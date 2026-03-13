import { useState, useEffect } from 'react'
import { Users, MessageSquare, Download, Clock, TrendingUp, X } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import axios from 'axios'

const COLORS = ['#00C853', '#FFD700', '#3B82F6', '#A855F7', '#EF4444', '#F97316', '#06B6D4', '#EC4899', '#10B981']

export default function OverviewPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        totalMessages: 0,
        unreadMessages: 0,
        totalDownloads: 0,
        whatsappCount: '0',
        daysUntilEvent: Math.ceil((new Date('2026-03-21') - new Date()) / (1000 * 60 * 60 * 24)),
    })
    const [trendData, setTrendData] = useState([])
    const [professionData, setProfessionData] = useState([])
    const [recentRegistrations, setRecentRegistrations] = useState([])
    const [recentDownloads, setRecentDownloads] = useState([])

    // Modal state
    const [selectedRegistration, setSelectedRegistration] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('adminToken')
                const headers = { Authorization: `Bearer ${token}` }

                // Fetch overview stats
                const statsRes = await axios.get('/api/analytics/overview', { headers })
                setStats(curr => ({ ...curr, ...statsRes.data }))

                await new Promise(resolve => setTimeout(resolve, 150))

                // Fetch trend
                const trendRes = await axios.get('/api/analytics/registrations', { headers })
                // Format dates string to simple names for chart if needed, or just use raw
                const formattedTrend = trendRes.data.map(item => ({
                    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    count: parseInt(item.count)
                }))
                setTrendData(formattedTrend)

                await new Promise(resolve => setTimeout(resolve, 150))

                // Fetch professions
                const profRes = await axios.get('/api/analytics/professions', { headers })
                const formattedProf = profRes.data.map(item => ({
                    name: item.profession,
                    value: parseInt(item.count)
                }))
                setProfessionData(formattedProf)

                await new Promise(resolve => setTimeout(resolve, 150))

                // Fetch recent registrations
                const recentRes = await axios.get('/api/registrations?limit=5', { headers })
                setRecentRegistrations(recentRes.data.registrations)

                await new Promise(resolve => setTimeout(resolve, 150))

                // Fetch recent downloads
                const downloadsRes = await axios.get('/api/analytics/downloads', { headers })
                setRecentDownloads(downloadsRes.data)

                setLoading(false)
            } catch (err) {
                console.error("Dashboard fetch error:", err)
                setError('Failed to load dashboard data. Please try again.')
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const statCards = [
        { label: 'Total Registrations', value: stats.totalRegistrations, icon: <Users size={24} />, color: 'text-primary-green', bgColor: 'bg-primary-green/10' },
        { label: 'Contact Messages', value: stats.totalMessages, icon: <MessageSquare size={24} />, color: 'text-blue-400', bgColor: 'bg-blue-400/10', badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : null },
        { label: 'Resource Downloads', value: stats.totalDownloads, icon: <Download size={24} />, color: 'text-gold-accent', bgColor: 'bg-gold-accent/10' },
        { label: 'WhatsApp Members', value: Number(stats.whatsappCount).toLocaleString(), icon: <MessageSquare size={24} />, color: 'text-[#25D366]', bgColor: 'bg-[#25D366]/10' },
        { label: 'Days Until Event', value: stats.daysUntilEvent, icon: <Clock size={24} />, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    ]

    // Modal Component
    const RegistrationModal = () => {
        if (!selectedRegistration) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRegistration(null)}>
                <div
                    className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-xl font-heading font-bold text-white">Registration Details</h2>
                        <button
                            onClick={() => setSelectedRegistration(null)}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Full Name</p>
                                <p className="font-medium text-white text-lg">{selectedRegistration.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Email</p>
                                <p className="font-medium text-white text-lg">{selectedRegistration.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Phone</p>
                                <p className="font-medium text-white">{selectedRegistration.country_code} {selectedRegistration.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Profession</p>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-green/20 text-primary-green">
                                    {selectedRegistration.profession}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">AI Experience</p>
                                <p className="font-medium text-white">{selectedRegistration.ai_experience}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Status</p>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${selectedRegistration.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                                    selectedRegistration.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    {selectedRegistration.status}
                                </span>
                            </div>
                            {selectedRegistration.referral_source && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-400 mb-1">Referral Source</p>
                                    <p className="font-medium text-white">{selectedRegistration.referral_source}</p>
                                </div>
                            )}
                            {selectedRegistration.learning_goals && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-400 mb-1">Learning Goals & Objectives</p>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-slate-300 font-body text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedRegistration.learning_goals}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="col-span-2 text-xs text-gray-500 flex justify-between pt-4 border-t border-white/5">
                                <span>Registered: {new Date(selectedRegistration.createdAt).toLocaleString()}</span>
                                <span>ID: {selectedRegistration.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary-green border-t-transparent animate-spin"></div>
        </div>
    )

    if (error) return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
        </div>
    )

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="font-heading font-bold text-2xl text-white">Dashboard Overview</h1>
                <p className="text-gray-400 font-body text-sm mt-1">Welcome back. Here's what's happening.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center ${card.color}`}>
                                {card.icon}
                            </div>
                            {card.change && (
                                <span className="text-xs text-primary-green flex items-center gap-0.5 font-body">
                                    <TrendingUp size={12} /> {card.change}
                                </span>
                            )}
                            {card.badge && (
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-body">
                                    {card.badge}
                                </span>
                            )}
                        </div>
                        <p className="font-accent text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-gray-400 text-xs font-body mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <h3 className="font-heading font-semibold text-white mb-4">Registration Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00C853" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#00C853" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                    {trendData.length === 0 && <p className="text-center text-gray-500 text-sm mt-4">No registration data yet.</p>}
                </div>

                {/* Profession Donut */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <h3 className="font-heading font-semibold text-white mb-4">Profession Breakdown</h3>
                    {professionData.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={professionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {professionData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                {professionData.map((p, i) => (
                                    <div key={p.name} className="flex items-center gap-2 text-xs font-body">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-gray-400 truncate" title={p.name}>{p.name}</span>
                                        <span className="text-white ml-auto font-medium">{p.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center">
                            <p className="text-gray-500 text-sm">No profession data yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activities Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Registrations */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-white">Latest Registrations</h3>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Click row for info</span>
                    </div>

                    {recentRegistrations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 font-body border-b border-white/5">
                                        <th className="text-left py-3 px-2">Name</th>
                                        <th className="text-left py-3 px-2">Profession</th>
                                        <th className="text-right py-3 px-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRegistrations.map(r => (
                                        <tr
                                            key={r.id}
                                            onClick={() => setSelectedRegistration(r)}
                                            className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                        >
                                            <td className="py-3 px-2 text-white font-body truncate max-w-[120px]">{r.full_name}</td>
                                            <td className="py-3 px-2">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-green/10 text-primary-green font-bold uppercase truncate max-w-[80px] inline-block">
                                                    {r.profession}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-gray-500 font-body text-xs text-right">
                                                {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500 font-body text-sm">
                            No registrations yet.
                        </div>
                    )}
                </div>

                {/* Recent Downloads */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-white">Recent Resource Downloads</h3>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tracked Activity</span>
                    </div>

                    {recentDownloads.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 font-body border-b border-white/5">
                                        <th className="text-left py-3 px-2">Email</th>
                                        <th className="text-left py-3 px-2">Resource</th>
                                        <th className="text-right py-3 px-2">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentDownloads.map(d => (
                                        <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-2 text-white font-body truncate max-w-[140px]" title={d.downloader_email}>
                                                {d.downloader_email}
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="text-primary-green font-body font-medium truncate max-w-[100px] inline-block">
                                                    {d.resource?.title || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-gray-500 font-body text-xs text-right">
                                                {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500 font-body text-sm">
                            No downloads tracked yet.
                        </div>
                    )}
                </div>
            </div>

            <RegistrationModal />
        </div>
    )
}
