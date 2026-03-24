import Papa from "papaparse";

interface ValidateResult {
  isValid: boolean;
  error?: string;
  headers?: string[];
  firstRow?: Record<string, string>;
}

export function validateCSV(file: File): Promise<ValidateResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as string[][];

        if (rows.length < 2) {
          resolve({ isValid: false, error: "CSV must have a header row and at least one data row" });
          return;
        }

        const headers = rows[0];

        if (headers.length === 0 || headers.every((h) => h.trim() === "")) {
          resolve({ isValid: false, error: "No headers found in CSV" });
          return;
        }

        const trimmed = headers.map((h) => h.trim().toLowerCase());
        if (new Set(trimmed).size !== trimmed.length) {
          resolve({ isValid: false, error: "Duplicate column names found" });
          return;
        }

        const expectedCols = headers.length;
        const bad = rows.find((row, i) => i > 0 && row.length !== expectedCols);
        if (bad) {
          resolve({ isValid: false, error: `Row has ${bad.length} columns but header has ${expectedCols}` });
          return;
        }

        const firstRow: Record<string, string> = {};
        headers.forEach((h, i) => {
          firstRow[h] = rows[1]?.[i] ?? "";
        });

        resolve({ isValid: true, headers, firstRow });
      },
      error(err) {
        resolve({ isValid: false, error: err.message || "Invalid CSV format" });
      },
    });
  });
}
