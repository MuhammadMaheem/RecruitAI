"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadResumes } from "@/lib/api";
import { Upload, File, CheckCircle, XCircle, Loader2, CloudUpload, Trash2, Brain, Database, BarChart2 } from "lucide-react";

interface FileStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  candidateId?: number;
  name?: string;
  error?: string;
}

interface UploadResultItem {
  filename: string;
  candidate_id?: number;
  name?: string;
  error?: string;
  status: string;
}

const INFO_CARDS = [
  { icon: Brain,     title: "AI Extraction",   desc: "Groq LLM extracts name, skills, experience & education from each PDF." },
  { icon: Database,  title: "Semantic Index",   desc: "ChromaDB indexes skills for semantic similarity matching." },
  { icon: BarChart2, title: "Instant Rankings", desc: "Go to Rankings to score candidates against any job in seconds." },
];

export default function UploadPage() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted
      .filter((f) => f.type === "application/pdf")
      .map((f) => ({ file: f, status: "pending" as const }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (!pending.length) return;
    setUploading(true);
    setFiles((prev) => prev.map((f) => f.status === "pending" ? { ...f, status: "uploading" } : f));
    try {
      const result = await uploadResumes(pending.map((f) => f.file));
      const resultMap = new Map<string, UploadResultItem>(
        result.results.map((r: UploadResultItem) => [r.filename, r])
      );
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== "uploading") return f;
          const res = resultMap.get(f.file.name);
          if (!res) return { ...f, status: "error" as const, error: "Not processed" };
          if (res.error) return { ...f, status: "error" as const, error: res.error };
          return { ...f, status: "success" as const, candidateId: res.candidate_id, name: res.name };
        })
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) => f.status === "uploading" ? { ...f, status: "error" as const, error: "Upload failed" } : f)
      );
    } finally {
      setUploading(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <div className="animate-fade-up max-w-3xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <p className="section-label mb-2">Ingest</p>
        <h1 className="page-title">Upload <span className="gradient-text">Resumes</span></h1>
        <p className="page-subtitle">AI extracts candidate data automatically from PDF files.</p>
      </div>

      {/* Info cards — shown first so users know what happens before they upload */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {INFO_CARDS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="panel p-5">
            <div className="stat-card-icon stat-icon-blue mb-3">
              <Icon className="w-4 h-4 text-blue-c" />
            </div>
            <h3 className="font-heading font-semibold text-base text-primary-c mb-1">{title}</h3>
            <p className="text-sm text-secondary-c leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`upload-zone${isDragActive ? " drag-active" : ""} mb-4`}
      >
        <input {...getInputProps()} />
        <div className="upload-zone-icon">
          <CloudUpload className="w-8 h-8 text-blue-c" />
        </div>
        {isDragActive ? (
          <p className="font-semibold text-lg font-heading text-blue-c">Drop PDFs here…</p>
        ) : (
          <>
            <p className="font-semibold text-lg font-heading text-primary-c mb-1">
              Drag &amp; drop PDF resumes
            </p>
            <p className="text-secondary-c text-base">
              or <span className="text-blue-c font-semibold">click to browse</span>
            </p>
            <p className="text-muted-c text-xs mt-3">Multiple PDFs · Max 10 MB per file</p>
          </>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="panel mb-4">
          <div className="panel-header">
            <span className="panel-title">{files.length} file{files.length !== 1 ? "s" : ""} queued</span>
            {successCount > 0 && (
              <span className="chip chip-green">{successCount} processed</span>
            )}
          </div>
          <div className="upload-file-list panel-body">
            {files.map((f, idx) => (
              <div key={idx} className="file-item">
                <div className="file-item-icon">
                  <File className="w-4 h-4 text-blue-c" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-base text-primary-c truncate mb-0.5">
                    {f.file.name}
                  </p>
                  <p className="text-sm text-muted-c">
                    {(f.file.size / 1024).toFixed(1)} KB
                    {f.name && ` · ${f.name}`}
                    {f.error && ` · ${f.error}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {f.status === "pending" && (
                    <>
                      <span className="chip chip-gray">Pending</span>
                      <button type="button" aria-label="Remove file" onClick={() => removeFile(idx)} className="text-muted-c hover:text-red-c transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {f.status === "uploading" && <div className="spinner" />}
                  {f.status === "success" && <CheckCircle className="w-5 h-5 text-green-c" />}
                  {f.status === "error" && <XCircle className="w-5 h-5 text-red-c" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <button type="button" onClick={handleUpload} disabled={uploading} className="btn-glow">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Processing with AI…" : `Upload ${pendingCount} Resume${pendingCount > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}
