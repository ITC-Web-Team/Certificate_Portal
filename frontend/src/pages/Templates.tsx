import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Eye, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, PageShell, Surface } from "@/components/ui/page-shell";
import CsvEditDialog from "@/components/CsvEditDialog";

interface Template {
  id: number;
  title: string;
  template: string;
  organization: string;
  verified: boolean;
  csv_data: string;
  fields: {
    field_name: string;
    x: number;
    y: number;
    font_size: number;
    font_color: string;
    font_family: string;
  }[];
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/templates/${user.roll}/`);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, [user.roll]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/delete/${id}/${user.roll}/`);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  if (loading) {
    return (
      <PageShell>
        <Surface className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading templates...</span>
        </Surface>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Your Templates"
        subtitle="Manage uploaded templates, inspect previews, and download source CSV files."
        action={
          <Link to="/load">
            <Button>Create New Template</Button>
          </Link>
        }
      />

      <div className="page-grid">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col overflow-hidden">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="truncate text-base sm:text-lg">
                  {template.title}
                </CardTitle>
                <Badge
                  variant={template.verified ? "success" : "secondary"}
                  className="shrink-0"
                >
                  {template.verified ? (
                    <div className="flex items-center whitespace-nowrap">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center whitespace-nowrap">
                      <XCircle className="mr-1 h-3 w-3" />
                      Pending
                    </div>
                  )}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{template.organization}</p>
            </CardHeader>

            <CardContent>
              <div className="relative aspect-[1.4] w-full">
                <img
                  src={`${template.template}`}
                  alt={template.title}
                  className="absolute inset-0 h-full w-full rounded-xl border border-border/70 bg-muted/20 object-contain"
                />
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 flex-1 text-xs sm:text-sm"
                onClick={() => handlePreview(template)}
              >
                <Eye className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                Preview
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10"
                onClick={() => setEditTemplate(template)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleDelete(template.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="m-4 w-[calc(100%-2rem)] max-w-3xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-2 overflow-auto rounded-xl border border-border/70 p-3">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/certificate/${previewTemplate.id}/generate/${user.roll}/`}
                alt="Certificate Preview"
                className="h-auto w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {templates.length === 0 && (
        <Surface className="mt-6 px-4 py-10 text-center">
          <div className="mb-4 text-sm text-muted-foreground sm:text-base">
            No templates found
          </div>
          <Link to="/load">
            <Button variant="outline" className="text-xs sm:text-sm">
              Create Your First Template
            </Button>
          </Link>
        </Surface>
      )}

      {editTemplate && (
        <CsvEditDialog
          open={!!editTemplate}
          onOpenChange={(open) => { if (!open) setEditTemplate(null); }}
          certificateId={editTemplate.id}
          certificateTitle={editTemplate.title}
          userRoll={user.roll}
        />
      )}
    </PageShell>
  );
}