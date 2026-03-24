import { Button } from "@/components/ui/button";
import { useState } from "react";

interface VariableInputProps {
  onAdd: (variable: VariableData) => void;
  onRemove: (index: number) => void;
  index: number;
  csvColumns: string[];
}

export interface VariableData {
  field_name: string;
  csv_column: string;
  x: number;
  y: number;
  font_color: string;
  font_weight: string;
  font_size: number;
}

export default function VariableInput({ onAdd, onRemove, index, csvColumns }: VariableInputProps) {
  const [variable, setVariable] = useState<VariableData>({
    field_name: "",
    csv_column: csvColumns[0] || "",
    x: 0,
    y: 0,
    font_color: "#000000",
    font_weight: "normal",
    font_size: 16
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(variable);
    setVariable({
      field_name: "",
      csv_column: csvColumns[0] || "",
      x: 0,
      y: 0,
      font_color: "#000000",
      font_weight: "normal",
      font_size: 16
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Variable Name</label>
          <input
            type="text"
            value={variable.field_name}
            onChange={(e) => setVariable({ ...variable, field_name: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CSV Column</label>
          <select
            value={variable.csv_column}
            onChange={(e) => setVariable({ ...variable, csv_column: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select a column</option>
            {csvColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">X Position</label>
          <input
            type="number"
            value={variable.x}
            onChange={(e) => setVariable({ ...variable, x: parseInt(e.target.value) })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Y Position</label>
          <input
            type="number"
            value={variable.y}
            onChange={(e) => setVariable({ ...variable, y: parseInt(e.target.value) })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Font Size</label>
          <input
            type="number"
            value={variable.font_size}
            onChange={(e) => setVariable({ ...variable, font_size: parseInt(e.target.value) })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Font Color</label>
          <input
            type="color"
            value={variable.font_color}
            onChange={(e) => setVariable({ ...variable, font_color: e.target.value })}
            className="w-full p-2 border rounded-md h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Font Weight</label>
          <select
            value={variable.font_weight}
            onChange={(e) => setVariable({ ...variable, font_weight: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="submit" variant="default">
          Add Variable
        </Button>
        <Button type="button" variant="destructive" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </div>
    </form>
  );
} 