import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useReport, useUpdateReport } from "@/hooks/use-reports";
import { Header } from "@/components/Header";
import { A4Page } from "@/components/A4Page";
import { ReportHeader } from "@/components/ReportHeader";
import { ReportFooter } from "@/components/ReportFooter";
import { ReportGrid } from "@/components/ReportGrid";
import { IdentityTable } from "@/components/IdentityTable";
import { type ReportLayout, type MultiPageLayout } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, ChevronRight, Plus as PlusIcon, Trash2 as TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      toast({ title: "Report saved successfully" });
    } catch (err) {
      toast({ title: "Failed to save", variant: "destructive" });
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
        const response = await fetch(url);
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
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: headerTitle || "EVALUASI HASIL UJI PERALATAN", bold: true, size: 24 })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "- PENGUKURAN TAHANAN PEMBUMIAN -", bold: true, size: 20 })] })
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

      // Sections
      for (const section of page.layout.sections) {
        if (section.type === 'table') {
          const tableRows: any[] = [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (section as any).colLabels?.[0] || "Hasil evaluasi", bold: true, size: 18 })] })], borders: standardBorders, shading: { fill: "F2F2F2" } }),
                new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (section as any).colLabels?.[1] || "Spesifikasi Teknik", bold: true, size: 18 })] })], borders: standardBorders, shading: { fill: "F2F2F2" } }),
                new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (section as any).colLabels?.[2] || "Keterangan", bold: true, size: 18 })] })], borders: standardBorders, shading: { fill: "F2F2F2" } }),
              ],
            })
          ];

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
          for (let k = 0; k < section.cells.length; k += 3) {
            const cellsBatch = section.cells.slice(k, k + 3);
            const rowChildren = [];
            for (const cell of cellsBatch) {
              const imgUrl = (cell as any).imageUrl;
              const imgBuffer = imgUrl ? await fetchImageBuffer(imgUrl) : null;
              rowChildren.push(new TableCell({
                width: { size: 33.33, type: WidthType.PERCENTAGE },
                children: [
                  imgBuffer ? new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new ImageRun({ data: imgBuffer, transformation: { width: 150, height: 150 }, type: "png" })],
                  }) : new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `[Image]`, italics: true, color: "888888" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cell.caption || "", size: 16, bold: true })] })
                ],
                borders: standardBorders,
              }));
            }
            while (rowChildren.length < 3) {
              rowChildren.push(new TableCell({ width: { size: 33.33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "" })], borders: standardBorders }));
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

    const doc = new Document({ sections: [{ properties: { page: { size: { width: 11906, height: 16838 } } }, children }] });
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
      <Header title={docNumber || "Untitled Report"} onSave={handleSave} onPrint={handlePrint} onExportPDF={handleExportPDF} onExportWord={handleExportWord} isSaving={updateReport.isPending} />
      
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
      </div>

      <main className="flex-1 relative overflow-y-auto py-8">
        <div id="report-pages-container" className="flex flex-col gap-8">
          {/* Only render current page for builder, but render all for print-like container if needed */}
          <A4Page id={`page-${layout.pages[currentPageIndex]?.id}`} className="print:m-0 print:shadow-none print:p-0">
            <div className="flex flex-col h-full">
              <ReportHeader logoUrl={logoUrl} setLogoUrl={setLogoUrl} title={headerTitle} setTitle={setHeaderTitle} docNumber={docNumber} setDocNumber={setDocNumber} revision={headerRevision} setRevision={setHeaderRevision} issuedDate={headerIssuedDate} setIssuedDate={setHeaderIssuedDate} revisionDate={headerRevisionDate} setRevisionDate={setHeaderRevisionDate} />
              
              <div className="flex-1 overflow-hidden py-2">
                <ReportGrid 
                  layout={layout.pages[currentPageIndex]?.layout || { sections: [] }} 
                  onChange={(newLayout) => updatePageLayout(currentPageIndex, newLayout)} 
                />
              </div>
              
              <ReportFooter year={year} setYear={setYear} technicianName={technicianName} setTechnicianName={setTechnicianName} technicianSignatureUrl={technicianSignatureUrl} setTechnicianSignatureUrl={setTechnicianSignatureUrl} ownerName={ownerName} setOwnerName={setOwnerName} ownerSignatureUrl={ownerSignatureUrl} setOwnerSignatureUrl={setOwnerSignatureUrl} />
            </div>
          </A4Page>
        </div>
      </main>
    </div>
  );
}
