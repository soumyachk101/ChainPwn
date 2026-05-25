import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "text-vulnforge-danger";
    case "HIGH":
      return "text-vulnforge-warning";
    case "MEDIUM":
      return "text-yellow-400";
    case "LOW":
      return "text-vulnforge-info";
    case "INFORMATIONAL":
      return "text-vulnforge-purple";
    default:
      return "text-slate-400";
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-vulnforge-danger/10 border-vulnforge-danger/30";
    case "HIGH":
      return "bg-vulnforge-warning/10 border-vulnforge-warning/30";
    case "MEDIUM":
      return "bg-yellow-400/10 border-yellow-400/30";
    case "LOW":
      return "bg-vulnforge-info/10 border-vulnforge-info/30";
    case "INFORMATIONAL":
      return "bg-vulnforge-purple/10 border-vulnforge-purple/30";
    default:
      return "bg-slate-400/10 border-slate-400/30";
  }
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case "CRITICAL":
      return "#ff3860";
    case "HIGH":
      return "#ff6b35";
    case "MEDIUM":
      return "#fbbf24";
    case "LOW":
      return "#3b82f6";
    case "SAFE":
      return "#00ff88";
    default:
      return "#64748b";
  }
}

export function getRiskPercent(risk: string): number {
  switch (risk) {
    case "CRITICAL":
      return 95;
    case "HIGH":
      return 75;
    case "MEDIUM":
      return 50;
    case "LOW":
      return 25;
    case "SAFE":
      return 5;
    default:
      return 0;
  }
}
