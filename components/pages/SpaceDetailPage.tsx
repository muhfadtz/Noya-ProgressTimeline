import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts";
import {
  getProgressReportsStream,
  addProgressReport,
  getSpaceDetails,
  updateProgressReport,
  deleteProgressReport,
  updateMarkdownNote,
} from "../../services/firebase";
import type { ProgressReport, Space } from "../../types";
import Layout from "../Layout";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Spinner,
  Textarea,
  Tooltip,
  Input,
  ConfirmDialog, // Import ConfirmDialog
} from "../ui";
// pakai lucide-react agar ikon pasti tampil
import {
  Edit2,
  Trash2,
  PlusCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Save,
  X,
  Eraser,
  FileText,
  MoreVertical,
} from "lucide-react";
import { Timestamp } from "@firebase/firestore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ===== helper =====
const safeToString = (v: any) => (typeof v === "string" ? v : v ?? "");

// format tanggal (terima Timestamp atau string/Date)
const formatDateSafe = (val: any) => {
  try {
    if (!val) return "—";
    // Firestore Timestamp
    if ((val as Timestamp).seconds !== undefined) {
      return new Date((val as Timestamp).seconds * 1000).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    // ISO string or Date
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
    }
    return String(val);
  } catch {
    return "—";
  }
};

// ===== Markdown renderer (react-markdown + remark-gfm) =====
const MarkdownRenderer: React.FC<{ content?: string }> = ({ content = "" }) => {
  if (!content || content.trim() === "") {
    return <div className="text-sm text-muted-foreground">—</div>;
  }
  return (
    <div className="prose prose-sm max-w-none text-muted-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

// ===== Markdown Note Dialog =====
const MarkdownNoteDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  report: ProgressReport;
  spaceId: string;
}> = ({ isOpen, onClose, report, spaceId }) => {
  const [note, setNote] = useState<string>(safeToString(report.markdownNote));
  const [loading, setLoading] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) setNote(safeToString(report.markdownNote));
  }, [isOpen, report.markdownNote]);

  const handleSave = async () => {
    if (!user) return;
    // prevent redundant save
    if (safeToString(note).trim() === safeToString(report.markdownNote).trim()) {
      onClose();
      return;
    }
    setLoading(true);
    try {
      await updateMarkdownNote(user.uid, spaceId, report.id, note.trim());
      onClose();
    } catch (err) {
      console.error("update markdown:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateMarkdownNote(user.uid, spaceId, report.id, "");
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error("delete markdown:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catatan Markdown</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-3">
            <Label htmlFor="markdown">Tulis catatan (Markdown)</Label>
            <Textarea
              id="markdown"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuliskan catatan singkat, contoh: - Observasi: ..."
            />
          </div>

          <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4 mr-1" /> Batal
              </Button>
              {safeToString(report.markdownNote).trim() !== "" && (
                <Button type="button" variant="destructive" onClick={() => setDeleteConfirmOpen(true)} disabled={loading}>
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </Button>
              )}
              <Button type="button" onClick={handleSave} disabled={loading}>
                {loading ? <Spinner size="sm" /> : <><Save className="w-4 h-4 mr-1" /> Simpan</>}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Catatan?"
        description="Apakah Anda yakin ingin menghapus catatan markdown ini? Tindakan ini tidak dapat dibatalkan."
        loading={loading}
      />
    </>
  );
};

// ===== Progress Dialog (Add / Edit) =====
const ProgressDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  reportToEdit?: ProgressReport | null;
}> = ({ isOpen, onClose, spaceId, reportToEdit }) => {
  const [progress, setProgress] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [dateMode, setDateMode] = useState<'auto' | 'manual'>('auto');
  const [manualDate, setManualDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const editing = !!reportToEdit;

  useEffect(() => {
    if (isOpen) {
      if (reportToEdit) {
        // EDIT MODE
        setProgress(safeToString(reportToEdit.progress));
        setNextStep(safeToString(reportToEdit.nextStep));
        setDateMode('manual');
        const d = reportToEdit.date.toDate();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setManualDate(`${yyyy}-${mm}-${dd}`);
      } else {
        // ADD MODE - reset
        setProgress('');
        setNextStep('');
        setDateMode('auto');
        setManualDate('');
      }
    }
  }, [isOpen, reportToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (dateMode === 'manual' && !manualDate) {
      alert("Silakan pilih tanggal dalam mode manual.");
      return;
    }
    setLoading(true);
    try {
      if (editing && reportToEdit) {
        const newDate = Timestamp.fromDate(new Date(manualDate));
        await updateProgressReport(user.uid, spaceId, reportToEdit.id, {
          progress: progress.trim(),
          nextStep: nextStep.trim(),
          date: newDate
        });
      } else {
        const reportDate = dateMode === 'auto' ? Timestamp.now() : Timestamp.fromDate(new Date(manualDate));
        await addProgressReport(user.uid, spaceId, progress.trim(), nextStep.trim(), reportDate);
      }
      onClose();
    } catch (err) {
      console.error("save progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setProgress("");
    setNextStep("");
    if (!editing) {
      setDateMode('auto');
      setManualDate('');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Progress" : "Tambah Progress"}</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
             <div className="space-y-2">
                <Label>Tanggal Laporan</Label>
                <div className="flex gap-2">
                    <Button type="button" variant={dateMode === 'auto' ? 'secondary' : 'ghost'} onClick={() => setDateMode('auto')} disabled={editing}>
                        Otomatis
                    </Button>
                    <Button type="button" variant={dateMode === 'manual' ? 'secondary' : 'ghost'} onClick={() => setDateMode('manual')}>
                        Manual
                    </Button>
                </div>
                {dateMode === 'manual' && (
                    <Input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        required
                        className="mt-2"
                    />
                )}
            </div>

            <div>
                <Label htmlFor="progress">Progress (Markdown)</Label>
                <Textarea
                id="progress"
                rows={5}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                required
                />
            </div>

            <div>
                <Label htmlFor="next-step">Next Step (Markdown)</Label>
                <Textarea
                id="next-step"
                rows={3}
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                required
                />
            </div>
          </div>

          <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4 mr-1" /> Batal
              </Button>
              <Button type="button" variant="secondary" onClick={handleClear}>
                <Eraser className="w-4 h-4 mr-2" /> Clear
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : <><Save className="w-4 h-4 mr-1" /> Simpan</>}
              </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ===== Timeline Card (dengan ikon lucide-react) =====
const TimelineCard: React.FC<{
  report: ProgressReport;
  isLast: boolean;
  onEdit: (report: ProgressReport) => void;
  onDelete: (reportId: string) => void;
  onNote: (report: ProgressReport) => void;
}> = ({ report, isLast, onEdit, onDelete, onNote }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setMenuOpen(false);
  };

  return (
    <div className="relative pl-10 group animate-fade-in">
      {!isLast && <div className="absolute left-4 top-5 bottom-0 w-px bg-border" />}

      <div className="absolute left-4 top-4 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
        <div className={`w-1.5 h-1.5 rounded-full ${report.markdownNote ? "bg-green-600" : "bg-primary"}`} />
      </div>

      <div className="pb-12 group-hover:-translate-y-1 transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <p className="font-semibold text-primary">{formatDateSafe(report.date)}</p>
          {report.lastModified && <span className="text-xs text-muted-foreground">(Edited)</span>}
        </div>

        <Card className={`relative transition-all ${report.markdownNote ? "border-l-4 border-green-600" : ""}`}>
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="z-20"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 mt-2 w-40 bg-card border rounded-lg shadow-xl z-20">
                  <div className="p-1">
                    <button
                      onClick={(e) => handleActionClick(e, () => onNote(report))}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                    >
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>Catatan</span>
                    </button>
                     <button
                      onClick={(e) => handleActionClick(e, () => onEdit(report))}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                     <button
                      onClick={(e) => handleActionClick(e, () => onDelete(report.id))}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-6 text-green-600" />
              <div>
                <h4 className="font-semibold mt-5">Progress</h4>
                <MarkdownRenderer content={safeToString(report.progress)} />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-1 text-yellow-500" />
              <div>
                <h4 className="font-semibold">Next Step</h4>
                <MarkdownRenderer content={safeToString(report.nextStep)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {safeToString(report.markdownNote).trim() !== "" && (
          <div className="mt-2">
            <Tooltip content={<MarkdownRenderer content={safeToString(report.markdownNote)} />}>
              <span className="text-xs text-green-600 cursor-help inline-flex items-center gap-1">
                <FileText className="w-4 h-4" /> Catatan tersedia
              </span>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== Page utama =====
const SpaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState<Space | null>(null);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  
  // State untuk confirm dialog
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDeleteId, setReportToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);
    getSpaceDetails(user.uid, id).then(setSpace);
    const unsub = getProgressReportsStream(user.uid, id, (data) => {
      setReports(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user, id]);

  const openAddDialog = (r: ProgressReport | null = null) => {
    setSelectedReport(r);
    setIsProgressDialogOpen(true);
  };

  const openNoteDialog = (r: ProgressReport) => {
    setSelectedReport(r);
    setIsNoteDialogOpen(true);
  };

  const handleDeleteRequest = (reportId: string) => {
    setReportToDeleteId(reportId);
    setDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!user || !id || !reportToDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteProgressReport(user.uid, id, reportToDeleteId);
    } catch (err) {
      console.error("delete:", err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setReportToDeleteId(null);
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center mt-20">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      headerContent={
        <div className="flex items-center justify-between p-4 border-b bg-card/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/spaces")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">{space?.name ?? "Space"}</h1>
          </div>
          <Button onClick={() => openAddDialog(null)} className="hidden md:inline-flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Tambah Progress
          </Button>
        </div>
      }
      onFabClick={() => openAddDialog(null)}
    >
      <div className="mt-4">
        {reports.length === 0 ? (
          <div className="text-center mt-20 p-8 border-2 border-dashed rounded-2xl">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Belum ada progress</h2>
            <p className="mt-2 text-muted-foreground">Tekan tombol “+” untuk menambahkan laporan.</p>
            <Button className="mt-6 md:hidden" onClick={() => openAddDialog(null)}>
              <PlusCircle className="w-4 h-4 mr-2" /> Tambah
            </Button>
          </div>
        ) : (
          reports.map((r, idx) => (
            <TimelineCard
              key={r.id}
              report={r}
              isLast={idx === reports.length - 1}
              onEdit={(rep) => openAddDialog(rep)}
              onDelete={handleDeleteRequest}
              onNote={(rep) => openNoteDialog(rep)}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      {id && (
        <>
          <ProgressDialog
            isOpen={isProgressDialogOpen}
            onClose={() => {
              setIsProgressDialogOpen(false);
              setSelectedReport(null);
            }}
            spaceId={id}
            reportToEdit={selectedReport ?? undefined}
          />

          {selectedReport && (
            <MarkdownNoteDialog
              isOpen={isNoteDialogOpen}
              onClose={() => {
                setIsNoteDialogOpen(false);
                setSelectedReport(null);
              }}
              report={selectedReport}
              spaceId={id}
            />
          )}

          <ConfirmDialog
            isOpen={isDeleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Hapus Laporan Progres?"
            description="Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
            loading={isDeleting}
          />
        </>
      )}
    </Layout>
  );
};

export default SpaceDetailPage;