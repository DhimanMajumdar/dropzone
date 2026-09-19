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
  Ban,
  X,
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
      badgeStyle: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      dotColor: 'bg-rose-500',
    };
  }

  if (shareLink.expiresAt && new Date(shareLink.expiresAt) <= new Date()) {
    return {
      label: 'Expired',
      badgeStyle: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
      dotColor: 'bg-amber-500',
    };
  }

  if (
    shareLink.maxDownloads !== null &&
    shareLink.downloadCount >= shareLink.maxDownloads
  ) {
    return {
      label: 'Limit reached',
      badgeStyle: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80',
      dotColor: 'bg-zinc-400',
    };
  }

  return {
    label: 'Active',
    badgeStyle: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    dotColor: 'bg-emerald-400',
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

  // Management State: Revoke Share Link
  const [revokeConfirmLink, setRevokeConfirmLink] = useState<ShareLink | null>(null);
  const [revokingLinkId, setRevokingLinkId] = useState<number | null>(null);
  const [revokeError, setRevokeError] = useState<{ linkId: number; message: string } | null>(null);

  // Management State: Delete File
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<FileItem | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // 1. Revoke Share Link API Call
  const handleRevokeShareLink = async (shareLinkId: number) => {
    try {
      setRevokingLinkId(shareLinkId);
      setRevokeError(null);

      const token = await getToken();
      if (!token) {
        setRevokeError({
          linkId: shareLinkId,
          message: 'Authentication token unavailable. Please sign in again.',
        });
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/share-links/${shareLinkId}/revoke`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || 'Unable to revoke this share link. Please try again.',
        );
      }

      // Success: update dashboard state immediately
      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          files: prev.files.map((file) => ({
            ...file,
            shareLinks: file.shareLinks.map((sl) =>
              sl.id === shareLinkId ? { ...sl, revoked: true } : sl,
            ),
          })),
        };
      });

      setRevokeConfirmLink(null);
    } catch (err: any) {
      console.error('Revoke share link error:', err);
      setRevokeError({
        linkId: shareLinkId,
        message:
          err.message || 'Unable to revoke this share link. Please try again.',
      });
    } finally {
      setRevokingLinkId(null);
    }
  };

  // 2. Delete File API Call
  const handleDeleteFile = async (fileId: number) => {
    if (!deleteConfirmFile) return;
    try {
      setDeletingFileId(fileId);
      setDeleteError(null);

      const token = await getToken();
      if (!token) {
        setDeleteError(
          'Authentication token unavailable. Please sign in again.',
        );
        return;
      }

      const res = await fetch(`http://localhost:5000/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || 'Unable to delete this file. Please try again.',
        );
      }

      // Success: calculate metrics update and remove file from dashboard state
      const targetFile = deleteConfirmFile;
      const linksCount = targetFile.shareLinks.length;
      const downloadsCount = targetFile.shareLinks.reduce(
        (sum, sl) => sum + sl.downloadCount,
        0,
      );

      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          stats: {
            totalFiles: Math.max(0, prev.stats.totalFiles - 1),
            totalShareLinks: Math.max(
              0,
              prev.stats.totalShareLinks - linksCount,
            ),
            totalDownloads: Math.max(
              0,
              prev.stats.totalDownloads - downloadsCount,
            ),
          },
          files: prev.files.filter((f) => f.id !== fileId),
        };
      });

      setDeleteConfirmFile(null);
    } catch (err: any) {
      console.error('Delete file error:', err);
      setDeleteError(
        err.message || 'Unable to delete this file. Please try again.',
      );
    } finally {
      setDeletingFileId(null);
    }
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
    <div className="min-h-screen flex flex-col justify-between bg-[#09090b] text-[#f4f4f5] selection:bg-[#6366f1] selection:text-white">
      <div>
        <Navbar />

        {/* Workspace Canvas Background Pattern */}
        <div className="bg-grid-pattern border-b border-zinc-800/80 bg-[#09090b]">
          <main className="py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
            <Show when="signed-out">
              <div className="bg-[#121215] rounded-2xl border border-zinc-800 p-8 sm:p-12 text-center max-w-md mx-auto shadow-2xl my-12 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 text-indigo-400 shadow-2xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                  Authentication Required
                </h2>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Please sign in to access your secure DropZone file workspace.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                >
                  Return to Home
                </Link>
              </div>
            </Show>

            <Show when="signed-in">
              {/* Top Navigation Tagline */}
              <div className="flex items-center gap-2 mb-3 text-xs font-mono font-medium text-zinc-400">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121215] border border-zinc-800 shadow-2xs text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  DASHBOARD OVERVIEW
                </span>
                <span className="text-zinc-700">•</span>
                <span className="hidden sm:inline text-zinc-500">
                  PRIVATE STORAGE TRANSIT LAYER
                </span>
              </div>

              {/* 1. Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    Your files
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1 font-normal">
                    Manage your files and shared links.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <button
                    onClick={() => fetchDashboard(true)}
                    disabled={refreshing || loading}
                    className="inline-flex items-center justify-center p-2.5 rounded-xl bg-[#121215] border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                    title="Refresh Dashboard Data"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-zinc-400 ${
                        refreshing ? 'animate-spin text-indigo-400' : ''
                      }`}
                    />
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] cursor-pointer active:scale-[0.99]"
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
                        className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 shadow-2xs animate-pulse"
                      >
                        <div className="h-4 w-20 bg-zinc-800 rounded mb-4" />
                        <div className="h-8 w-16 bg-zinc-700 rounded" />
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-8 text-center shadow-2xs animate-pulse">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-zinc-400 font-medium">
                      Fetching encrypted file index...
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="bg-rose-950/60 border border-rose-800/60 rounded-2xl p-6 text-center text-rose-200 mb-8 shadow-2xs">
                  <AlertCircle className="w-7 h-7 mx-auto mb-2 text-rose-400" />
                  <p className="text-sm font-semibold mb-1">{error}</p>
                  <button
                    onClick={() => fetchDashboard(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 transition-colors shadow-2xs cursor-pointer mt-2"
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
                    <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 shadow-2xl hover:border-zinc-700 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          Files
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-2xs">
                          <Files className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                          {dashboardData.stats.totalFiles}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          stored
                        </span>
                      </div>
                    </div>

                    {/* Share Links Stat */}
                    <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 shadow-2xl hover:border-zinc-700 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          Share links
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-2xs">
                          <Share2 className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                          {dashboardData.stats.totalShareLinks}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          generated
                        </span>
                      </div>
                    </div>

                    {/* Downloads Stat */}
                    <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-5 shadow-2xl hover:border-zinc-700 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          Downloads
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-400 shadow-2xs bg-indigo-500/10 border-indigo-500/20">
                          <Download className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                          {dashboardData.stats.totalDownloads}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">
                          transits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 6. EMPTY STATE */}
                  {dashboardData.files.length === 0 ? (
                    <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-12 sm:p-16 text-center shadow-2xl">
                      <div className="w-14 h-14 rounded-2xl bg-[#09090b] border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500 shadow-2xs">
                        <UploadCloud className="w-7 h-7 text-zinc-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                        No files yet
                      </h3>
                      <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">
                        Upload your first file to get started.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4" />
                        Upload file
                      </Link>
                    </div>
                  ) : (
                    /* 3. FILE LIST & TOOLBAR */
                    <div className="space-y-5">
                      {/* Search and Filter Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121215] p-3.5 rounded-2xl border border-zinc-800/90 shadow-2xs">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Filter files by filename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-[#09090b] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-indigo-500 transition-all font-sans"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-zinc-800 self-start sm:self-auto text-xs font-medium">
                          <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              filterStatus === 'all'
                                ? 'bg-zinc-800 text-white shadow-2xs font-semibold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            All ({dashboardData.files.length})
                          </button>
                          <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              filterStatus === 'active'
                                ? 'bg-zinc-800 text-white shadow-2xs font-semibold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Active Links
                          </button>
                          <button
                            onClick={() => setFilterStatus('expired')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                              filterStatus === 'expired'
                                ? 'bg-zinc-800 text-white shadow-2xs font-semibold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Expired / Revoked
                          </button>
                        </div>
                      </div>

                      {/* Filtered Empty Match */}
                      {filteredFiles.length === 0 ? (
                        <div className="bg-[#121215] border border-zinc-800/90 rounded-2xl p-10 text-center shadow-2xs">
                          <Filter className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-zinc-300">
                            No files match your search criteria.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setFilterStatus('all');
                            }}
                            className="mt-3 text-xs font-medium text-indigo-400 hover:underline cursor-pointer"
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
                                className="bg-[#121215] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl hover:border-zinc-700 transition-all"
                              >
                                {/* File Header Row */}
                                <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-[#09090b]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
                                      <Icon className="w-5.5 h-5.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <h3
                                        className="font-bold text-white text-sm sm:text-base truncate tracking-tight"
                                        title={file.originalName}
                                      >
                                        {file.originalName}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 font-mono flex-wrap">
                                        <span className="font-semibold text-zinc-300 bg-[#121215] px-2 py-0.5 rounded border border-zinc-800">
                                          {formatBytes(file.size)}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          Uploaded {formatDate(file.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* File Management Actions */}
                                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-[#09090b] px-3 py-1.5 rounded-lg border border-zinc-800">
                                      <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                                      <span>
                                        {file.shareLinks.length}{' '}
                                        {file.shareLinks.length === 1
                                          ? 'link'
                                          : 'links'}
                                      </span>
                                    </div>

                                    {/* 2. DELETE FILE BUTTON */}
                                    <button
                                      onClick={() => {
                                        setDeleteConfirmFile(file);
                                        setDeleteError(null);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 font-medium text-xs transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
                                      title="Delete file permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>

                                {/* 4. Share Links inside File */}
                                <div className="p-4 sm:p-5">
                                  {file.shareLinks.length === 0 ? (
                                    <p className="text-xs text-zinc-500 italic">
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
                                            className="bg-[#09090b]/80 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-all hover:bg-[#121215] hover:border-zinc-700/90 shadow-2xs"
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
                                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60 font-mono">
                                                    <Trash2 className="w-3 h-3 text-purple-400" />
                                                    Delete after download
                                                  </span>
                                                )}
                                              </div>

                                              {/* Token Box */}
                                              <div className="flex items-center gap-2 min-w-0">
                                                <code className="font-mono text-indigo-300 bg-[#121215] px-2.5 py-1 rounded-lg border border-zinc-800 truncate max-w-full sm:max-w-md text-xs shadow-2xs">
                                                  {displayUrl}
                                                </code>
                                              </div>

                                              {/* Metrics: Downloads & Expiry */}
                                              <div className="flex items-center gap-4 text-zinc-400 text-[11px] font-mono flex-wrap">
                                                <span className="flex items-center gap-1.5 bg-[#121215] px-2 py-0.5 rounded border border-zinc-800">
                                                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                                                  <span>Downloads:</span>
                                                  <strong className="text-zinc-200">
                                                    {shareLink.downloadCount} /{' '}
                                                    {shareLink.maxDownloads !==
                                                    null
                                                      ? shareLink.maxDownloads
                                                      : 'Unlimited'}
                                                  </strong>
                                                </span>

                                                <span className="flex items-center gap-1.5 bg-[#121215] px-2 py-0.5 rounded border border-zinc-800">
                                                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                                  <span>Expiry:</span>
                                                  <strong className="text-zinc-200">
                                                    {shareLink.expiresAt
                                                      ? formatDate(
                                                          shareLink.expiresAt,
                                                        )
                                                      : 'Never expires'}
                                                  </strong>
                                                </span>
                                              </div>

                                              {/* Revoke Inline Error */}
                                              {revokeError &&
                                                revokeError.linkId ===
                                                  shareLink.id && (
                                                  <p className="text-xs text-rose-400 font-medium">
                                                    {revokeError.message}
                                                  </p>
                                                )}
                                            </div>

                                            {/* SHARE LINK ACTIONS: [ Copy ] [ Open ] [ Revoke ] */}
                                            <div className="flex items-center gap-2 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-zinc-800/80 flex-wrap sm:flex-nowrap">
                                              {/* Copy Button */}
                                              <button
                                                onClick={() =>
                                                  handleCopyLink(shareLink.token)
                                                }
                                                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#121215] border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white font-medium transition-all shadow-2xs cursor-pointer text-xs"
                                                title="Copy Share Link"
                                              >
                                                {copiedToken ===
                                                shareLink.token ? (
                                                  <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400 font-semibold">
                                                      Copied
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                                    <span>Copy</span>
                                                  </>
                                                )}
                                              </button>

                                              {/* Open Button */}
                                              <a
                                                href={`/share/${shareLink.token}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#121215] border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white font-medium transition-all shadow-2xs cursor-pointer text-xs"
                                                title="Open Share Link in new tab"
                                              >
                                                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                                                <span>Open</span>
                                              </a>

                                              {/* 1. REVOKE BUTTON (only when revoked === false) */}
                                              {!shareLink.revoked && (
                                                <button
                                                  onClick={() => {
                                                    setRevokeConfirmLink(
                                                      shareLink,
                                                    );
                                                    setRevokeError(null);
                                                  }}
                                                  disabled={
                                                    revokingLinkId ===
                                                    shareLink.id
                                                  }
                                                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 font-medium transition-all shadow-2xs cursor-pointer text-xs disabled:opacity-50"
                                                  title="Revoke Share Link"
                                                >
                                                  {revokingLinkId ===
                                                  shareLink.id ? (
                                                    <>
                                                      <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                                                      <span>Revoking...</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Ban className="w-3.5 h-3.5 text-rose-400" />
                                                      <span>Revoke</span>
                                                    </>
                                                  )}
                                                </button>
                                              )}
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

      {/* CONFIRMATION MODAL: REVOKE SHARE LINK */}
      {revokeConfirmLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121215] rounded-2xl border border-zinc-800 shadow-2xl max-w-md w-full p-6 text-left relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                if (!revokingLinkId) {
                  setRevokeConfirmLink(null);
                  setRevokeError(null);
                }
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
              <Ban className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              Revoke this share link?
            </h3>
            <p className="text-sm text-zinc-400 mb-3 leading-relaxed">
              Anyone using this link will no longer be able to download the file.
            </p>

            <div className="bg-[#09090b] border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-indigo-300 truncate mb-6">
              /share/{revokeConfirmLink.token}
            </div>

            {revokeError &&
              revokeError.linkId === revokeConfirmLink.id && (
                <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{revokeError.message}</span>
                </div>
              )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (!revokingLinkId) {
                    setRevokeConfirmLink(null);
                    setRevokeError(null);
                  }
                }}
                disabled={!!revokingLinkId}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeShareLink(revokeConfirmLink.id)}
                disabled={!!revokingLinkId}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {revokingLinkId === revokeConfirmLink.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Revoking...</span>
                  </>
                ) : (
                  <span>Revoke link</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE FILE */}
      {deleteConfirmFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121215] rounded-2xl border border-zinc-800 shadow-2xl max-w-md w-full p-6 text-left relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                if (!deletingFileId) {
                  setDeleteConfirmFile(null);
                  setDeleteError(null);
                }
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mb-2 truncate">
              Delete &quot;{deleteConfirmFile.originalName}&quot;?
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              This will permanently remove the file and all of its share links.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (!deletingFileId) {
                    setDeleteConfirmFile(null);
                    setDeleteError(null);
                  }
                }}
                disabled={!!deletingFileId}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFile(deleteConfirmFile.id)}
                disabled={!!deletingFileId}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {deletingFileId === deleteConfirmFile.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
