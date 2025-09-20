import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/upload", label: "Upload" },
  { path: "/analysis", label: "Analysis" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/proposal", label: "Proposal" },
];

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0" data-testid="link-logo">
              <div className="text-2xl font-bold text-primary">FinSight AI</div>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                      location === item.path
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    data-testid={`link-nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                    {location === item.path && (
                      <motion.div
                        className="absolute inset-0 bg-secondary rounded-md -z-10"
                        layoutId="navbar-active"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
