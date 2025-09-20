import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ContractAnalysisResult {
  unbilledWork: {
    total: number;
    items: Array<{
      client: string;
      amount: number;
      description: string;
      hours: number;
    }>;
  };
  slaBreaches: {
    total: number;
    violations: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  };
  mispricedServices: {
    total: number;
    services: Array<{
      service: string;
      currentPrice: number;
      marketPrice: number;
      difference: number;
    }>;
  };
}

export interface LicenseAnalysisResult {
  unusedLicenses: {
    total: number;
    licenses: Array<{
      tool: string;
      monthlyPrice: number;
      lastUsed: string;
      users: number;
    }>;
  };
  duplicateSubscriptions: {
    total: number;
    duplicates: Array<{
      tools: string[];
      monthlyPrice: number;
      functionality: string;
    }>;
  };
  overprovisioned: {
    total: number;
    services: Array<{
      service: string;
      currentUsers: number;
      activeUsers: number;
      monthlySavings: number;
    }>;
  };
}

export async function analyzeContract(contractText: string, workLogs: string): Promise<ContractAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a financial analysis expert specializing in MSP (Managed Service Provider) contract analysis. Analyze the provided contract and work logs to identify:
1. Unbilled work - services performed but not invoiced
2. SLA breaches - service level agreement violations requiring credits
3. Mispriced services - services priced below market rate

Respond with JSON in this exact format:
{
  "unbilledWork": {
    "total": number,
    "items": [{"client": string, "amount": number, "description": string, "hours": number}]
  },
  "slaBreaches": {
    "total": number, 
    "violations": [{"type": string, "amount": number, "description": string}]
  },
  "mispricedServices": {
    "total": number,
    "services": [{"service": string, "currentPrice": number, "marketPrice": number, "difference": number}]
  }
}`
        },
        {
          role: "user",
          content: `Contract: ${contractText}\n\nWork Logs: ${workLogs}`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to analyze contract: " + (error as Error).message);
  }
}

export async function analyzeLicenses(licenseData: string): Promise<LicenseAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a SaaS license optimization expert. Analyze the provided license data to identify:
1. Unused licenses - licenses with no recent activity
2. Duplicate subscriptions - multiple tools providing same functionality
3. Overprovisioned services - more licenses than active users

Respond with JSON in this exact format:
{
  "unusedLicenses": {
    "total": number,
    "licenses": [{"tool": string, "monthlyPrice": number, "lastUsed": string, "users": number}]
  },
  "duplicateSubscriptions": {
    "total": number,
    "duplicates": [{"tools": [string], "monthlyPrice": number, "functionality": string}]
  },
  "overprovisioned": {
    "total": number,
    "services": [{"service": string, "currentUsers": number, "activeUsers": number, "monthlySavings": number}]
  }
}`
        },
        {
          role: "user",
          content: `License Data: ${licenseData}`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to analyze licenses: " + (error as Error).message);
  }
}

export async function generateProposal(analysisData: {
  contractAnalysis: ContractAnalysisResult;
  licenseAnalysis: LicenseAnalysisResult;
  clientName?: string;
}): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a professional proposal writer specializing in MSP financial optimization. Create a comprehensive, professional proposal based on the analysis data provided. The proposal should include:
1. Executive Summary
2. Revenue Recovery Opportunities (with specific details)
3. Cost Optimization Strategy  
4. Implementation Timeline
5. Financial Impact summary
6. Next Steps

Write in a professional business tone suitable for presenting to C-level executives.`
        },
        {
          role: "user",
          content: `Create a proposal for ${analysisData.clientName || 'the client'} based on this analysis:

Contract Analysis:
- Unbilled Work: $${analysisData.contractAnalysis.unbilledWork.total}
- SLA Breaches: $${analysisData.contractAnalysis.slaBreaches.total}  
- Mispriced Services: $${analysisData.contractAnalysis.mispricedServices.total}

License Analysis:
- Unused Licenses: $${analysisData.licenseAnalysis.unusedLicenses.total}/month
- Duplicate Subscriptions: $${analysisData.licenseAnalysis.duplicateSubscriptions.total}/month
- Overprovisioned: $${analysisData.licenseAnalysis.overprovisioned.total}/month

Include specific details from the analysis data in the proposal.`
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    throw new Error("Failed to generate proposal: " + (error as Error).message);
  }
}
