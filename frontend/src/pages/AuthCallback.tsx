import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSsoReturn } from "@/hooks/useSsoReturn";
import { PageShell, Surface } from "@/components/ui/page-shell";

export default function AuthCallback() {
  const error = useSsoReturn();

  if (error) {
    return (
      <PageShell className="flex min-h-screen items-center justify-center py-12">
        <Surface className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Surface>
      </PageShell>
    );
  }

  return (
    <PageShell className="flex min-h-screen items-center justify-center py-12">
      <Surface className="w-full max-w-md text-center">
        <Loader2 className="mx-auto mb-4 h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Completing authentication...</p>
      </Surface>
    </PageShell>
  );
}
