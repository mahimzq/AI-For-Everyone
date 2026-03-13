import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import {
    MessageCircle, Send, Mail, Phone, Search,
    CircleDot, CheckCircle2, XCircle
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/' : 'http://localhost:5001')
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL
const parseMessages = (messages) => {
    if (Array.isArray(messages)) return messages
    if (typeof messages === 'string') {
        try {
            return JSON.parse(messages)
        } catch {
            return []
        }
    }
    return []
}

const getSessionSortTime = (session) => {
    const messages = parseMessages(session.messages)
    const latestMessage = messages.length > 0 ? messages[messages.length - 1].timestamp : null
    const ts = latestMessage || session.updatedAt || session.createdAt
    return ts ? new Date(ts).getTime() : 0
}

const normalizeSession = (session) => ({
    ...session,
    messages: parseMessages(session.messages),
})

const sortSessions = (list) => (
    [...list].sort((a, b) => getSessionSortTime(b) - getSessionSortTime(a))
)

const appendMessageIfNew = (existingMessages = [], incomingMessage) => {
    if (!incomingMessage?.text) return existingMessages
    const last = existingMessages[existingMessages.length - 1]
    if (
        last &&
        last.sender === incomingMessage.sender &&
        last.text === incomingMessage.text &&
        last.timestamp === incomingMessage.timestamp
    ) {
        return existingMessages
    }
    return [...existingMessages, incomingMessage]
}

const getLastMessagePreview = (session) => {
    const msgs = parseMessages(session.messages)
    if (!msgs.length) return 'No messages yet'
    const text = msgs[msgs.length - 1]?.text || ''
    return text.length > 40 ? `${text.slice(0, 40)}...` : text
}

const formatSessionTime = (session) => {
    const ts = session.updatedAt || session.createdAt
    if (!ts) return ''
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function LiveChat() {
    const [socket, setSocket] = useState(null)
    const [sessions, setSessions] = useState([])
    const [selectedSession, setSelectedSession] = useState(null)
    const [input, setInput] = useState('')
    const [connected, setConnected] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [selectedSession?.messages])

    // Setup socket connection
    useEffect(() => {
        const s = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionDelay: 5000,
            reconnectionAttempts: 5
        })
        setSocket(s)

        s.on('connect', () => {
            setConnected(true)
            s.emit('admin:join')
        })

        s.on('disconnect', () => setConnected(false))

        s.on('chat:sessions', (data) => {
            const nextSessions = sortSessions(data.map(normalizeSession))
            setSessions(nextSessions)
            setSelectedSession(prev => {
                if (!prev) return nextSessions[0] || null
                return nextSessions.find(ses => ses.id === prev.id) || nextSessions[0] || null
            })
        })

        s.on('chat:new_session', (data) => {
            const incoming = normalizeSession(data)
            setSessions(prev => sortSessions([incoming, ...prev]))
            setSelectedSession(prev => prev || incoming)
        })

        s.on('chat:message', (data) => {
            setSessions(prev => prev.map(sess => {
                if (sess.id === data.sessionId) {
                    let msgs = [...(sess.messages || [])]
                    if (data.sender === 'visitor' || data.sender === 'ai') {
                        msgs = appendMessageIfNew(msgs, { sender: data.sender, text: data.text, timestamp: data.timestamp })
                    }
                    return { ...sess, messages: msgs }
                }
                return sess
            }).sort((a, b) => getSessionSortTime(b) - getSessionSortTime(a)))
            setSelectedSession(prev => {
                if (prev && prev.id === data.sessionId && (data.sender === 'visitor' || data.sender === 'ai')) {
                    return {
                        ...prev,
                        messages: appendMessageIfNew(prev.messages || [], { sender: data.sender, text: data.text, timestamp: data.timestamp }),
                    }
                }
                return prev
            })
        })

        s.on('chat:message_update', (data) => {
            if (!data?.sessionId || !data?.message) return
            setSessions(prev => prev.map(sess => {
                if (sess.id !== data.sessionId) return sess
                const messages = appendMessageIfNew(sess.messages || [], data.message)
                return { ...sess, messages }
            }).sort((a, b) => getSessionSortTime(b) - getSessionSortTime(a)))

            setSelectedSession(prev => {
                if (!prev || prev.id !== data.sessionId) return prev
                return { ...prev, messages: appendMessageIfNew(prev.messages || [], data.message) }
            })
        })

        s.on('chat:session_update', (data) => {
            setSessions(prev => sortSessions(prev.map(s =>
                s.id === data.sessionId ? { ...s, ...data } : s
            )))
            setSelectedSession(prev =>
                prev && prev.id === data.sessionId ? { ...prev, ...data } : prev
            )
        })

        s.on('chat:visitor_disconnected', (data) => {
            setSessions(prev => prev.map(s =>
                s.id === data.sessionId ? { ...s, visitor_disconnected: true } : s
            ))
        })

        return () => { s.disconnect() }
    }, [])

    const handleClaim = (sessionId) => {
        if (!socket) return
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
        socket.emit('admin:claim', { sessionId, adminId: adminData.id || 1 })
    }

    const handleSend = () => {
        const message = input.trim()
        if (!message || !socket || !selectedSession || selectedSession.status !== 'active') return
        socket.emit('admin:message', { sessionId: selectedSession.id, message })
        setInput('')
    }

    const handleEndChat = (sessionId) => {
        if (!socket) return
        socket.emit('admin:end_chat', { sessionId })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const formatTime = (ts) => {
        if (!ts) return ''
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const statusIcon = (status) => {
        if (status === 'waiting') return <CircleDot size={12} className="text-yellow-400 animate-pulse" />
        if (status === 'active') return <CheckCircle2 size={12} className="text-primary-green" />
        return <XCircle size={12} className="text-gray-500" />
    }

    const totalWaiting = sessions.filter(s => s.status === 'waiting').length
    const totalActive = sessions.filter(s => s.status === 'active').length
    const totalEnded = sessions.filter(s => s.status === 'ended').length

    const normalizedSearch = searchTerm.trim().toLowerCase()
    const filteredSessions = sessions.filter((session) => {
        const statusMatch = statusFilter === 'all' ? true : session.status === statusFilter
        if (!statusMatch) return false
        if (!normalizedSearch) return true

        const haystack = `${session.visitor_name || ''} ${session.visitor_email || ''} ${session.visitor_phone || ''}`.toLowerCase()
        return haystack.includes(normalizedSearch)
    })

    const waitingSessions = filteredSessions.filter(s => s.status === 'waiting')
    const activeSessions = filteredSessions.filter(s => s.status === 'active')
    const endedSessions = filteredSessions.filter(s => s.status === 'ended')

    return (
        <div className="flex h-[calc(100vh-120px)] gap-4">
            {/* Sessions Sidebar */}
            <div className="w-80 flex-shrink-0 bg-white/5 rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading font-bold text-white text-lg">Live Chat</h2>
                        <div className={`flex items-center gap-1.5 text-xs font-body ${connected ? 'text-primary-green' : 'text-red-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-primary-green animate-pulse' : 'bg-red-400'}`} />
                            {connected ? 'Online' : 'Offline'}
                        </div>
                    </div>
                </div>

                <div className="p-3 border-b border-white/5 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                        <div className="rounded-lg bg-white/5 border border-white/5 p-2 text-center">
                            <p className="text-[10px] text-gray-500 font-body">All</p>
                            <p className="text-white font-heading text-sm">{sessions.length}</p>
                        </div>
                        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/15 p-2 text-center">
                            <p className="text-[10px] text-yellow-300 font-body">Waiting</p>
                            <p className="text-yellow-300 font-heading text-sm">{totalWaiting}</p>
                        </div>
                        <div className="rounded-lg bg-primary-green/10 border border-primary-green/20 p-2 text-center">
                            <p className="text-[10px] text-primary-green font-body">Active</p>
                            <p className="text-primary-green font-heading text-sm">{totalActive}</p>
                        </div>
                        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
                            <p className="text-[10px] text-gray-400 font-body">Ended</p>
                            <p className="text-gray-300 font-heading text-sm">{totalEnded}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search name, email, phone..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs font-body focus:outline-none focus:border-primary-green/40"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'waiting', label: 'Waiting' },
                            { key: 'active', label: 'Active' },
                            { key: 'ended', label: 'Ended' },
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key)}
                                className={`px-2.5 py-1.5 rounded-md text-[10px] font-body transition ${statusFilter === filter.key
                                    ? 'bg-primary-green/15 text-primary-green border border-primary-green/20'
                                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Waiting */}
                    {waitingSessions.length > 0 && (
                        <div className="p-2">
                            <p className="text-[10px] font-body text-yellow-400 uppercase tracking-wider px-2 py-1">
                                Waiting ({waitingSessions.length})
                            </p>
                            {waitingSessions.map(sess => (
                                <button
                                    key={sess.id}
                                    onClick={() => setSelectedSession(sess)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedSession?.id === sess.id ? 'bg-primary-green/10 border border-primary-green/20' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">
                                        {sess.visitor_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-body text-sm font-medium truncate">{sess.visitor_name}</p>
                                        <p className="text-gray-500 font-body text-[10px] truncate">{sess.visitor_email}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-body">{formatSessionTime(sess)}</span>
                                    {statusIcon(sess.status)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Active */}
                    {activeSessions.length > 0 && (
                        <div className="p-2">
                            <p className="text-[10px] font-body text-primary-green uppercase tracking-wider px-2 py-1">
                                Active ({activeSessions.length})
                            </p>
                            {activeSessions.map(sess => (
                                <button
                                    key={sess.id}
                                    onClick={() => setSelectedSession(sess)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedSession?.id === sess.id ? 'bg-primary-green/10 border border-primary-green/20' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary-green/15 flex items-center justify-center text-primary-green font-bold text-sm flex-shrink-0">
                                        {sess.visitor_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-body text-sm font-medium truncate">{sess.visitor_name}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-gray-500 font-body text-[10px] truncate">
                                                {getLastMessagePreview(sess)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-body">{formatSessionTime(sess)}</span>
                                    {statusIcon(sess.status)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Ended */}
                    {endedSessions.length > 0 && (
                        <div className="p-2">
                            <p className="text-[10px] font-body text-gray-500 uppercase tracking-wider px-2 py-1">
                                Ended ({endedSessions.length})
                            </p>
                            {endedSessions.map(sess => (
                                <button
                                    key={sess.id}
                                    onClick={() => setSelectedSession(sess)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedSession?.id === sess.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 font-bold text-sm flex-shrink-0">
                                        {sess.visitor_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 font-body text-sm font-medium truncate">{sess.visitor_name}</p>
                                        <p className="text-gray-500 font-body text-[10px] truncate">
                                            Ended {new Date(sess.updatedAt || sess.createdAt).toLocaleString([], {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-body">{formatSessionTime(sess)}</span>
                                    {statusIcon(sess.status)}
                                </button>
                            ))}
                        </div>
                    )}

                    {sessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageCircle size={32} className="mb-2 opacity-30" />
                            <p className="font-body text-sm">No chats yet</p>
                            <p className="font-body text-xs">New conversations will appear here</p>
                        </div>
                    )}

                    {sessions.length > 0 && filteredSessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6 text-center">
                            <MessageCircle size={28} className="mb-2 opacity-30" />
                            <p className="font-body text-sm">No matching chats</p>
                            <p className="font-body text-xs mt-1">Try another search term or change the filter.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                {selectedSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-green/15 flex items-center justify-center text-primary-green font-bold">
                                    {selectedSession.visitor_name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-heading font-semibold text-sm">
                                        {selectedSession.visitor_name}
                                        {selectedSession.is_returning && (
                                            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-400 font-bold uppercase tracking-wider">
                                                Returning ({selectedSession.previous_chats})
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 font-body mt-0.5">
                                        <span className="flex items-center gap-1"><Mail size={10} />{selectedSession.visitor_email}</span>
                                        {selectedSession.visitor_phone && <span className="flex items-center gap-1"><Phone size={10} />{selectedSession.visitor_phone}</span>}
                                        {selectedSession.visitor_ip && <span className="flex items-center gap-1 border-l border-white/10 pl-3">IP: {selectedSession.visitor_ip}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedSession.status === 'waiting' && (
                                    <button onClick={() => handleClaim(selectedSession.id)}
                                        className="px-3 py-1.5 rounded-lg bg-primary-green/10 text-primary-green text-xs font-body hover:bg-primary-green/20 transition font-semibold">
                                        Accept Chat
                                    </button>
                                )}
                                {selectedSession.status === 'active' && (
                                    <button onClick={() => handleEndChat(selectedSession.id)}
                                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-body hover:bg-red-500/20 transition">
                                        End Chat
                                    </button>
                                )}
                                {selectedSession.status === 'ended' && (
                                    <span className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 text-xs font-body">
                                        Chat Ended
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {selectedSession.messages?.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                                    {msg.sender === 'system' ? (
                                        <div className="bg-white/5 text-gray-400 text-xs font-body px-3 py-1.5 rounded-full">
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm font-body ${msg.sender === 'admin'
                                            ? 'bg-primary-green text-primary-dark rounded-br-sm'
                                            : 'bg-white/10 text-white rounded-bl-sm'
                                            }`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-primary-dark/60' : 'text-gray-500'}`}>
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {selectedSession.status === 'active' && (
                            <div className="p-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm font-body focus:outline-none focus:border-primary-green transition-colors"
                                    />
                                    <button onClick={handleSend} disabled={!input.trim()}
                                        className="w-10 h-10 rounded-xl bg-primary-green flex items-center justify-center text-primary-dark hover:shadow-lg hover:shadow-primary-green/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedSession.status === 'waiting' && (
                            <div className="p-4 border-t border-white/5 text-center">
                                <p className="text-gray-500 font-body text-xs">Accept this chat to start responding</p>
                            </div>
                        )}

                        {selectedSession.status === 'ended' && (
                            <div className="p-4 border-t border-white/5 text-center">
                                <p className="text-gray-500 font-body text-xs">This conversation is saved in your chat history.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <MessageCircle size={48} className="mb-3 opacity-20" />
                        <p className="font-heading font-semibold text-white/40 text-lg">Select a conversation</p>
                        <p className="font-body text-xs mt-1">Choose a chat from the sidebar to start responding</p>
                    </div>
                )}
            </div>
        </div>
    )
}
