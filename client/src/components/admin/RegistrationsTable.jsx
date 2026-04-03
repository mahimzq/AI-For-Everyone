import { useState, useEffect, useCallback } from 'react'
import { Search, Download, Trash2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, Mail, UserPlus } from 'lucide-react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useAlert } from './AlertDialog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL

export default function RegistrationsTable() {
    const [registrations, setRegistrations] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedRegistration, setSelectedRegistration] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [error, setError] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [addForm, setAddForm] = useState({ full_name: '', email: '', phone: '', country_code: '+237', profession: '', ai_experience: '', transaction_id: '' })
    const [addLoading, setAddLoading] = useState(false)
    const perPage = 10
    const dialog = useAlert()

    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: `Bearer ${token}` }

    const fetchRegistrations = useCallback(async () => {
        try {
            setLoading(true)
            const params = { page, limit: perPage }
            if (search) params.search = search
            if (statusFilter) params.status = statusFilter

            const res = await axios.get('/api/registrations', { headers, params })
            setRegistrations(res.data.registrations)
            setTotal(res.data.total)
            setTotalPages(res.data.totalPages)
        } catch (err) {
            setError('Failed to load registrations')
        } finally {
            setLoading(false)
        }
    }, [page, search, statusFilter])

    useEffect(() => { fetchRegistrations() }, [fetchRegistrations])

    useEffect(() => {
        const s = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionDelay: 5000,
            reconnectionAttempts: 5
        })

        s.on('connect', () => {
            s.emit('admin:join')
        })

        s.on('admin:new_registration', () => {
            fetchRegistrations()
        })

        s.on('admin:registration_updated', () => {
            fetchRegistrations()
        })

        s.on('admin:registration_deleted', () => {
            fetchRegistrations()
        })

        return () => s.disconnect()
    }, [fetchRegistrations])

    const handleDelete = async (id) => {
        const confirmed = await dialog.confirm('This registration will be permanently deleted.', 'Delete Registration?', 'Delete')
        if (!confirmed) return
        setActionLoading(id)
        try {
            await axios.delete(`/api/registrations/${id}`, { headers })
            setRegistrations(prev => prev.filter(r => r.id !== id))
            setTotal(prev => prev - 1)
            dialog.toast.success('Registration deleted')
            if (selectedRegistration?.id === id) setSelectedRegistration(null)
        } catch (err) {
            dialog.error('Failed to delete registration')
        } finally {
            setActionLoading(null)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        setActionLoading(id)
        try {
            await axios.patch(`/api/registrations/${id}`, { status: newStatus }, { headers })
            setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
            dialog.toast.success(`Registration ${newStatus}`)
            if (selectedRegistration?.id === id) {
                setSelectedRegistration(prev => ({ ...prev, status: newStatus }))
            }
        } catch (err) {
            dialog.error('Failed to update status')
        } finally {
            setActionLoading(null)
        }
    }

    const handleResendEmail = async (id) => {
        setActionLoading(id)
        try {
            await axios.post(`/api/registrations/${id}/resend-email`, {}, { headers })
            dialog.toast.success('Email sent successfully')
        } catch (err) {
            dialog.error(err.response?.data?.message || 'Failed to resend email')
        } finally {
            setActionLoading(null)
        }
    }

    const handleAddRegistration = async (e) => {
        e.preventDefault()
        if (!addForm.full_name || !addForm.email || !addForm.phone) {
            dialog.error('Full name, email and phone are required.')
            return
        }
        setAddLoading(true)
        try {
            await axios.post('/api/registrations/admin', addForm, { headers })
            setShowAddModal(false)
            setAddForm({ full_name: '', email: '', phone: '', country_code: '+237', profession: '', ai_experience: '', transaction_id: '' })
            fetchRegistrations()
            dialog.toast.success('Registration added and confirmation email sent')
        } catch (err) {
            dialog.error(err.response?.data?.message || 'Failed to add registration')
        } finally {
            setAddLoading(false)
        }
    }

    const handleExportCSV = async () => {
        try {
            const res = await axios.get('/api/registrations/export', {
                headers,
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch {
            dialog.error('Failed to export CSV')
        }
    }

    const statusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-400',
            confirmed: 'bg-primary-green/10 text-primary-green',
            cancelled: 'bg-red-500/10 text-red-400',
        }
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-body capitalize ${styles[status] || 'bg-white/10 text-gray-400'}`}>
                {status}
            </span>
        )
    }

    // Detail Modal
    const DetailModal = () => {
        if (!selectedRegistration) return null
        const r = selectedRegistration
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRegistration(null)}>
                <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-xl font-heading font-bold text-white">Registration Details</h2>
                        <button onClick={() => setSelectedRegistration(null)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Full Name</p>
                                <p className="font-medium text-white text-lg">{r.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Email</p>
                                <p className="font-medium text-white">{r.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Phone</p>
                                <p className="font-medium text-white">{r.country_code} {r.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Payment / MoMo ID</p>
                                <p className="font-mono text-primary-green bg-primary-green/10 px-2 py-0.5 rounded inline-block text-sm">{r.transaction_id || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Profession</p>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-green/20 text-primary-green">{r.profession}</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">AI Experience</p>
                                <p className="font-medium text-white">{r.ai_experience}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Status</p>
                                {statusBadge(r.status)}
                            </div>
                            {r.referral_source && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-400 mb-1">Referral Source</p>
                                    <p className="font-medium text-white">{r.referral_source}</p>
                                </div>
                            )}
                            {r.learning_goals && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-400 mb-1">Learning Goals</p>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-slate-300 font-body text-sm leading-relaxed whitespace-pre-wrap">{r.learning_goals}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-white/5 flex-wrap">
                            <button onClick={() => handleResendEmail(r.id)} disabled={actionLoading === r.id}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-body hover:bg-blue-500/20 transition disabled:opacity-50">
                                {actionLoading === r.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Resend Ticket
                            </button>
                            {r.status !== 'confirmed' && (
                                <button onClick={() => handleStatusChange(r.id, 'confirmed')} disabled={actionLoading === r.id}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-green/10 text-primary-green text-xs font-body hover:bg-primary-green/20 transition disabled:opacity-50">
                                    <CheckCircle2 size={14} /> Confirm
                                </button>
                            )}
                            {r.status !== 'cancelled' && (
                                <button onClick={() => handleStatusChange(r.id, 'cancelled')} disabled={actionLoading === r.id}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-body hover:bg-yellow-500/20 transition disabled:opacity-50">
                                    <XCircle size={14} /> Cancel
                                </button>
                            )}
                            <button onClick={() => handleDelete(r.id)} disabled={actionLoading === r.id}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-body hover:bg-red-500/20 transition ml-auto disabled:opacity-50">
                                {actionLoading === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between">
                            <span>Registered: {new Date(r.createdAt).toLocaleString()}</span>
                            <span>ID: #{r.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-bold text-2xl text-white">Registrations</h1>
                    <p className="text-gray-400 font-body text-sm">{total} total registrations</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowAddModal(true)} className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-2">
                        <UserPlus size={16} /> Add Registration
                    </button>
                    <button onClick={handleExportCSV} className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm font-body focus:outline-none focus:border-primary-green transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-body focus:outline-none focus:border-primary-green appearance-none cursor-pointer"
                >
                    <option value="" className="bg-primary-dark">All Status</option>
                    <option value="pending" className="bg-primary-dark">Pending</option>
                    <option value="confirmed" className="bg-primary-dark">Confirmed</option>
                    <option value="cancelled" className="bg-primary-dark">Cancelled</option>
                </select>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-primary-green" />
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 font-body text-sm">
                        No registrations found.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 font-body border-b border-white/5 bg-white/[0.02]">
                                        <th className="text-left py-3 px-4">ID</th>
                                        <th className="text-left py-3 px-4">Name</th>
                                        <th className="text-left py-3 px-4 hidden md:table-cell">Email</th>
                                        <th className="text-left py-3 px-4 hidden lg:table-cell">Profession</th>
                                        <th className="text-left py-3 px-4 hidden xl:table-cell">Payment ID</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4 hidden sm:table-cell">Date</th>
                                        <th className="text-right py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map(r => (
                                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-body">#{r.id}</td>
                                            <td className="py-3 px-4 text-white font-body font-medium cursor-pointer hover:text-primary-green transition-colors" onClick={() => setSelectedRegistration(r)}>
                                                {r.full_name}
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 font-body hidden md:table-cell">{r.email}</td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 font-body">{r.profession}</span>
                                            </td>
                                            <td className="py-3 px-4 hidden xl:table-cell font-mono text-xs text-primary-green">
                                                {r.transaction_id || '-'}
                                            </td>
                                            <td className="py-3 px-4">{statusBadge(r.status)}</td>
                                            <td className="py-3 px-4 text-gray-500 font-body text-xs hidden sm:table-cell">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1 justify-end">
                                                    {r.status === 'pending' && (
                                                        <button onClick={() => handleStatusChange(r.id, 'confirmed')} disabled={actionLoading === r.id}
                                                            className="p-1.5 rounded-lg hover:bg-primary-green/10 text-gray-400 hover:text-primary-green transition disabled:opacity-50" title="Confirm">
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleResendEmail(r.id)} disabled={actionLoading === r.id}
                                                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition disabled:opacity-50" title="Resend Ticket">
                                                        {actionLoading === r.id ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                                    </button>
                                                    <button onClick={() => handleDelete(r.id)} disabled={actionLoading === r.id}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition disabled:opacity-50" title="Delete">
                                                        {actionLoading === r.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                            <p className="text-xs text-gray-500 font-body">
                                Page {page} of {totalPages} ({total} total)
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm text-gray-400 font-body px-2">{page} / {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <DetailModal />

            {/* Add Registration Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-heading font-bold text-white">Add Manual Registration</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddRegistration} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                                    <input value={addForm.full_name} onChange={e => setAddForm(f => ({ ...f, full_name: e.target.value }))}
                                        placeholder="Full name" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary-green" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Email *</label>
                                    <input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="email@example.com" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary-green" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Country Code</label>
                                    <select value={addForm.country_code} onChange={e => setAddForm(f => ({ ...f, country_code: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary-green appearance-none">
                                        {['+237','+234','+233','+254','+44','+1','+33','+49'].map(c => (
                                            <option key={c} value={c} className="bg-primary-dark">{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                                    <input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="6XXXXXXXX" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary-green" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Profession</label>
                                    <select value={addForm.profession} onChange={e => setAddForm(f => ({ ...f, profession: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary-green appearance-none">
                                        <option value="" className="bg-primary-dark">Select...</option>
                                        {['Student','Graduate','Job Seeker','Public Sector Worker','Private Sector Worker','Entrepreneur','Educator/Lecturer','Faith Leader','Other'].map(p => (
                                            <option key={p} value={p} className="bg-primary-dark">{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Payment ID</label>
                                    <input value={addForm.transaction_id} onChange={e => setAddForm(f => ({ ...f, transaction_id: e.target.value }))}
                                        placeholder="MoMo / Transaction ID" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary-green" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">Registration will be <span className="text-primary-green font-medium">confirmed immediately</span> and a ticket email will be sent.</p>
                            <div className="flex items-center gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition">Cancel</button>
                                <button type="submit" disabled={addLoading} className="flex-1 py-2 rounded-xl bg-primary-green text-black font-bold text-sm hover:bg-green-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                    {addLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
