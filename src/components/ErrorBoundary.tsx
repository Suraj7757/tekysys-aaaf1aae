import React, { Component, ErrorInfo, ReactNode } from "react";
import { MainLayout } from "./layout/MainLayout";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <MainLayout title="Error">
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              The application encountered an unexpected error. Please try refreshing the page or navigating back.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-4 bg-muted rounded-lg text-xs font-mono text-left max-w-full overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-4 mt-6">
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
              <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </div>
        </MainLayout>
      );
    }

    return this.props.children;
  }
}
