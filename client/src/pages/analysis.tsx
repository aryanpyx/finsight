import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";
import { AnalysisResult } from "@shared/schema";

interface ExpandableCardProps {
  result: AnalysisResult;
  color: string;
  bgColor: string;
}

function ExpandableCard({ result, color, bgColor }: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
      case "opportunity":
        return <Badge className="bg-blue-100 text-blue-800">Opportunity</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`p-6 shadow-md border-l-4 cursor-pointer transition-shadow hover:shadow-lg ${bgColor}`}
        onClick={() => setExpanded(!expanded)}
        data-testid={`card-analysis-${result.title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg" data-testid={`text-result-title-${result.id}`}>
            {result.title}
          </h3>
          {getSeverityBadge(result.severity)}
        </div>
        
        <div className={`text-3xl font-bold mb-2 ${color}`} data-testid={`text-result-amount-${result.id}`}>
          <AnimatedCounter 
            value={parseFloat(result.amount)} 
            prefix="$" 
            data-testid={`counter-amount-${result.id}`}
          />
        </div>
        
        <p className="text-muted-foreground mb-4" data-testid={`text-result-description-${result.id}`}>
          {result.description}
        </p>

        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : 0 }}
          className="overflow-hidden"
        >
          {expanded && result.details && typeof result.details === 'object' && (
            <div className="pt-4 border-t border-border">
              <div className="text-sm space-y-2">
                {('items' in result.details) && (result.details as any).items && (result.details as any).items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between" data-testid={`item-detail-${result.id}-${index}`}>
                    <span>{item.client || item.tool || item.service}:</span>
                    <span className={color}>${item.amount || item.monthlyPrice || item.difference}</span>
                  </div>
                ))}
                {('violations' in result.details) && (result.details as any).violations && (result.details as any).violations.map((violation: any, index: number) => (
                  <div key={index} className="flex justify-between" data-testid={`violation-detail-${result.id}-${index}`}>
                    <span>{violation.type}:</span>
                    <span className={color}>${violation.amount}</span>
                  </div>
                ))}
                {('licenses' in result.details) && (result.details as any).licenses && (result.details as any).licenses.map((license: any, index: number) => (
                  <div key={index} className="flex justify-between" data-testid={`license-detail-${result.id}-${index}`}>
                    <span>{license.tool}:</span>
                    <span className={color}>${license.monthlyPrice}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-primary hover:text-primary/80 text-sm font-medium">
            {expanded ? "Hide Details" : "View Details"}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </Card>
    </motion.div>
  );
}

export default function Analysis() {
  const [, setLocation] = useLocation();

  const { data: results = [], isLoading } = useQuery<AnalysisResult[]>({
    queryKey: ["/api/analysis/results"],
  });

  const revenueLeaks = results.filter(r => r.type === "revenue_leak");
  const costWaste = results.filter(r => r.type === "cost_waste");

  const totalRevenueLeak = revenueLeaks.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalCostWaste = costWaste.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-analysis">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      data-testid="page-analysis"
    >
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-testid="text-analysis-title"
        >
          AI Analysis Results
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-testid="text-analysis-description"
        >
          AI has analyzed your data and identified key opportunities for optimization
        </motion.p>
      </div>

      {revenueLeaks.length > 0 && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center" data-testid="text-revenue-title">
            <DollarSign className="w-6 h-6 text-red-500 mr-3" />
            Revenue Leakage Detected: <AnimatedCounter value={totalRevenueLeak} prefix="$" className="ml-2" data-testid="counter-total-revenue-leak" />
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {revenueLeaks.map((result) => (
              <ExpandableCard
                key={result.id}
                result={result}
                color="text-red-600"
                bgColor="border-l-red-500"
              />
            ))}
          </div>
        </motion.div>
      )}

      {costWaste.length > 0 && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center" data-testid="text-waste-title">
            <TrendingDown className="w-6 h-6 text-green-600 mr-3" />
            License Waste Found: <AnimatedCounter value={totalCostWaste} prefix="$" suffix="/month" className="ml-2" data-testid="counter-total-cost-waste" />
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {costWaste.map((result) => (
              <ExpandableCard
                key={result.id}
                result={result}
                color="text-green-600"
                bgColor="border-l-green-500"
              />
            ))}
          </div>
        </motion.div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12" data-testid="empty-results">
          <p className="text-muted-foreground mb-4">No analysis results found.</p>
          <Button onClick={() => setLocation("/upload")} data-testid="button-upload-data">
            Upload Data to Start Analysis
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            size="lg"
            onClick={() => setLocation("/proposal")}
            className="mr-4"
            data-testid="button-generate-proposal"
          >
            Generate Proposal
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-view-dashboard"
          >
            View Dashboard
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
