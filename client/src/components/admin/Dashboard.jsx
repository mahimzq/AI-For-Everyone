import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Users, MessageSquare, FileText, BarChart3,
    LogOut, Menu, X, Bell, ChevronRight, Settings, User, Fingerprint, MessageCircle, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { AlertProvider } from './AlertDialog'
import OverviewPage from './OverviewPage'
import RegistrationsTable from './RegistrationsTable'
import MessagesTable from './MessagesTable'
import ResourceManager from './ResourceManager'
import AnalyticsPanel from './AnalyticsPanel'
import SettingsPage from './SettingsPage'
import LiveChat from './LiveChat'
import MarketingPanel from './MarketingPanel'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL

// Notification sound
function playAdminNotification() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const osc3 = ctx.createOscillator()
        const gain = ctx.createGain()

        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(523, ctx.currentTime)     // C5
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.15) // E5
        osc3.type = 'sine'
        osc3.frequency.setValueAtTime(784, ctx.currentTime + 0.3)  // G5

        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)

        osc1.connect(gain); osc2.connect(gain); osc3.connect(gain)
        gain.connect(ctx.destination)

        osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.2)
        osc2.start(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.35)
        osc3.start(ctx.currentTime + 0.3); osc3.stop(ctx.currentTime + 0.6)
    } catch (e) { /* silent */ }
}

const sidebarItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview', exact: true },
    { path: '/admin/registrations', icon: <Users size={20} />, label: 'Registrations', key: 'registrations' },
    { path: '/admin/messages', icon: <MessageSquare size={20} />, label: 'Messages', key: 'messages' },
    { path: '/admin/resources', icon: <FileText size={20} />, label: 'Resources' },
    { path: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/admin/live-chat', icon: <MessageCircle size={20} />, label: 'Live Chat', key: 'live-chat' },
    { path: '/admin/marketing', icon: <MessageSquare size={20} />, label: 'Marketing' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
]

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [admin, setAdmin] = useState(null)
    const [profileDropdown, setProfileDropdown] = useState(false)
    const [chatCount, setChatCount] = useState(0)
    const [messageCount, setMessageCount] = useState(0)
    const [registrationCount, setRegistrationCount] = useState(0)
    const [activityFeed, setActivityFeed] = useState([])
    const [activityOpen, setActivityOpen] = useState(false)
    const [notification, setNotification] = useState(null)
    const [notifVisible, setNotifVisible] = useState(false)
    const dropdownRef = useRef(null)
    const activityPanelRef = useRef(null)
    const socketRef = useRef(null)
    const notifTimerRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    const totalIndicatorCount = chatCount + messageCount + registrationCount

    const pushActivity = (activity) => {
        const item = {
            id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            time: new Date().toISOString(),
            ...activity,
        }
        setActivityFeed(prev => [item, ...prev].slice(0, 25))
    }

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            navigate('/admin/login')
            return
        }
        axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setAdmin(res.data))
            .catch(() => {
                setAdmin({ username: 'Admin', role: 'admin' })
            })
    }, [navigate])

    // Clear section indicators when that section is open
    useEffect(() => {
        if (location.pathname.includes('live-chat')) {
            setChatCount(0)
        }
        if (location.pathname.includes('/admin/messages')) {
            setMessageCount(0)
        }
        if (location.pathname.includes('/admin/registrations')) {
            setRegistrationCount(0)
        }
    }, [location.pathname])

    // Global Socket.IO connection for chat notifications
    useEffect(() => {
        const s = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionDelay: 5000,
            reconnectionAttempts: 5
        })
        socketRef.current = s

        s.on('connect', () => {
            s.emit('admin:join')
        })

        // Initial unread indicators
        const token = localStorage.getItem('adminToken')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        Promise.all([
            axios.get('/api/contacts', { headers }).catch(() => ({ data: [] })),
            axios.get('/api/registrations/stats', { headers }).catch(() => ({ data: {} })),
        ]).then(([contactsRes, regStatsRes]) => {
            const messages = contactsRes?.data?.messages || contactsRes?.data || []
            const unread = messages.filter(m => !m.is_read && !m.is_archived).length
            setMessageCount(unread)
            setRegistrationCount(regStatsRes?.data?.pending || 0)
        }).catch(() => { /* silent */ })

        // Get initial sessions to count waiting
        s.on('chat:sessions', (sessions) => {
            const waiting = sessions.filter(sess => sess.status === 'waiting' || sess.status === 'active').length
            setChatCount(waiting)
        })

        // New chat session
        s.on('chat:new_session', (data) => {
            setChatCount(prev => prev + 1)
            playAdminNotification()
            pushActivity({
                type: 'chat',
                title: `New chat from ${data.visitor_name}`,
                subtitle: data.visitor_email || 'Visitor started a live chat',
                actionPath: '/admin/live-chat',
            })

            // Show notification banner
            setNotification({
                title: `💬 New chat from ${data.visitor_name}`,
                subtitle: `${data.visitor_email || 'No email'} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                actionPath: '/admin/live-chat',
                actionLabel: 'Chat Now',
                avatar: data.visitor_name?.charAt(0)?.toUpperCase() || 'C',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })
            setNotifVisible(true)

            // Auto-hide after 10 seconds
            clearTimeout(notifTimerRef.current)
            notifTimerRef.current = setTimeout(() => {
                setNotifVisible(false)
                setTimeout(() => setNotification(null), 300)
            }, 10000)
        })

        // New message from visitor
        s.on('chat:message_update', (data) => {
            if (data.message.sender === 'visitor' && !location.pathname.includes('live-chat')) {
                playAdminNotification()
                pushActivity({
                    type: 'chat',
                    title: 'New visitor message in live chat',
                    subtitle: 'A visitor sent a new message',
                    actionPath: '/admin/live-chat',
                })
            }
        })

        // Session ended
        s.on('chat:session_update', (data) => {
            if (data.status === 'ended') {
                setChatCount(prev => Math.max(0, prev - 1))
            }
        })

        s.on('admin:new_contact_message', (data) => {
            if (!location.pathname.includes('/admin/messages')) {
                setMessageCount(prev => prev + 1)
            }
            playAdminNotification()
            pushActivity({
                type: 'message',
                title: `New message from ${data.name}`,
                subtitle: data.subject || data.email,
                actionPath: '/admin/messages',
            })

            setNotification({
                title: `📩 New message from ${data.name}`,
                subtitle: `${data.subject || 'Contact form message'} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                actionPath: '/admin/messages',
                actionLabel: 'Open Messages',
                avatar: data.name?.charAt(0)?.toUpperCase() || 'M',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })
            setNotifVisible(true)
            clearTimeout(notifTimerRef.current)
            notifTimerRef.current = setTimeout(() => {
                setNotifVisible(false)
                setTimeout(() => setNotification(null), 300)
            }, 10000)
        })

        s.on('admin:contact_updated', (data) => {
            if (location.pathname.includes('/admin/messages')) return
            if (data?.previous?.is_read === false && data?.current?.is_read === true) {
                setMessageCount(prev => Math.max(0, prev - 1))
            }
            if (data?.previous?.is_read === true && data?.current?.is_read === false) {
                setMessageCount(prev => prev + 1)
            }
        })

        s.on('admin:contact_deleted', (data) => {
            if (location.pathname.includes('/admin/messages')) return
            if (data?.is_read === false && data?.is_archived === false) {
                setMessageCount(prev => Math.max(0, prev - 1))
            }
        })

        s.on('admin:new_registration', (data) => {
            if (!location.pathname.includes('/admin/registrations')) {
                setRegistrationCount(prev => prev + 1)
            }
            playAdminNotification()
            pushActivity({
                type: 'registration',
                title: `New registration: ${data.full_name}`,
                subtitle: data.email || data.profession || 'New attendee registered',
                actionPath: '/admin/registrations',
            })

            setNotification({
                title: `📝 New registration from ${data.full_name}`,
                subtitle: `${data.email || 'No email'} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                actionPath: '/admin/registrations',
                actionLabel: 'View Registration',
                avatar: data.full_name?.charAt(0)?.toUpperCase() || 'R',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })
            setNotifVisible(true)
            clearTimeout(notifTimerRef.current)
            notifTimerRef.current = setTimeout(() => {
                setNotifVisible(false)
                setTimeout(() => setNotification(null), 300)
            }, 10000)
        })

        s.on('admin:registration_deleted', () => {
            if (location.pathname.includes('/admin/registrations')) return
            setRegistrationCount(prev => Math.max(0, prev - 1))
        })

        return () => { s.disconnect() }
    }, [location.pathname])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileDropdown(false)
            }
            if (activityPanelRef.current && !activityPanelRef.current.contains(e.target)) {
                setActivityOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        navigate('/admin/login')
    }

    const handleNotifClick = () => {
        setNotifVisible(false)
        setTimeout(() => setNotification(null), 300)
        navigate(notification?.actionPath || '/admin/live-chat')
    }

    const dismissNotif = () => {
        setNotifVisible(false)
        setTimeout(() => setNotification(null), 300)
    }

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path
        return location.pathname.startsWith(path)
    }

    return (
        <AlertProvider>
            <div className="min-h-screen bg-[#0d1117] flex">
                {/* Sidebar Overlay (mobile) */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed lg:sticky z-50 top-0 left-0 h-screen bg-primary-dark border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        } ${sidebarCollapsed ? 'w-[68px]' : 'w-64'}`}
                >
                    {/* Logo + Collapse Toggle */}
                    <div className="p-3 border-b border-white/5 flex items-center justify-between min-h-[64px]">
                        {!sidebarCollapsed && (
                            <div className="flex items-center justify-center flex-1">
                                <img src="/images/logo.png" alt="Mindset" className="h-9 object-contain" />
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all flex-shrink-0"
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                        </button>
                        {/* Mobile close */}
                        <button
                            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                        {sidebarItems
                            .filter(item => {
                                // Moderators/Viewers cannot see Registrations, Resources, Analytics
                                if (admin?.role !== 'admin' && admin?.role !== 'super_admin') {
                                    return ['/admin', '/admin/messages', '/admin/live-chat', '/admin/settings', '/admin/marketing'].includes(item.path)
                                }
                                return true
                            })
                            .map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        setSidebarOpen(false)
                                        if (item.key === 'live-chat') setChatCount(0)
                                        if (item.key === 'messages') setMessageCount(0)
                                        if (item.key === 'registrations') setRegistrationCount(0)
                                    }}
                                    title={sidebarCollapsed ? item.label : undefined}
                                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${isActive(item.path, item.exact)
                                        ? 'bg-primary-green/10 text-primary-green font-semibold'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                    {/* Live Chat badge */}
                                    {item.key === 'live-chat' && chatCount > 0 && (
                                        <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse ${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}`}>
                                            {chatCount}
                                        </span>
                                    )}
                                    {item.key === 'messages' && messageCount > 0 && (
                                        <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[9px] font-bold ${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}`}>
                                            {messageCount}
                                        </span>
                                    )}
                                    {item.key === 'registrations' && registrationCount > 0 && (
                                        <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[9px] font-bold ${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}`}>
                                            {registrationCount}
                                        </span>
                                    )}
                                    {!sidebarCollapsed && item.key !== 'live-chat' && isActive(item.path, item.exact) && (
                                        <ChevronRight size={14} className="ml-auto" />
                                    )}
                                    {/* Tooltip on collapsed */}
                                    {sidebarCollapsed && (
                                        <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-[#1e293b] text-white text-xs font-body whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl border border-white/10 z-50">
                                            {item.label}
                                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1e293b] rotate-45 border-l border-b border-white/10" />
                                        </div>
                                    )}
                                </Link>
                            ))}
                    </nav>

                    {/* Bottom */}
                    <div className="p-2 border-t border-white/5">
                        <button
                            onClick={handleLogout}
                            title={sidebarCollapsed ? 'Sign Out' : undefined}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
                        >
                            <LogOut size={20} />
                            {!sidebarCollapsed && 'Sign Out'}
                            {sidebarCollapsed && (
                                <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-[#1e293b] text-white text-xs font-body whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl border border-white/10 z-50">
                                    Sign Out
                                </div>
                            )}
                        </button>
                        {!sidebarCollapsed && (
                            <div className="px-3 pt-2 pb-1">
                                <p className="text-[9px] font-body text-gray-600 text-center">
                                    <span className="text-gray-500">Mindset</span> Dashboard
                                </p>
                                <p className="text-[9px] font-body text-gray-600 text-center mt-0.5">
                                    Designed & Developed by{' '}
                                    <a href="https://www.facebook.com/eWebcity" target="_blank" rel="noopener noreferrer"
                                        className="text-blue-400/60 hover:text-blue-400 transition">
                                        eWebCity
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Top Bar */}
                    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 bg-primary-dark/50 backdrop-blur-sm sticky top-0 z-30">
                        <button
                            className="lg:hidden text-gray-400 hover:text-white"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div className="flex items-center gap-4 ml-auto">
                            {/* Server Restart Button (Admin Only) */}
                            {(admin?.role === 'admin' || admin?.role === 'super_admin') && (
                                <button
                                    onClick={async () => {
                                        if (!window.confirm('Are you sure you want to restart the live server?\n\nThis will temporarily disconnect all active users (approx. 2 seconds) while the API reloads.')) return
                                        try {
                                            const btn = document.getElementById('btn-restart-server')
                                            if (btn) btn.classList.add('animate-spin', 'text-amber-500')
                                            await axios.post('/api/admin/restart-server', {}, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                                            })
                                            // Provide immediate visual feedback, then wait for page auto-reconnect
                                            setTimeout(() => alert('Server restart initiated. The dashboard will silently reconnect in a few seconds.'), 500)
                                        } catch (err) {
                                            const btn = document.getElementById('btn-restart-server')
                                            if (btn) btn.classList.remove('animate-spin', 'text-amber-500')
                                            alert(err.response?.data?.message || 'Failed to restart server.')
                                        }
                                    }}
                                    className="relative text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all p-1.5 rounded-lg flex items-center justify-center cursor-pointer ml-1"
                                    title="Hard Restart Server"
                                >
                                    <svg id="btn-restart-server" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                </button>
                            )}

                            {/* Global Activity Bell */}
                            <div className="relative ml-2" ref={activityPanelRef}>
                                <button
                                    className="relative text-gray-400 hover:text-white transition"
                                    onClick={() => setActivityOpen(prev => !prev)}
                                >
                                    <Bell size={20} />
                                    {totalIndicatorCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                                            {totalIndicatorCount > 99 ? '99+' : totalIndicatorCount}
                                        </span>
                                    )}
                                </button>

                                {activityOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-[360px] max-w-[calc(100vw-2rem)] bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-heading font-semibold text-sm">Live Activity</p>
                                                <p className="text-gray-500 text-[11px] font-body">Messages, registrations, and live chat updates</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setActivityFeed([])
                                                    setChatCount(0)
                                                    setMessageCount(0)
                                                    setRegistrationCount(0)
                                                }}
                                                className="text-[11px] px-2 py-1 rounded-md bg-white/5 text-gray-400 hover:text-white"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        <div className="max-h-[360px] overflow-y-auto">
                                            {activityFeed.length === 0 ? (
                                                <div className="p-6 text-center text-gray-500 text-sm font-body">
                                                    No activity yet.
                                                </div>
                                            ) : (
                                                activityFeed.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            if (item.actionPath) navigate(item.actionPath)
                                                            setActivityOpen(false)
                                                        }}
                                                        className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition"
                                                    >
                                                        <p className="text-white text-sm font-body">{item.title}</p>
                                                        <p className="text-gray-500 text-xs font-body mt-0.5">{item.subtitle}</p>
                                                        <p className="text-gray-600 text-[10px] font-body mt-1">
                                                            {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileDropdown(!profileDropdown)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                                >
                                    {admin?.profile_picture ? (
                                        <img src={`${SOCKET_URL}${admin.profile_picture}`} alt="" className="w-8 h-8 rounded-full object-cover border border-primary-green/20" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-green/30 to-emerald-glow/30 flex items-center justify-center text-primary-green text-sm font-bold border border-primary-green/20">
                                            {admin?.username?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-300 font-body hidden sm:block">
                                        {admin?.username || 'Admin'}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {profileDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                                        {/* Profile Header */}
                                        <div className="p-4 border-b border-white/5">
                                            <p className="text-white font-body font-semibold text-sm">{admin?.username || 'Admin'}</p>
                                            <p className="text-gray-500 font-body text-xs mt-0.5">{admin?.email || 'admin@mindset.com'}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] bg-primary-green/10 text-primary-green capitalize">
                                                {admin?.role?.replace('_', ' ') || 'Admin'}
                                            </span>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-1.5">
                                            <Link
                                                to="/admin/settings"
                                                onClick={() => setProfileDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                                            >
                                                <User size={16} /> Edit Profile
                                            </Link>
                                            <Link
                                                to="/admin/settings"
                                                onClick={() => setProfileDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                                            >
                                                <Settings size={16} /> Settings
                                            </Link>
                                            <Link
                                                to="/admin/settings"
                                                onClick={() => { setProfileDropdown(false) }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                                            >
                                                <Fingerprint size={16} /> Biometric Login
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="p-1.5 border-t border-white/5">
                                            <button
                                                onClick={() => { setProfileDropdown(false); handleLogout() }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-red-400 hover:bg-red-500/10 transition-all w-full"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Chat Notification Banner */}
                    {notification && (
                        <div className={`mx-4 lg:mx-6 mt-3 transition-all duration-300 ${notifVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-primary-green/20"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.08) 0%, rgba(0, 200, 83, 0.02) 100%)',
                                    boxShadow: '0 0 30px rgba(0, 200, 83, 0.06)',
                                }}>
                                {/* Animated avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-primary-green/15 flex items-center justify-center text-primary-green font-bold text-lg">
                                        {notification.avatar || 'N'}
                                    </div>
                                    <span className="absolute -inset-1 rounded-xl border border-primary-green/30 animate-ping" style={{ animationDuration: '2s' }} />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary-green border-2 border-[#0d1117]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-heading font-semibold text-sm">
                                        {notification.title}
                                    </p>
                                    <p className="text-gray-400 text-xs font-body mt-0.5 truncate">
                                        {notification.subtitle}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleNotifClick}
                                        className="px-4 py-2 rounded-lg font-heading font-bold text-xs transition-all hover:scale-105"
                                        style={{
                                            background: 'linear-gradient(135deg, #00C853, #00E676)',
                                            color: '#0a0f1e',
                                            boxShadow: '0 4px 16px rgba(0, 200, 83, 0.3)',
                                        }}
                                    >
                                        {notification.actionLabel || 'Open'}
                                    </button>
                                    <button onClick={dismissNotif} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <main className="flex-1 p-4 lg:p-6 overflow-auto">
                        <Routes>
                            <Route index element={<OverviewPage />} />
                            <Route path="registrations" element={<RegistrationsTable />} />
                            <Route path="messages" element={<MessagesTable />} />
                            <Route path="resources" element={<ResourceManager />} />
                            <Route path="analytics" element={<AnalyticsPanel />} />
                            <Route path="live-chat" element={<LiveChat />} />
                            <Route path="marketing" element={<MarketingPanel />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </AlertProvider>
    )
}
