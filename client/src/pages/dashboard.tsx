import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AnalysisResult } from "@shared/schema";

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const [isClientView, setIsClientView] = useState(false);

  const { data: results = [] } = useQuery<AnalysisResult[]>({
    queryKey: ["/api/analysis/results"],
  });

  const revenueLeaks = results.filter(r => r.type === "revenue_leak");
  const costWaste = results.filter(r => r.type === "cost_waste");

  const totalRevenueLeak = revenueLeaks.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalCostWaste = costWaste.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const annualSavings = totalCostWaste * 12;

  // Chart data
  const revenueData = revenueLeaks.map(r => ({
    name: r.title,
    value: parseFloat(r.amount),
  }));

  const costData = costWaste.map(r => ({
    name: r.title,
    value: parseFloat(r.amount),
  }));

  const monthlyTrendData = [
    { month: 'Jan', revenue: 15000, cost: 8000 },
    { month: 'Feb', revenue: 18000, cost: 8500 },
    { month: 'Mar', revenue: 22000, cost: 8200 },
    { month: 'Apr', revenue: 20000, cost: 8900 },
    { month: 'May', revenue: 25000, cost: 8700 },
    { month: 'Jun', revenue: 24750, cost: 8940 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      data-testid="page-dashboard"
    >
      <div className="text-center mb-12">
        <motion.h1
          className="text-4xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-testid="text-dashboard-title"
        >
          Financial Insights Dashboard
        </motion.h1>
        
        {/* View Toggle */}
        <motion.div
          className="flex items-center justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="mr-3 text-muted-foreground" data-testid="text-msp-view">MSP View</span>
          <ToggleSwitch
            checked={isClientView}
            onToggle={() => setIsClientView(!isClientView)}
            data-testid="toggle-view-switch"
          />
          <span className="ml-3 text-muted-foreground" data-testid="text-client-view">Client View</span>
        </motion.div>
      </div>

      {!isClientView ? (
        // MSP View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          data-testid="view-msp"
        >
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Revenue Leakage Panel */}
            <Card className="p-6 shadow-lg" data-testid="card-revenue-leakage">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center" data-testid="text-revenue-panel-title">
                  <span className="text-red-500 mr-2">💸</span>
                  MSP Revenue Leakage
                </h2>
                <span className="text-3xl font-bold text-red-600">
                  <AnimatedCounter value={totalRevenueLeak} prefix="$" data-testid="counter-msp-revenue" />
                </span>
              </div>
              
              <div className="chart-container mb-6" data-testid="chart-revenue-breakdown">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#ef4444"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {revenueLeaks.map((result) => (
                  <div key={result.id} className="flex justify-between items-center" data-testid={`revenue-item-${result.id}`}>
                    <span className="text-sm text-muted-foreground">{result.title}</span>
                    <span className="font-semibold text-red-600">${result.amount}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Client Cost Waste Panel */}
            <Card className="p-6 shadow-lg" data-testid="card-cost-waste">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center" data-testid="text-waste-panel-title">
                  <span className="text-green-500 mr-2">💰</span>
                  Client Cost Waste
                </h2>
                <span className="text-3xl font-bold text-green-600">
                  <AnimatedCounter value={totalCostWaste} prefix="$" suffix="/mo" data-testid="counter-msp-cost-waste" />
                </span>
              </div>
              
              <div className="chart-container mb-6" data-testid="chart-cost-breakdown">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Monthly Cost']} />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {costWaste.map((result) => (
                  <div key={result.id} className="flex justify-between items-center" data-testid={`waste-item-${result.id}`}>
                    <span className="text-sm text-muted-foreground">{result.title}</span>
                    <span className="font-semibold text-green-600">${result.amount}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Summary Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center" data-testid="card-metric-unbilled">
              <div className="text-2xl font-bold text-primary">
                <AnimatedCounter value={47} data-testid="counter-unbilled-hours" />
              </div>
              <div className="text-muted-foreground">Unbilled Hours</div>
            </Card>
            <Card className="p-6 text-center" data-testid="card-metric-violations">
              <div className="text-2xl font-bold text-amber-600">
                <AnimatedCounter value={12} data-testid="counter-sla-violations" />
              </div>
              <div className="text-muted-foreground">SLA Violations</div>
            </Card>
            <Card className="p-6 text-center" data-testid="card-metric-licenses">
              <div className="text-2xl font-bold text-green-600">
                <AnimatedCounter value={23} data-testid="counter-unused-licenses" />
              </div>
              <div className="text-muted-foreground">Unused Licenses</div>
            </Card>
            <Card className="p-6 text-center" data-testid="card-metric-impact">
              <div className="text-2xl font-bold text-purple-600">
                <AnimatedCounter value={132} prefix="$" suffix="K" data-testid="counter-annual-impact" />
              </div>
              <div className="text-muted-foreground">Annual Impact</div>
            </Card>
          </div>
        </motion.div>
      ) : (
        // Client View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          data-testid="view-client"
        >
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Cost Optimization Panel */}
            <Card className="p-6 shadow-lg" data-testid="card-cost-optimization">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center" data-testid="text-optimization-title">
                  <span className="text-green-500 mr-2">📊</span>
                  Cost Optimization
                </h2>
                <span className="text-3xl font-bold text-green-600">
                  <AnimatedCounter value={annualSavings} prefix="$" suffix="/yr" data-testid="counter-client-savings" />
                </span>
              </div>
              
              <div className="chart-container mb-6" data-testid="chart-optimization-trend">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#10b981" name="Cost Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center" data-testid="optimization-license">
                  <span className="text-sm text-muted-foreground">License Optimization</span>
                  <span className="font-semibold text-green-600">${totalCostWaste}/mo</span>
                </div>
                <div className="flex justify-between items-center" data-testid="optimization-automation">
                  <span className="text-sm text-muted-foreground">Process Automation</span>
                  <span className="font-semibold text-blue-600">$3,200/mo</span>
                </div>
                <div className="flex justify-between items-center" data-testid="optimization-infrastructure">
                  <span className="text-sm text-muted-foreground">Infrastructure Right-sizing</span>
                  <span className="font-semibold text-purple-600">$2,100/mo</span>
                </div>
              </div>
            </Card>

            {/* Service Enhancement Panel */}
            <Card className="p-6 shadow-lg" data-testid="card-service-enhancement">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center" data-testid="text-enhancement-title">
                  <span className="text-blue-500 mr-2">⚡</span>
                  Service Enhancement
                </h2>
                <span className="text-3xl font-bold text-blue-600">
                  <AnimatedCounter value={95.8} suffix="%" data-testid="counter-service-level" />
                </span>
              </div>
              
              <div className="chart-container mb-6" data-testid="chart-service-performance">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-4">⚡</div>
                  <p>Service Level Performance</p>
                  <p className="text-sm">Target: 99% | Current: 95.8%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center" data-testid="service-response-time">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="font-semibold text-green-600">2.3 min avg</span>
                </div>
                <div className="flex justify-between items-center" data-testid="service-resolution-rate">
                  <span className="text-sm text-muted-foreground">Resolution Rate</span>
                  <span className="font-semibold text-blue-600">94.2%</span>
                </div>
                <div className="flex justify-between items-center" data-testid="service-satisfaction">
                  <span className="text-sm text-muted-foreground">Client Satisfaction</span>
                  <span className="font-semibold text-purple-600">4.7/5</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Client Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center" data-testid="card-client-metric-savings">
              <div className="text-2xl font-bold text-green-600">
                <AnimatedCounter value={annualSavings} prefix="$" suffix="K" data-testid="counter-client-annual-savings" />
              </div>
              <div className="text-muted-foreground">Annual Savings</div>
            </Card>
            <Card className="p-6 text-center" data-testid="card-client-metric-reduction">
              <div className="text-2xl font-bold text-blue-600">
                <AnimatedCounter value={38} suffix="%" data-testid="counter-cost-reduction" />
              </div>
              <div className="text-muted-foreground">Cost Reduction</div>
            </Card>
            <Card className="p-6 text-center" data-testid="card-client-metric-tools">
              <div className="text-2xl font-bold text-purple-600">
                <AnimatedCounter value={15} data-testid="counter-tools-optimized" />
              </div>
              <div className="text-muted-foreground">Tools Optimized</div>
            </Card>
            <Card className="p-6 text-center" data-testid="card-client-metric-uptime">
              <div className="text-2xl font-bold text-primary">
                <AnimatedCounter value={99.2} suffix="%" data-testid="counter-uptime-target" />
              </div>
              <div className="text-muted-foreground">Uptime Target</div>
            </Card>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
