import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle, FileDown, Mail, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Proposal } from "@shared/schema";

export default function ProposalPage() {
  const [clientName, setClientName] = useState("TechFlow Solutions");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: proposal, isLoading } = useQuery<Proposal | null>({
    queryKey: ["/api/proposal/latest"],
  });

  const generateProposalMutation = useMutation({
    mutationFn: (data: { clientName: string }) =>
      apiRequest("POST", "/api/proposal/generate", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposal/latest"] });
      toast({
        title: "Proposal generated",
        description: "AI has generated your proposal successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate proposal",
        variant: "destructive",
      });
    },
  });

  const handleGenerateProposal = () => {
    generateProposalMutation.mutate({ clientName });
  };

  const handleCopyProposal = async () => {
    if (!proposal?.content) return;

    try {
      await navigator.clipboard.writeText(proposal.content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Proposal content has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-proposal">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading proposal...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      data-testid="page-proposal"
    >
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-testid="text-proposal-title"
        >
          AI-Generated Proposal
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-testid="text-proposal-description"
        >
          Professional proposal with actionable recommendations
        </motion.p>
      </div>

      {!proposal ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="p-8 max-w-md mx-auto" data-testid="card-generate-proposal">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-generate-title">
              Generate New Proposal
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  data-testid="input-client-name"
                />
              </div>
              <Button
                onClick={handleGenerateProposal}
                disabled={generateProposalMutation.isPending}
                className="w-full"
                data-testid="button-generate-proposal"
              >
                {generateProposalMutation.isPending ? "Generating..." : "Generate Proposal"}
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 shadow-lg" data-testid="card-proposal-content">
            {/* Proposal Header */}
            <div className="border-b border-border pb-6 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-proposal-header-title">
                    {proposal.title}
                  </h2>
                  <p className="text-muted-foreground" data-testid="text-proposal-date">
                    Date: {new Date(proposal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={handleCopyProposal}
                  variant={copied ? "default" : "outline"}
                  className={`transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700" : ""}`}
                  data-testid="button-copy-proposal"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Financial Impact Summary */}
            {(proposal.oneTimeRecovery || proposal.annualSavings) && (
              <div className="bg-secondary p-6 rounded-lg mb-8" data-testid="card-financial-impact">
                <h3 className="text-lg font-semibold mb-4">Financial Impact Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {proposal.oneTimeRecovery && (
                    <div className="text-center" data-testid="metric-one-time-recovery">
                      <div className="text-lg font-semibold">One-Time Recovery</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${parseFloat(proposal.oneTimeRecovery).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {proposal.annualSavings && (
                    <div className="text-center" data-testid="metric-annual-savings">
                      <div className="text-lg font-semibold">Annual Savings</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${parseFloat(proposal.annualSavings).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {proposal.totalImpact && (
                    <div className="text-center" data-testid="metric-total-impact">
                      <div className="text-lg font-semibold">Total Impact</div>
                      <div className="text-2xl font-bold text-primary">
                        ${parseFloat(proposal.totalImpact).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proposal Content */}
            <div 
              className="prose prose-gray max-w-none"
              style={{ whiteSpace: 'pre-wrap' }}
              data-testid="text-proposal-content"
            >
              {proposal.content}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-border">
              <Button 
                variant="default"
                data-testid="button-download-pdf"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="secondary"
                data-testid="button-email-proposal"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Proposal
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
