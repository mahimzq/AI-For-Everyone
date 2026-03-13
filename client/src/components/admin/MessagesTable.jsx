import { useState, useEffect, useCallback } from 'react'
import { Mail, MailOpen, Archive, Trash2, Reply, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useAlert } from './AlertDialog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL

export default function MessagesTable() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expanded, setExpanded] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const dialog = useAlert()

    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: `Bearer ${token}` }

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/contacts', { headers })
            setMessages(res.data.messages || res.data || [])
        } catch (err) {
            setError('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMessages() }, [fetchMessages])

    useEffect(() => {
        const s = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionDelay: 5000,
            reconnectionAttempts: 5
        })

        s.on('connect', () => {
            s.emit('admin:join')
        })

        s.on('admin:new_contact_message', () => {
            fetchMessages()
        })

        s.on('admin:contact_updated', () => {
            fetchMessages()
        })

        s.on('admin:contact_deleted', () => {
            fetchMessages()
        })

        return () => s.disconnect()
    }, [fetchMessages])

    const toggleRead = async (id, currentRead) => {
        setActionLoading(id)
        try {
            await axios.patch(`/api/contacts/${id}`, { is_read: !currentRead }, { headers })
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !currentRead } : m))
        } catch {
            dialog.error('Failed to update message')
        } finally {
            setActionLoading(null)
        }
    }

    const handleArchive = async (id) => {
        setActionLoading(id)
        try {
            await axios.patch(`/api/contacts/${id}`, { is_archived: true }, { headers })
            setMessages(prev => prev.filter(m => m.id !== id))
            dialog.toast.success('Message archived')
        } catch {
            dialog.error('Failed to archive message')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async (id) => {
        const confirmed = await dialog.confirm('This message will be permanently deleted.', 'Delete Message?', 'Delete')
        if (!confirmed) return
        setActionLoading(id)
        try {
            await axios.delete(`/api/contacts/${id}`, { headers })
            setMessages(prev => prev.filter(m => m.id !== id))
            dialog.toast.success('Message deleted')
        } catch {
            dialog.error('Failed to delete message')
        } finally {
            setActionLoading(null)
        }
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffH = Math.floor(diffMs / 3600000)
        const diffD = Math.floor(diffMs / 86400000)
        if (diffH < 1) return 'Just now'
        if (diffH < 24) return `${diffH}h ago`
        if (diffD < 7) return `${diffD}d ago`
        return date.toLocaleDateString()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-primary-green" />
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-heading font-bold text-2xl text-white">Messages</h1>
                <p className="text-gray-400 font-body text-sm">
                    {messages.filter(m => !m.is_read).length} unread messages
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {messages.length === 0 ? (
                <div className="bg-white/5 rounded-2xl border border-white/5 py-16 text-center text-gray-500 font-body text-sm">
                    No messages yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`bg-white/5 rounded-2xl border transition-all duration-200 ${!msg.is_read ? 'border-primary-green/20' : 'border-white/5'}`}
                        >
                            {/* Header */}
                            <div
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 rounded-t-2xl"
                                onClick={() => {
                                    setExpanded(expanded === msg.id ? null : msg.id)
                                    if (!msg.is_read) toggleRead(msg.id, msg.is_read)
                                }}
                            >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!msg.is_read ? 'bg-primary-green' : 'bg-transparent'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-body text-sm truncate ${!msg.is_read ? 'text-white font-semibold' : 'text-gray-300'}`}>
                                            {msg.name}
                                        </p>
                                        <span className="text-gray-500 text-xs font-body flex-shrink-0">{formatDate(msg.createdAt || msg.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-body truncate">{msg.subject}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleRead(msg.id, msg.is_read) }}
                                        disabled={actionLoading === msg.id}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50"
                                        title={msg.is_read ? 'Mark unread' : 'Mark read'}
                                    >
                                        {msg.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
                                    </button>
                                    {expanded === msg.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expanded === msg.id && (
                                <div className="px-4 pb-4 border-t border-white/5">
                                    <div className="pt-4">
                                        <p className="text-xs text-gray-500 font-body mb-1">From: {msg.email}</p>
                                        <p className="text-white font-body text-sm leading-relaxed mb-4">{msg.message}</p>
                                        <div className="flex gap-2">
                                            <a
                                                href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-green/10 text-primary-green text-xs font-body hover:bg-primary-green/20 transition"
                                            >
                                                <Reply size={14} /> Reply
                                            </a>
                                            <button
                                                onClick={() => handleArchive(msg.id)}
                                                disabled={actionLoading === msg.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-body hover:bg-white/10 transition disabled:opacity-50"
                                            >
                                                {actionLoading === msg.id ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />} Archive
                                            </button>
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                disabled={actionLoading === msg.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-body hover:bg-red-500/20 transition ml-auto disabled:opacity-50"
                                            >
                                                {actionLoading === msg.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
