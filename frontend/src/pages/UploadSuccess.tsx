import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

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
    return <div className="container mx-auto py-8">Loading preview...</div>;
  }

  const previewSrc = preview
    ? `${API}/certificate/${id}/generate/${preview.first_roll}/`
    : "";

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Certificate Uploaded Successfully</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your certificate template for{" "}
                <span className="font-medium">{preview?.organization}</span> has been uploaded and is
                pending verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {previewSrc && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Preview (First Entry)</h2>
          <div className="border rounded-lg p-4">
            <img
              src={previewSrc}
              alt="Certificate preview"
              className="w-full h-auto max-w-[800px] mx-auto rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 mt-8">
        <Link to="/certificates">
          <Button variant="outline">View All Certificates</Button>
        </Link>
      </div>
    </div>
  );
}
