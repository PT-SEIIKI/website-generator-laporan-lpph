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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
              Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your visual inspection reports
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
            New Report
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : reports?.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white/50">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No reports yet</h3>
            <p className="text-muted-foreground mb-6">Create your first inspection report to get started.</p>
            <Button onClick={handleCreate} variant="outline">Create Report</Button>
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
                      {report.officerName || "No officer assigned"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100">
                      <span>{format(new Date(report.createdAt || new Date()), "MMM d, yyyy")}</span>
                      
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
                              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the report.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteReport.mutate(report.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
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
