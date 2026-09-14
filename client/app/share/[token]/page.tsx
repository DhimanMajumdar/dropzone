'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  Download, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Ban, 
  FileX, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

type ErrorType = 
  | 'not_found'
  | 'expired'
  | 'revoked'
  | 'limit_reached'
  | 'file_unavailable'
  | 'server_error'
  | null;

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [fileName, setFileName] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  const downloadFile = async () => {
    try {
      setLoading(true);
      setErrorType(null);

      const response = await fetch(
        `http://localhost:5000/api/share-links/${token}/download`
      );

      const data = await response.json();

      if (!response.ok) {
        const message = (data.error || '').toLowerCase();
        
        if (response.status === 404) {
          if (message.includes('file')) {
            setErrorType('file_unavailable');
          } else {
            setErrorType('not_found');
          }
        } else if (response.status === 403) {
          setErrorType('revoked');
        } else if (response.status === 410) {
          if (message.includes('limit')) {
            setErrorType('limit_reached');
          } else {
            setErrorType('expired');
          }
        } else {
          setErrorType('server_error');
        }
        return;
      }

      setFileName(data.fileName);
      setDownloadUrl(data.downloadUrl);
      setDownloadSuccess(true);

      // Trigger standard browser download redirect
      window.location.href = data.downloadUrl;
    } catch (error) {
      console.error('Download error:', error);
      setErrorType('server_error');
    } finally {
      setLoading(false);
    }
  };

  const renderErrorContent = () => {
    switch (errorType) {
      case 'not_found':
        return {
          icon: FileX,
          title: "This share link doesn't exist.",
          description: "Double check the URL or ask the sender to generate a new share link.",
        };
      case 'expired':
        return {
          icon: Clock,
          title: "This share link has expired.",
          description: "This link had a time limit that has already passed.",
        };
      case 'revoked':
        return {
          icon: Ban,
          title: "This share link is no longer available.",
          description: "The owner of this file has revoked or disabled access to this link.",
        };
      case 'limit_reached':
        return {
          icon: AlertCircle,
          title: "This file has reached its download limit.",
          description: "The maximum allowed downloads for this share link have been reached.",
        };
      case 'file_unavailable':
        return {
          icon: FileX,
          title: "This file is no longer available.",
          description: "The original file was removed from private storage by its owner.",
        };
      case 'server_error':
      default:
        return {
          icon: AlertCircle,
          title: "Something went wrong. Please try again.",
          description: "We encountered an issue generating your secure download URL.",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-[#4f46e5] selection:text-white bg-grid-pattern">
      {/* Stitch Design System Header */}
      <header className="w-full py-5 px-4 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white shadow-xs">
              <UploadCloud className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-zinc-900 tracking-tight text-base">
              DropZone
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200">
            <Lock className="w-3 h-3 text-emerald-600" />
            SECURE PUBLIC DOWNLOAD
          </div>
        </div>
      </header>

      {/* Main Download Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-8 text-center relative">
            {/* Top Logo Badge */}
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 text-[#4f46e5]">
              <UploadCloud className="w-6 h-6" />
            </div>

            {!errorType ? (
              <>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-1">
                  Someone shared a file with you
                </h1>
                <p className="text-xs text-zinc-500 mb-6">
                  Click below to securely retrieve the payload directly from S3 private storage.
                </p>

                {/* File Preview Pill */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-zinc-900 truncate">
                      {fileName || 'Shared Payload'}
                    </h4>
                    <p className="text-xs font-mono text-zinc-500">
                      {fileName?.endsWith('.pdf') ? 'PDF Payload' : 'Ephemeral Payload'} · Presigned Link Valid
                    </p>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadFile}
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-lg bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 mb-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Preparing download...
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4.5 h-4.5" />
                      Download file
                    </>
                  )}
                </button>

                {/* Supporting Security Text */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#4f46e5]" />
                  <span>Your download is handled securely.</span>
                </div>
              </>
            ) : (
              /* STITCH ERROR STATE DISPLAY */
              (() => {
                const err = renderErrorContent();
                const Icon = err.icon;
                return (
                  <div className="py-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h2 className="text-lg font-bold text-zinc-900 mb-2">
                      {err.title}
                    </h2>

                    <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                      {err.description}
                    </p>

                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-sm transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Go to DropZone Home
                    </Link>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-200 bg-white/50 text-center">
        <p className="text-xs text-zinc-400 font-mono">
          Powered by <strong className="text-zinc-700 font-sans">DropZone</strong> — Ephemeral Data Transit
        </p>
      </footer>
    </div>
  );
}