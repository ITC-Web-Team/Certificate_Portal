import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader, PageShell, Surface } from "@/components/ui/page-shell";

interface CertificateData {
  template: string;
  organization: string;
  title: string;
  fields: {
    [key: string]: {
      value: string;
      x: number;
      y: number;
      font_size: number;
      font_color: string;
      font_family: string;
    }
  };
}

export default function VerifyCertificate() {
  const { id, rollNumber } = useParams();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/details/${rollNumber}/`
        );
        setCertificateData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setError("Invalid certificate or roll number");
        } else {
          setError("Failed to verify certificate");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [id, rollNumber]);

  if (loading) {
    return (
      <PageShell>
        <Surface className="mx-auto max-w-4xl text-center text-muted-foreground">Verifying certificate...</Surface>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Certificate Verification"
          subtitle="Verification endpoint for public certificate authenticity checks."
        />
        {error ? (
          <Surface>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </Surface>
        ) : certificateData && (
          <div className="space-y-4">
            <Surface className="border-emerald-200 bg-emerald-50/70 p-4">
              <Alert className="border-0 bg-transparent p-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800">Certificate Verified</AlertTitle>
                <AlertDescription className="flex gap-1 text-emerald-700">
                  This is an authentic certificate issued by
                  <span className="font-bold underline">{certificateData.organization}</span>
                </AlertDescription>
              </Alert>
            </Surface>

            <Surface className="p-3 sm:p-4">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${rollNumber}/`}
                alt="Certificate Preview"
                className="h-auto w-full rounded-lg"
              />
            </Surface>
          </div>
        )}
      </div>
    </PageShell>
  );
}