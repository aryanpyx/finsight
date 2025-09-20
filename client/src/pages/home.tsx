import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, DollarSign, BarChart3, Edit } from "lucide-react";

const features = [
  {
    icon: <FileText className="w-6 h-6 text-primary" />,
    title: "Contract Intelligence",
    description: "AI analyzes contracts to identify unbilled work and SLA breaches automatically.",
    bgColor: "bg-blue-100",
  },
  {
    icon: <DollarSign className="w-6 h-6 text-green-600" />,
    title: "License Waste Finder",
    description: "Discover unused SaaS licenses and eliminate unnecessary subscription costs.",
    bgColor: "bg-green-100",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
    title: "Interactive Dashboard",
    description: "Visual insights with animated charts and MSP/Client toggle views.",
    bgColor: "bg-purple-100",
  },
  {
    icon: <Edit className="w-6 h-6 text-amber-600" />,
    title: "AI Proposal Generator",
    description: "Generate professional proposals with actionable recommendations instantly.",
    bgColor: "bg-amber-100",
  },
];

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-testid="page-home"
    >
      {/* Hero Section */}
      <div className="hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              data-testid="text-hero-title"
            >
              AI-Powered Financial
              <span className="block text-green-300">Co-pilot for MSPs</span>
            </motion.h1>
            <motion.p
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              data-testid="text-hero-description"
            >
              Detect revenue leaks, identify IT cost waste, and generate actionable proposals with advanced AI analysis. Transform your financial insights in minutes, not hours.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href="/upload">
                <Button 
                  size="lg" 
                  className="bg-white text-primary px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  data-testid="button-get-started"
                >
                  Upload Your Data & Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-features-title">
            Powerful AI-Driven Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
            Leverage cutting-edge AI to uncover hidden opportunities and optimize your financial performance
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
            >
              <Card 
                className="p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid={`text-feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
