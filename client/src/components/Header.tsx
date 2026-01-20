import { FileText, Printer, Save, ArrowLeft, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  onSave?: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  onExportWord?: () => void;
  isSaving?: boolean;
  showControls?: boolean;
  isPreview?: boolean;
  setIsPreview?: (preview: boolean) => void;
}

export function Header({ 
  title, 
  onSave, 
  onPrint, 
  onExportPDF, 
  onExportWord, 
  isSaving, 
  showControls = true,
  isPreview = false,
  setIsPreview
}: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-primary/5">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {title || "Report Generator"}
            </h1>
          </div>
          {setIsPreview && (
            <div className="flex items-center bg-muted rounded-md p-1 ml-2">
              <Button
                variant={!isPreview ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsPreview(false)}
              >
                Edit
              </Button>
              <Button
                variant={isPreview ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsPreview(true)}
              >
                Pratinjau
              </Button>
            </div>
          )}
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportPDF}
              className="hidden sm:flex"
              title="Unduh sebagai PDF"
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportWord}
              className="hidden sm:flex"
              title="Unduh sebagai Word"
            >
              <Download className="mr-2 h-4 w-4" />
              Word
            </Button>
            
            <Button 
              size="sm" 
              onClick={onSave} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Menyimpan..." : "Simpan Laporan"}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
