import { useState, useEffect } from "react";
import { type TableSection, type TableRow } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Table as TableIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableSectionProps {
  section: TableSection;
  onChange: (updates: Partial<TableSection>) => void;
  readOnly?: boolean;
}

export function DataTableSection({ section, onChange, readOnly = false }: DataTableSectionProps) {
  const [dataColInput, setDataColInput] = useState<string>(section.numCols.toString());
  const [dataRowInput, setDataRowInput] = useState<string>(section.rows.length.toString());

  // Local state for evaluation table dimensions
  const [evalColInput, setEvalColInput] = useState<string>("3");
  const [evalRowInput, setEvalRowInput] = useState<string>("2");

  useEffect(() => {
    setDataColInput(section.numCols.toString());
    setDataRowInput(section.rows.length.toString());
  }, [section.numCols, section.rows.length]);

  const updateDataColumns = (value: string) => {
    setDataColInput(value);
    const newCount = parseInt(value);
    if (isNaN(newCount) || newCount < 1) return;
    
    const count = Math.min(10, newCount);
    const newLabels = [...(section.dataColLabels || [])];
    const newWidths = Array(count).fill(`${100 / count}%`);
    
    onChange({
      numCols: count,
      dataColLabels: newLabels.slice(0, count),
      colWidths: newWidths,
      rows: section.rows.map(row => ({
        ...row,
        cells: row.cells.length > count 
          ? row.cells.slice(0, count) 
          : [...row.cells, ...Array(count - row.cells.length).fill("")]
      }))
    });
  };

  const updateDataRowsCount = (value: string) => {
    setDataRowInput(value);
    const newCount = parseInt(value);
    if (isNaN(newCount) || newCount < 0) return;

    const count = newCount;
    const currentRows = [...section.rows];
    
    if (count > currentRows.length) {
      const extraRows = Array.from({ length: count - currentRows.length }).map(() => ({
        id: crypto.randomUUID(),
        cells: Array(section.numCols).fill(""),
      }));
      onChange({ rows: [...currentRows, ...extraRows] });
    } else {
      onChange({ rows: currentRows.slice(0, count) });
    }
  };

  const addDataRow = () => {
    const newRow: TableRow = {
      id: crypto.randomUUID(),
      cells: Array(section.numCols).fill(""),
    };
    onChange({
      rows: [...section.rows, newRow],
    });
  };

  const removeDataRow = (rowId: string) => {
    onChange({
      rows: section.rows.filter(r => r.id !== rowId),
    });
  };

  const updateDataCell = (rowId: string, colIndex: number, value: string) => {
    onChange({
      rows: section.rows.map(row => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          cells: row.cells.map((cell, idx) => (idx === colIndex ? value : cell)),
        };
      }),
    });
  };

  const numEvalCols = Math.max(1, parseInt(evalColInput) || 1);
  const numEvalRows = Math.max(1, parseInt(evalRowInput) || 1);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="relative">
          <table className="w-full text-[10px] border-collapse border border-slate-900">
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.id} className="group relative">
                  {row.cells.map((cell, colIndex) => (
                    <td
                      key={`${row.id}-${colIndex}`}
                      className="border border-slate-900 p-1 text-center"
                    >
                      {readOnly ? (
                        <div className="min-h-[1.2rem] text-slate-900 font-medium uppercase">{cell}</div>
                      ) : (
                        <Input
                          value={cell}
                          onChange={(e) => updateDataCell(row.id, colIndex, e.target.value)}
                          placeholder="..."
                          className="h-5 text-[10px] text-center border-0 bg-transparent hover:bg-slate-50 focus:bg-white p-1 uppercase"
                        />
                      )}
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity no-print border-0 p-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeDataRow(row.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DataTableSectionControls({ 
  colInput, onColChange,
  rowInput, onRowChange,
  onRemove
}: { 
  colInput: string;
  onColChange: (v: string) => void;
  rowInput: string;
  onRowChange: (v: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md no-print mb-4 shadow-sm relative group">
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -right-12 top-0 h-8 w-8 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
          title="Hapus Bagian Ini"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
      <div className="flex items-center gap-2">
         <TableIcon className="w-4 h-4 text-primary" />
         <span className="text-xs font-bold text-slate-700 uppercase">PENGATURAN</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-2 bg-white rounded border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Kolom:</span>
              <Input 
                type="text" 
                value={colInput} 
                onChange={(e) => onColChange(e.target.value)}
                className="h-7 w-12 text-[10px] border-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Baris:</span>
              <Input 
                type="text" 
                value={rowInput} 
                onChange={(e) => onRowChange(e.target.value)}
                className="h-7 w-12 text-[10px] border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
