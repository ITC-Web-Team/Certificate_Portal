import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Upload,
  Download,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateId: number;
  certificateTitle: string;
  userRoll: string;
}

export default function CsvEditDialog({
  open,
  onOpenChange,
  certificateId,
  certificateTitle,
  userRoll,
}: Props) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const base = import.meta.env.VITE_API_BASE_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${base}/certificate/${certificateId}/csv-data/${userRoll}/`
      );
      setHeaders(res.data.headers);
      setRows(res.data.rows);
      setDirty(false);
    } catch (err) {
      console.error("Failed to load CSV data:", err);
    } finally {
      setLoading(false);
    }
  }, [base, certificateId, userRoll]);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    setRows((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[rowIdx][colIdx] = value;
      return copy;
    });
    setDirty(true);
  };

  const addRow = () => {
    setRows((prev) => [...prev, headers.map(() => "")]);
    setDirty(true);
  };

  const deleteRow = (rowIdx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== rowIdx));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${base}/certificate/${certificateId}/csv-data/${userRoll}/`,
        { headers, rows }
      );
      setDirty(false);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("csv_file", file);
    setLoading(true);
    try {
      await axios.post(
        `${base}/certificate/${certificateId}/csv-replace/${userRoll}/`,
        formData
      );
      await fetchData();
    } catch (err) {
      console.error("Failed to re-upload:", err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(
        `${base}/certificate/${certificateId}/csv/${userRoll}/`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `${certificateTitle.toLowerCase().replace(/\s+/g, "-")}-data.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-5xl flex-col gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg">
            Edit Data &mdash; {certificateTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
          <Button size="sm" variant="outline" onClick={addRow}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Row
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Re-upload CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleReupload}
          />
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download CSV
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">#</TableHead>
                  {headers.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, ri) => (
                  <TableRow key={ri}>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {ri + 1}
                    </TableCell>
                    {row.map((cell, ci) => (
                      <TableCell key={ci} className="p-1.5">
                        <Input
                          value={cell}
                          onChange={(e) => updateCell(ri, ci, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="p-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteRow(ri)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={headers.length + 2}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No rows. Click "Add Row" or "Re-upload CSV" to add data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
