import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { PageHeader, PageShell, Surface } from "@/components/ui/page-shell";

interface Certificate {
  id: number;
  title: string;
  template: string;
  organization: string;
  verified: boolean;
}

export default function CertificateList() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/certificate`);
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter(cert => 
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <PageShell>
        <Surface className="text-center text-muted-foreground">Loading certificates...</Surface>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Certificates"
        subtitle="Browse issued certificates and open recipient-specific certificate views."
        action={
          <Link to="/load">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </Link>
        }
      />

      <Surface className="mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by certificate title or organization"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
      </Surface>

      <div className="page-grid">
        {filteredCertificates.map((cert) => (
          <Card key={cert.id} className="flex flex-col overflow-hidden">
            <CardHeader className="space-y-1 pb-0">
              <CardTitle className="text-base truncate">{cert.title}</CardTitle>
              <p className="truncate text-xs text-muted-foreground">{cert.organization}</p>
            </CardHeader>
            <CardContent>
              <img
                src={`${cert.template}`}
                alt={cert.title}
                className="h-40 w-full rounded-xl border border-border/70 object-cover"
              />
            </CardContent>
            <CardFooter>
              <Link to={`/certificates/${cert.id}`} className="w-full">
                <Button className="w-full">View Certificate</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <Surface className="mt-6 text-center">
          {searchTerm ? (
            <div className="text-muted-foreground">
              No certificates found matching "{searchTerm}"
            </div>
          ) : (
            <div className="text-muted-foreground">
              No verified certificates found
            </div>
          )}
        </Surface>
      )}
    </PageShell>
  );
}