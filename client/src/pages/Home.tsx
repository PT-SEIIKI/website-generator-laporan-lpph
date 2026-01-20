import { useReports, useCreateReport, useDeleteReport } from "@/hooks/use-reports";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText, Loader2, Download, ShieldCheck, Layout, Settings as SettingsIcon, MousePointer2, Save, FileType } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Vercel-style Hero Section */}
      <div className="relative overflow-hidden border-b border-border/40 bg-background pt-16 pb-24">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary animate-in fade-in slide-in-from-top-4 duration-1000">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Sistem Pembuat Laporan SLO Pro
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 sm:leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Dokumentasi Inspeksi Visual <br className="hidden md:block" /> Dengan Standar Profesional.
            </h1>
            
            <p className="max-w-2xl text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              Platform efisien untuk membuat, mengelola, dan mengekspor laporan Uji Laik Operasi (SLO) dengan tata letak yang fleksibel dan hasil akhir siap cetak.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Button 
                size="lg"
                onClick={handleCreate} 
                disabled={createReport.isPending}
                className="h-12 px-8 text-base font-medium rounded-md shadow-xl shadow-primary/20"
              >
                {createReport.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-5 w-5" />
                )}
                Buat Laporan Baru
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 px-8 text-base font-medium rounded-md"
                onClick={() => document.getElementById('tutorial-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Lihat Panduan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto py-20 px-4">
        {/* Reports Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Proyek Terbaru</h2>
              <p className="text-muted-foreground">Kelola dan akses semua laporan inspeksi Anda.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse border border-border/50" />
              ))}
            </div>
          ) : reports?.length === 0 ? (
            <div className="text-center py-24 border border-dashed rounded-2xl bg-muted/20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background border border-border mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold">Belum Ada Laporan</h3>
              <p className="text-muted-foreground mt-2 mb-8 max-w-sm mx-auto">
                Mulai dengan membuat laporan inspeksi visual pertama Anda hari ini.
              </p>
              <Button onClick={handleCreate} variant="secondary" className="rounded-md">
                <Plus className="mr-2 h-4 w-4" />
                Mulai Sekarang
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reports?.map((report) => (
                <Card 
                  key={report.id}
                  className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 border-border/50"
                >
                  <Link href={`/report/${report.id}`} className="flex flex-col flex-1 p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 bg-muted/50 px-2 py-1 rounded">
                        ID-{report.id}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {report.documentNumber || "Draft Laporan"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 italic">
                      {report.title || "Tanpa Judul"}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-tighter text-muted-foreground/50 font-semibold">Terakhir Diperbarui</span>
                        <span className="text-xs font-medium">{format(new Date(report.createdAt || new Date()), "d MMM yyyy", { locale: id })}</span>
                      </div>
                      
                      <div onClick={(e) => e.preventDefault()} className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border-border/60">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl">Hapus Laporan?</AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                Data ini akan dihapus secara permanen dari server kami. Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                              <AlertDialogCancel className="rounded-md">Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteReport.mutate(report.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md"
                              >
                                Hapus Permanen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Tutorial Section - Vercel style */}
        <div id="tutorial-section" className="pt-20 border-t border-border/40">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Panduan Penggunaan Detail</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ikuti langkah-langkah di bawah ini untuk menghasilkan laporan inspeksi yang memenuhi standar teknis.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group p-8 rounded-2xl bg-muted/30 border border-border/50 hover:bg-background hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Inisiasi Proyek</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Mulai dengan menekan tombol <strong>"Laporan Baru"</strong>. Sistem akan secara otomatis mengalokasikan nomor dokumen unik dan menyiapkan template dasar untuk Anda.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground/80">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> Nomor Dokumen Otomatis</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> Judul Laporan Default</li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 border border-border/50 hover:bg-background hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Bangun Struktur</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Di dalam editor, gunakan panel navigasi bawah untuk menambahkan komponen. Anda bisa mengombinasikan berbagai elemen laporan secara dinamis.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-background border border-border/40 text-[10px] font-medium">
                  <Layout className="w-3 h-3" /> Grid Gambar
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-background border border-border/40 text-[10px] font-medium">
                  <FileText className="w-3 h-3" /> Tabel Data
                </div>
              </div>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 border border-border/50 hover:bg-background hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Konfigurasi Teknis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Setiap komponen memiliki menu <strong>"PENGATURAN"</strong> sendiri. Klik ikon gear untuk menyesuaikan jumlah kolom, baris, dan label header tabel.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground/80">
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> Ubah Label Kolom</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> Atur Jumlah Grid (1-4)</li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 border border-border/50 hover:bg-background hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">4. Input & Dokumentasi</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Klik pada area yang dapat diedit untuk memasukkan data. Untuk Grid Gambar, cukup klik area placeholder untuk mengunggah foto temuan inspeksi.
              </p>
              <div className="flex gap-2 items-center text-[10px] text-primary font-bold uppercase tracking-wider mt-4">
                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-primary/20 bg-primary/5">!</span>
                Ukuran file optimal: Max 2MB per foto
              </div>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 border border-border/50 hover:bg-background hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Save className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">5. Simpan & Finalisasi</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Sistem tidak menyimpan secara otomatis dalam interval pendek. Pastikan Anda menekan tombol <strong>Simpan</strong> setelah melakukan perubahan besar pada konten.
              </p>
              <div className="p-3 rounded bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-600 font-medium">
                Peringatan: Refresh halaman tanpa menyimpan akan menghilangkan perubahan terakhir.
              </div>
            </div>

            <div className="group p-8 rounded-2xl bg-muted/30 border border-border/50 hover:bg-background hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <FileType className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">6. Ekspor Profesional</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Gunakan menu ekspor untuk mendapatkan file akhir. Format Word (.docx) sangat disarankan jika Anda perlu melakukan penyesuaian tata letak lebih lanjut.
              </p>
              <div className="flex gap-4 mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-[10px]">PDF</div>
                  <span className="text-[9px] mt-1 text-muted-foreground">Fixed Layout</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px]">DOCX</div>
                  <span className="text-[9px] mt-1 text-muted-foreground">Editable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SLO Report Builder. Dibuat untuk profesional inspeksi teknik.
          </p>
        </div>
      </footer>
    </div>
  );
}

  );
}
