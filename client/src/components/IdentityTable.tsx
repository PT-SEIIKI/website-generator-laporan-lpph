import { Input } from "@/components/ui/input";

interface IdentityTableProps {
  ownerName?: string;
  setOwnerName?: (name: string) => void;
  operationYear?: string;
  setOperationYear?: (year: string) => void;
  readOnly?: boolean;
}

export function IdentityTable({ 
  ownerName = "", 
  setOwnerName = () => {}, 
  operationYear = "", 
  setOperationYear = () => {},
  readOnly = false 
}: IdentityTableProps) {
  return (
    <div className="mb-4">
      <table className="w-full text-[10px] border-collapse border border-slate-900">
        <tbody>
          <tr>
            <td className="border border-slate-900 p-1 w-[30%] font-bold bg-slate-50">Nama Pemilik Instalasi</td>
            <td className="border border-slate-900 p-1">
              {readOnly ? ownerName : (
                <Input 
                  value={ownerName} 
                  onChange={(e) => setOwnerName(e.target.value)} 
                  className="h-5 text-[10px] border-0 p-0 focus-visible:ring-0 bg-transparent uppercase"
                  placeholder="MASUKKAN NAMA PEMILIK..."
                />
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-900 p-1 font-bold bg-slate-50">Tahun Operasi</td>
            <td className="border border-slate-900 p-1">
              {readOnly ? operationYear : (
                <Input 
                  value={operationYear} 
                  onChange={(e) => setOperationYear(e.target.value)} 
                  className="h-5 text-[10px] border-0 p-0 focus-visible:ring-0 bg-transparent"
                  placeholder="2026"
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
