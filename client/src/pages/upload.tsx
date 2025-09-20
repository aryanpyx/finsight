import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { FileText, BarChart3, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const demoData = [
  {
    type: "contract" as const,
    title: "Sample Contract",
    description: "MSP Service Agreement",
  },
  {
    type: "logs" as const,
    title: "Work Logs",
    description: "Q4 2023 Time Entries",
  },
  {
    type: "licenses" as const,
    title: "License Data",
    description: "SaaS Subscription Audit",
  },
];

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleFileUpload = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    // Use fetch directly for FormData uploads instead of apiRequest
    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  };

  const handleDemoDataLoad = async (type: string) => {
    try {
      await apiRequest("POST", "/api/demo/load", { type });
      toast({
        title: "Demo data loaded",
        description: `${type} demo data has been loaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load demo data",
        variant: "destructive",
      });
    }
  };

  const handleStartAnalysis = async () => {
    try {
      setUploading(true);
      await apiRequest("POST", "/api/analysis/start", {});
      toast({
        title: "Analysis started",
        description: "AI analysis is processing your data...",
      });
      setTimeout(() => {
        setLocation("/analysis");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start analysis",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      data-testid="page-upload"
    >
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-testid="text-upload-title"
        >
          Upload Your Data
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-testid="text-upload-description"
        >
          Upload contracts, work logs, and license data to get started with AI analysis
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FileUpload
            type="contract"
            title="Contracts"
            description="Drop PDF/DOC files here"
            acceptedFormats="Accepts: PDF, DOC, DOCX, TXT"
            icon={<FileText className="w-5 h-5 text-primary mr-2" />}
            onUpload={(file) => handleFileUpload(file, "contract")}
          />

          <FileUpload
            type="worklog"
            title="Work Logs"
            description="Drop CSV/JSON files here"
            acceptedFormats="Accepts: CSV, JSON, TXT"
            icon={<BarChart3 className="w-5 h-5 text-green-600 mr-2" />}
            onUpload={(file) => handleFileUpload(file, "worklog")}
          />

          <FileUpload
            type="license"
            title="License Data"
            description="Drop CSV/Excel files here"
            acceptedFormats="Accepts: CSV, XLSX, XLS, JSON"
            icon={<Key className="w-5 h-5 text-purple-600 mr-2" />}
            onUpload={(file) => handleFileUpload(file, "license")}
          />
        </motion.div>

        {/* Demo Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 shadow-md mb-8" data-testid="card-demo-data">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-demo-title">
              Try with Demo Data
            </h3>
            <p className="text-muted-foreground mb-6" data-testid="text-demo-description">
              Use our sample data to explore FinSight AI capabilities without uploading your own files.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {demoData.map((demo) => (
                <Button
                  key={demo.type}
                  variant="secondary"
                  className="p-4 h-auto flex flex-col items-center text-center"
                  onClick={() => handleDemoDataLoad(demo.type)}
                  data-testid={`button-demo-${demo.type}`}
                >
                  <div className="font-medium">{demo.title}</div>
                  <div className="text-sm text-muted-foreground">{demo.description}</div>
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            size="lg"
            onClick={handleStartAnalysis}
            disabled={uploading}
            className="mr-4"
            data-testid="button-start-analysis"
          >
            {uploading ? "Starting Analysis..." : "Start AI Analysis"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation("/analysis")}
            data-testid="button-view-results"
          >
            View Previous Results
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
