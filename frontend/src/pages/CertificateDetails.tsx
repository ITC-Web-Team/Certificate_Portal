import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Download, FileDown, Image, Share2, Copy, Check } from "lucide-react";
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

export default function CertificateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificateInfo, setCertificateInfo] = useState<{ title: string, organization: string } | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const verifyLinkRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const checkCertificate = async () => {
      try {
        const userJson = localStorage.getItem("user");
        if (!userJson) {
          navigate("/");
          return;
        }

        const response1 = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/info/`);
        setCertificateInfo(response1.data);

        const currentUser = JSON.parse(userJson);
        const rollNumber = currentUser.roll;

        const response2 = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/details/${rollNumber}/`
        );
        setCertificateData(response2.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setError("certificate_not_found");
        } else {
          setError("fetch_error");
        }
      } finally {
        setLoading(false);
      }
    };

    checkCertificate();
  }, [id, navigate]);

  const handleDownload = async (mode: "pdf" | "png", extension: "pdf" | "png") => {
    if (!certificateInfo) return;

    setDownloading(true);
    try {
      const userRoll = JSON.parse(localStorage.getItem("user") || "{}").roll;
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${userRoll}/${mode}/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${certificateInfo.title.toLowerCase().replace(/\s+/g, "-")}-certificate.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = () => handleDownload("pdf", "pdf");
  const handleDownloadImage = () => handleDownload("png", "png");

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopy = async () => {
    const link = getVerificationLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (verifyLinkRef.current) {
        verifyLinkRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const getVerificationLink = () => {
    const baseUrl = window.location.origin;
    const userJson = localStorage.getItem("user");
    const userRoll = userJson ? JSON.parse(userJson).roll : "";
    return `${baseUrl}/verify/${id}/${userRoll}`;
  };

  if (loading) {
    return (
      <PageShell>
        <Surface className="max-w-4xl text-center text-muted-foreground">Loading your certificate...</Surface>
      </PageShell>
    );
  }

  const renderError = () => {
    if (!certificateInfo) return null;

    switch (error) {
      case "certificate_not_found":
        return (
          <Surface className="space-y-4 text-center">
            <Alert variant="destructive" className="mx-auto max-w-2xl text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Certificate Not Found</AlertTitle>
              <AlertDescription>
                Oops! We couldn't find a certificate for you in{" "}
                <span className="font-medium">{certificateInfo.title}</span> by{" "}
                <span className="font-medium">{certificateInfo.organization}</span>.
              </AlertDescription>
            </Alert>
            <p className="text-muted-foreground">
              If you believe this is a mistake, please contact the event organizers.
            </p>
            <Link to="/my-certificates">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Certificates
              </Button>
            </Link>
          </Surface>
        );
      case "fetch_error":
        return (
          <Surface>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                An error occurred while fetching your certificate. Please try again later.
              </AlertDescription>
            </Alert>
          </Surface>
        );
      default:
        return null;
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {error ? (
          renderError()
        ) : certificateData && (
          <>
            <PageHeader
              title="Your Certificate"
              subtitle={`${certificateData.title} · ${certificateData.organization}`}
              action={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button disabled={downloading}>
                        <Download className="mr-2 h-4 w-4" />
                        {downloading ? "Generating..." : "Download"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleDownloadPDF}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadImage}>
                        <Image className="mr-2 h-4 w-4" />
                        Download as Image
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />

            <Surface className="p-3 sm:p-4">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${user.roll}/`}
                alt="Certificate Preview"
                className="h-auto w-full rounded-lg"
              />
            </Surface>

            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Certificate</DialogTitle>
                  <DialogDescription>
                    Anyone with this link can verify your certificate
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <Input
                    ref={verifyLinkRef}
                    readOnly
                    value={getVerificationLink()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </PageShell>
  );
}