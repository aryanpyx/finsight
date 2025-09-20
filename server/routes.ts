import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertFileSchema, insertAnalysisResultSchema, insertProposalSchema } from "@shared/schema";
import { analyzeContract, analyzeLicenses, generateProposal } from "./services/openai";
import { processTextFile, validateFileType } from "./services/fileProcessor";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint
  app.post("/api/files/upload", upload.single("file"), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const { type } = req.body;
      if (!type || !['contract', 'worklog', 'license'].includes(type)) {
        return res.status(400).json({ error: "Invalid file type" });
      }

      if (!validateFileType(req.file.originalname, type)) {
        return res.status(400).json({ error: "Invalid file format for type" });
      }

      // Process file content
      const content = await processTextFile({
        filename: req.file.filename || '',
        originalName: req.file.originalname,
        type,
        size: req.file.size,
      } as any, req.file.buffer);

      // Create file record
      const fileData = insertFileSchema.parse({
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        type,
        size: req.file.size,
        content,
        processed: true,
      });

      const file = await storage.createFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Get uploaded files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  // Start AI analysis
  app.post("/api/analysis/start", async (req, res) => {
    try {
      console.log("Starting AI analysis...");
      
      // Get uploaded files
      const contractFiles = await storage.getFilesByType('contract');
      const worklogFiles = await storage.getFilesByType('worklog');
      const licenseFiles = await storage.getFilesByType('license');

      console.log(`Found files - Contracts: ${contractFiles.length}, Work logs: ${worklogFiles.length}, Licenses: ${licenseFiles.length}`);

      // Combine content
      const contractText = contractFiles.map(f => f.content).join('\n\n');
      const workLogText = worklogFiles.map(f => f.content).join('\n\n');
      const licenseText = licenseFiles.map(f => f.content).join('\n\n');

      console.log(`Content lengths - Contract: ${contractText.length}, WorkLog: ${workLogText.length}, License: ${licenseText.length}`);

      let results = [];

      // Analyze contracts if available
      if (contractText && workLogText) {
        console.log("Calling OpenAI for contract analysis...");
        const contractAnalysis = await analyzeContract(contractText, workLogText);
        console.log("Contract analysis result:", contractAnalysis);
        
        // Store unbilled work results
        if (contractAnalysis.unbilledWork.total > 0) {
          const unbilledResult = await storage.createAnalysisResult({
            type: 'revenue_leak',
            title: 'Unbilled Work',
            amount: contractAnalysis.unbilledWork.total.toString(),
            description: `${contractAnalysis.unbilledWork.items.length} items of unbilled work detected`,
            details: contractAnalysis.unbilledWork,
            severity: 'critical',
          });
          results.push(unbilledResult);
        }

        // Store SLA breach results
        if (contractAnalysis.slaBreaches.total > 0) {
          const slaResult = await storage.createAnalysisResult({
            type: 'revenue_leak',
            title: 'SLA Breaches',
            amount: contractAnalysis.slaBreaches.total.toString(),
            description: `${contractAnalysis.slaBreaches.violations.length} SLA violations requiring credits`,
            details: contractAnalysis.slaBreaches,
            severity: 'medium',
          });
          results.push(slaResult);
        }

        // Store mispriced services
        if (contractAnalysis.mispricedServices.total > 0) {
          const mispricedResult = await storage.createAnalysisResult({
            type: 'revenue_leak',
            title: 'Mispriced Services',
            amount: contractAnalysis.mispricedServices.total.toString(),
            description: 'Services priced below market rate',
            details: contractAnalysis.mispricedServices,
            severity: 'opportunity',
          });
          results.push(mispricedResult);
        }
      }

      // Analyze licenses if available
      if (licenseText) {
        console.log("Calling OpenAI for license analysis...");
        const licenseAnalysis = await analyzeLicenses(licenseText);
        console.log("License analysis result:", licenseAnalysis);

        // Store unused licenses
        if (licenseAnalysis.unusedLicenses.total > 0) {
          const unusedResult = await storage.createAnalysisResult({
            type: 'cost_waste',
            title: 'Unused Licenses',
            amount: licenseAnalysis.unusedLicenses.total.toString(),
            description: `${licenseAnalysis.unusedLicenses.licenses.length} inactive licenses found`,
            details: licenseAnalysis.unusedLicenses,
            severity: 'critical',
          });
          results.push(unusedResult);
        }

        // Store duplicate subscriptions
        if (licenseAnalysis.duplicateSubscriptions.total > 0) {
          const duplicateResult = await storage.createAnalysisResult({
            type: 'cost_waste',
            title: 'Duplicate Subscriptions',
            amount: licenseAnalysis.duplicateSubscriptions.total.toString(),
            description: `${licenseAnalysis.duplicateSubscriptions.duplicates.length} duplicate tools found`,
            details: licenseAnalysis.duplicateSubscriptions,
            severity: 'medium',
          });
          results.push(duplicateResult);
        }

        // Store overprovisioned services
        if (licenseAnalysis.overprovisioned.total > 0) {
          const overprovisionedResult = await storage.createAnalysisResult({
            type: 'cost_waste',
            title: 'Overprovisioned Services',
            amount: licenseAnalysis.overprovisioned.total.toString(),
            description: `${licenseAnalysis.overprovisioned.services.length} services with excessive capacity`,
            details: licenseAnalysis.overprovisioned,
            severity: 'medium',
          });
          results.push(overprovisionedResult);
        }
      }

      console.log(`Analysis completed with ${results.length} results`);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze data" });
    }
  });

  // Get analysis results
  app.get("/api/analysis/results", async (req, res) => {
    try {
      const results = await storage.getAnalysisResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analysis results" });
    }
  });

  // Generate proposal
  app.post("/api/proposal/generate", async (req, res) => {
    try {
      const { clientName } = req.body;
      
      // Get analysis results
      const revenueLeaks = await storage.getAnalysisResultsByType('revenue_leak');
      const costWaste = await storage.getAnalysisResultsByType('cost_waste');

      // Transform results for proposal generation
      const contractAnalysis = {
        unbilledWork: { total: 0, items: [] },
        slaBreaches: { total: 0, violations: [] },
        mispricedServices: { total: 0, services: [] },
      };

      const licenseAnalysis = {
        unusedLicenses: { total: 0, licenses: [] },
        duplicateSubscriptions: { total: 0, duplicates: [] },
        overprovisioned: { total: 0, services: [] },
      };

      // Populate analysis data
      revenueLeaks.forEach(result => {
        const amount = parseFloat(result.amount);
        if (result.title === 'Unbilled Work') {
          contractAnalysis.unbilledWork.total = amount;
          contractAnalysis.unbilledWork.items = (result.details && typeof result.details === 'object' && 'items' in result.details) ? (result.details as any).items || [] : [];
        } else if (result.title === 'SLA Breaches') {
          contractAnalysis.slaBreaches.total = amount;
          contractAnalysis.slaBreaches.violations = (result.details && typeof result.details === 'object' && 'violations' in result.details) ? (result.details as any).violations || [] : [];
        } else if (result.title === 'Mispriced Services') {
          contractAnalysis.mispricedServices.total = amount;
          contractAnalysis.mispricedServices.services = (result.details && typeof result.details === 'object' && 'services' in result.details) ? (result.details as any).services || [] : [];
        }
      });

      costWaste.forEach(result => {
        const amount = parseFloat(result.amount);
        if (result.title === 'Unused Licenses') {
          licenseAnalysis.unusedLicenses.total = amount;
          licenseAnalysis.unusedLicenses.licenses = (result.details && typeof result.details === 'object' && 'licenses' in result.details) ? (result.details as any).licenses || [] : [];
        } else if (result.title === 'Duplicate Subscriptions') {
          licenseAnalysis.duplicateSubscriptions.total = amount;
          licenseAnalysis.duplicateSubscriptions.duplicates = (result.details && typeof result.details === 'object' && 'duplicates' in result.details) ? (result.details as any).duplicates || [] : [];
        } else if (result.title === 'Overprovisioned Services') {
          licenseAnalysis.overprovisioned.total = amount;
          licenseAnalysis.overprovisioned.services = (result.details && typeof result.details === 'object' && 'services' in result.details) ? (result.details as any).services || [] : [];
        }
      });

      // Generate proposal
      const proposalContent = await generateProposal({
        contractAnalysis,
        licenseAnalysis,
        clientName,
      });

      // Calculate totals
      const oneTimeRecovery = contractAnalysis.unbilledWork.total + contractAnalysis.slaBreaches.total + contractAnalysis.mispricedServices.total;
      const monthlySavings = licenseAnalysis.unusedLicenses.total + licenseAnalysis.duplicateSubscriptions.total + licenseAnalysis.overprovisioned.total;
      const annualSavings = monthlySavings * 12;

      // Store proposal
      const proposal = await storage.createProposal({
        title: `Financial Optimization Proposal${clientName ? ` - ${clientName}` : ''}`,
        content: proposalContent,
        totalImpact: (oneTimeRecovery + annualSavings).toString(),
        oneTimeRecovery: oneTimeRecovery.toString(),
        annualSavings: annualSavings.toString(),
      });

      res.json(proposal);
    } catch (error) {
      console.error("Proposal generation error:", error);
      res.status(500).json({ error: "Failed to generate proposal" });
    }
  });

  // Get latest proposal
  app.get("/api/proposal/latest", async (req, res) => {
    try {
      const proposal = await storage.getLatestProposal();
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proposal" });
    }
  });

  // Load demo data
  app.post("/api/demo/load", async (req, res) => {
    try {
      const { type } = req.body;
      
      let content = "";
      let filename = "";
      
      if (type === 'contract') {
        content = `MSP SERVICE AGREEMENT
        
Client: TechFlow Solutions
Service Level Agreement:
- Response time: 4 hours for critical issues
- Uptime guarantee: 99.5%
- Monthly service fee: $5,000

Services Include:
- 24/7 monitoring and support
- Server maintenance and updates
- Security monitoring
- Backup management

Hourly rates:
- Standard support: $150/hour
- Emergency support: $200/hour
- Project work: $175/hour`;
        filename = "sample_contract.txt";
      } else if (type === 'logs') {
        content = `Date,Client,Service,Hours,Rate,Status
2023-12-01,TechFlow Solutions,Emergency Server Recovery,8,200,Completed
2023-12-02,TechFlow Solutions,Network Troubleshooting,3,150,Completed
2023-12-03,DataFlow Inc,Security Incident Response,12,200,Completed
2023-12-05,CloudFirst Ltd,Database Migration,6,175,Completed
2023-12-07,TechFlow Solutions,After Hours Maintenance,4,200,Completed`;
        filename = "work_logs_q4.csv";
      } else if (type === 'licenses') {
        content = `Tool,Users Licensed,Users Active,Monthly Cost,Last Login
Microsoft 365,50,45,$750,2023-12-15
Slack Premium,30,28,$180,2023-12-15
Zoom Pro,25,15,$375,2023-11-20
Adobe Creative Cloud,20,8,$1200,2023-10-15
Atlassian Suite,15,12,$225,2023-12-14
Salesforce,10,10,$1500,2023-12-15
Dropbox Business,35,20,$525,2023-12-10`;
        filename = "license_audit.csv";
      }

      if (content) {
        // Map frontend demo types to backend file types
        const fileType = type === 'logs' ? 'worklog' : type === 'licenses' ? 'license' : type;
        
        const fileData = insertFileSchema.parse({
          filename: `demo_${filename}`,
          originalName: filename,
          type: fileType,
          size: Buffer.byteLength(content, 'utf8'),
          content,
          processed: true,
        });

        const file = await storage.createFile(fileData);
        res.json(file);
      } else {
        res.status(400).json({ error: "Invalid demo type" });
      }
    } catch (error) {
      console.error("Demo load error:", error);
      res.status(500).json({ error: "Failed to load demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
