import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function ProgressRing({ progress, size = 120, strokeWidth = 2.5, color, className }: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <svg width={size} height={size} className={className}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color || "hsl(var(--primary))"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
        transition={{ duration: 1.5, ease: [0.2, 0, 0, 1] }}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
}
