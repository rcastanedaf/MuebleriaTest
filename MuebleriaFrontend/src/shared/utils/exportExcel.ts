import * as XLSX from "xlsx";

export function exportToExcel(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const rows = [
    columns.map((c) => c.label),
    ...data.map((row) => columns.map((c) => row[c.key] ?? "")),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
