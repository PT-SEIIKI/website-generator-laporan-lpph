import { useReports, useCreateReport, useDeleteReport } from "@/hooks/use-reports";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const { data: reports, isLoading } = useReports();
  const createReport = useCreateReport();
  const deleteReport = useDeleteReport();
  const [, setLocation] = useLocation();

  const handleCreate = async () => {
    try {
      const newReport = await createReport.mutateAsync({
        title: "VISUAL TEST ITEM – UJI LAIK OPERASI",
        documentNumber: `DOC/${new Date().getFullYear()}/00${(reports?.length || 0) + 1}`,
        layoutJson: { rows: [] },
        operationYear: new Date().getFullYear().toString(),
        officerName: "",
      });
      setLocation(`/report/${newReport.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container max-w-5xl mx-auto py-12 px-4">
        {/* Tutorial Section */}
        <div className="mb-12 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Cara Menggunakan Pembuat Laporan SLO</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Langkah-langkah:</h3>
                <ul className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                  <li>Klik tombol <span className="font-medium text-slate-900">"Laporan Baru"</span> di kanan atas.</li>
                  <li>Di halaman editor, masukkan nomor dokumen dan judul laporan.</li>
                  <li>Unggah logo perusahaan Anda pada kotak logo yang tersedia.</li>
                  <li>Gunakan kontrol di bawah untuk menambahkan <span className="font-medium text-slate-900">Tabel Data</span> atau <span className="font-medium text-slate-900">Grid Gambar</span>.</li>
                  <li>Sesuaikan jumlah kolom dan baris melalui panel <span className="font-medium text-slate-900">"PENGATURAN"</span>.</li>
                  <li>Unggah foto hasil inspeksi dan berikan keterangan pada grid gambar.</li>
                  <li>Lengkapi data teknisi dan saksi di bagian tanda tangan bawah.</li>
                  <li>Simpan laporan Anda dan ekspor ke format PDF atau Word sesuai kebutuhan.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Fungsi Utama:</h3>
                <div className="grid gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Layout Fleksibel</h4>
                      <p className="text-xs text-slate-500">Buat tata letak grid dan tabel yang dinamis sesuai kebutuhan inspeksi.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Ekspor Dokumen</h4>
                      <p className="text-xs text-slate-500">Ekspor hasil inspeksi ke Word atau PDF dengan format yang rapi dan siap cetak.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
              Daftar Laporan
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola laporan inspeksi visual Anda
            </p>
          </div>
          <Button 
            onClick={handleCreate} 
            disabled={createReport.isPending}
            className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {createReport.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Laporan Baru
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : reports?.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white/50">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Belum ada laporan</h3>
            <p className="text-muted-foreground mb-6">Buat laporan inspeksi pertama Anda untuk memulai.</p>
            <Button onClick={handleCreate} variant="outline">Buat Laporan</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports?.map((report) => (
              <Card 
                key={report.id}
                className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
              >
                <Link href={`/report/${report.id}`} className="block p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        #{report.id}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                      {report.documentNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {report.officerName || "Tidak ada petugas"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100">
                      <span>{format(new Date(report.createdAt || new Date()), "d MMM yyyy")}</span>
                      
                      {/* Delete Action - Stop Propagation to prevent opening link */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-slate-400 hover:text-destructive -mr-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteReport.mutate(report.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
