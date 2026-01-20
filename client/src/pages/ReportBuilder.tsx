import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useReport, useUpdateReport } from "@/hooks/use-reports";
import { Header } from "@/components/Header";
import { A4Page } from "@/components/A4Page";
import { ReportHeader } from "@/components/ReportHeader";
import { ReportFooter } from "@/components/ReportFooter";
import { ReportGrid, ReportGridControls } from "@/components/ReportGrid";
import { DataTableSectionControls } from "@/components/DataTableSection";
import { type ReportLayout, type MultiPageLayout, type ReportGridSection, type TableSection } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, ChevronRight, Plus as PlusIcon, Trash2 as TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReportBuilder() {
  const [, params] = useRoute("/report/:id");
  const id = params ? parseInt(params.id) : 0;
  
  const { data: report, isLoading } = useReport(id);
  const updateReport = useUpdateReport();
  const { toast } = useToast();

  // Local state for editing
  const [docNumber, setDocNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [layout, setLayout] = useState<MultiPageLayout>({ pages: [{ id: crypto.randomUUID(), layout: { sections: [] } }] });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerRevision, setHeaderRevision] = useState("");
  const [headerIssuedDate, setHeaderIssuedDate] = useState("");
  const [headerRevisionDate, setHeaderRevisionDate] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [technicianSignatureUrl, setTechnicianSignatureUrl] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerSignatureUrl, setOwnerSignatureUrl] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [isPreview, setIsPreview] = useState(false);

  // Sync state when report loads
  useEffect(() => {
    if (report) {
      setDocNumber(report.documentNumber);
      setLogoUrl(report.headerLogoUrl || "");
      
      const loadedLayout = report.layoutJson as any;
      if (loadedLayout && loadedLayout.pages) {
        setLayout(loadedLayout as MultiPageLayout);
      } else if (loadedLayout && loadedLayout.sections) {
        // Migration: Wrap old single layout into pages
        setLayout({ pages: [{ id: crypto.randomUUID(), layout: loadedLayout }] });
      } else {
        setLayout({ pages: [{ id: crypto.randomUUID(), layout: { sections: [] } }] });
      }

      setHeaderTitle(report.headerTitle || "");
      setHeaderRevision(report.headerRevision || "");
      setHeaderIssuedDate(report.headerIssuedDate || "");
      setHeaderRevisionDate(report.headerRevisionDate || "");
      setTechnicianName(report.technicianName || "");
      setTechnicianSignatureUrl(report.technicianSignatureUrl || "");
      setOwnerName(report.ownerName || "");
      setOwnerSignatureUrl(report.ownerSignatureUrl || "");
      setOfficerName(report.officerName || "");
      setSignatureUrl(report.footerSignatureUrl || "");
      setYear(report.operationYear || new Date().getFullYear().toString());
    }
  }, [report]);

  const addPage = () => {
    const newPage = { id: crypto.randomUUID(), layout: { sections: [] } };
    setLayout(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
    setCurrentPageIndex(layout.pages.length);
  };

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
    
    const pageLayout = layout.pages[currentPageIndex].layout;
    updatePageLayout(currentPageIndex, { sections: [...(pageLayout.sections || []), newSection] });
  };

  const addTableSection = (numCols: number = 1) => {
    const colLabels = Array(numCols).fill("");
    const colWidths = Array(numCols).fill(`${100/numCols}%`);
    
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
    
    const pageLayout = layout.pages[currentPageIndex].layout;
    updatePageLayout(currentPageIndex, { sections: [...(pageLayout.sections || []), newSection] });
  };

  const removePage = (index: number) => {
    if (layout.pages.length <= 1) return;
    const newPages = layout.pages.filter((_, i) => i !== index);
    setLayout({ pages: newPages });
    setCurrentPageIndex(Math.max(0, index - 1));
  };

  const updatePageLayout = (newPageIndex: number, newLayout: ReportLayout) => {
    setLayout(prev => {
      const newPages = [...prev.pages];
      newPages[newPageIndex] = { ...newPages[newPageIndex], layout: newLayout };
      return { ...prev, pages: newPages };
    });
  };

  const handleSave = async () => {
    try {
      await updateReport.mutateAsync({
        id,
        documentNumber: docNumber,
        headerLogoUrl: logoUrl,
        headerTitle,
        headerRevision,
        headerIssuedDate,
        headerRevisionDate,
        layoutJson: layout,
        technicianName,
        technicianSignatureUrl,
        ownerName,
        ownerSignatureUrl,
        officerName,
        footerSignatureUrl: signatureUrl,
        operationYear: year,
      });
      toast({ title: "Laporan berhasil disimpan" });
    } catch (err) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("report-pages-container");
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${docNumber || "report"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4" as const, orientation: "portrait" as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
  };

  const handleExportWord = async () => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ImageRun, TextRun, VerticalAlign, PageBreak } = await import("docx");
    
    const fetchImageBuffer = async (url: string) => {
      try {
        // Handle relative URLs for local uploads
        const finalUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
        const response = await fetch(finalUrl);
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      } catch (err) {
        console.error("Failed to fetch image:", url, err);
        return null;
      }
    };

    const standardBorders = {
      top: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    };

    const children: any[] = [];
    
    for (let i = 0; i < layout.pages.length; i++) {
      const page = layout.pages[i];
      if (i > 0) children.push(new Paragraph({ children: [new PageBreak()] }));

      // Header
      const logoBuffer = logoUrl ? await fetchImageBuffer(logoUrl) : null;
      const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                  logoBuffer ? new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new ImageRun({ data: logoBuffer, transformation: { width: 60, height: 60 }, type: "png" })],
                  }) : new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "LOGO", bold: true })] })
                ],
                borders: standardBorders,
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [
                    new TextRun({ text: headerTitle || "EVALUASI HASIL UJI PERALATAN", bold: true, size: 24 }),
                  ] })
                ],
                borders: standardBorders,
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [new TextRun({ text: `Nomor LHPP : ${docNumber || ""}`, size: 16 })] }),
                  new Paragraph({ children: [new TextRun({ text: `Revisi : ${headerRevision || "0"}`, size: 16 })] }),
                  new Paragraph({ children: [new TextRun({ text: `Tgl. Terbit : ${headerIssuedDate || ""}`, size: 16 })] }),
                  new Paragraph({ children: [new TextRun({ text: `Tgl. Revisi : ${headerRevisionDate || "0"}`, size: 16 })] }),
                ],
                borders: standardBorders,
              }),
            ],
          }),
        ],
      });
      children.push(headerTable, new Paragraph({ text: "" }));

          // Header
          for (const section of page.layout.sections) {
            if (section.type === 'table' && section.colLabels) {
              tableRows.push(new TableRow({
                children: section.colLabels.map((label: string) => new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label.toUpperCase(), bold: true, size: 18 })] })],
                  borders: standardBorders,
                  shading: { fill: "F8FAFC" }
                })),
              }));
            }
            
            // Data Rows
            for (const row of section.rows) {
            tableRows.push(new TableRow({
              children: row.cells.map((cell: any) => new TableCell({
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(cell || ""), size: 18 })] })],
                borders: standardBorders,
              })),
            }));
          }
          children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }), new Paragraph({ text: "" }));
        } else if (section.type === 'grid') {
          const rows: any[] = [];
          const numCols = section.numCols || 1;
          
          for (let k = 0; k < section.cells.length; k += numCols) {
            const cellsBatch = section.cells.slice(k, k + numCols);
            const rowChildren = [];
            for (const cell of cellsBatch) {
              const imgUrl = (cell as any).imageUrl || (cell as any).url; // Support both property names
              const imgBuffer = imgUrl ? await fetchImageBuffer(imgUrl) : null;
              rowChildren.push(new TableCell({
                width: { size: 100 / numCols, type: WidthType.PERCENTAGE },
                children: [
                  imgBuffer ? new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new ImageRun({ 
                      data: imgBuffer, 
                      transformation: { 
                        width: 500 / numCols, 
                        height: 350 / numCols 
                      }, 
                      type: "png" 
                    })],
                  }) : new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `[Image]`, italics: true, color: "888888" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cell.caption || "", size: 16, bold: true })] })
                ],
                borders: standardBorders,
              }));
            }
            // Fill empty cells if last row is incomplete
            while (rowChildren.length < numCols) {
              rowChildren.push(new TableCell({ width: { size: 100 / numCols, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "" })], borders: standardBorders }));
            }
            rows.push(new TableRow({ children: rowChildren }));
          }
          children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }), new Paragraph({ text: "" }));
        }
      }

      // Footer
      const techSigBuffer = technicianSignatureUrl ? await fetchImageBuffer(technicianSignatureUrl) : null;
      const ownerSigBuffer = ownerSignatureUrl ? await fetchImageBuffer(ownerSignatureUrl) : null;
      const footerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tenaga Teknik", bold: true })] }),
                  techSigBuffer ? new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: techSigBuffer, transformation: { width: 100, height: 60 }, type: "png" })] }) : new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: technicianName || "" })] }),
                ],
                borders: standardBorders,
              }),
              new TableCell({
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Saksi Pemilik Instalasi", bold: true })] }),
                  ownerSigBuffer ? new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: ownerSigBuffer, transformation: { width: 100, height: 60 }, type: "png" })] }) : new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ownerName || "" })] }),
                ],
                borders: standardBorders,
              }),
            ],
          }),
        ],
      });
      children.push(footerTable);
    }

    const doc = new Document({ 
      sections: [{ 
        properties: { 
          page: { 
            size: { width: 11906, height: 16838 },
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          } 
        }, 
        children 
      }] 
    });
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docNumber || "report"}.docx`;
    a.click();
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>;
  if (!report) return <div>Report not found</div>;

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans">
      <Header 
        title={docNumber || "Untitled Report"} 
        onSave={handleSave} 
        onPrint={handlePrint} 
        onExportPDF={handleExportPDF} 
        onExportWord={handleExportWord} 
        isSaving={updateReport.isPending}
        isPreview={isPreview}
        setIsPreview={setIsPreview}
      />
      
      {/* Page Navigation Controls */}
      <div className="sticky top-16 z-10 bg-white border-b px-4 py-2 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))} disabled={currentPageIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <span className="text-sm font-medium">Halaman {currentPageIndex + 1} / {layout.pages.length}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPageIndex(prev => Math.min(layout.pages.length - 1, prev + 1))} disabled={currentPageIndex === layout.pages.length - 1}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        {!isPreview && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addPage} className="text-primary border-primary hover:bg-primary/5">
              <PlusIcon className="h-4 w-4 mr-1" /> Tambah Halaman
            </Button>
            {layout.pages.length > 1 && (
              <Button variant="outline" size="sm" onClick={() => removePage(currentPageIndex)} className="text-destructive border-destructive hover:bg-destructive/5">
                <TrashIcon className="h-4 w-4 mr-1" /> Hapus Halaman
              </Button>
            )}
          </div>
        )}
      </div>

      <main className="flex-1 relative overflow-y-auto py-8">
        <div id="report-pages-container" className="flex flex-col gap-8">
          {!isPreview && (
            <div className="max-w-[210mm] mx-auto w-full no-print space-y-4">
              <ReportGridControls 
                onAddTable={addTableSection}
                onAddGrid={addGridSection}
              />
              
              {/* Global controls for selected section */}
              {layout.pages[currentPageIndex].layout.sections?.map(section => (
                <DataTableSectionControls
                  key={section.id}
                  colInput={section.type === 'grid' ? section.numCols.toString() : section.numCols.toString()}
                  onRemove={() => {
                    const sections = layout.pages[currentPageIndex].layout.sections.filter(s => s.id !== section.id);
                    updatePageLayout(currentPageIndex, { sections });
                  }}
                  onColChange={(val) => {
                    const newCount = parseInt(val);
                    if (isNaN(newCount)) {
                      const sections = [...layout.pages[currentPageIndex].layout.sections];
                      const idx = sections.findIndex(s => s.id === section.id);
                      if (section.type === 'grid') {
                        sections[idx] = { ...section, numCols: 0 as any };
                      } else {
                        sections[idx] = { ...section, numCols: 0 as any };
                      }
                      updatePageLayout(currentPageIndex, { sections });
                      return;
                    }
                    const count = Math.min(10, newCount);
                    
                    const sections = [...layout.pages[currentPageIndex].layout.sections];
                    const idx = sections.findIndex(s => s.id === section.id);
                    
                    if (section.type === 'grid') {
                      const colWidths = Array(count).fill(`${100 / count}%`);
                      const currentCells = section.cells || [];
                      let newCells;
                      if (count > currentCells.length) {
                        newCells = [...currentCells, ...Array.from({ length: count - currentCells.length }).map(() => ({
                          id: crypto.randomUUID(),
                          type: "image" as const,
                          caption: ""
                        }))];
                      } else {
                        newCells = currentCells.slice(0, count);
                      }
                      sections[idx] = { ...section, numCols: count, colWidths, cells: newCells };
                    } else {
                      const newWidths = Array(count).fill(`${100 / count}%`);
                      sections[idx] = {
                        ...section,
                        numCols: count,
                        colWidths: newWidths,
                        rows: section.rows.map(row => ({
                          ...row,
                          cells: row.cells.length > count 
                            ? row.cells.slice(0, count) 
                            : [...row.cells, ...Array(count - row.cells.length).fill("")]
                        }))
                      };
                    }
                    updatePageLayout(currentPageIndex, { sections });
                  }}
                  rowInput={section.type === 'grid' ? "1" : section.rows.length.toString()}
                  onRowChange={(val) => {
                    if (section.type === 'grid') return;
                    const count = parseInt(val);
                    if (isNaN(count)) {
                      const sections = [...layout.pages[currentPageIndex].layout.sections];
                      const idx = sections.findIndex(s => s.id === section.id);
                      sections[idx] = { ...section, rows: [] };
                      updatePageLayout(currentPageIndex, { sections });
                      return;
                    }
                    const currentRows = [...section.rows];
                    let newRows;
                    if (count > currentRows.length) {
                      newRows = [...currentRows, ...Array.from({ length: count - currentRows.length }).map(() => ({
                        id: crypto.randomUUID(),
                        cells: Array(section.numCols).fill(""),
                      }))];
                    } else {
                      newRows = currentRows.slice(0, count);
                    }
                    
                    const sections = [...layout.pages[currentPageIndex].layout.sections];
                    const idx = sections.findIndex(s => s.id === section.id);
                    sections[idx] = { ...section, rows: newRows };
                    updatePageLayout(currentPageIndex, { sections });
                  }}
                />
              ))}
            </div>
          )}

          {/* Render all pages for PDF export visibility, but keep them accessible */}
          {layout.pages.map((page, index) => (
            <div key={page.id} className={cn(
              "transition-all",
              index === currentPageIndex ? "block" : "hidden no-print"
            )}>
              <A4Page id={`page-${page.id}`} className={cn("print:m-0 print:shadow-none print:p-0", isPreview ? "shadow-none border border-slate-200" : "")}>
                <div className="flex flex-col h-full">
                  <ReportHeader 
                    logoUrl={logoUrl} 
                    setLogoUrl={setLogoUrl} 
                    title={headerTitle} 
                    setTitle={setHeaderTitle} 
                    docNumber={docNumber} 
                    setDocNumber={setDocNumber} 
                    revision={headerRevision} 
                    setRevision={setHeaderRevision} 
                    issuedDate={headerIssuedDate} 
                    setIssuedDate={setHeaderIssuedDate} 
                    revisionDate={headerRevisionDate} 
                    setRevisionDate={setHeaderRevisionDate} 
                    readOnly={isPreview}
                  />
                  
                  <div className="flex-1 overflow-hidden py-2">
                    <ReportGrid 
                      layout={page.layout || { sections: [] }} 
                      onChange={(newLayout) => updatePageLayout(index, newLayout)} 
                      readOnly={isPreview}
                    />
                  </div>
                  
                  <ReportFooter 
                    year={year} 
                    setYear={setYear} 
                    technicianName={technicianName} 
                    setTechnicianName={setTechnicianName} 
                    technicianSignatureUrl={technicianSignatureUrl} 
                    setTechnicianSignatureUrl={setTechnicianSignatureUrl} 
                    ownerName={ownerName} 
                    setOwnerName={setOwnerName} 
                    ownerSignatureUrl={ownerSignatureUrl} 
                    setOwnerSignatureUrl={setOwnerSignatureUrl} 
                    readOnly={isPreview}
                  />
                </div>
              </A4Page>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
