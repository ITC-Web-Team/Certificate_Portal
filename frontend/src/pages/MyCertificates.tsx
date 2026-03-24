import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loader2, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell, Surface } from "@/components/ui/page-shell";

interface MyCert {
  id: number;
  title: string;
  organization: string;
  template: string;
  created_at: string;
}

export default function MyCertificates() {
  const [certs, setCerts] = useState<MyCert[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchMyCerts = useCallback(async () => {
    if (!user.roll) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/my-certificates/${user.roll}/`
      );
      setCerts(res.data);
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setLoading(false);
    }
  }, [user.roll]);

  useEffect(() => {
    fetchMyCerts();
  }, [fetchMyCerts]);

  if (loading) {
    return (
      <PageShell>
        <Surface className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading your certificates...
        </Surface>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="My Certificates"
        subtitle="Certificates issued to you. Click to view, download, or share."
      />

      {certs.length === 0 ? (
        <Surface className="py-16 text-center">
          <Award className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No certificates found for your account.
          </p>
          <Link to="/certificates" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              Browse All Certificates
            </Button>
          </Link>
        </Surface>
      ) : (
        <div className="page-grid">
          {certs.map((cert) => (
            <Link key={cert.id} to={`/certificates/${cert.id}`} className="group">
              <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-md">
                <CardHeader className="space-y-1 pb-0">
                  <CardTitle className="truncate text-base sm:text-lg">
                    {cert.title}
                  </CardTitle>
                  <p className="truncate text-xs text-muted-foreground">
                    {cert.organization}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[1.4] w-full">
                    <img
                      src={cert.template}
                      alt={cert.title}
                      className="absolute inset-0 h-full w-full rounded-xl border border-border/70 bg-muted/20 object-contain"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Certificate</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
