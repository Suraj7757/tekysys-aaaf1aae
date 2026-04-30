import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-destructive text-destructive-foreground px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline — internet connection check karein</span>
    </div>
  );
}
