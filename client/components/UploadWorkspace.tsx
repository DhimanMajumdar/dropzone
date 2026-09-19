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
  ShieldCheck,
  KeyRound
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
        throw new Error('Direct secure file transfer failed');
      }

      // 3. Save file record
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
      {/* Dark Obsidian Card Container */}
      <div className="bg-[#121215] rounded-2xl border border-zinc-800/90 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#09090b]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
              <UploadCloud className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">DropZone Workspace</h2>
              <p className="text-[11px] font-mono text-zinc-400">Private Data Transit Layer</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/60">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>ENCRYPTED SESSION</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-medium flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE 1: Empty Drop Target */}
          {!selectedFile && !uploadedFile && !shareUrl && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group ${isDragging
                ? 'border-indigo-500 bg-indigo-950/30 scale-[0.995]'
                : 'border-zinc-800 hover:border-indigo-500/80 bg-zinc-950/50 hover:bg-indigo-950/20'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-[#121215] shadow-2xs border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-indigo-400 group-hover:scale-105 transition-all">
                <UploadCloud className="w-6 h-6" />
              </div>

              <h3 className="font-bold text-white text-base mb-1 tracking-tight">
                Drop your file here
              </h3>
              <p className="text-xs text-zinc-400 mb-4 font-normal">
                or <span className="text-indigo-400 font-medium underline underline-offset-2">browse from your device</span>
              </p>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-[#09090b] px-3 py-1 rounded-md border border-zinc-800">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                Files remain private in encrypted storage
              </div>
            </div>
          )}

          {/* STATE 2: File Selected */}
          {selectedFile && !uploading && !uploadedFile && (
            <div className="space-y-6">
              <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      {formatBytes(selectedFile.size)} · {selectedFile.type || 'binary payload'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRemoveSelectedFile}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={executeUpload}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)] cursor-pointer active:scale-[0.99]"
              >
                <UploadCloud className="w-4.5 h-4.5" />
                Upload to DropZone
              </button>
            </div>
          )}

          {/* STATE 3: Uploading Loader */}
          {uploading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 shadow-2xs">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Uploading payload...</h4>
                <p className="text-xs font-mono text-zinc-400 mt-1">Streaming directly into encrypted storage</p>
              </div>
            </div>
          )}

          {/* STATE 4: Uploaded Ready for Share Link */}
          {uploadedFile && !shareUrl && (
            <div className="space-y-6">
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                      Payload Sealed
                    </span>
                    <h4 className="text-sm font-semibold text-white truncate">
                      {uploadedFile.originalName}
                    </h4>
                  </div>
                </div>
                <p className="text-xs font-mono text-emerald-400/80">
                  Size: {formatBytes(uploadedFile.size)} · Encrypted &amp; Registered
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Link expiry
                  </label>

                  <select
                    value={expiresIn}
                    onChange={(event) =>
                      setExpiresIn(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-[#09090b] px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
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
                    className="w-full rounded-xl border border-zinc-800 bg-[#09090b] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteAfterDownload}
                    onChange={(event) =>
                      setDeleteAfterDownload(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-zinc-700 bg-[#09090b] text-indigo-600 focus:ring-indigo-500"
                  />

                  <span className="text-sm text-zinc-300">
                    Delete file after download
                  </span>
                </label>

                <div className="space-y-2 pt-1 border-t border-zinc-800/60">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordEnabled}
                      onChange={(event) => {
                        setPasswordEnabled(event.target.checked);
                        if (!event.target.checked) setPassword('');
                      }}
                      className="h-4 w-4 rounded border-zinc-700 bg-[#09090b] text-indigo-600 focus:ring-indigo-500"
                    />

                    <span className="text-sm text-zinc-200 font-medium flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      Password protect this link
                    </span>
                  </label>

                  {passwordEnabled && (
                    <div className="pl-7 space-y-1.5">
                      <input
                        type="password"
                        placeholder="Enter password for link"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-[#09090b] px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <p className="text-[11px] text-zinc-400">
                        Recipients will be required to enter this password to download the file.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={createShareLink}
                disabled={creatingLink}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.25)] cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {creatingLink ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Generating link...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4.5 h-4.5" />
                    Create share link
                  </>
                )}
              </button>
            </div>
          )}

          {/* STATE 5: Share Link Result Card */}
          {shareUrl && (
            <div className="space-y-6">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-white text-xl tracking-tight">Your file is ready to share</h3>
                <p className="text-xs text-zinc-400 mt-1">Secure access link generated successfully</p>
              </div>

              <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 space-y-2">
                <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block">
                  Secure Share URL
                </label>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-[#121215] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-indigo-300 select-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
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
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                  Open link
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-400 transition-colors cursor-pointer"
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
