import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PageShell, Surface } from "@/components/ui/page-shell";

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
    };
  };
}

function extractName(fields: CertificateData["fields"]): string | null {
  const nameKey = Object.keys(fields).find((k) =>
    k.toLowerCase().includes("name")
  );
  return nameKey ? fields[nameKey].value : null;
}

export default function VerifyCertificate() {
  const { id, rollNumber } = useParams();
  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/details/${rollNumber}/`
        );
        setCertificateData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
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
        <Surface className="mx-auto max-w-4xl text-center text-muted-foreground">
          Verifying certificate...
        </Surface>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-4">
        {error ? (
          <Surface>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </Surface>
        ) : (
          certificateData && (
            <>
              <p className="text-center text-sm text-muted-foreground sm:text-base">
                This certificate is issued by{" "}
                <span className="font-semibold text-foreground">
                  {certificateData.organization}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {extractName(certificateData.fields) ?? "—"}
                </span>{" "}
                ({rollNumber})
              </p>

              <Surface className="p-3 sm:p-4">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${rollNumber}/`}
                  alt="Certificate"
                  className="h-auto w-full rounded-lg"
                />
              </Surface>
            </>
          )
        )}
      </div>
    </PageShell>
  );
}
