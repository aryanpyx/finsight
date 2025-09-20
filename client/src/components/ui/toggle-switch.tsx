import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onToggle: () => void;
  className?: string;
  "data-testid"?: string;
}

export function ToggleSwitch({ checked, onToggle, className = "", "data-testid": testId }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-15 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted"
      } ${className}`}
      data-testid={testId}
    >
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
