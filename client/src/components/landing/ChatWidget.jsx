import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { MessageCircle, X, Send, Loader2, User, Mail, Phone, ArrowRight, Sparkles, Download, Volume2, Bot } from 'lucide-react'

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

function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(880, ctx.currentTime)
        osc1.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.12)
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination)
        osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.2)
        osc2.start(ctx.currentTime + 0.12); osc2.stop(ctx.currentTime + 0.4)
    } catch (e) { /* */ }
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false)
    const [phase, setPhase] = useState('form')
    const [form, setForm] = useState({ name: '', email: '', phone: '' })

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [socket, setSocket] = useState(null)
    const [sessionId, setSessionId] = useState(null)
    const [unread, setUnread] = useState(0)
    const [pulse, setPulse] = useState(true)
    const [typing, setTyping] = useState(null) // 'ai' or 'admin'
    const [soundEnabled, setSoundEnabled] = useState(true)
    const activeSessionRef = useRef(false)
    const historyRestoredRef = useRef(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(() => setPulse(false), 8000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    useEffect(() => {
        if (!open) return
        activeSessionRef.current = false
        historyRestoredRef.current = false

        const s = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionDelay: 5000,
            reconnectionAttempts: 5
        })
        setSocket(s)

        // Generate or get browser_id
        let bId = localStorage.getItem('ai_chat_browser_id')
        if (!bId) {
            bId = `b_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
            localStorage.setItem('ai_chat_browser_id', bId)
        }

        // Try to reconnect
        s.emit('visitor:reconnect', { browser_id: bId })
        s.emit('visitor:get_history', { browser_id: bId })

        s.on('chat:reconnected', (data) => {
            activeSessionRef.current = true
            historyRestoredRef.current = true
            setSessionId(data.sessionId)
            const msgs = data.messages || []
            const hasAIMessages = msgs.some(m => m.sender === 'ai')

            if (data.status === 'active') {
                setPhase('chat')
            } else if (hasAIMessages) {
                setPhase('connected')
            } else {
                setPhase('connecting')
            }

            setMessages(msgs)
            setForm(prev => ({
                ...prev,
                name: data.visitor_name || prev.name,
                email: data.visitor_email || prev.email,
                phone: data.visitor_phone || prev.phone,
            }))
        })

        s.on('chat:no_session', () => {
            if (activeSessionRef.current) {
                setPhase('ended')
                activeSessionRef.current = false
                setMessages(prev => [...prev, { sender: 'system', text: 'Your previous session has ended.', timestamp: new Date().toISOString() }])
            }
        })

        s.on('chat:visitor_history', (data) => {
            if (activeSessionRef.current || historyRestoredRef.current) return

            const sessions = (data?.sessions || []).map(session => ({
                ...session,
                messages: parseMessages(session.messages),
            }))
            const latestEnded = sessions.find(session => session.status === 'ended' && session.messages.length > 0)
            if (!latestEnded) return

            historyRestoredRef.current = true
            setSessionId(latestEnded.id)
            setMessages(latestEnded.messages)
            setPhase('ended')
            setForm(prev => ({
                ...prev,
                name: latestEnded.visitor_name || prev.name,
                email: latestEnded.visitor_email || prev.email,
                phone: latestEnded.visitor_phone || prev.phone,
            }))
        })

        s.on('chat:started', (data) => {
            activeSessionRef.current = true
            historyRestoredRef.current = true
            setSessionId(data.sessionId)
            setPhase('connecting')
            setMessages([{ sender: 'system', text: 'Finding an available agent...', timestamp: new Date().toISOString() }])
        })

        s.on('chat:admin_joined', () => {
            setPhase('chat')
            setTyping(null)
            setMessages(prev => [...prev, { sender: 'system', text: '🎉 An admin has joined! You\'re now connected.', timestamp: new Date().toISOString() }])
            if (soundEnabled) playNotificationSound()
        })

        s.on('chat:typing', (data) => {
            setTyping(data.sender)
        })

        s.on('chat:stop_typing', () => {
            setTyping(null)
        })

        s.on('chat:message', (data) => {
            if (data.sender === 'admin' || data.sender === 'ai') {
                setMessages(prev => [...prev, { sender: data.sender, text: data.text, timestamp: data.timestamp }])
                setTyping(null)
                if (soundEnabled) playNotificationSound()

                setUnread(prev => prev + (!open ? 1 : 0))

                // AI response means we're now in "connected" state
                if (data.sender === 'ai') {
                    setPhase(prevPhase => (prevPhase === 'connecting' || prevPhase === 'form' ? 'connected' : prevPhase))
                }
            }
        })

        s.on('chat:ended', () => {
            setPhase('ended')
            activeSessionRef.current = false
            historyRestoredRef.current = true
            setTyping(null)
            setMessages(prev => [...prev, { sender: 'system', text: 'Chat has ended. Thanks for chatting! 👋', timestamp: new Date().toISOString() }])
            if (soundEnabled) playNotificationSound()
        })

        return () => { s.disconnect() }
    }, [open, soundEnabled])



    const handleStartChat = (e) => {
        e.preventDefault()
        if (!socket || !form.name.trim() || !form.email.trim()) return

        let bId = localStorage.getItem('ai_chat_browser_id')
        if (!bId) {
            bId = `b_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
            localStorage.setItem('ai_chat_browser_id', bId)
        }

        socket.emit('visitor:start', { ...form, browser_id: bId })
    }

    const handleSend = () => {
        if (!input.trim() || !socket || !sessionId) return
        socket.emit('visitor:message', { sessionId, message: input })
        setMessages(prev => [...prev, { sender: 'visitor', text: input, timestamp: new Date().toISOString() }])
        setInput('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const toggleChat = () => {
        setOpen(!open)
        setPulse(false)
        if (!open) setUnread(0)
    }

    const handleNewConversation = () => {
        setPhase('form')
        setSessionId(null)
        setMessages([])
        setInput('')
        setTyping(null)
        activeSessionRef.current = false
    }

    const downloadTranscript = useCallback(() => {
        const chatMessages = messages.filter(m => m.sender !== 'system')
        if (chatMessages.length === 0) return
        let transcript = `MINDSET AI — Chat Transcript\nDate: ${new Date().toLocaleDateString()}\nVisitor: ${form.name} (${form.email})\n${'─'.repeat(40)}\n\n`
        chatMessages.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            const sender = msg.sender === 'visitor' ? form.name : msg.sender === 'admin' ? 'Admin' : 'Mindset AI'
            transcript += `[${time}] ${sender}:\n${msg.text}\n\n`
        })
        transcript += `${'─'.repeat(40)}\nPowered by Mindset AI | Designed by eWebCity\n`
        const blob = new Blob([transcript], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }, [messages, form])

    const canChat = phase === 'chat' || phase === 'connected'

    const renderMessage = (msg, i) => {
        if (msg.sender === 'system') {
            return (
                <div key={i} className="flex justify-center">
                    <div className="text-gray-500 text-[11px] font-body px-4 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {msg.text}
                    </div>
                </div>
            )
        }

        if (msg.sender === 'visitor') {
            return (
                <div key={i} className="flex justify-end items-end gap-2">
                    <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm font-body"
                        style={{ background: 'linear-gradient(135deg, #00C853, #00E676)', color: '#0a0f1e', boxShadow: '0 4px 12px rgba(0, 200, 83, 0.2)' }}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'rgba(10, 15, 30, 0.5)' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {/* User avatar */}
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary-green"
                        style={{ background: 'rgba(0, 200, 83, 0.15)' }}>
                        {form.name?.charAt(0)?.toUpperCase()}
                    </div>
                </div>
            )
        }

        // AI or Admin message
        return (
            <div key={i} className="flex items-end gap-2">
                {/* AI/Admin avatar */}
                {msg.sender === 'ai' ? (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))' }}>
                        <Bot size={14} className="text-violet-400" />
                    </div>
                ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0, 200, 83, 0.15)' }}>
                        <Sparkles size={14} className="text-primary-green" />
                    </div>
                )}
                <div className="max-w-[78%]">
                    <p className="text-[10px] font-body mb-1" style={{ color: msg.sender === 'ai' ? '#a78bfa' : '#00C853' }}>
                        {msg.sender === 'ai' ? 'Mindset AI' : 'Admin'}
                    </p>
                    <div className="px-4 py-2.5 rounded-2xl rounded-bl-md text-sm font-body"
                        style={{
                            background: msg.sender === 'ai'
                                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.06))'
                                : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${msg.sender === 'ai' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.06)'}`,
                            color: '#e2e8f0',
                        }}>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        <p className="text-[10px] text-gray-600 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Typing indicator component
    const TypingIndicator = () => (
        <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: typing === 'ai' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))' : 'rgba(0, 200, 83, 0.15)' }}>
                {typing === 'ai' ? <Bot size={14} className="text-violet-400" /> : <Sparkles size={14} className="text-primary-green" />}
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Floating Button — LEFT */}
            <div className="fixed bottom-6 left-6 z-50">
                {!open && pulse && (
                    <div className="absolute bottom-16 left-0 bg-white text-gray-900 text-xs font-body font-semibold px-4 py-2 rounded-xl shadow-lg shadow-black/20 whitespace-nowrap animate-alert-in">
                        💬 Need help? Chat with us!
                        <div className="absolute -bottom-1 left-5 w-2 h-2 bg-white rotate-45" />
                    </div>
                )}
                {unread > 0 && !open && (
                    <div className="absolute -top-2 -right-2 z-20">
                        <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-[11px] font-bold items-center justify-center shadow-lg shadow-red-500/40">{unread}</span>
                        </span>
                    </div>
                )}
                <button onClick={toggleChat} className="group relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105"
                    style={{
                        background: open ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #00C853, #00E676, #69F0AE)',
                        boxShadow: open ? '0 8px 32px rgba(239,68,68,0.4)' : '0 8px 32px rgba(0,200,83,0.4), 0 0 60px rgba(0,200,83,0.15)',
                    }}>
                    {!open && (
                        <>
                            <span className="absolute inset-0 rounded-2xl animate-ping bg-primary-green/30" style={{ animationDuration: '2s' }} />
                            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary-green/20 to-transparent blur-sm" />
                        </>
                    )}
                    {open ? <X size={26} className="text-white relative z-10 group-hover:rotate-90 transition-transform" /> : <MessageCircle size={26} className="text-primary-dark relative z-10" />}
                </button>
            </div>

            {/* Chat Window */}
            {open && (
                <div className="fixed bottom-28 left-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[580px] max-h-[calc(100vh-140px)] flex flex-col overflow-hidden animate-alert-in"
                    style={{
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(10,15,30,0.99))',
                        border: '1px solid rgba(0,200,83,0.15)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(0,200,83,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}>
                    {/* Header */}
                    <div className="relative p-5 pb-4" style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.08), rgba(0,230,118,0.03))' }}>
                        <div className="absolute inset-0 border-b border-white/5" />
                        <div className="flex items-center gap-3 relative">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.2), rgba(0,230,118,0.1))' }}>
                                    <Sparkles size={22} className="text-primary-green" />
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] ${phase === 'ended' ? 'bg-gray-500' : 'bg-primary-green'}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-heading font-bold text-base">Mindset AI</h3>
                                <p className="text-xs font-body" style={{ color: phase === 'ended' ? '#9ca3af' : 'rgba(0,200,83,0.8)' }}>
                                    {phase === 'form' && '● Online — Usually replies instantly'}
                                    {phase === 'connecting' && '● Connecting you...'}
                                    {phase === 'connected' && '● Mindset AI is available'}
                                    {phase === 'chat' && '● Live with admin'}
                                    {phase === 'ended' && '○ Chat ended'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute' : 'Unmute'}
                                    className={`p-2 rounded-xl hover:bg-white/5 transition-all ${soundEnabled ? 'text-primary-green' : 'text-gray-600'}`}>
                                    <Volume2 size={14} />
                                </button>
                                {messages.length > 0 && phase !== 'form' && (
                                    <button onClick={downloadTranscript} title="Download transcript"
                                        className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                                        <Download size={14} />
                                    </button>
                                )}
                                <button onClick={toggleChat} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        {/* Form */}
                        {phase === 'form' && (
                            <form onSubmit={handleStartChat} className="space-y-4 mt-1">
                                <div className="text-center mb-5">
                                    <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
                                        style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.15), rgba(0,200,83,0.05))', boxShadow: '0 0 40px rgba(0,200,83,0.1)' }}>
                                        <MessageCircle size={36} className="text-primary-green" />
                                    </div>
                                    <h4 className="text-white font-heading font-bold text-lg">Hey there! 👋</h4>
                                    <p className="text-gray-400 text-sm font-body mt-1.5 leading-relaxed">Got questions? We'd love to help!</p>
                                </div>



                                <div className="space-y-3">
                                    <div className="relative group">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-green transition-colors" />
                                        <input type="text" value={form.name} required placeholder="Your name *"
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-body text-white placeholder-gray-500 focus:outline-none transition-all"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(0,200,83,0.4)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-green transition-colors" />
                                        <input type="email" value={form.email} required placeholder="Your email *"
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-body text-white placeholder-gray-500 focus:outline-none transition-all"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(0,200,83,0.4)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-green transition-colors" />
                                        <input type="tel" value={form.phone} placeholder="Phone (optional)"
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-body text-white placeholder-gray-500 focus:outline-none transition-all"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(0,200,83,0.4)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-3.5 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ background: 'linear-gradient(135deg, #00C853, #00E676)', color: '#0a0f1e', boxShadow: '0 8px 24px rgba(0,200,83,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                                    Start Conversation <ArrowRight size={16} />
                                </button>
                                <p className="text-center text-[10px] text-gray-600 font-body">AI responds instantly • Admins respond within minutes</p>
                            </form>
                        )}

                        {/* Connecting */}
                        {phase === 'connecting' && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.15), rgba(0,200,83,0.05))', boxShadow: '0 0 50px rgba(0,200,83,0.15)' }}>
                                        <Loader2 size={32} className="text-primary-green animate-spin" />
                                    </div>
                                    <span className="absolute -inset-3 rounded-2xl border-2 border-primary-green/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                                </div>
                                <p className="text-white font-heading font-bold text-lg">Connecting...</p>
                                <p className="text-gray-400 text-xs font-body mt-2 text-center leading-relaxed">Our AI assistant will be right with you.</p>
                                <div className="mt-6 flex items-center gap-2 text-primary-green/60 text-[11px] font-body">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
                                    Initializing Mindset AI
                                </div>
                            </div>
                        )}

                        {/* Chat messages */}
                        {(phase === 'connected' || phase === 'chat' || phase === 'ended') && (
                            <div className="space-y-3">
                                {messages.map((msg, i) => renderMessage(msg, i))}
                                {typing && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    {canChat && (
                        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex items-center gap-2">
                                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-body text-white placeholder-gray-500 focus:outline-none transition-all"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(0,200,83,0.4)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                                <button onClick={handleSend} disabled={!input.trim()}
                                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                                    style={{
                                        background: input.trim() ? 'linear-gradient(135deg, #00C853, #00E676)' : 'rgba(255,255,255,0.05)',
                                        boxShadow: input.trim() ? '0 4px 12px rgba(0,200,83,0.3)' : 'none',
                                        color: input.trim() ? '#0a0f1e' : '#6b7280',
                                    }}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {phase === 'connecting' && (
                        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex items-center gap-2 opacity-40">
                                <input disabled placeholder="Waiting for AI..." className="flex-1 px-4 py-3 rounded-xl text-sm font-body text-gray-500"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                            </div>
                        </div>
                    )}

                    {phase === 'ended' && (
                        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button onClick={downloadTranscript}
                                className="w-full py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.1), rgba(0,200,83,0.05))', border: '1px solid rgba(0,200,83,0.2)', color: '#00C853' }}>
                                <Download size={16} /> Download Chat Transcript
                            </button>
                            <button
                                onClick={handleNewConversation}
                                className="w-full py-3 mt-2 rounded-xl font-heading font-bold text-sm transition-all hover:scale-[1.02]"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
                            >
                                Start New Chat
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-4 pb-2 pt-0">
                        <p className="text-center text-[9px] font-body" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            Powered by <span className="text-primary-green/50">Mindset AI</span> • Designed by{' '}
                            <a href="https://www.facebook.com/eWebcity" target="_blank" rel="noopener noreferrer"
                                className="text-blue-400/50 hover:text-blue-400 transition">eWebCity</a>
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
