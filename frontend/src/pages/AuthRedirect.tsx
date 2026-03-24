import { useSsoReturn } from "@/hooks/useSsoReturn";
import { Loader2 } from "lucide-react";
import { PageShell, Surface } from "@/components/ui/page-shell";

export default function AuthRedirect() {
  const error = useSsoReturn();

  if (error) {
    return (
      <PageShell className="flex min-h-screen items-center justify-center py-12">
        <Surface className="w-full max-w-md text-center">
          <div className="mb-2 text-destructive">{error}</div>
          <div className="text-sm text-muted-foreground">Redirecting to login...</div>
        </Surface>
      </PageShell>
    );
  }

  return (
    <PageShell className="flex min-h-screen items-center justify-center py-12">
      <Surface className="w-full max-w-md text-center">
        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
        <div className="text-base font-medium text-foreground">Authenticating...</div>
      </Surface>
    </PageShell>
  );
}
