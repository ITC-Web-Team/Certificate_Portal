import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">Verifying certificate...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : certificateData && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-800">Certificate Verified</AlertTitle>
              <AlertDescription className="text-green-700 flex gap-1">
                This is an authentic certificate issued by 
                <span className="font-bold underline">
                  {certificateData.organization}
                </span>
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 bg-white">
              <img 
                src={`${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${rollNumber}/`}
                alt="Certificate Preview"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 