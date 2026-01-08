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
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(element).save();
  };

  const handleExportWord = async () => {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle, convertInchesToTwip } = await import("docx");
    
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: docNumber || "Report",
            bold: true,
            size: 28,
          }),
          new Paragraph({
            text: headerTitle || "Title",
            bold: true,
            size: 24,
          }),
          new Paragraph({
            text: `Revisi: ${headerRevision || "0"}`,
            size: 22,
          }),
          new Paragraph({
            text: `Tgl Terbit: ${headerIssuedDate || "-"}`,
            size: 22,
          }),
          new Paragraph({
            text: "\n\nReport Content\n\n",
            size: 22,
          }),
          new Paragraph({
            text: `Tenaga Teknik: ${technicianName || "_"}`,
            size: 22,
          }),
          new Paragraph({
            text: `Saksi Pemilik Instalasi: ${ownerName || "_"}`,
            size: 22,
          }),
        ],
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
