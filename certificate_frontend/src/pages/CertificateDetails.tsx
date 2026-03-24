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

interface CertificateData {
  template: string;
  organization: string;  // Add this to show in error message
  title: string;        // Add this to show in error message
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const checkCertificate = async () => {
      try {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
          localStorage.setItem('user', JSON.stringify({roll: '22b0661'}));
          navigate('/');
          return;
        } 

        // First fetch certificate info
        const response1 = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/info/`);
        setCertificateInfo(response1.data);

        const user = JSON.parse(userJson);
        const rollNumber = user.roll;  

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

  const handleDownloadPDF = async () => {
    if (!certificateInfo) return;
    
    setDownloading(true);
    try {
      const userRoll = JSON.parse(localStorage.getItem('user') || '{}').roll;
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${userRoll}/pdf/`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificateInfo.title.toLowerCase().replace(/\s+/g, '-')}-certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateInfo) return;
    
    setDownloading(true);
    try {
      const userRoll = JSON.parse(localStorage.getItem('user') || '{}').roll;
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${userRoll}/png/`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificateInfo.title.toLowerCase().replace(/\s+/g, '-')}-certificate.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopy = () => {
    if (verifyLinkRef.current) {
      verifyLinkRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getVerificationLink = () => {
    const baseUrl = window.location.origin;
    const userJson = localStorage.getItem('user');
    const userRoll = userJson ? JSON.parse(userJson).roll : '';
    return `${baseUrl}/verify/${id}/${userRoll}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">Loading your certificate...</div>
      </div>
    );
  }

  const renderError = () => {
    if (!certificateInfo) return null;

    switch (error) {
      case "certificate_not_found":
        return (
          <div className="text-center space-y-4">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
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
            <Link to="/certificates">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Certificates
              </Button>
            </Link>
          </div>
        );
      case "fetch_error":
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              An error occurred while fetching your certificate. Please try again later.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {error ? (
          renderError()
        ) : certificateData && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Certificate</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                >
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
            </div>
            
            <div className="border rounded-lg p-4 bg-white">
              <img 
                src={`${import.meta.env.VITE_API_BASE_URL}/certificate/${id}/generate/${user.roll}/`}
                alt="Certificate Preview"
                className="w-full h-auto rounded-lg"
              />
            </div>

            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Certificate</DialogTitle>
                  <DialogDescription>
                    Anyone with this link can verify your certificate
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 items-center">
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
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
} 