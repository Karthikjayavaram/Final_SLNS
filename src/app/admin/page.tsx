'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, Trash2, X, Plus, ImageIcon, CheckSquare, Search, Filter, LogOut, Loader2, Crop, Minus, AlertCircle, Edit, Eye, EyeOff, Star, Save, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageEditor from './ImageEditor';
import ErrorModal from '@/components/ErrorModal';

type Project = {
  _id: string;
  category: string;
  mediaUrls: string[];
  title?: string;
};

type EventStyle = {
  _id: string;
  name: string;
};

type StagedFile = {
  id: string;
  originalFile: File;
  objectUrl: string;
  editedBlob?: Blob;
  watermarkOptions?: any;
  originalSize: number;
  compressedSize?: number;
  status?: 'pending' | 'compressing' | 'uploading' | 'success' | 'error';
  progress?: number;
};

const compressImage = async (file: File | Blob, maxWidth = 1920): Promise<Blob> => {
  if (!file.type.startsWith('image/')) return file as Blob;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      let isTransparent = false;
      if (['image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        try {
          const imageData = ctx.getImageData(0, 0, width, height).data;
          // Check alpha channel (every 4th byte)
          for (let i = 3; i < imageData.length; i += 4) {
            if (imageData[i] < 255) {
              isTransparent = true;
              break;
            }
          }
        } catch (e) {
          // Default to preserving if we can't read pixel data (e.g., CORS, though local Blob shouldn't trigger this)
          isTransparent = true;
        }
      }

      const mimeType = isTransparent ? 'image/webp' : 'image/jpeg';
      canvas.toBlob((blob) => resolve(blob || file), mimeType, 0.85);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<EventStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCurrent, setUploadCurrent] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(0);
  const [uploadFail, setUploadFail] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const router = useRouter();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // New Project Form State
  const [uploadCategory, setUploadCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [stagingFiles, setStagingFiles] = useState<StagedFile[]>([]);
  const [editingStagedFile, setEditingStagedFile] = useState<StagedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Modals
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title?: string; message: string; details?: string } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProjects();
  }, [filterCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/styles', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !uploadCategory) setUploadCategory(data[0].name);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterCategory !== 'All') query.append('category', filterCategory);
      query.append('sort', 'newest'); // Always sort by newest by default

      const res = await fetch(`/api/projects?${query.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    const res = await fetch('/api/styles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (res.ok) {
      const { style } = await res.json();
      setCategories(prev => [...prev, style]);
      setUploadCategory(style.name);
      setNewCategoryName('');
      setIsCreatingCategory(false);
    }
  };

  const handleDeleteCategory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      message: 'Delete this category? ALL photos and videos inside this category will also be permanently deleted.',
      onConfirm: async () => {
        const categoryName = categories.find(c => c._id === id)?.name;
        await fetch(`/api/styles?id=${id}`, { method: 'DELETE' });
        
        // Optimistically remove category
        setCategories(prev => {
          const updated = prev.filter(c => c._id !== id);
          if (uploadCategory === categoryName) {
            setUploadCategory(updated.length > 0 ? updated[0].name : '');
          }
          return updated;
        });
        
        // Optimistically remove all projects in this category
        if (categoryName) {
          setProjects(prev => prev.filter(p => p.category !== categoryName));
        }

        fetchCategories();
        fetchProjects(); // refresh projects to ensure accurate state
        setConfirmDialog(null);
      }
    });
  };

  // Bulk Actions
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      message: `Delete ${selectedIds.length} projects?`,
      onConfirm: async () => {
        try {
          const validIds = selectedIds.filter(id => !id.startsWith('temp-'));
          if (validIds.length > 0) {
            await fetch('/api/projects/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'delete', ids: validIds }),
            });
          }
          setProjects(prev => prev.filter(p => !selectedIds.includes(p._id)));
          setSelectedIds([]);
          fetchProjects();
        } catch (e) {
          console.error(e);
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleBulkUpdate = async (updateData: any) => {
    try {
      await fetch('/api/projects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ids: selectedIds, updateData }),
      });
      setSelectedIds([]);
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this media?',
      onConfirm: async () => {
        try {
          setProjects(prev => prev.filter(p => p._id !== id));
          if (!id.startsWith('temp-')) {
            await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
          }
          fetchProjects();
        } catch (error) {
          console.error('Delete failed', error);
        }
        setConfirmDialog(null);
      }
    });
  };

  // Staging & Upload Logic
  const processFiles = async (files: File[]) => {
    const newFiles = files.filter(f => !stagingFiles.some(p => p.originalFile.name === f.name && p.originalSize === f.size));
    if (newFiles.length === 0) return;

    const initialStaged = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      originalFile: f,
      objectUrl: URL.createObjectURL(f),
      originalSize: f.size,
      status: 'compressing' as const
    }));

    setStagingFiles(prev => [...prev, ...initialStaged]);

    for (const staged of initialStaged) {
      if (staged.originalFile.type.startsWith('image/')) {
        try {
          const compressed = await compressImage(staged.originalFile);
          setStagingFiles(prev => prev.map(p => {
            if (p.id === staged.id) {
              return { 
                ...p, 
                editedBlob: compressed, 
                compressedSize: compressed.size, 
                status: 'pending' 
              };
            }
            return p;
          }));
        } catch (e) {
          setStagingFiles(prev => prev.map(p => p.id === staged.id ? { ...p, status: 'pending' } : p));
        }
      } else {
        setStagingFiles(prev => prev.map(p => p.id === staged.id ? { ...p, status: 'pending' } : p));
      }
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
    e.target.value = ''; // Reset input
  };

  const removeStagedFile = (id: string) => {
    setStagingFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.objectUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleCancelUpload = () => {
    stagingFiles.forEach(f => URL.revokeObjectURL(f.objectUrl));
    setStagingFiles([]);
    setIsAdding(false);
  };

  const saveEditedStagedFile = (blob: Blob | null, watermarkOpts?: any) => {
    if (!editingStagedFile) return;
    setStagingFiles(prev => prev.map(f => {
      if (f.id === editingStagedFile.id) {
        if (blob) {
          if (f.editedBlob) URL.revokeObjectURL(f.objectUrl); // cleanup previous edit if any
          return { ...f, objectUrl: URL.createObjectURL(blob), editedBlob: blob };
        } else if (watermarkOpts) {
          return { ...f, watermarkOptions: { ...watermarkOpts, type: 'text' } };
        }
      }
      return f;
    }));
    setEditingStagedFile(null);
  };

  const handleUploadAll = async () => {
    if (stagingFiles.length === 0) return alert('No files to upload');
    if (!uploadCategory) return alert('Please select a category first');
    
    setUploading(true);
    setUploadTotal(stagingFiles.length);
    setUploadCurrent(0);
    setUploadProgress(0);
    setUploadSuccess(0);
    setUploadFail(0);
    setTimeRemaining(null);

    const startTime = Date.now();

    try {
      let successCount = 0;
      let failCount = 0;
      let completedCount = 0;

      const pendingFiles = stagingFiles.filter(f => f.status !== 'success');
      
      const CONCURRENCY = 10;
      
      const uploadFile = async (staged: StagedFile) => {
        try {
          // Optimistic UI: Display the file instantly
          const tempId = `temp-${staged.id}`;
          const optimisticProject = {
            _id: tempId,
            category: uploadCategory,
            mediaUrls: [staged.objectUrl],
            mediaType: staged.originalFile.type.startsWith('video/') ? 'video' : 'image',
          } as Project;
          setProjects(prev => [optimisticProject, ...prev]);

          let fileToUpload = staged.editedBlob || staged.originalFile;
          
          // 1. Get Cloudinary Upload Signature
          const sigPayload: any = {};
          if (staged.editedBlob) {
            sigPayload.skipWatermark = true;
          } else if (staged.watermarkOptions) {
            sigPayload.customWatermark = staged.watermarkOptions;
          }

          const sigRes = await fetch('/api/upload/signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sigPayload)
          });
          
          if (!sigRes.ok) throw new Error('Signature generation failed');
          const sigData = await sigRes.json();

          // 2. Upload directly to Cloudinary edge nodes via XHR for progress tracking
          const uploadData = await new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`);
            
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                setStagingFiles(prev => prev.map(f => f.id === staged.id ? { ...f, progress: percentComplete, status: 'uploading' } : f));
              }
            };
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
              }
            };
            
            xhr.onerror = () => reject(new Error('Network error during upload'));
            
            const formData = new FormData();
            formData.append('file', fileToUpload, staged.originalFile.name);
            formData.append('api_key', sigData.apiKey);
            formData.append('timestamp', sigData.timestamp.toString());
            formData.append('signature', sigData.signature);
            formData.append('folder', sigData.folder);
            if (sigData.transformation) {
              formData.append('transformation', sigData.transformation);
            }
            
            xhr.send(formData);
          });
          
          const url = uploadData.secure_url;

          const projectRes = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: uploadCategory,
              mediaUrls: [url],
              mediaType: staged.originalFile.type.startsWith('video/') ? 'video' : 'image',
              visibility: true,
            }),
          });
          
          if (!projectRes.ok) {
            const errorData = await projectRes.json();
            throw new Error(`Project creation failed: ${errorData.error}`);
          }
          
          const newProjectData = await projectRes.json();
          // Replace optimistic temp project with real DB project
          setProjects(prev => prev.map(p => p._id === tempId ? newProjectData.project : p));
          
          setUploadSuccess(successCount);
          setStagingFiles(prev => prev.map(f => f.id === staged.id ? { ...f, status: 'success', progress: 100 } : f));
        } catch (err) {
          console.error('Upload failed for file', staged.originalFile.name, err);
          failCount++;
          setUploadFail(failCount);
          setStagingFiles(prev => prev.map(f => f.id === staged.id ? { ...f, status: 'error' } : f));
        } finally {
          completedCount++;
          setUploadCurrent(completedCount);
          setUploadProgress(Math.round((completedCount / stagingFiles.length) * 100));
          
          const elapsed = Date.now() - startTime;
          const timePerFile = elapsed / completedCount;
          const remainingFiles = stagingFiles.length - completedCount;
          const remainingMs = remainingFiles * timePerFile;
          
          if (remainingMs > 60000) {
            setTimeRemaining(`${Math.round(remainingMs / 60000)}m remaining`);
          } else if (remainingMs > 1000) {
            setTimeRemaining(`${Math.round(remainingMs / 1000)}s remaining`);
          } else {
            setTimeRemaining('Almost done...');
          }
        }
      };

      for (let i = 0; i < pendingFiles.length; i += CONCURRENCY) {
        const chunk = pendingFiles.slice(i, i + CONCURRENCY);
        await Promise.all(chunk.map(uploadFile));
      }

      fetchProjects();
      
      if (failCount > 0) {
        setStagingFiles(prev => prev.filter(f => f.status === 'error' || f.status === 'pending'));
        setErrorModal({
          isOpen: true,
          title: 'Upload Partially Completed',
          message: `${successCount} items uploaded successfully, but ${failCount} items failed to upload.`,
          details: 'Check your internet connection and ensure all files are valid formats. The failed files have been left in the staging area.'
        });
      } else {
        setIsAdding(false);
        setStagingFiles([]);
      }
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: 'Upload Failed',
        message: 'A critical error occurred during the upload process.',
        details: error.message || String(error)
      });
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadTotal(0);
        setUploadCurrent(0);
        setUploadProgress(0);
        setTimeRemaining(null);
      }, 2000);
    }
  };

  // Media Editing Logic
  const handleUpdateProject = async (id: string, data: any) => {
    await fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    fetchProjects();
    if (editingProject) {
      setEditingProject({ ...editingProject, ...data });
    }
  };

  // Filter Projects by Search Client-side
  const displayedProjects = projects.filter(p => (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">Media Management</h1>
          <p className="text-foreground/40 mt-1 text-sm">Upload, edit, and organize your portfolio</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => { if (isAdding) handleCancelUpload(); else setIsAdding(true); }} className="btn-gold px-5 py-2.5 rounded-xl text-xs uppercase flex items-center gap-2 font-bold tracking-wider">
            {isAdding ? 'Cancel Upload' : <><Upload className="w-4 h-4" /> Upload Photos & Videos</>}
          </button>
          <button onClick={handleLogout} className="btn-outline-gold border-white/10 text-white/60 hover:text-white px-4 py-2.5 rounded-xl text-xs uppercase flex items-center gap-2">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Upload Workflow Area */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass rounded-3xl p-6 sm:p-8 mb-8 border border-gold-400/20 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Step 1 & 2: Controls */}
              <div className="w-full md:w-1/3 flex flex-col gap-6">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-bold text-gold-400">1. Select Category</h3>
                  
                  {isCreatingCategory ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)} 
                        placeholder="e.g. Traditional Wedding" 
                        className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-black text-sm" 
                        autoFocus
                      />
                      <button onClick={handleCreateCategory} className="btn-gold px-3 rounded-xl text-xs">Save</button>
                      <button onClick={() => setIsCreatingCategory(false)} className="text-white/50 hover:text-white px-2"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select 
                          value={uploadCategory || ''} 
                          onChange={(e) => setUploadCategory(e.target.value)} 
                          className="w-full px-4 py-3 rounded-xl appearance-none bg-[#0a0a0a] border border-gold-400/20 text-foreground hover:border-gold-400/40 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23AA7C11%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat pr-10 text-sm [&>option]:bg-[#0a0a0a] [&>option]:text-white shadow-inner"
                        >
                          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                          {categories.length === 0 && <option value="" disabled>No categories available</option>}
                        </select>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setIsCreatingCategory(true)} className="btn-outline-gold px-3 rounded-xl flex items-center justify-center" title="New Category">
                          <Plus className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={(e) => {
                            const selectedCat = categories.find(c => c.name === uploadCategory);
                            if (selectedCat) handleDeleteCategory(selectedCat._id, e);
                          }} 
                          className="btn-outline-gold px-3 rounded-xl flex items-center justify-center border-red-500/50 text-red-400 hover:bg-red-500/10" 
                          title="Delete Selected Category"
                        >
                          <Minus className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-bold text-gold-400">2. Select Files</h3>
                  <div className="flex flex-col gap-3">
                    <label className="relative cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-surface/50 hover:bg-white/5 transition-colors">
                      <ImageIcon className="w-5 h-5 text-gold-400" />
                      <span className="text-sm">Select Photos & Videos</span>
                      <input type="file" accept="image/*,video/*" multiple onChange={handleFilesSelected} className="hidden" />
                    </label>
                    
                    <label className="relative cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-surface/50 hover:bg-white/5 transition-colors">
                      <Plus className="w-5 h-5 text-gold-400" />
                      <span className="text-sm">Select Entire Folder</span>
                      <input type="file" accept="image/*,video/*" {...{webkitdirectory: "true"}} onChange={handleFilesSelected} className="hidden" />
                    </label>

                    {stagingFiles.length > 0 && (
                      <div className="flex flex-col gap-3 mt-4">
                        {uploading && uploadTotal > 0 && (
                          <div className="bg-surface rounded-xl p-5 border border-white/10 flex flex-col gap-3 shadow-lg">
                            <div className="flex justify-between items-end text-sm">
                              <div>
                                <p className="font-bold text-gold-400">Uploading {uploadCurrent} of {uploadTotal} files</p>
                                <p className="text-xs text-foreground/50 mt-1">{timeRemaining || 'Calculating...'}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-lg">{uploadProgress}%</span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-300 relative" 
                                style={{ width: `${uploadProgress}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                              </div>
                            </div>
                            <div className="flex justify-between text-xs pt-1">
                              <span className="text-green-400">{uploadSuccess} Successful</span>
                              {uploadFail > 0 && <span className="text-red-400">{uploadFail} Failed</span>}
                            </div>
                          </div>
                        )}
                        <button onClick={handleUploadAll} disabled={uploading} className="btn-gold py-3 rounded-xl text-sm font-bold tracking-wider uppercase flex justify-center items-center gap-2">
                          {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                          {uploading ? 'Processing Uploads...' : `Upload ${stagingFiles.length} File${stagingFiles.length > 1 ? 's' : ''}`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3 & 4: Staging Preview Area */}
              <div 
                className={`w-full md:w-2/3 border rounded-2xl bg-black/50 p-6 flex flex-col transition-colors ${isDragging ? 'border-gold-400 bg-gold-400/10' : 'border-white/10'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    processFiles(Array.from(e.dataTransfer.files));
                  }
                }}
              >
                <h3 className="font-serif text-xl font-bold text-white mb-1">3. Staging Area & Preview</h3>
                <p className="text-xs text-white/50 mb-4">Click any photo to open the visual editor (Crop, Rotate). Files here are not saved yet. Watermarks are automatically applied on upload.</p>
                
                {stagingFiles.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">No files selected</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {stagingFiles.map((file) => (
                        <div key={file.id} className="relative aspect-square group rounded-xl overflow-hidden border border-white/10 bg-black cursor-pointer">
                          {file.originalFile.type.startsWith('video/') ? (
                            <video src={file.objectUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={file.objectUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Staged" />
                          )}
                          
                          {/* File Optimization & Status Badges */}
                          <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 pointer-events-none">
                            {file.status === 'compressing' && (
                              <span className="text-[10px] bg-blue-500/80 text-white px-2 py-0.5 rounded-full backdrop-blur-md font-bold">Compressing...</span>
                            )}
                            {file.status === 'uploading' && (
                              <span className="text-[10px] bg-gold-500/80 text-black px-2 py-0.5 rounded-full backdrop-blur-md font-bold">Uploading {file.progress}%</span>
                            )}
                            {file.status === 'success' && (
                              <span className="text-[10px] bg-green-500/80 text-white px-2 py-0.5 rounded-full backdrop-blur-md font-bold">Success</span>
                            )}
                            {file.status === 'error' && (
                              <span className="text-[10px] bg-red-500/80 text-white px-2 py-0.5 rounded-full backdrop-blur-md font-bold">Failed</span>
                            )}
                            {file.compressedSize && file.compressedSize < file.originalSize && (
                              <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm">
                                {Math.round(file.originalSize / 1024)}KB → {Math.round(file.compressedSize / 1024)}KB
                                <span className="text-green-400 ml-1">(-{Math.round((1 - file.compressedSize / file.originalSize) * 100)}%)</span>
                              </span>
                            )}
                          </div>

                          {/* CSS Overlay for Watermark Preview */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                            <span 
                              className="font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                              style={{ 
                                color: file.watermarkOptions?.color || '#ffffff', 
                                fontSize: `${(file.watermarkOptions?.size || 30) * 0.6}px`, 
                                opacity: file.watermarkOptions?.opacity || 0.7 
                              }}
                            >
                              {file.watermarkOptions?.text || 'SLNS 9480038144'}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                            <button onClick={() => setEditingStagedFile(file)} className="p-2 bg-gold-400 text-black rounded-full hover:scale-110 transition-transform">
                              <Crop className="w-4 h-4" />
                            </button>
                            <button onClick={() => removeStagedFile(file.id)} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {file.editedBlob && (
                            <div className="absolute top-2 left-2 bg-green-500/80 px-2 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                              EDITED
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 rounded-2xl bg-surface/50 border border-white/5">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
          {/* Multi-select actions */}
          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in w-full md:w-auto">
              <span className="text-xs text-gold-400 font-bold px-2 whitespace-nowrap">{selectedIds.length} Selected</span>
              <button onClick={handleBulkDelete} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40"><Trash2 className="w-4 h-4"/></button>
              <select onChange={(e) => { if(e.target.value) handleBulkUpdate({ category: e.target.value })}} className="px-3 py-1.5 rounded-lg border border-gold-400/20 bg-[#0a0a0a] text-xs text-foreground appearance-none hover:border-gold-400/40 focus:outline-none focus:border-gold-400/60 transition-all bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23AA7C11%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[position:right_8px_center] bg-no-repeat pr-7 [&>option]:bg-[#0a0a0a] [&>option]:text-white flex-1 md:flex-none">
                <option value="">Move to...</option>
                {categories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
              <button onClick={() => setSelectedIds([])} className="p-2 text-foreground/50 hover:text-white"><X className="w-4 h-4"/></button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => {
                  if (selectedIds.length === displayedProjects.length && displayedProjects.length > 0) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(displayedProjects.map(p => p._id));
                  }
                }}
                className="btn-outline-gold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-2 border-white/10 whitespace-nowrap w-full md:w-auto"
              >
                <CheckSquare className="w-4 h-4"/> Select All
              </button>
              <div className="relative w-full md:w-64 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input type="text" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-black text-sm" />
              </div>
              <div className="flex items-center gap-2 md:border-l border-white/10 md:pl-4 w-full md:w-auto">
                <Filter className="w-4 h-4 text-foreground/40" />
                <select value={filterCategory || 'All'} onChange={(e) => setFilterCategory(e.target.value)} className="appearance-none bg-[#0a0a0a] text-sm border border-gold-400/20 rounded-lg px-3 py-1.5 outline-none cursor-pointer text-foreground hover:border-gold-400/40 focus:border-gold-400/60 transition-all bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23AA7C11%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[position:right_8px_center] bg-no-repeat pr-8 [&>option]:bg-[#0a0a0a] [&>option]:text-white flex-1 md:flex-none shadow-inner">
                  <option value="All">All Categories</option>
                  {categories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold-400" /></div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
          {displayedProjects.map((project) => (
            <motion.div
              key={project._id || Math.random().toString(36)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`group relative rounded-2xl overflow-hidden border ${selectedIds.includes(project._id) ? 'border-gold-400 shadow-[0_0_15px_rgba(170,124,17,0.3)]' : 'border-white/5'} bg-surface break-inside-avoid cursor-pointer aspect-auto`}
              onClick={() => toggleSelect(project._id)}
              onDoubleClick={(e) => { e.stopPropagation(); setPreviewProject(project); }}
            >
              {/* Render Image or Video */}
              {project.mediaUrls?.[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={project.mediaUrls[0]} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 pointer-events-none" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} muted playsInline />
              ) : (
                <img src={project.mediaUrls?.[0] || ''} alt={project.title || 'SLNS Decoration Project'} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Top Left Checks */}
              <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => toggleSelect(project._id)} className="text-white drop-shadow-md">
                  {selectedIds.includes(project._id) ? <CheckSquare className="w-5 h-5 text-gold-400" /> : <Square className="w-5 h-5 opacity-50 hover:opacity-100" />}
                </button>
              </div>

              {/* Status Badges */}
              <div className="absolute top-3 right-3 flex gap-1">
                {/* Visibility/Hidden tags removed as requested */}
              </div>

              {/* Bottom Info & Edit Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                <div>
                  <div className="inline-block px-2 py-1 mb-1 rounded bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-wider text-gold-400 uppercase">
                    {project.category}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                  className="p-2 bg-gold-400 text-black rounded-full hover:bg-gold-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editing Staged File Modal (Image Editor) */}
      {editingStagedFile && (
        <ImageEditor 
          imageUrl={editingStagedFile.objectUrl}
          isVideo={editingStagedFile.originalFile.type.startsWith('video/')}
          onSave={saveEditedStagedFile}
          onCancel={() => setEditingStagedFile(null)}
        />
      )}

      {/* Media Management Modal (Edit existing) */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface border border-white/10 rounded-3xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row relative">
              
              <button onClick={() => setEditingProject(null)} className="absolute top-4 right-4 z-[70] p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5"/>
              </button>

              {editingProject.mediaUrls?.[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
                <>
                  <div className="md:w-2/3 relative bg-black flex items-center justify-center h-full">
                    <video src={editingProject.mediaUrls[0]} className="w-full h-full object-contain" controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />
                  </div>
                  <div className="md:w-1/3 p-6 md:p-8 flex flex-col bg-surface border-l border-white/10">
                    <h3 className="font-serif text-2xl font-bold mb-6">Manage Video</h3>
                    
                    <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gold-400 tracking-wider">Category</label>
                        <select 
                          value={editingProject?.category || ''} 
                          onChange={(e) => setEditingProject({...editingProject, category: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm text-foreground [&>option]:bg-black [&>option]:text-white"
                        >
                          {categories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4">
                      <button onClick={() => { handleUpdateProject(editingProject._id, editingProject); setEditingProject(null); }} className="btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                      <button onClick={() => { handleDelete(editingProject._id); setEditingProject(null); }} className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1 py-2">
                        <Trash2 className="w-4 h-4" /> Delete Video
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <ImageEditor 
                  imageUrl={editingProject.mediaUrls?.[0] || ''}
                  isModal={false}
                  onSave={async (blob) => {
                    // Save new edited image
                    if (!blob) return;
                    setUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append('file', blob, 'edited.jpg');
                      formData.append('skipWatermark', 'true');
                      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                      const { url } = await uploadRes.json();
                      
                      await handleUpdateProject(editingProject._id, { ...editingProject, mediaUrls: [url] });
                      setEditingProject(null);
                    } catch (e: any) {
                      setErrorModal({ isOpen: true, title: 'Edit Failed', message: 'Failed to save the edited image.', details: e.message || String(e) });
                    } finally {
                      setUploading(false);
                    }
                  }}
                  onCancel={() => setEditingProject(null)}
                  extraTools={
                    <div className="space-y-4 mb-4 pb-4 border-b border-white/10">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gold-400 tracking-wider">Category</label>
                        <select 
                          value={editingProject?.category || ''} 
                          onChange={(e) => setEditingProject({...editingProject, category: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg appearance-none bg-[#0a0a0a] border border-gold-400/20 text-foreground hover:border-gold-400/40 focus:outline-none focus:border-gold-400/60 focus:ring-1 focus:ring-gold-400/30 transition-all bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23AA7C11%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[position:right_8px_center] bg-no-repeat pr-8 text-sm [&>option]:bg-[#0a0a0a] [&>option]:text-white shadow-inner"
                        >
                          {categories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <button onClick={() => { handleDelete(editingProject._id); setEditingProject(null); }} className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs flex items-center justify-center gap-2 transition-colors">
                        <Trash2 className="w-3 h-3" /> Delete Photo Completely
                      </button>
                    </div>
                  }
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Full Photo Modal */}
      <AnimatePresence>
        {previewProject && (
          <div 
            className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewProject(null)}
          >
            <button 
              onClick={() => setPreviewProject(null)} 
              className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white/50 hover:text-white transition-colors z-50"
            >
              <X className="w-6 h-6"/>
            </button>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative max-w-full max-h-full cursor-default"
              onClick={e => e.stopPropagation()}
            >
              {previewProject.mediaUrls?.[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={previewProject.mediaUrls[0]} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} autoPlay />
              ) : (
                <img src={previewProject.mediaUrls?.[0] || ''} alt={previewProject.title || 'SLNS Decoration Project'} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog Modal */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
            >
              <h3 className="text-xl font-serif text-white mb-3">Confirm Action</h3>
              <p className="text-sm text-foreground/60 mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDialog(null)}
                  disabled={isProcessingAction}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsProcessingAction(true);
                    await confirmDialog.onConfirm();
                    setIsProcessingAction(false);
                  }}
                  disabled={isProcessingAction}
                  className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors text-sm font-bold flex items-center justify-center min-w-[100px]"
                >
                  {isProcessingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Error Modal */}
      <ErrorModal
        isOpen={!!errorModal?.isOpen}
        title={errorModal?.title}
        message={errorModal?.message || ''}
        details={errorModal?.details}
        onClose={() => setErrorModal(null)}
      />
    </div>
  );
}
