import { useState } from "react";
import { type TableSection, type TableRow } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableSectionProps {
  section: TableSection;
  onChange: (section: TableSection) => void;
  readOnly?: boolean;
}

export function DataTableSection({ section, onChange, readOnly = false }: DataTableSectionProps) {
  const addRow = () => {
    const newRow: TableRow = {
      id: crypto.randomUUID(),
      cells: Array(section.numCols).fill(""),
    };
    onChange({
      ...section,
      rows: [...section.rows, newRow],
    });
  };

  const removeRow = (rowId: string) => {
    onChange({
      ...section,
      rows: section.rows.filter(r => r.id !== rowId),
    });
  };

  const updateCell = (rowId: string, colIndex: number, value: string) => {
    onChange({
      ...section,
      rows: section.rows.map(row => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          cells: row.cells.map((cell, idx) => (idx === colIndex ? value : cell)),
        };
      }),
    });
  };

  return (
    <div className="space-y-0">
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse border border-slate-900">
          <thead>
            {/* Main Evaluation Row */}
            <tr className="bg-white">
              <th className="border border-slate-900 p-1 font-bold text-center w-1/3 uppercase">
                {readOnly ? (
                  section.colLabels?.[0] || "Hasil evaluasi"
                ) : (
                  <Input 
                    value={section.colLabels?.[0] || ""} 
                    onChange={e => {
                      const newLabels = [...(section.colLabels || Array(section.numCols).fill(""))];
                      newLabels[0] = e.target.value;
                      onChange({...section, colLabels: newLabels});
                    }}
                    placeholder="Hasil evaluasi..."
                    className="h-5 text-[10px] text-center border-0 bg-transparent p-0 uppercase font-bold"
                  />
                )}
              </th>
              <th className="border border-slate-900 p-1 font-bold text-center w-1/3 uppercase">
                {readOnly ? (
                  section.colLabels?.[1] || "Spesifikasi Teknik"
                ) : (
                  <Input 
                    value={section.colLabels?.[1] || ""} 
                    onChange={e => {
                      const newLabels = [...(section.colLabels || Array(section.numCols).fill(""))];
                      newLabels[1] = e.target.value;
                      onChange({...section, colLabels: newLabels});
                    }}
                    placeholder="Spesifikasi Teknik..."
                    className="h-5 text-[10px] text-center border-0 bg-transparent p-0 uppercase font-bold"
                  />
                )}
              </th>
              <th className="border border-slate-900 p-1 font-bold text-center w-1/3 uppercase">
                {readOnly ? (
                  section.colLabels?.[2] || "Keterangan"
                ) : (
                  <Input 
                    value={section.colLabels?.[2] || ""} 
                    onChange={e => {
                      const newLabels = [...(section.colLabels || Array(section.numCols).fill(""))];
                      newLabels[2] = e.target.value;
                      onChange({...section, colLabels: newLabels});
                    }}
                    placeholder="Keterangan..."
                    className="h-5 text-[10px] text-center border-0 bg-transparent p-0 uppercase font-bold"
                  />
                )}
              </th>
            </tr>
            <tr className="bg-white">
              <td className="border border-slate-900 p-1 text-center text-[10px]">
                {readOnly ? (
                  section.evaluationLabel || "Ada dan Sesuai"
                ) : (
                  <Input 
                    value={section.evaluationLabel || ""} 
                    onChange={e => onChange({...section, evaluationLabel: e.target.value})}
                    placeholder="Hasil evaluasi..."
                    className="h-5 text-[10px] text-center border-0 bg-transparent p-0 uppercase"
                  />
                )}
              </td>
              <td className="border border-slate-900 p-1 text-center text-[10px] font-medium">
                {readOnly ? (
                  section.title || "Terpasang lengkap"
                ) : (
                  <Input 
                    value={section.title || ""} 
                    onChange={e => onChange({...section, title: e.target.value})}
                    placeholder="Spesifikasi Teknik..."
                    className="h-5 text-[10px] text-center border-0 bg-transparent p-0 uppercase"
                  />
                )}
              </td>
              <td className="border border-slate-900 p-1 text-center text-[10px]">
                {readOnly ? (
                  section.description || "Berfungsi dengan normal"
                ) : (
                  <Input 
                    value={section.description || ""} 
                    onChange={e => onChange({...section, description: e.target.value})}
                    placeholder="Keterangan..."
                    className="h-5 text-[10px] text-center border-0 bg-transparent p-0 uppercase"
                  />
                )}
              </td>
            </tr>
          </thead>
        </table>

        {/* Nested Data Table */}
        <div className="mt-4 flex justify-center">
          <table className="w-full text-[10px] border-collapse border border-slate-900">
            <tbody>
              {/* Dynamic Header row */}
              <tr className="bg-white">
                {Array.from({ length: section.numCols }).map((_, i) => (
                  <td key={i} className="border border-slate-900 p-1 font-bold text-center uppercase" style={{ width: section.colWidths[i] }}>
                    {readOnly ? (
                      section.colLabels?.[i] || ""
                    ) : (
                      <Input
                        value={section.colLabels?.[i] || ""}
                        onChange={(e) => {
                          const newLabels = [...(section.colLabels || Array(section.numCols).fill(""))];
                          newLabels[i] = e.target.value;
                          onChange({ ...section, colLabels: newLabels });
                        }}
                        placeholder="Label..."
                        className="h-5 text-[10px] text-center border-0 bg-transparent p-0 font-bold uppercase"
                      />
                    )}
                  </td>
                ))}
              </tr>
              {section.rows.map((row, rowIndex) => (
                <tr key={row.id} className="group relative">
                  {row.cells.map((cell, colIndex) => (
                    <td
                      key={`${row.id}-${colIndex}`}
                      className={cn(
                        "border border-slate-900 p-1",
                        colIndex === 0 ? "text-left font-bold bg-white pl-2" : "text-center"
                      )}
                    >
                      {readOnly ? (
                        <div className="min-h-[1.2rem] text-slate-900 font-medium uppercase">{cell}</div>
                      ) : (
                        <Input
                          value={cell}
                          onChange={(e) => updateCell(row.id, colIndex, e.target.value)}
                          placeholder="..."
                          className={cn(
                            "h-5 text-[10px] border-0 bg-transparent hover:bg-slate-50 focus:bg-white p-1 uppercase",
                            colIndex === 0 ? "text-left font-bold" : "text-center"
                          )}
                        />
                      )}
                    </td>
                  ))}
                  {!readOnly && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRow(row.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-center mt-2 no-print">
          <Button variant="outline" size="sm" onClick={addRow} className="gap-2 h-7 text-[10px]">
            <Plus className="w-3 h-3" />
            Tambah Baris Data
          </Button>
        </div>
      )}
    </div>
  );
}

