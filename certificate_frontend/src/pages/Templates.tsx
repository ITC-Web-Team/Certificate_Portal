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
import { CheckCircle2, XCircle, Loader2, Eye, Trash2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/templates/${user.roll}/`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [user.roll]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/delete/${id}/${user.roll}/`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleDownloadCSV = async (templateId: number, title: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/certificate/${templateId}/csv/${user.roll}/`, 
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#101828]">Your Templates</h1>
        <Link to="/load">
          <Button>Create New Template</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader className="space-y-1 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg truncate">
                  {template.title}
                </CardTitle>
                <Badge 
                  variant={template.verified ? "success" : "secondary"}
                  className="shrink-0"
                >
                  {template.verified ? (
                    <div className="flex items-center whitespace-nowrap">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  ) : (
                    <div className="flex items-center whitespace-nowrap">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending
                    </div>
                  )}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {template.organization}
              </p>
            </CardHeader>
            
            <CardContent className="p-3 sm:p-4">
              <div className="relative aspect-[1.4] w-full">
                <img 
                  src={`${template.template}`}
                  alt={template.title}
                  className="absolute inset-0 w-full h-full object-contain rounded-lg bg-gray-50"
                />
              </div>
            </CardContent>

            <CardFooter className="p-3 sm:p-4 pt-0 flex justify-between gap-2">
              <Button 
                variant="outline" 
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                onClick={() => handlePreview(template)}
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Preview
              </Button>
              <Button 
                variant="secondary" 
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => handleDownloadCSV(template.id, template.title)}
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => handleDelete(template.id)}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl m-4">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-4 overflow-auto">
              <img 
                src={`${import.meta.env.VITE_API_BASE_URL}/certificate/${previewTemplate.id}/generate/${user.roll}/`}
                alt="Certificate Preview"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {templates.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-[#E4E7EC] px-4">
          <div className="text-[#475467] mb-4 text-sm sm:text-base">
            No templates found
          </div>
          <Link to="/load">
            <Button variant="outline" className="text-xs sm:text-sm">
              Create Your First Template
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 