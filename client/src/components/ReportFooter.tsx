import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useUploadFile } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";

interface ReportFooterProps {
  year: string;
  setYear: (val: string) => void;
  technicianName: string;
  setTechnicianName: (val: string) => void;
  technicianSignatureUrl?: string;
  setTechnicianSignatureUrl: (val: string) => void;
  ownerName: string;
  setOwnerName: (val: string) => void;
  ownerSignatureUrl?: string;
  setOwnerSignatureUrl: (val: string) => void;
  readOnly?: boolean;
}

export function ReportFooter({
  year,
  setYear,
  technicianName,
  setTechnicianName,
  technicianSignatureUrl,
  setTechnicianSignatureUrl,
  ownerName,
  setOwnerName,
  ownerSignatureUrl,
  setOwnerSignatureUrl,
  readOnly = false
}: ReportFooterProps) {
  const { toast } = useToast();
  const uploadFile = useUploadFile();

  const handleTechnicianUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFile.mutateAsync(file);
      setTechnicianSignatureUrl(res.url);
      toast({ title: "Tanda tangan berhasil diunggah" });
    } catch (err) {
      toast({ title: "Gagal mengunggah", variant: "destructive" });
    }
  };

  const handleOwnerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFile.mutateAsync(file);
      setOwnerSignatureUrl(res.url);
      toast({ title: "Tanda tangan berhasil diunggah" });
    } catch (err) {
      toast({ title: "Gagal mengunggah", variant: "destructive" });
    }
  };

  return (
    <div className="mt-auto border border-slate-900">
      <div className="grid grid-cols-2 gap-0">
        {/* Left: Tenaga Teknik */}
        <div className="text-center border-r border-slate-900 p-2">
          <div className="text-[10px] font-bold mb-1 uppercase">Tenaga Teknik</div>
          <div className="h-16 w-full flex items-center justify-center relative group mb-1">
            {technicianSignatureUrl ? (
              <img 
                src={technicianSignatureUrl} 
                alt="Technician Signature" 
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="w-full h-full border border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-300">
                (Tanda Tangan di Sini)
              </div>
            )}

            {!readOnly && (
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer no-print rounded">
                <label className="cursor-pointer p-1 bg-white rounded-full shadow-sm">
                  <Upload className="w-3 h-3 text-slate-700" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleTechnicianUpload} />
                </label>
              </div>
            )}
          </div>

          <div className="mt-1">
            {readOnly ? (
              <p className="font-bold text-slate-900 uppercase text-[10px] underline decoration-slate-900 underline-offset-4">
                {technicianName || "Yuli Krisdiantoro"}
              </p>
            ) : (
              <Input
                value={technicianName}
                onChange={e => setTechnicianName(e.target.value)}
                placeholder="NAMA TENAGA TEKNIK"
                className="h-6 text-center font-bold uppercase text-[10px] border-transparent hover:border-input focus:border-input bg-transparent underline"
              />
            )}
          </div>
        </div>

        {/* Right: Saksi Pemilik Instalasi */}
        <div className="text-center p-2">
          <div className="text-[10px] font-bold mb-1 uppercase">Saksi Pemilik Instalasi</div>
          <div className="h-16 w-full flex items-center justify-center relative group mb-1">
            {ownerSignatureUrl ? (
              <img 
                src={ownerSignatureUrl} 
                alt="Owner Signature" 
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="w-full h-full border border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-300">
                (Tanda Tangan di Sini)
              </div>
            )}

            {!readOnly && (
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer no-print rounded">
                <label className="cursor-pointer p-1 bg-white rounded-full shadow-sm">
                  <Upload className="w-3 h-3 text-slate-700" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleOwnerUpload} />
                </label>
              </div>
            )}
          </div>

          <div className="mt-1">
            {readOnly ? (
              <p className="font-bold text-slate-900 uppercase text-[10px] underline decoration-slate-900 underline-offset-4">
                {ownerName || "Abidin"}
              </p>
            ) : (
              <Input
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="NAMA PEMILIK/SAKSI"
                className="h-6 text-center font-bold uppercase text-[10px] border-transparent hover:border-input focus:border-input bg-transparent underline"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
