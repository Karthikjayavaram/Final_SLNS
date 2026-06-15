'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Minus, Trash2, Image as ImageIcon, Loader2, LogOut, 
  Search, Filter, X, Edit, Eye, EyeOff, Star, Save, CheckSquare, Square, 
  Upload, Crop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageEditor from './ImageEditor';

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
};

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<EventStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  // Modals
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProjects();
  }, [filterCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/styles');
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
      message: 'Delete this category? Photos will remain but their category tag might disappear.',
      onConfirm: async () => {
        await fetch(`/api/styles?id=${id}`, { method: 'DELETE' });
        fetchCategories();
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
          await fetch('/api/projects/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', ids: selectedIds }),
          });
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
          await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
          fetchProjects();
        } catch (error) {
          console.error('Delete failed', error);
        }
        setConfirmDialog(null);
      }
    });
  };

  // Staging & Upload Logic
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const newStaged = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      originalFile: f,
      objectUrl: URL.createObjectURL(f)
    }));
    
    setStagingFiles(prev => [...prev, ...newStaged]);
    e.target.value = ''; // Reset input
  };

  const removeStagedFile = (id: string) => {
    setStagingFiles(prev => prev.filter(f => f.id !== id));
  };

  const saveEditedStagedFile = (blob: Blob) => {
    if (!editingStagedFile) return;
    setStagingFiles(prev => prev.map(f => {
      if (f.id === editingStagedFile.id) {
        if (f.editedBlob) URL.revokeObjectURL(f.objectUrl); // cleanup previous edit if any
        return { ...f, objectUrl: URL.createObjectURL(blob), editedBlob: blob };
      }
      return f;
    }));
    setEditingStagedFile(null);
  };

  const handleUploadAll = async () => {
    if (stagingFiles.length === 0) return alert('No files to upload');
    if (!uploadCategory) return alert('Please select a category first');
    
    setUploading(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const staged of stagingFiles) {
        try {
          const formData = new FormData();
          const fileToUpload = staged.editedBlob || staged.originalFile;
          // If editedBlob exists, we need to pass a filename
          if (staged.editedBlob) {
            formData.append('file', staged.editedBlob, staged.originalFile.name);
          } else {
            formData.append('file', staged.originalFile);
          }
          
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!uploadRes.ok) throw new Error('Upload failed');
          const { url } = await uploadRes.json();

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
          
          successCount++;
        } catch (err) {
          console.error('Upload failed for file', staged.originalFile.name, err);
          failCount++;
        }
      }

      setIsAdding(false);
      setStagingFiles([]);
      fetchProjects();
      
      if (failCount > 0) {
        alert(`Finished: ${successCount} uploaded successfully, ${failCount} failed.`);
      }
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    } finally {
      setUploading(false);
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
  const displayedProjects = projects.filter(p => p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">Media Management</h1>
          <p className="text-foreground/40 mt-1 text-sm">Upload, edit, and organize your portfolio</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => { setIsAdding(!isAdding); setStagingFiles([]); }} className="btn-gold px-5 py-2.5 rounded-xl text-xs uppercase flex items-center gap-2 font-bold tracking-wider">
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
                          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-surface text-sm appearance-none text-foreground [&>option]:bg-black [&>option]:text-white"
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
                  </div>
                </div>
                
                {stagingFiles.length > 0 && (
                  <button onClick={handleUploadAll} disabled={uploading} className="mt-auto btn-gold py-3 rounded-xl text-sm font-bold tracking-wider uppercase flex justify-center items-center gap-2">
                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {uploading ? 'Uploading...' : `Upload ${stagingFiles.length} File${stagingFiles.length > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>

              {/* Step 3 & 4: Staging Preview Area */}
              <div className="w-full md:w-2/3 border border-white/10 rounded-2xl bg-black/50 p-6 flex flex-col">
                <h3 className="font-serif text-xl font-bold text-white mb-1">3. Staging Area & Preview</h3>
                <p className="text-xs text-white/50 mb-4">Click any photo to open the visual editor (Crop, Rotate, Watermark). Files here are not saved yet.</p>
                
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
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            {!file.originalFile.type.startsWith('video/') && (
                              <button onClick={() => setEditingStagedFile(file)} className="p-2 bg-gold-400 text-black rounded-full hover:scale-110 transition-transform">
                                <Crop className="w-4 h-4" />
                              </button>
                            )}
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
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Multi-select actions */}
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-xs text-gold-400 font-bold px-2">{selectedIds.length} Selected</span>
              <button onClick={handleBulkDelete} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40"><Trash2 className="w-4 h-4"/></button>
              <select onChange={(e) => { if(e.target.value) handleBulkUpdate({ category: e.target.value })}} className="px-3 py-1.5 rounded-lg border border-white/10 bg-black text-xs text-foreground [&>option]:bg-black [&>option]:text-white">
                <option value="">Move to...</option>
                {categories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
              </select>
              <button onClick={() => setSelectedIds([])} className="p-2 text-foreground/50 hover:text-white"><X className="w-4 h-4"/></button>
            </div>
          ) : (
            <>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input type="text" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-black text-sm" />
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <Filter className="w-4 h-4 text-foreground/40" />
                <select value={filterCategory || 'All'} onChange={(e) => setFilterCategory(e.target.value)} className="bg-transparent text-sm border-none outline-none cursor-pointer text-foreground [&>option]:bg-black [&>option]:text-white">
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
              key={project._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`group relative rounded-2xl overflow-hidden border ${selectedIds.includes(project._id) ? 'border-gold-400 shadow-[0_0_15px_rgba(170,124,17,0.3)]' : 'border-white/5'} bg-surface break-inside-avoid cursor-pointer aspect-auto`}
              onClick={() => toggleSelect(project._id)}
              onDoubleClick={(e) => { e.stopPropagation(); setPreviewProject(project); }}
            >
              {/* Render Image or Video */}
              {project.mediaUrls[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={project.mediaUrls[0]} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" muted playsInline />
              ) : (
                <img src={project.mediaUrls[0]} alt={project.title || 'SLNS Decoration Project'} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
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

              {editingProject.mediaUrls[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
                <>
                  <div className="md:w-2/3 relative bg-black flex items-center justify-center h-full">
                    <video src={editingProject.mediaUrls[0]} className="w-full h-full object-contain" controls />
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
                  imageUrl={editingProject.mediaUrls[0]}
                  isModal={false}
                  onSave={async (blob) => {
                    // Save new edited image
                    setUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append('file', blob, 'edited.jpg');
                      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                      const { url } = await uploadRes.json();
                      
                      await handleUpdateProject(editingProject._id, { ...editingProject, mediaUrls: [url] });
                      setEditingProject(null);
                    } catch (e) {
                      alert('Failed to save edited image');
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
                          className="w-full px-3 py-2 rounded-lg bg-black border border-white/10 text-sm text-foreground [&>option]:bg-black [&>option]:text-white"
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
              {previewProject.mediaUrls[0]?.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={previewProject.mediaUrls[0]} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" controls autoPlay />
              ) : (
                <img src={previewProject.mediaUrls[0]} alt={previewProject.title || 'SLNS Decoration Project'} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
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
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors text-sm font-bold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
