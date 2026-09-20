import type { ReactNode } from "react";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-lg border border-border bg-panel p-8 text-center">
      <div className="space-y-3">
        <Loader2 className="mx-auto size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/10 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 text-danger" aria-hidden="true" />
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry ? (
            <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-panel p-8 text-center">
      <Search className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface StateViewProps {
  isLoading?: boolean;
  loadingLabel?: string;
  error?: { message: string } | null;
  onRetry?: () => void;
  children: ReactNode;
}

export function StateView({
  isLoading,
  loadingLabel = "Loading financial data...",
  error,
  onRetry,
  children,
}: StateViewProps) {
  if (isLoading) return <LoadingState label={loadingLabel} />;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  return <>{children}</>;
}
