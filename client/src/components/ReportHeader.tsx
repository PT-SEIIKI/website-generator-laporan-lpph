import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useUploadFile } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";

interface ReportHeaderProps {
  logoUrl?: string;
  setLogoUrl: (val: string) => void;
  title?: string;
  setTitle: (val: string) => void;
  docNumber: string;
  setDocNumber: (val: string) => void;
  revision?: string;
  setRevision: (val: string) => void;
  issuedDate?: string;
  setIssuedDate: (val: string) => void;
  revisionDate?: string;
  setRevisionDate: (val: string) => void;
  readOnly?: boolean;
}

export function ReportHeader({ 
  logoUrl, setLogoUrl, 
  title, setTitle, 
  docNumber, setDocNumber, 
  revision, setRevision, 
  issuedDate, setIssuedDate, 
  revisionDate, setRevisionDate,
  readOnly = false
}: ReportHeaderProps) {
  const { toast } = useToast();
  const uploadFile = useUploadFile();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFile.mutateAsync(file);
      setLogoUrl(res.url);
      toast({ title: "Logo uploaded successfully" });
    } catch (err) {
      toast({ title: "Failed to upload logo", variant: "destructive" });
    }
  };

  return (
    <div className="border border-slate-900 mb-0">
      <div className="grid grid-cols-[180px_1fr_220px] gap-0">
        {/* Left: Logo */}
        <div className="border-r border-slate-900 p-2 flex items-center justify-center relative group min-h-[110px]">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Company Logo" 
              className="max-h-24 max-w-full object-contain"
            />
          ) : (
            <div className="w-full h-24 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 border border-dashed rounded">
              Logo
            </div>
          )}
          
          {!readOnly && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded cursor-pointer no-print">
              <label className="cursor-pointer p-2">
                <Upload className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
          )}
        </div>

        {/* Center: Title */}
        <div className="border-r border-slate-900 p-2 flex flex-col items-center justify-center relative group min-h-[110px] bg-white">
          <div className="w-full text-center">
            {readOnly ? (
              <div className="space-y-1">
                <div className="text-base font-bold leading-tight text-slate-900 uppercase whitespace-pre-wrap">
                  {title || "EVALUASI HASIL UJI PERALATAN"}
                </div>
                <div className="text-[10px] font-bold leading-tight text-slate-900 uppercase">
                  - PENGUKURAN TAHANAN PEMBUMIAN -
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <textarea
                  value={title || ""}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul laporan..."
                  className="w-full text-center text-base font-bold leading-tight resize-none border-0 bg-transparent focus:ring-0 focus:outline-none uppercase p-0"
                  rows={2}
                />
                <div className="text-[10px] font-bold leading-tight text-slate-900 uppercase">
                  - PENGUKURAN TAHANAN PEMBUMIAN -
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Document Info */}
        <div className="p-2 space-y-1 min-h-[110px] flex flex-col justify-start text-[10px] bg-white">
          <div className="grid grid-cols-[80px_1fr] gap-1">
            <span className="font-bold">Nomor LHPP :</span>
            {readOnly ? (
              <div className="text-slate-900 font-medium">{docNumber || "-"}</div>
            ) : (
              <Input 
                value={docNumber} 
                onChange={(e) => setDocNumber(e.target.value)}
                className="h-5 text-[10px] px-1 py-0 border-slate-300" 
                placeholder="063/LHPP/..."
              />
            )}
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-1">
            <span className="font-bold">Revisi :</span>
            {readOnly ? (
              <div className="text-slate-900 font-medium">{revision || "0"}</div>
            ) : (
              <Input 
                value={revision || ""} 
                onChange={(e) => setRevision(e.target.value)}
                className="h-5 text-[10px] px-1 py-0 border-slate-300"
                placeholder="0"
              />
            )}
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-1">
            <span className="font-bold">Tgl. Terbit :</span>
            {readOnly ? (
              <div className="text-slate-900 font-medium">{issuedDate || "-"}</div>
            ) : (
              <Input 
                value={issuedDate || ""} 
                onChange={(e) => setIssuedDate(e.target.value)}
                className="h-5 text-[10px] px-1 py-0 border-slate-300"
                placeholder="DD.MM.YYYY"
              />
            )}
          </div>
          <div className="grid grid-cols-[80px_1fr] gap-1">
            <span className="font-bold">Tgl. Revisi :</span>
            {readOnly ? (
              <div className="text-slate-900 font-medium">{revisionDate || "0"}</div>
            ) : (
              <Input 
                value={revisionDate || ""} 
                onChange={(e) => setRevisionDate(e.target.value)}
                className="h-5 text-[10px] px-1 py-0 border-slate-300"
                placeholder="DD.MM.YYYY"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
