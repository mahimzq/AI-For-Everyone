import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, Trash2, Eye, EyeOff, Download, Loader2, AlertCircle, ChevronDown, ChevronUp, Mail, User, Clock } from 'lucide-react'
import axios from 'axios'

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function ResourceManager() {
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [expandedLogs, setExpandedLogs] = useState({}) // { resourceId: logs[] }
    const [expandLoading, setExpandLoading] = useState({}) // { resourceId: boolean }
    
    const fileRef = useRef(null)
    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: `Bearer ${token}` }

    const fetchResources = async () => {
        try {
            const res = await axios.get('/api/resources/admin', { headers })
            setResources(res.data)
        } catch (err) {
            setError('Failed to load resources')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchResources()
    }, [])

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            setError('File too large (max 10MB)')
            return
        }

        setUploading(true)
        setError('')
        
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', file.name.replace(/\.[^/.]+$/, "")) // Default title
            formData.append('description', 'Uploaded resource')

            await axios.post('/api/resources/upload', formData, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            })
            if (fileRef.current) fileRef.current.value = ''
            await fetchResources()
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const toggleActive = async (resource) => {
        try {
            await axios.patch(`/api/resources/${resource.id}`, 
                { is_active: !resource.is_active }, 
                { headers }
            )
            setResources(prev => prev.map(r => r.id === resource.id ? { ...r, is_active: !r.is_active } : r))
        } catch (err) {
            setError('Failed to update status')
        }
    }

    const deleteResource = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return
        try {
            await axios.delete(`/api/resources/${id}`, { headers })
            setResources(prev => prev.filter(r => r.id !== id))
        } catch (err) {
            setError('Failed to delete resource')
        }
    }

    const toggleLogs = async (resourceId) => {
        if (expandedLogs[resourceId]) {
            setExpandedLogs(prev => {
                const updated = { ...prev }
                delete updated[resourceId]
                return updated
            })
            return
        }

        setExpandLoading(prev => ({ ...prev, [resourceId]: true }))
        try {
            const res = await axios.get(`/api/resources/${resourceId}/logs`, { headers })
            setExpandedLogs(prev => ({ ...prev, [resourceId]: res.data }))
        } catch (err) {
            console.error('Failed to fetch logs')
        } finally {
            setExpandLoading(prev => ({ ...prev, [resourceId]: false }))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-primary-green" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-bold text-2xl text-white">Resources Management</h1>
                    <p className="text-gray-400 font-body text-sm">
                        {resources.length} resource{resources.length !== 1 ? 's' : ''} available to users
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Upload Zone */}
            <div
                onClick={() => !uploading && fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                    uploading ? 'border-primary-green/50 bg-primary-green/5' : 'border-white/10 hover:border-primary-green/30 hover:bg-white/5'
                }`}
            >
                <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                {uploading ? (
                    <>
                        <Loader2 size={40} className="mx-auto text-primary-green animate-spin mb-3" />
                        <p className="text-primary-green font-heading font-bold">Uploading Resource...</p>
                    </>
                ) : (
                    <>
                        <Upload size={40} className="mx-auto text-gray-500 group-hover:text-primary-green transition-colors mb-3" />
                        <p className="text-gray-400 font-body text-sm font-semibold">
                            Click to upload a new PDF guide
                        </p>
                        <p className="text-gray-600 font-body text-xs mt-1">Maximum file size: 10MB</p>
                    </>
                )}
            </div>

            {/* Resources List */}
            <div className="space-y-4">
                {resources.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 font-body border border-dashed border-white/5 rounded-2xl">
                        No resources found. Upload your first PDF to get started.
                    </div>
                ) : resources.map(res => (
                    <div key={res.id} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-green/10 flex items-center justify-center flex-shrink-0 border border-primary-green/20">
                                <FileText size={24} className="text-primary-green" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-heading font-semibold text-white text-base">{res.title}</h4>
                                    {!res.is_active && (
                                        <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Draft</span>
                                    )}
                                </div>
                                <p className="text-gray-400 font-body text-xs truncate max-w-md">{res.description || 'No description provided'}</p>
                                <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Download size={12} className="text-primary-green" /> {res.download_count} downloads</span>
                                    <span>{res.file_name}</span>
                                    <span>{formatSize(res.file_size)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                                <button
                                    onClick={() => toggleLogs(res.id)}
                                    className={`p-2 rounded-lg transition-all ${expandedLogs[res.id] ? 'bg-primary-green text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                    title="View Download Logs"
                                >
                                    {expandLoading[res.id] ? <Loader2 size={16} className="animate-spin" /> : expandedLogs[res.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <button
                                    onClick={() => toggleActive(res)}
                                    className={`p-2 rounded-lg transition-all ${res.is_active ? 'bg-primary-green/10 text-primary-green hover:bg-primary-green/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                    title={res.is_active ? 'Hide from public' : 'Make public'}
                                >
                                    {res.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    onClick={() => deleteResource(res.id)}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                    title="Delete resource"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Expandable Logs Section */}
                        {expandedLogs[res.id] && (
                            <div className="bg-black/20 border-t border-white/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h5 className="text-[10px] font-heading font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock size={12} /> Recent Download Logs
                                </h5>
                                {expandedLogs[res.id].length === 0 ? (
                                    <p className="text-xs text-gray-600 font-body py-2">No download records yet.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {expandedLogs[res.id].map(log => (
                                            <div key={log.id} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-300 font-medium flex items-center gap-1">
                                                            <Mail size={10} className="text-primary-green" /> {log.downloader_email}
                                                        </span>
                                                        {log.downloader_name && (
                                                            <span className="text-gray-500 text-[10px] flex items-center gap-1">
                                                                <User size={10} /> {log.downloader_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-gray-600 tabular-nums">
                                                    {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
