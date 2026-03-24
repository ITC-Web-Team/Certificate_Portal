import { useSearchParams, Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, Surface } from "@/components/ui/page-shell";

export default function ErrorCallback() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error") || "Unknown error occurred";

  return (
    <PageShell className="flex min-h-screen items-center justify-center py-12">
      <Surface className="w-full max-w-md space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Link to="/">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </Surface>
    </PageShell>
  );
}