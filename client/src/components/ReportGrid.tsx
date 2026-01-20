import { useState } from "react";
import { type ReportLayout, type ReportGridSection, type ReportCell, type TableSection, type TableRow } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Image as ImageIcon, Type, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadFile } from "@/hooks/use-reports";
import { Input } from "@/components/ui/input";
import { DataTableSection } from "./DataTableSection";

interface ReportGridProps {
  layout: ReportLayout;
  onChange: (layout: ReportLayout) => void;
  readOnly?: boolean;
}

export function ReportGrid({ layout, onChange, readOnly = false }: ReportGridProps) {
  const uploadFile = useUploadFile();

  const getSections = () => layout.sections || [];

  const addGridSection = (numCols: 1 | 2 | 3) => {
    const colWidths = numCols === 1 ? ["100%"] : numCols === 2 ? ["50%", "50%"] : ["33%", "33%", "33%"];
    const newSection: ReportGridSection = {
      id: crypto.randomUUID(),
      type: "grid",
      numCols,
      colWidths,
      cells: Array(numCols).fill(null).map(() => ({
        id: crypto.randomUUID(),
        type: "image",
        caption: ""
      })),
    };
    onChange({ sections: [...getSections(), newSection] });
  };

  const addTableSection = (numCols: number = 3) => {
    const colLabels = numCols === 3 ? ["", "", ""] : Array(numCols).fill("");
    const colWidths = numCols === 2 ? ["50%", "50%"] : numCols === 3 ? ["40%", "30%", "30%"] : Array(numCols).fill(`${100/numCols}%`);
    
    const newSection: TableSection = {
      id: crypto.randomUUID(),
      type: "table",
      title: "",
      evaluationLabel: "",
      description: "",
      numCols,
      colLabels,
      colWidths,
      rows: [
        { id: crypto.randomUUID(), cells: Array(numCols).fill("") }
      ],
    };
    onChange({ sections: [...getSections(), newSection] });
  };

  const removeSection = (sectionId: string) => {
    onChange({ sections: getSections().filter(s => s.id !== sectionId) });
  };

  const updateSection = (sectionId: string, updates: Partial<TableSection> | Partial<ReportGridSection>) => {
    onChange({
      sections: getSections().map(section => {
        if (section.id !== sectionId) return section;
        return { ...section, ...updates } as (TableSection | ReportGridSection);
      }),
    });
  };

  const updateCell = (sectionId: string, cellId: string, updates: Partial<ReportCell>) => {
    const section = getSections().find(s => s.id === sectionId);
    if (!section || section.type !== "grid") return;

    const newCells = section.cells.map(cell => {
      if (cell.id !== cellId) return cell;
      return { ...cell, ...updates };
    });
    updateSection(sectionId, { cells: newCells });
  };

  const handleImageUpload = async (file: File, sectionId: string, cellId: string) => {
    try {
      const res = await uploadFile.mutateAsync(file);
      updateCell(sectionId, cellId, { imageUrl: res.url });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-0 px-0 min-h-[400px]">
      {getSections().map((section) => (
        <div key={section.id} className="relative group/section border-x border-b border-slate-900 first:border-t-0 bg-white p-2">
          {!readOnly && (
            <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity no-print">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeSection(section.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {section.type === "table" ? (
            <DataTableSection
              section={section}
              onChange={(updated) => updateSection(section.id, updated)}
              readOnly={readOnly}
            />
          ) : (
            /* Grid Layout */
            <div className="grid w-full gap-0 border border-slate-900" style={{ gridTemplateColumns: `repeat(${section.numCols}, 1fr)` }}>
              {section.cells.map((cell, idx) => (
              <div 
                key={cell.id} 
                className={cn(
                  "flex flex-col gap-0 relative group/cell border-slate-900",
                  idx < section.numCols - 1 ? "border-r" : ""
                )}
              >
                <div className={cn(
                  "overflow-hidden bg-white transition-colors",
                  readOnly ? "" : "hover:bg-slate-50"
                )}>
                  {cell.type === "image" ? (
                    <div className="space-y-0 p-4">
                      <div className="relative aspect-[4/3] w-full bg-white flex items-center justify-center overflow-hidden border border-slate-900">
                        {cell.imageUrl ? (
                          <img 
                            src={cell.imageUrl} 
                            alt="Evidence" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-xs">No Image</span>
                          </div>
                        )}

                        {!readOnly && (
                          <label className="absolute inset-0 bg-black/0 group-hover/cell:bg-black/5 cursor-pointer flex items-center justify-center transition-all">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], section.id, cell.id)}
                            />
                            <div className="opacity-0 group-hover/cell:opacity-100 bg-white/90 px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-slate-700">
                              {cell.imageUrl ? "Change Image" : "Upload Image"}
                            </div>
                          </label>
                        )}
                      </div>
                      
                      <div className="p-1">
                        {readOnly ? (
                          <p className="text-[10px] font-bold text-slate-900 text-center min-h-[1.2rem] uppercase">
                            {cell.caption}
                          </p>
                        ) : (
                          <Input
                            value={cell.caption || ""}
                            onChange={(e) => updateCell(section.id, cell.id, { caption: e.target.value })}
                            placeholder="Enter caption..."
                            className="h-6 text-center text-[10px] font-bold border-transparent hover:border-input focus:border-input bg-transparent uppercase"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full min-h-[120px] flex items-center justify-center border-dashed border-2 border-slate-100">
                      <span className="text-[10px] text-slate-300 font-mono uppercase">SPACER</span>
                    </div>
                  )}
                </div>

                {!readOnly && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 transition-opacity no-print">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-5 w-5 shadow-sm"
                      onClick={() => updateCell(section.id, cell.id, { type: cell.type === "image" ? "spacer" : "image" })}
                    >
                      {cell.type === "image" ? <Type className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                    </Button>
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ReportGridControls({ onAddTable, onAddGrid }: { onAddTable: (cols: number) => void, onAddGrid: (cols: 1 | 2 | 3) => void }) {
  return (
    <div className="flex items-center justify-center gap-4 py-8 no-print flex-wrap">
      <Button variant="outline" onClick={() => onAddTable(3)} className="gap-2">
        <TableIcon className="w-4 h-4" />
        Add Table
      </Button>
      <Button variant="outline" onClick={() => onAddGrid(1)} className="gap-2">
        <div className="w-4 h-4 border border-current rounded-sm" />
        Image Grid (1 Col)
      </Button>
      <Button variant="outline" onClick={() => onAddGrid(2)} className="gap-2">
        <div className="flex gap-0.5 w-4 h-4">
          <div className="w-1/2 border border-current rounded-sm" />
          <div className="w-1/2 border border-current rounded-sm" />
        </div>
        Image Grid (2 Col)
      </Button>
      <Button variant="outline" onClick={() => onAddGrid(3)} className="gap-2">
        <div className="flex gap-0.5 w-4 h-4">
          <div className="w-1/3 border border-current rounded-sm" />
          <div className="w-1/3 border border-current rounded-sm" />
          <div className="w-1/3 border border-current rounded-sm" />
        </div>
        Image Grid (3 Col)
      </Button>
    </div>
  );
}
