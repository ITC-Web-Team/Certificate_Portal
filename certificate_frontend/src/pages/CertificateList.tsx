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
import { Search } from "lucide-react";

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

  // Filter certificates based on search term
  const filteredCertificates = certificates.filter(cert => 
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="w-full mx-auto">
      {/* Search bar */}
      <div className="relative mb-6 w-full mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Search certificates by title or organization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Certificate grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCertificates.map((cert) => (
          <Card key={cert.id} className="flex flex-col">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base truncate">{cert.title}</CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {cert.organization}
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <img 
                src={`${cert.template}`} 
                alt={cert.title}
                className="w-full h-36 object-cover rounded-md"
              />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link to={`/certificates/${cert.id}`} className="w-full">
                <Button className="w-full">
                  View Certificate
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredCertificates.length === 0 && (
        <div className="text-center py-8">
          {searchTerm ? (
            <div className="text-gray-500">
              No certificates found matching "{searchTerm}"
            </div>
          ) : (
            <div className="text-gray-500">
              No verified certificates found
            </div>
          )}
        </div>
      )}
    </div>
  );
} 