import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useReport, useUpdateReport } from "@/hooks/use-reports";
import { Header } from "@/components/Header";
import { A4Page } from "@/components/A4Page";
import { ReportHeader } from "@/components/ReportHeader";
import { ReportFooter } from "@/components/ReportFooter";
import { ReportGrid } from "@/components/ReportGrid";
import { IdentityTable } from "@/components/IdentityTable";
import { type ReportLayout } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ReportBuilder() {
  const [, params] = useRoute("/report/:id");
  const id = params ? parseInt(params.id) : 0;
  
  const { data: report, isLoading } = useReport(id);
  const updateReport = useUpdateReport();
  const { toast } = useToast();

  // Local state for editing
  const [docNumber, setDocNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [layout, setLayout] = useState<ReportLayout>({ sections: [] });
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
      setLayout(report.layoutJson as ReportLayout);
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
    const element = document.getElementById("a4-page");
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${docNumber || "report"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4" as const, orientation: "portrait" as const },
    };

    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
  };

  const handleExportWord = async () => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ImageRun, TextRun, VerticalAlign } = await import("docx");
    
    // Helper to fetch image and convert to Uint8Array
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

    // Helper for cell borders
    const standardBorders = {
      top: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    };

    const children: any[] = [];
    
    // 1. Header Table (3 columns)
    const logoBuffer = logoUrl ? await fetchImageBuffer(logoUrl) : null;
    
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            // Logo column
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                logoBuffer ? new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: logoBuffer,
                      transformation: { width: 60, height: 60 },
                      type: "png",
                    }),
                  ],
                }) : new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "LOGO", bold: true })]
                })
              ],
              borders: standardBorders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            // Title column
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: headerTitle || "EVALUASI HASIL UJI PERALATAN",
                      bold: true,
                      size: 24,
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "- PENGUKURAN TAHANAN PEMBUMIAN -",
                      bold: true,
                      size: 20,
                    })
                  ]
                })
              ],
              borders: standardBorders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            // Info column
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

    // 2. Body Sections
    if (layout.sections && layout.sections.length > 0) {
      for (const section of layout.sections) {
        if (section.type === 'table') {
          const tableRows = [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (section as any).colLabels?.[0] || "Hasil evaluasi", bold: true, size: 18 })] })],
                  borders: standardBorders,
                  shading: { fill: "F2F2F2" },
                }),
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (section as any).colLabels?.[1] || "Spesifikasi Teknik", bold: true, size: 18 })] })],
                  borders: standardBorders,
                  shading: { fill: "F2F2F2" },
                }),
                new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (section as any).colLabels?.[2] || "Keterangan", bold: true, size: 18 })] })],
                  borders: standardBorders,
                  shading: { fill: "F2F2F2" },
                }),
              ],
            })
          ];

          if (section.rows && Array.isArray(section.rows)) {
            for (const row of section.rows) {
              const docxRow = new TableRow({
                children: row.cells.map((cell: string) => new TableCell({
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cell || "", size: 18 })] })],
                  borders: standardBorders,
                })),
              });
              tableRows.push(docxRow);
            }
          }

          children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }), new Paragraph({ text: "" }));
        } else if (section.type === 'grid') {
          // Process image grid as a table for layout stability
          const rows: TableRow[] = [];
          for (let i = 0; i < section.cells.length; i += 3) {
            const cellsBatch = section.cells.slice(i, i + 3);
            const rowChildren = [];
            
            for (const cell of cellsBatch) {
              const imgUrl = (cell as any).url || (cell as any).imageUrl;
              const imgBuffer = imgUrl ? await fetchImageBuffer(imgUrl) : null;
              rowChildren.push(new TableCell({
                width: { size: 33.33, type: WidthType.PERCENTAGE },
                children: [
                  imgBuffer ? new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: imgBuffer,
                        transformation: { width: 150, height: 150 },
                        type: "png",
                      }),
                    ],
                  }) : new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `[Image: ${cell.caption || 'Photo'}]`, italics: true, color: "888888" })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: cell.caption || "", size: 16, bold: true })]
                  })
                ],
                borders: standardBorders,
              }));
            }
            
            // Fill remaining cells in the row if less than 3
            while (rowChildren.length < 3) {
              rowChildren.push(new TableCell({
                width: { size: 33.33, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: "" })],
                borders: standardBorders,
              }));
            }

            rows.push(new TableRow({ children: rowChildren }));
          }
          children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }), new Paragraph({ text: "" }));
        }
      }
    }

    // 3. Footer Table (Signatures)
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
                techSigBuffer ? new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: techSigBuffer,
                      transformation: { width: 100, height: 60 },
                      type: "png",
                    }),
                  ],
                }) : new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: technicianName || "" })] }),
              ],
              borders: standardBorders,
            }),
            new TableCell({
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Saksi Pemilik Instalasi", bold: true })] }),
                ownerSigBuffer ? new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: ownerSigBuffer,
                      transformation: { width: 100, height: 60 },
                      type: "png",
                    }),
                  ],
                }) : new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ownerName || "" })] }),
              ],
              borders: standardBorders,
            }),
          ],
        }),
      ],
    });
    children.push(footerTable);

    const doc = new Document({
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 } } }, // A4
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docNumber || "report"}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans">
      <Header 
        title={docNumber || "Untitled Report"} 
        onSave={handleSave}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
        isSaving={updateReport.isPending}
      />
      
      <main className="flex-1 relative overflow-y-auto">
        <A4Page id="a4-page">
          <div className="flex flex-col min-h-[297mm]">
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
            />
            
            
            <div className="flex-1">
              <ReportGrid 
                layout={layout} 
                onChange={setLayout} 
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
            />
          </div>
        </A4Page>
      </main>
    </div>
  );
}
