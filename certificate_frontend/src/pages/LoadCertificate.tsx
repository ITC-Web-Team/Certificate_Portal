import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VariableData } from "@/components/VariableInput";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { validateCSV } from "@/lib/csvValidator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API = import.meta.env.VITE_API_BASE_URL;

interface CertificateData {
  title: string;
  organization: string;
  template: File | null;
  csvFile: File | null;
  rollColumn: string;
  user: string;
}

export default function LoadCertificate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [certificateData, setCertificateData] = useState<CertificateData>({
    title: "",
    organization: "",
    template: null,
    csvFile: null,
    rollColumn: "",
    user: JSON.parse(localStorage.getItem("user") || "{}").roll,
  });
  const [variables, setVariables] = useState<VariableData[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvFirstRow, setCsvFirstRow] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [templateDims, setTemplateDims] = useState<{ w: number; h: number } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const centerX = templateDims ? Math.round(templateDims.w / 2) : 0;
  const centerY = templateDims ? Math.round(templateDims.h / 2) : 0;

  const [editingVariable, setEditingVariable] = useState<VariableData>({
    field_name: "",
    csv_column: "",
    x: 0,
    y: 0,
    font_color: "#000000",
    font_weight: "normal",
    font_size: 16,
  });

  useEffect(() => {
    if (!templateDims) return;
    setEditingVariable((prev) => {
      if (prev.x === 0 && prev.y === 0) {
        return { ...prev, x: Math.round(templateDims.w / 2), y: Math.round(templateDims.h / 2) };
      }
      return prev;
    });
  }, [templateDims]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.roll) {
      setCertificateData((prev) => ({ ...prev, user: user.roll }));
    } else {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (e.target.name === "template") {
      setCertificateData((prev) => ({ ...prev, template: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      const img = new Image();
      img.onload = () => setTemplateDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = url;
    } else if (e.target.name === "csv") {
      handleCSVUpload(file);
    }
  };

  const handleCSVUpload = async (file: File) => {
    setError(null);
    const result = await validateCSV(file);
    if (!result.isValid) {
      setError(result.error || "Invalid CSV file");
      return;
    }
    setCsvColumns(result.headers || []);
    setCsvFirstRow(result.firstRow || {});
    setCertificateData((prev) => ({ ...prev, csvFile: file }));
  };

  const handleFirstStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateData.template && certificateData.csvFile && certificateData.rollColumn) {
      setStep(2);
    }
  };

  const handleAddVariable = () => {
    if (editingVariable.field_name && editingVariable.csv_column) {
      setVariables((prev) => [...prev, editingVariable]);
      setEditingVariable({
        field_name: "",
        csv_column: "",
        x: centerX,
        y: centerY,
        font_color: "#000000",
        font_weight: "normal",
        font_size: 16,
      });
    }
  };

  const handleRemoveVariable = (index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditVariable = (index: number, updated: VariableData) => {
    setVariables((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const abortRef = useRef<AbortController | null>(null);
  const prevBlobRef = useRef<string | null>(null);

  const fetchPreview = useCallback(async () => {
    if (!certificateData.template) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPreviewLoading(true);
    setError(null);
    try {
      const renderVars = variables.map((v) => ({
        text: csvFirstRow[v.csv_column] || v.field_name,
        x: v.x,
        y: v.y,
        font_size: v.font_size,
        font_color: v.font_color,
        font_family: v.font_weight || "normal",
      }));

      const fd = new FormData();
      fd.append("template", certificateData.template);
      fd.append("variables", JSON.stringify(renderVars));

      const res = await axios.post(`${API}/preview-render/`, fd, {
        responseType: "blob",
        signal: controller.signal,
      });

      const newUrl = URL.createObjectURL(res.data);
      if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
      prevBlobRef.current = newUrl;
      setPreviewImageUrl(newUrl);
    } catch (err) {
      if (!axios.isCancel(err)) setError("Failed to generate preview");
    } finally {
      if (abortRef.current === controller) setPreviewLoading(false);
    }
  }, [certificateData.template, variables, csvFirstRow]);

  useEffect(() => {
    if (step !== 2 || !certificateData.template) return;
    const timer = setTimeout(fetchPreview, 800);
    return () => clearTimeout(timer);
  }, [step, variables, certificateData.template, csvFirstRow, fetchPreview]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    if (!certificateData.title || !certificateData.template || !certificateData.csvFile) {
      setLoading(false);
      return;
    }

    const backendVars = variables.map((v) => ({
      field_name: v.field_name,
      csv_column: v.csv_column,
      x: Math.max(0, Math.round(v.x)),
      y: Math.max(0, Math.round(v.y)),
      font_size: Math.max(1, Math.round(v.font_size)),
      font_color: v.font_color.startsWith("#") ? v.font_color : "#000000",
      font_family: v.font_weight || "normal",
    }));

    if (backendVars.length === 0) {
      setLoading(false);
      return;
    }

    const fd = new FormData();
    fd.append("title", certificateData.title);
    fd.append("organization", certificateData.organization);
    fd.append("template", certificateData.template);
    fd.append("csv_file", certificateData.csvFile);
    fd.append("roll_column", certificateData.rollColumn);
    fd.append("user", certificateData.user);
    fd.append("variables", JSON.stringify(backendVars));

    try {
      const res = await axios.post(`${API}/upload/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 201) navigate(`/upload-success/${res.data.id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Upload failed");
      else setError("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#101828]">Create New Template</h1>
          <p className="mt-1 text-[#475467]">Add a new certificate template and configure its variables.</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleFirstStep} className="space-y-6 bg-white p-6 rounded-lg border border-[#E4E7EC] shadow-sm">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#344054]">Certificate Title</Label>
                  <Input
                    id="title"
                    value={certificateData.title}
                    onChange={(e) => setCertificateData({ ...certificateData, title: e.target.value })}
                    placeholder="Enter certificate title"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-[#344054]">Organization Name</Label>
                  <Input
                    id="organization"
                    value={certificateData.organization}
                    onChange={(e) => setCertificateData({ ...certificateData, organization: e.target.value })}
                    placeholder="Enter organization name"
                    className="h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#344054]">Certificate Template</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      name="template"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#F2F4F7] file:text-[#344054] hover:file:bg-[#E4E7EC]"
                      required
                    />
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="h-11 w-auto rounded border border-[#E4E7EC]" />
                    )}
                  </div>
                  <p className="text-sm text-[#475467]">Upload a PNG or JPG image (max 5MB)</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#344054]">Data File (CSV)</Label>
                  <Input
                    type="file"
                    name="csv"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#F2F4F7] file:text-[#344054] hover:file:bg-[#E4E7EC]"
                    required
                  />
                  <p className="text-sm text-[#475467]">Upload a CSV file containing certificate data</p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {csvColumns.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[#344054]">Roll Number Column</Label>
                    <Select
                      value={certificateData.rollColumn}
                      onValueChange={(value: string) => setCertificateData({ ...certificateData, rollColumn: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select column for roll numbers" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvColumns.map((column) => (
                          <SelectItem key={column} value={column}>{column}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-[#475467]">Select the column containing roll numbers</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E4E7EC]">
              <Button
                type="submit"
                disabled={!certificateData.template || !certificateData.csvFile || !certificateData.rollColumn}
                className="w-full sm:w-auto"
              >
                Continue to Variables
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Preview</h2>
                  {templateDims && (
                    <p className="text-sm text-[#475467]">
                      Template: {templateDims.w} &times; {templateDims.h} px &mdash; coordinates are the center of each text field.
                    </p>
                  )}
                </div>
                <Button
                  onClick={fetchPreview}
                  disabled={previewLoading}
                  variant="outline"
                  size="sm"
                >
                  {previewLoading ? "Rendering..." : "Refresh Preview"}
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Certificate preview"
                    className="w-full h-auto max-w-[800px] mx-auto rounded-lg"
                  />
                ) : previewLoading ? (
                  <p className="text-center text-[#475467] py-12">Rendering preview...</p>
                ) : (
                  <p className="text-center text-[#475467] py-12">Loading template...</p>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Variables table */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Variables</h2>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variable Name</TableHead>
                      <TableHead>CSV Column</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variables.map((variable, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={variable.field_name}
                            onChange={(e) => handleEditVariable(index, { ...variable, field_name: e.target.value })}
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={variable.csv_column}
                            onValueChange={(value: string) => handleEditVariable(index, { ...variable, csv_column: value })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {csvColumns.map((column) => (
                                <SelectItem key={column} value={column}>{column}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col gap-1">
                                    <Label className="text-xs">X</Label>
                                    <Input
                                      type="number"
                                      value={variable.x}
                                      onChange={(e) => handleEditVariable(index, { ...variable, x: parseInt(e.target.value) || 0 })}
                                      className="h-9 w-[70px]"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent><p>Horizontal center</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Y</Label>
                                    <Input
                                      type="number"
                                      value={variable.y}
                                      onChange={(e) => handleEditVariable(index, { ...variable, y: parseInt(e.target.value) || 0 })}
                                      className="h-9 w-[70px]"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent><p>Vertical center</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Color</Label>
                                    <Input
                                      type="color"
                                      value={variable.font_color}
                                      onChange={(e) => handleEditVariable(index, { ...variable, font_color: e.target.value })}
                                      className="h-9 w-[50px] p-1"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent><p>Font color</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Size</Label>
                                    <Input
                                      type="number"
                                      value={variable.font_size}
                                      onChange={(e) => handleEditVariable(index, { ...variable, font_size: parseInt(e.target.value) || 16 })}
                                      className="h-9 w-[60px]"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent><p>Font size (px)</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Select
                              value={variable.font_weight}
                              onValueChange={(value: string) => handleEditVariable(index, { ...variable, font_weight: value })}
                            >
                              <SelectTrigger className="h-9 w-[90px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => handleRemoveVariable(index)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex items-center gap-4 p-2">
                          <Input
                            value={editingVariable.field_name}
                            onChange={(e) => setEditingVariable({ ...editingVariable, field_name: e.target.value })}
                            placeholder="Variable name"
                            className="h-9 w-[200px]"
                          />
                          <Select
                            value={editingVariable.csv_column}
                            onValueChange={(value: string) => setEditingVariable({ ...editingVariable, csv_column: value })}
                          >
                            <SelectTrigger className="h-9 w-[200px]">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {csvColumns.map((column) => (
                                <SelectItem key={column} value={column}>{column}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={handleAddVariable}
                            disabled={!editingVariable.field_name || !editingVariable.csv_column}
                            size="sm"
                            className="ml-auto"
                          >
                            Add Variable
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || variables.length === 0}>
                {loading ? "Uploading..." : "Upload Certificate"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
