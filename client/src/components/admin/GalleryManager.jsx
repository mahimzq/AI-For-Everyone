import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, X, Image, Loader2, Plus } from 'lucide-react'
import axios from 'axios'

export default function GalleryManager() {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [previews, setPreviews] = useState([])
    const [lightbox, setLightbox] = useState(null)
    const fileRef = useRef()
    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: `Bearer ${token}` }

    const fetchPhotos = async () => {
        try {
            const res = await axios.get('/api/gallery')
            setPhotos(res.data)
        } catch {
            // silent
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPhotos() }, [])

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return
        setSelectedFiles(files)
        // Generate previews (limit to first 20 for performance)
        const previewUrls = files.slice(0, 20).map(f => URL.createObjectURL(f))
        setPreviews(previewUrls)
    }

    const clearSelection = () => {
        selectedFiles.forEach((_, i) => previews[i] && URL.revokeObjectURL(previews[i]))
        setSelectedFiles([])
        setPreviews([])
        setProgress(0)
        if (fileRef.current) fileRef.current.value = ''
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!selectedFiles.length) return
        setUploading(true)
        setProgress(0)

        // Upload one at a time — avoids nginx size limits, gives accurate progress
        for (let i = 0; i < selectedFiles.length; i++) {
            const formData = new FormData()
            formData.append('photo', selectedFiles[i])
            try {
                await axios.post('/api/gallery', formData, {
                    headers: { ...headers, 'Content-Type': 'multipart/form-data' },
                })
            } catch (err) {
                // 409 = duplicate, skip silently. Other errors: continue anyway.
            }
            setProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
        }

        clearSelection()
        fetchPhotos()
        setUploading(false)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this photo?')) return
        try {
            await axios.delete(`/api/gallery/${id}`, { headers })
            setPhotos(prev => prev.filter(p => p.id !== id))
        } catch {
            alert('Failed to delete photo')
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white">Gallery</h1>
                    <p className="text-slate-400 text-sm mt-1">{photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</p>
                </div>
            </div>

            {/* Upload Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-heading font-semibold mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-primary-green" /> Upload Photos
                </h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    {/* Drop zone */}
                    <div
                        className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary-green/50 transition-colors"
                        onClick={() => !uploading && fileRef.current?.click()}
                    >
                        {previews.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {previews.map((src, i) => (
                                        <img key={i} src={src} className="w-16 h-16 object-cover rounded-lg" />
                                    ))}
                                    {selectedFiles.length > 20 && (
                                        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                            +{selectedFiles.length - 20}
                                        </div>
                                    )}
                                </div>
                                <p className="text-primary-green font-body text-sm font-semibold">
                                    {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
                                </p>
                                <p className="text-slate-500 text-xs">Click to change selection</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Image size={40} className="mx-auto text-slate-500" />
                                <p className="text-slate-300 text-sm font-semibold">Click to select images</p>
                                <p className="text-slate-500 text-xs">Select 1 to 200 images at once · JPG, PNG, WEBP · Max 10MB each</p>
                            </div>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <motion.div
                                    className="bg-primary-green h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    {selectedFiles.length > 0 && !uploading && (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2.5 rounded-xl bg-primary-green text-black font-bold text-sm hover:bg-green-400 transition flex items-center justify-center gap-2"
                            >
                                <Upload size={16} />
                                Upload {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    )}

                    {uploading && (
                        <div className="flex items-center justify-center gap-2 py-2 text-slate-400 text-sm">
                            <Loader2 size={16} className="animate-spin" />
                            Please wait, uploading images...
                        </div>
                    )}
                </form>
            </div>

            {/* Photo Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={28} className="animate-spin text-primary-green" />
                </div>
            ) : photos.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Image size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No photos yet. Upload some!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                        {photos.map(photo => (
                            <motion.div
                                key={photo.id}
                                className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-square cursor-pointer"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setLightbox(photo)}
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.caption || photo.original_name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                    {photo.caption && (
                                        <p className="text-white text-xs font-body line-clamp-2">{photo.caption}</p>
                                    )}
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDelete(photo.id) }}
                                        className="self-end p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                    >
                        <button className="absolute top-4 right-4 p-2 text-white/60 hover:text-white">
                            <X size={28} />
                        </button>
                        <img
                            src={lightbox.url}
                            alt={lightbox.caption}
                            className="max-w-4xl max-h-[90vh] object-contain rounded-xl"
                            onClick={e => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
