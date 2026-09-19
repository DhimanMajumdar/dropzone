'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, Show } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  UploadCloud,
  FileText,
  Files,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Loader2,
  AlertCircle,
  File,
  Film,
  Image as ImageIcon,
  Archive,
  FileCode,
  Music,
  RefreshCw,
  Plus,
  ShieldCheck,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Link2,
} from 'lucide-react';

interface ShareLink {
  id: number;
  token: string;
  expiresAt: string | null;
  maxDownloads: number | null;
  downloadCount: number;
  deleteAfterDownload: boolean;
  revoked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FileItem {
  id: number;
  originalName: string;
  size: number;
  mimeType: string | null;
  createdAt: string;
  updatedAt: string;
  shareLinks: ShareLink[];
}

interface DashboardStats {
  totalFiles: number;
  totalShareLinks: number;
  totalDownloads: number;
}

interface DashboardData {
  stats: DashboardStats;
  files: FileItem[];
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getFileIcon(mimeType: string | null, originalName: string) {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  if (
    mimeType?.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)
  ) {
    return ImageIcon;
  }
  if (
    mimeType?.startsWith('video/') ||
    ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)
  ) {
    return Film;
  }
  if (
    mimeType?.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'flac'].includes(ext)
  ) {
    return Music;
  }
  if (mimeType?.includes('pdf') || ext === 'pdf') {
    return FileText;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return Archive;
  }
  if (
    ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(
      ext,
    )
  ) {
    return FileCode;
  }
  return File;
}

