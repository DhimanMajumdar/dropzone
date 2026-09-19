'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  UploadCloud,
  FileText,
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function UploadWorkspace() {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    id: number;
    originalName: string;
    size: number;
  } | null>(null);

  const [creatingLink, setCreatingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [expiresIn, setExpiresIn] = useState('24h');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [deleteAfterDownload, setDeleteAfterDownload] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMsg(null);
    setSelectedFile(file);
    setUploadedFile(null);
    setShareUrl(null);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setErrorMsg(null);

      const token = await getToken();
      if (!token) {
        setErrorMsg('Authentication token missing. Please sign in again.');
        setUploading(false);
        return;
      }

      // 1. Get presigned upload URL
      const response = await fetch('http://localhost:5000/api/files/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get upload URL');
      }

      // 2. Upload file directly to S3
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type || 'application/octet-stream',
        },
        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Direct S3 file upload failed');
      }

      // 3. Save metadata in PostgreSQL
      const saveResponse = await fetch('http://localhost:5000/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalName: selectedFile.name,
          storageKey: data.storageKey,
          mimeType: selectedFile.type,
          size: selectedFile.size,
        }),
      });

      const savedFile = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(savedFile.error || 'Failed to save metadata');
      }

      setUploadedFile({
        id: savedFile.id,
        originalName: savedFile.originalName,
        size: selectedFile.size,
      });
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMsg(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const createShareLink = async () => {
    if (!uploadedFile) return;

    try {
      setCreatingLink(true);
      setErrorMsg(null);

      const token = await getToken();
      if (!token) {
        setErrorMsg('Please sign in first.');
        setCreatingLink(false);
        return;
      }

      let expiresAt: string | null = null;
      if (expiresIn !== 'never') {
        const date = new Date();

        if (expiresIn === '1h') {
          date.setHours(date.getHours() + 1);
        }

        if (expiresIn === '24h') {
          date.setHours(date.getHours() + 24);
        }

        if (expiresIn === '7d') {
          date.setDate(date.getDate() + 7);
        }

        expiresAt = date.toISOString();
      }

      if (passwordEnabled) {
        if (!password || password.trim().length === 0) {
          setErrorMsg('Please enter a password for your protected link.');
          setCreatingLink(false);
          return;
        }
      }

      const response = await fetch('http://localhost:5000/api/share-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileId: uploadedFile.id,
          expiresAt,
          maxDownloads: maxDownloads
            ? Number(maxDownloads)
            : null,
          deleteAfterDownload,
          password: passwordEnabled && password.trim() ? password.trim() : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link');
      }

      setShareUrl(data.shareUrl);
      setPasswordEnabled(false);
      setPassword('');
    } catch (err: any) {
      console.error('Share link error:', err);
      setErrorMsg(err.message || 'Failed to create share link');
    } finally {
      setCreatingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setShareUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {/* Stitch Design System Card Structure */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white shadow-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 leading-tight">DropZone Workspace</h2>
              <p className="text-[11px] font-mono text-zinc-500">Private S3 Transit Layer</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            <Lock className="w-3 h-3 text-indigo-600" />
            <span>ENCRYPTED SESSION</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE 1: Empty Drop Target (Stitch Design Specification) */}
          {!selectedFile && !uploadedFile && !shareUrl && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group ${isDragging
                ? 'border-[#4f46e5] bg-indigo-50/50 scale-[0.995]'
                : 'border-zinc-300 hover:border-[#4f46e5] bg-zinc-50/50 hover:bg-indigo-50/20'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-zinc-200 flex items-center justify-center mx-auto mb-4 text-[#4f46e5] group-hover:scale-105 transition-all">
                <UploadCloud className="w-6 h-6" />
              </div>

              <h3 className="font-semibold text-zinc-900 text-base mb-1">
                Drop your file here
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                or <span className="text-[#4f46e5] font-medium underline underline-offset-2">browse from your device</span>
              </p>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-white px-3 py-1 rounded border border-zinc-200 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-indigo-500" />
                Files remain private in S3 storage
              </div>
            </div>
          )}

          {/* STATE 2: File Selected */}
          {selectedFile && !uploading && !uploadedFile && (
            <div className="space-y-6">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 truncate">
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-500">
                      {formatBytes(selectedFile.size)} · {selectedFile.type || 'binary payload'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRemoveSelectedFile}
                  className="p-1.5 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={executeUpload}
                className="w-full py-3 rounded-lg bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                Upload to DropZone
              </button>
            </div>
          )}

          {/* STATE 3: Uploading Loader */}
          {uploading && (
            <div className="py-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-[#4f46e5]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm">Uploading payload...</h4>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">Streaming directly into S3 private bucket</p>
              </div>
            </div>
          )}

          {/* STATE 4: Uploaded Ready for Share Link */}
          {uploadedFile && !shareUrl && (
            <div className="space-y-6">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-emerald-800 uppercase tracking-wider">
                      Payload Sealed
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 truncate">
                      {uploadedFile.originalName}
                    </h4>
                  </div>
                </div>
                <p className="text-xs font-mono text-emerald-700">
                  Size: {formatBytes(uploadedFile.size)} · Metadata linked in PostgreSQL
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Link expiry
                  </label>

                  <select
                    value={expiresIn}
                    onChange={(event) =>
                      setExpiresIn(event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Maximum downloads
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={maxDownloads}
                    onChange={(event) =>
                      setMaxDownloads(event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteAfterDownload}
                    onChange={(event) =>
                      setDeleteAfterDownload(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <span className="text-sm text-zinc-700">
                    Delete file after download
                  </span>
                </label>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordEnabled}
                      onChange={(event) => {
                        setPasswordEnabled(event.target.checked);
                        if (!event.target.checked) setPassword('');
                      }}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />

                    <span className="text-sm text-zinc-700 font-medium">
                      Password protect this link
                    </span>
                  </label>

                  {passwordEnabled && (
                    <div className="pl-7 space-y-1">
                      <input
                        type="password"
                        placeholder="Enter password for link"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <p className="text-[11px] text-zinc-500">
                        Recipients will be required to enter this password to download the file.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={createShareLink}
                disabled={creatingLink}
                className="w-full py-3 rounded-lg bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {creatingLink ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating link...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Create share link
                  </>
                )}
              </button>
            </div>
          )}

          {/* STATE 5: Share Link Result Card (Stitch Specification) */}
          {shareUrl && (
            <div className="space-y-6">
              <div className="text-center pb-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-zinc-900 text-lg">Your file is ready to share</h3>
                <p className="text-xs text-zinc-500 mt-1">Presigned S3 access URL forged successfully</p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2">
                <label className="text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider block">
                  Presigned Share URL
                </label>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 select-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-4 rounded-lg bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy link
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open link
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-[#4f46e5] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Upload another payload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
