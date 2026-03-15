import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Optional fallback UI to render on error */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary captures runtime errors in child components
 * and displays a user-friendly fallback UI instead of crashing the entire page.
 * 
 * Usage: Wrap any component tree that should be isolated from crashes.
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Gözlənilməz xəta baş verdi</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || "Bir xəta meydana gəldi. Zəhmət olmasa yenidən cəhd edin."}
          </p>
          <Button onClick={this.handleReset} variant="outline" size="sm">
            <RefreshCw size={14} className="mr-2" />
            Yenidən cəhd et
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
