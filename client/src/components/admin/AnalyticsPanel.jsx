import { useState, useEffect } from 'react'
import {
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { Loader2, TrendingUp, Users, BarChart3 } from 'lucide-react'
import axios from 'axios'

const COLORS = ['#00C853', '#FFD700', '#3B82F6', '#A855F7', '#EF4444', '#F97316', '#06B6D4', '#EC4899', '#10B981']

const tooltipStyle = {
    contentStyle: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' },
}

export default function AnalyticsPanel() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [trendData, setTrendData] = useState([])
    const [professionData, setProfessionData] = useState([])
    const [experienceData, setExperienceData] = useState([])
    const [referralData, setReferralData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [overview, setOverview] = useState({ totalRegistrations: 0, totalMessages: 0 })

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('adminToken')
                const headers = { Authorization: `Bearer ${token}` }

                // Fetch sequentially with slight delays to avoid overloading the backend
                const trendRes = await axios.get('/api/analytics/registrations', { headers })
                await new Promise(resolve => setTimeout(resolve, 200))

                const profRes = await axios.get('/api/analytics/professions', { headers })
                await new Promise(resolve => setTimeout(resolve, 200))

                const expRes = await axios.get('/api/analytics/experience', { headers })
                await new Promise(resolve => setTimeout(resolve, 200))

                const refRes = await axios.get('/api/analytics/referrals', { headers })
                await new Promise(resolve => setTimeout(resolve, 200))

                const overviewRes = await axios.get('/api/analytics/overview', { headers })
                await new Promise(resolve => setTimeout(resolve, 200))

                const statsRes = await axios.get('/api/registrations/stats', { headers })

                // Format trend data
                const trend = trendRes.data.map(item => ({
                    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    registrations: parseInt(item.count),
                }))
                setTrendData(trend)

                // Profession data
                setProfessionData(profRes.data.map(p => ({
                    name: p.profession || 'Unknown',
                    value: parseInt(p.count),
                })))

                // Experience data
                setExperienceData(expRes.data.map(e => ({
                    name: e.ai_experience || 'Unknown',
                    value: parseInt(e.count),
                })))

                // Referral data
                setReferralData(refRes.data.map(r => ({
                    name: r.referral_source || 'Unknown',
                    value: parseInt(r.count),
                })))

                // Status breakdown
                setStatusData([
                    { name: 'Confirmed', value: statsRes.data.confirmed || 0 },
                    { name: 'Pending', value: statsRes.data.pending || 0 },
                    { name: 'Cancelled', value: statsRes.data.cancelled || 0 },
                ])

                setOverview(overviewRes.data)
                setLoading(false)
            } catch (err) {
                console.error('Analytics fetch error:', err)
                setError('Failed to load analytics data')
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary-green" />
        </div>
    )

    if (error) return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
        </div>
    )

    const totalRegs = overview.totalRegistrations || statusData.reduce((sum, s) => sum + s.value, 0)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading font-bold text-2xl text-white">Analytics</h1>
                <p className="text-gray-400 font-body text-sm">Detailed breakdown of event data • {totalRegs} total registrations</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Registration Trend */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-primary-green" />
                        <h3 className="font-heading font-semibold text-white text-sm">Registration Trend</h3>
                    </div>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00C853" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" stroke="#666" fontSize={11} />
                                <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
                                <Tooltip {...tooltipStyle} />
                                <Area type="monotone" dataKey="registrations" stroke="#00C853" fillOpacity={1} fill="url(#colorReg)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[240px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
                    )}
                </div>

                {/* Profession Distribution */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-primary-green" />
                        <h3 className="font-heading font-semibold text-white text-sm">By Profession</h3>
                    </div>
                    {professionData.length > 0 ? (
                        <div className="flex items-center">
                            <ResponsiveContainer width="55%" height={240}>
                                <PieChart>
                                    <Pie data={professionData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {professionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip {...tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1.5">
                                {[...professionData].sort((a, b) => b.value - a.value).map((p) => {
                                    const origIdx = professionData.indexOf(p)
                                    return (
                                        <div key={p.name} className="flex items-center gap-2 text-xs font-body">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[origIdx % COLORS.length] }} />
                                            <span className="text-gray-400 truncate">{p.name}</span>
                                            <span className="text-white font-semibold ml-auto flex-shrink-0">{p.value}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[240px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
                    )}
                </div>

                {/* AI Experience */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={16} className="text-primary-green" />
                        <h3 className="font-heading font-semibold text-white text-sm">AI Experience Level</h3>
                    </div>
                    {experienceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={experienceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" stroke="#666" fontSize={11} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" stroke="#666" fontSize={10} width={110} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="value" fill="#00C853" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[240px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
                    )}
                </div>

                {/* Referral Source */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <h3 className="font-heading font-semibold text-white mb-4 text-sm">Referral Sources</h3>
                    {referralData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={referralData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                                <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {referralData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[240px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
                    )}
                </div>

                {/* Registration Status */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 lg:col-span-2">
                    <h3 className="font-heading font-semibold text-white mb-4 text-sm">Registration Status Breakdown</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <ResponsiveContainer width={200} height={200}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                                    <Cell fill="#00C853" />
                                    <Cell fill="#FFD700" />
                                    <Cell fill="#EF4444" />
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            {statusData.map((s, i) => (
                                <div key={s.name} className="text-center">
                                    <p className="font-accent text-3xl font-bold" style={{ color: ['#00C853', '#FFD700', '#EF4444'][i] }}>{s.value}</p>
                                    <p className="text-gray-400 text-xs font-body mt-1">{s.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
