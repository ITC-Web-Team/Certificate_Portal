import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { PageHeader, PageShell, Surface } from "@/components/ui/page-shell";

const API = import.meta.env.VITE_API_BASE_URL;

interface PreviewData {
  organization: string;
  first_roll: string;
}

export default function UploadSuccess() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    axios
      .get(`${API}/certificate/${id}/preview/`)
      .then((res) => setPreview(res.data))
      .catch((err) => console.error("Error fetching preview:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <Surface className="text-center text-muted-foreground">Loading preview...</Surface>
      </PageShell>
    );
  }

  const previewSrc = preview
    ? `${API}/certificate/${id}/generate/${preview.first_roll}/`
    : "";

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Template Uploaded"
          subtitle="Your template is now available for verification and certificate generation."
        />

        <Surface className="border-emerald-200 bg-emerald-50/70">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div className="text-sm text-emerald-800">
              Your certificate template for <span className="font-semibold">{preview?.organization}</span> has been uploaded successfully and is pending verification.
            </div>
          </div>
        </Surface>

        {previewSrc && (
          <Surface className="space-y-4 p-4">
            <h2 className="text-lg font-semibold text-foreground">Preview (First CSV Entry)</h2>
            <img
              src={previewSrc}
              alt="Certificate preview"
              className="mx-auto h-auto w-full max-w-[900px] rounded-lg"
            />
          </Surface>
        )}

        <div className="flex justify-end">
          <Link to="/certificates">
            <Button variant="outline">View All Certificates</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
