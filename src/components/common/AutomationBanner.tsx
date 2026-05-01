import { useAutomationAlerts } from "@/hooks/useAutomation";
import { AlertTriangle, Package, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function AutomationBanner() {
  const { pendingJobs, lowStockItems } = useAutomationAlerts();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const total = pendingJobs.length + lowStockItems.length;
  if (dismissed || total === 0) return null;

  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-2">
      {pendingJobs.length > 0 && (
        <button
          onClick={() => navigate("/jobs")}
          className="text-left flex items-start gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {pendingJobs.length} jobs need attention
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Stuck in same status for too long — review karein
            </p>
          </div>
        </button>
      )}
      {lowStockItems.length > 0 && (
        <button
          onClick={() => navigate("/inventory")}
          className="text-left flex items-start gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors"
        >
          <Package className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-destructive">
              {lowStockItems.length} items low on stock
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {lowStockItems
                .slice(0, 3)
                .map((i) => i.name)
                .join(", ")}
            </p>
          </div>
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