function getShareLinkStatus(shareLink: ShareLink): {
  label: string;
  badgeStyle: string;
  dotColor: string;
} {
  if (shareLink.revoked) {
    return {
      label: 'Revoked',
      badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dotColor: 'bg-rose-500',
    };
  }

  if (shareLink.expiresAt && new Date(shareLink.expiresAt) <= new Date()) {
    return {
      label: 'Expired',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dotColor: 'bg-amber-500',
    };
  }

  if (
    shareLink.maxDownloads !== null &&
    shareLink.downloadCount >= shareLink.maxDownloads
  ) {
    return {
      label: 'Limit reached',
      badgeStyle: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      dotColor: 'bg-zinc-400',
    };
  }

  return {
    label: 'Active',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotColor: 'bg-emerald-500',
  };
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  const fetchDashboard = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const token = await getToken();
        if (!token) {
          setError('Authentication token unavailable. Please sign in again.');
          setLoading(false);
          setRefreshing(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Failed to load dashboard (${res.status})`,
          );
        }

        const data: DashboardData = await res.json();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDashboard();
    }
  }, [isLoaded, isSignedIn, fetchDashboard]);

  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => {
      setCopiedToken((prev) => (prev === token ? null : prev));
    }, 2000);
  };

  const filteredFiles = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.files.filter((file) => {
      const matchesSearch = file.originalName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;

      const hasActive = file.shareLinks.some((sl) => {
        const st = getShareLinkStatus(sl);
        return st.label === 'Active';
      });

      const hasExpiredOrRevoked = file.shareLinks.some((sl) => {
        const st = getShareLinkStatus(sl);
        return st.label === 'Expired' || st.label === 'Revoked';
      });

      if (filterStatus === 'active') return hasActive;
      if (filterStatus === 'expired') return hasExpiredOrRevoked;

      return true;
    });
  }, [dashboardData, searchQuery, filterStatus]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fafafa] selection:bg-[#4f46e5] selection:text-white">
      <div>
        <Navbar />

        {/* Workspace Canvas Background Pattern */}
        <div className="bg-grid-pattern border-b border-zinc-200/60 bg-white/40">
          <main className="py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
            <Show when="signed-out">
              <div className="bg-white rounded-2xl border border-zinc-200/90 p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm my-12 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 text-[#4f46e5] shadow-2xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">
                  Authentication Required
                </h2>
                <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                  Please sign in to access your secure DropZone file workspace.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-xs"
                >
                  Return to Home
                </Link>
              </div>
            </Show>

            <Show when="signed-in">
              {/* Top Navigation Breadcrumb / Tagline */}
              <div className="flex items-center gap-2 mb-3 text-xs font-mono font-medium text-zinc-500">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-zinc-200 shadow-2xs text-zinc-700">
                  <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                  DASHBOARD OVERVIEW
                </span>
                <span className="text-zinc-300">•</span>
                <span className="hidden sm:inline text-zinc-400">
                  PRIVATE STORAGE TRANSIT LAYER
                </span>
              </div>

              {/* 1. Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
                    Your files
                  </h1>
                  <p className="text-sm text-zinc-500 mt-1 font-normal">
                    Manage your files and shared links.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <button
                    onClick={() => fetchDashboard(true)}
                    disabled={refreshing || loading}
                    className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white border border-zinc-200/90 hover:bg-zinc-50 text-zinc-700 font-medium text-sm transition-all shadow-2xs hover:border-zinc-300 disabled:opacity-50 cursor-pointer"
                    title="Refresh Dashboard Data"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-zinc-500 ${
                        refreshing ? 'animate-spin text-[#4f46e5]' : ''
                      }`}
                    />
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.99]"
                  >
                    <Plus className="w-4 h-4" />
                    Upload file
                  </Link>
                </div>
              </div>

              {/* Skeleton Loading State */}
              {loading && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs animate-pulse"
                      >
                        <div className="h-4 w-20 bg-zinc-100 rounded mb-4" />
                        <div className="h-8 w-16 bg-zinc-200 rounded" />
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 text-center shadow-2xs animate-pulse">
                    <Loader2 className="w-6 h-6 text-[#4f46e5] animate-spin mx-auto mb-3" />
                    <p className="text-sm text-zinc-500 font-medium">
                      Fetching encrypted file index...
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-6 text-center text-rose-900 mb-8 shadow-2xs backdrop-blur-xs">
                  <AlertCircle className="w-7 h-7 mx-auto mb-2 text-rose-600" />
                  <p className="text-sm font-semibold mb-1">{error}</p>
                  <p className="text-xs text-rose-600 mb-4">
                    Failed to sync with standard API server at localhost:5000
                  </p>
                  <button
                    onClick={() => fetchDashboard(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry connection
                  </button>
                </div>
              )}

              {/* Main Dashboard Content */}
              {!loading && !error && dashboardData && (
                <>
                  {/* 2. STAT CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {/* Files Stat */}
                    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          Files
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-[#4f46e5] shadow-2xs">
                          <Files className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-zinc-900 tracking-tight font-mono">
                          {dashboardData.stats.totalFiles}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          stored
                        </span>
                      </div>
                    </div>

                    {/* Share Links Stat */}
                    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          Share links
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-[#4f46e5] shadow-2xs">
                          <Share2 className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-zinc-900 tracking-tight font-mono">
                          {dashboardData.stats.totalShareLinks}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          generated
                        </span>
                      </div>
                    </div>

                    {/* Downloads Stat */}
                    <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          Downloads
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-[#4f46e5] shadow-2xs">
                          <Download className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-zinc-900 tracking-tight font-mono">
                          {dashboardData.stats.totalDownloads}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          transits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 6. EMPTY STATE */}
                  {dashboardData.files.length === 0 ? (
                    <div className="bg-white border border-zinc-200/90 rounded-2xl p-12 sm:p-16 text-center shadow-xs">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-4 text-zinc-400 shadow-2xs">
                        <UploadCloud className="w-7 h-7 text-zinc-400" />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 mb-1 tracking-tight">
                        No files yet
                      </h3>
                      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto leading-relaxed">
                        Upload your first file to get started.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4" />
                        Upload file
                      </Link>
                    </div>
                  ) : (
                    /* 3. FILE LIST & TOOLBAR */
                    <div className="space-y-5">
                      {/* Search and Filter Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/90 shadow-2xs">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Filter files by filename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200/80 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#4f46e5] focus:bg-white transition-all"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 self-start sm:self-auto text-xs font-medium">
                          <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              filterStatus === 'all'
                                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            All ({dashboardData.files.length})
                          </button>
                          <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              filterStatus === 'active'
                                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            Active Links
                          </button>
                          <button
                            onClick={() => setFilterStatus('expired')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              filterStatus === 'expired'
                                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            Expired / Revoked
                          </button>
                        </div>
                      </div>

                      {/* Filtered Empty Match */}
                      {filteredFiles.length === 0 ? (
                        <div className="bg-white border border-zinc-200/90 rounded-2xl p-10 text-center shadow-xs">
                          <Filter className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-zinc-800">
                            No files match your search criteria.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setFilterStatus('all');
                            }}
                            className="mt-3 text-xs font-medium text-[#4f46e5] hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredFiles.map((file) => {
                            const Icon = getFileIcon(
                              file.mimeType,
                              file.originalName,
                            );

                            return (
                              <div
                                key={file.id}
                                className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs hover:border-zinc-300 transition-all"
                              >
                                {/* File Header Row */}
                                <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 border border-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0 shadow-2xs">
                                      <Icon className="w-5.5 h-5.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <h3
                                        className="font-bold text-zinc-900 text-sm sm:text-base truncate tracking-tight"
                                        title={file.originalName}
                                      >
                                        {file.originalName}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 font-mono flex-wrap">
                                        <span className="font-semibold text-zinc-700 bg-white px-2 py-0.5 rounded border border-zinc-200/80">
                                          {formatBytes(file.size)}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          Uploaded {formatDate(file.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-white px-3 py-1.5 rounded-lg border border-zinc-200/80 shrink-0 self-start sm:self-auto">
                                    <Link2 className="w-3.5 h-3.5 text-[#4f46e5]" />
                                    <span>
                                      {file.shareLinks.length}{' '}
                                      {file.shareLinks.length === 1
                                        ? 'link'
                                        : 'links'}
                                    </span>
                                  </div>
                                </div>

                                {/* 4. Share Links inside File */}
                                <div className="p-4 sm:p-5">
                                  {file.shareLinks.length === 0 ? (
                                    <p className="text-xs text-zinc-400 italic">
                                      No share links generated for this file.
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {file.shareLinks.map((shareLink) => {
                                        const status =
                                          getShareLinkStatus(shareLink);
                                        const displayUrl = `/share/${shareLink.token}`;

                                        return (
                                          <div
                                            key={shareLink.id}
                                            className="bg-zinc-50/70 border border-zinc-200/70 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-all hover:bg-white hover:border-zinc-300/80 hover:shadow-2xs"
                                          >
                                            {/* Details & Badges */}
                                            <div className="flex-1 min-w-0 space-y-2">
                                              {/* Status Pill & Flags */}
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${status.badgeStyle}`}
                                                >
                                                  <span
                                                    className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                                                  />
                                                  {status.label}
                                                </span>

                                                {shareLink.deleteAfterDownload && (
                                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80 font-mono">
                                                    <Trash2 className="w-3 h-3 text-purple-600" />
                                                    Delete after download
                                                  </span>
                                                )}
                                              </div>

                                              {/* Token Box */}
                                              <div className="flex items-center gap-2 min-w-0">
                                                <code className="font-mono text-zinc-800 bg-white px-2.5 py-1 rounded-lg border border-zinc-200/90 truncate max-w-full sm:max-w-md text-xs shadow-2xs">
                                                  {displayUrl}
                                                </code>
                                              </div>

                                              {/* Metrics: Downloads & Expiry */}
                                              <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-mono flex-wrap">
                                                <span className="flex items-center gap-1.5 bg-white/80 px-2 py-0.5 rounded border border-zinc-200/60">
                                                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                                                  <span>Downloads:</span>
                                                  <strong className="text-zinc-800">
                                                    {shareLink.downloadCount} /{' '}
                                                    {shareLink.maxDownloads !==
                                                    null
                                                      ? shareLink.maxDownloads
                                                      : 'Unlimited'}
                                                  </strong>
                                                </span>

                                                <span className="flex items-center gap-1.5 bg-white/80 px-2 py-0.5 rounded border border-zinc-200/60">
                                                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                  <span>Expiry:</span>
                                                  <strong className="text-zinc-800">
                                                    {shareLink.expiresAt
                                                      ? formatDate(
                                                          shareLink.expiresAt,
                                                        )
                                                      : 'Never expires'}
                                                  </strong>
                                                </span>
                                              </div>
                                            </div>

                                            {/* 5. Actions: Copy & Open */}
                                            <div className="flex items-center gap-2 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-zinc-200/80">
                                              <button
                                                onClick={() =>
                                                  handleCopyLink(shareLink.token)
                                                }
                                                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-medium transition-all shadow-2xs hover:border-zinc-300 cursor-pointer text-xs"
                                                title="Copy Share Link"
                                              >
                                                {copiedToken ===
                                                shareLink.token ? (
                                                  <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span className="text-emerald-700 font-semibold">
                                                      Copied
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>Copy</span>
                                                  </>
                                                )}
                                              </button>

                                              <a
                                                href={`/share/${shareLink.token}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-medium transition-all shadow-2xs hover:border-zinc-300 cursor-pointer text-xs"
                                                title="Open Share Link in new tab"
                                              >
                                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                                <span>Open</span>
                                              </a>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Show>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
