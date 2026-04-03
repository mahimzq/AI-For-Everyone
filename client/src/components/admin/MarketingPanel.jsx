import { useState, useEffect, useRef } from 'react'
import { Send, Users, AlertCircle, Loader2, CheckCircle2, History, ImageIcon, X, Clock, Mail } from 'lucide-react'
import axios from 'axios'
import { useAlert } from './AlertDialog'

const AUDIENCE_LABELS = {
    all: 'Everyone',
    confirmed: 'Confirmed Only',
    pending: 'Pending Only',
    cancelled: 'Cancelled Only',
    specific: 'Specific Person',
    custom: 'Custom List',
}

function HistoryTab() {
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        axios.get('/api/marketing/history', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setCampaigns(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary-green" size={28} />
        </div>
    )

    if (campaigns.length === 0) return (
        <div className="text-center py-20 text-gray-500 font-body text-sm">No campaigns sent yet.</div>
    )

    return (
        <div className="space-y-3">
            {campaigns.map(c => (
                <div key={c.id} className="bg-[#0d1117] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm font-body truncate">{c.subject}</p>
                            <p className="text-gray-500 text-xs font-body mt-0.5 truncate">{c.html_body.replace(/<[^>]+>/g, ' ').substring(0, 100)}…</p>
                        </div>
                        {c.has_image && (
                            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                                <ImageIcon size={10} /> Image
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-body text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><Users size={11} /> {AUDIENCE_LABELS[c.target_audience] || c.target_audience}</span>
                        {c.specific_email && <span className="flex items-center gap-1"><Mail size={11} /> {c.specific_email}</span>}
                        <span className="flex items-center gap-1"><Send size={11} /> {c.total_sent} sent</span>
                        <span className="flex items-center gap-1 ml-auto"><Clock size={11} /> {new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function MarketingPanel() {
    const { confirm, alert, error } = useAlert()
    const [activeTab, setActiveTab] = useState('compose')
    const [subject, setSubject] = useState('')
    const [htmlBody, setHtmlBody] = useState('')
    const [targetAudience, setTargetAudience] = useState('all')
    const [specificEmail, setSpecificEmail] = useState('')
    const [customEmails, setCustomEmails] = useState([''])
    const [imageBase64, setImageBase64] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const fileInputRef = useRef(null)

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const result = ev.target.result // data:image/png;base64,...
            const base64 = result.split(',')[1]
            setImageBase64(base64)
            setImagePreview(result)
        }
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setImageBase64(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSend = async (e) => {
        e.preventDefault()

        if (!subject.trim() || !htmlBody.trim()) {
            await alert('Subject and Body are required.', 'Validation Error')
            return
        }

        if (targetAudience === 'specific' && !specificEmail.trim()) {
            await alert('Please enter a recipient email address.', 'Validation Error')
            return
        }

        const validCustomEmails = customEmails.map(e => e.trim()).filter(Boolean)
        if (targetAudience === 'custom' && validCustomEmails.length === 0) {
            await alert('Please add at least one email address.', 'Validation Error')
            return
        }

        const confirmMsg = targetAudience === 'specific'
            ? `Send this email to ${specificEmail}?`
            : targetAudience === 'custom'
            ? `Send this email to ${validCustomEmails.length} recipient(s)?`
            : `Are you sure you want to send this email to ${targetAudience} users? This cannot be undone.`

        const confirmed = await confirm(confirmMsg, 'Confirm Send', 'Send')
        if (!confirmed) return

        setIsLoading(true)
        setSuccessMessage('')
        try {
            const token = localStorage.getItem('adminToken')
            const res = await axios.post(
                '/api/marketing/send',
                { subject, htmlBody, targetAudience, specificEmail: specificEmail.trim(), customEmails: validCustomEmails, imageBase64 },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setSuccessMessage(`Success! ${res.data.message}`)
            setSubject('')
            setHtmlBody('')
            setSpecificEmail('')
            setCustomEmails([''])
            removeImage()
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message || 'Failed to send marketing emails'
            await error(msg, 'Error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white tracking-tight">Email Marketing</h1>
                    <p className="text-gray-400 font-body text-sm mt-1">
                        Send beautiful promotional emails to your event registrants.
                    </p>
                </div>
                <div className="p-3 bg-gradient-to-tr from-primary-green/20 to-emerald-glow/20 rounded-xl border border-primary-green/20 shadow-[0_0_20px_rgba(0,200,83,0.15)]">
                    <Send className="text-primary-green drop-shadow-[0_0_8px_rgba(0,200,83,0.5)] animate-pulse" size={24} />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${activeTab === 'compose' ? 'bg-primary-green text-[#050B14]' : 'text-gray-400 hover:text-white'}`}
                >
                    <Send size={14} /> Compose
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-semibold transition-all ${activeTab === 'history' ? 'bg-primary-green text-[#050B14]' : 'text-gray-400 hover:text-white'}`}
                >
                    <History size={14} /> History
                </button>
            </div>

            {activeTab === 'history' ? <HistoryTab /> : (
                <>
                    {successMessage && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-emerald-200 text-sm font-body">{successMessage}</p>
                        </div>
                    )}

                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
                        <form onSubmit={handleSend} className="space-y-6">
                            {/* Audience */}
                            <div className="space-y-2">
                                <label className="text-white text-sm font-semibold font-body flex items-center gap-2">
                                    <Users size={16} className="text-primary-green" />
                                    Target Audience
                                </label>
                                <select
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary-green/50 transition font-body appearance-none"
                                >
                                    <option value="all">Every Registered User</option>
                                    <option value="confirmed">Confirmed Attendees Only</option>
                                    <option value="pending">Pending Registrations Only</option>
                                    <option value="specific">Specific Person</option>
                                    <option value="custom">Custom Email List</option>
                                </select>
                            </div>

                            {targetAudience === 'specific' && (
                                <div className="space-y-2">
                                    <label className="text-white text-sm font-semibold font-body">Recipient Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. john@example.com"
                                        value={specificEmail}
                                        onChange={(e) => setSpecificEmail(e.target.value)}
                                        className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary-green/50 transition font-body placeholder-gray-600"
                                    />
                                </div>
                            )}

                            {targetAudience === 'custom' && (
                                <div className="space-y-2">
                                    <label className="text-white text-sm font-semibold font-body flex items-center justify-between">
                                        <span>Email List</span>
                                        <button
                                            type="button"
                                            onClick={() => setCustomEmails(prev => [...prev, ''])}
                                            className="text-xs text-primary-green hover:text-emerald-300 font-semibold transition flex items-center gap-1"
                                        >
                                            + Add Email
                                        </button>
                                    </label>
                                    <div className="space-y-2">
                                        {customEmails.map((email, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="email"
                                                    placeholder={`e.g. person${idx + 1}@example.com`}
                                                    value={email}
                                                    onChange={(e) => {
                                                        const updated = [...customEmails]
                                                        updated[idx] = e.target.value
                                                        setCustomEmails(updated)
                                                    }}
                                                    className="flex-1 bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-green/50 transition font-body placeholder-gray-600 text-sm"
                                                />
                                                {customEmails.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCustomEmails(prev => prev.filter((_, i) => i !== idx))}
                                                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition border border-red-500/20"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">{customEmails.filter(e => e.trim()).length} email(s) added</p>
                                </div>
                            )}

                            {/* Subject */}
                            <div className="space-y-2">
                                <label className="text-white text-sm font-semibold font-body">Email Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Schedule Update for AI For Everybody!"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary-green/50 transition font-body placeholder-gray-600"
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-2">
                                <label className="text-white text-sm font-semibold font-body flex items-center justify-between">
                                    <span>Email Body (HTML Supported)</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold bg-white/5 px-2 py-1 rounded">VIP Template Pre-applied</span>
                                </label>
                                <textarea
                                    required
                                    placeholder="Write your email content here. You can use <br> for line breaks or <strong> for bold text."
                                    value={htmlBody}
                                    onChange={(e) => setHtmlBody(e.target.value)}
                                    rows={8}
                                    className="w-full bg-[#0d1117] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary-green/50 transition font-body placeholder-gray-600 resize-y font-mono text-sm leading-relaxed"
                                />
                                <p className="text-xs text-gray-500 flex items-start gap-1.5 mt-2">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    Content is wrapped inside the branded email template. The user's name is inserted automatically.
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-white text-sm font-semibold font-body flex items-center gap-2">
                                    <ImageIcon size={16} className="text-primary-green" />
                                    Attach Image <span className="text-gray-500 font-normal">(optional)</span>
                                </label>
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img src={imagePreview} alt="Preview" className="max-h-48 rounded-xl border border-white/10 object-contain" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-red-500/80 rounded-full text-white transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/10 hover:border-primary-green/40 rounded-xl p-6 text-center cursor-pointer transition group"
                                    >
                                        <ImageIcon size={24} className="mx-auto text-gray-600 group-hover:text-primary-green/60 mb-2 transition" />
                                        <p className="text-gray-500 text-sm font-body">Click to upload an image</p>
                                        <p className="text-gray-600 text-xs font-body mt-1">PNG, JPG, GIF — max 2MB recommended</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-4 border-t border-white/5 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all
                                        ${isLoading
                                            ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-white/10'
                                            : 'bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050B14] hover:scale-105 shadow-[0_4px_20px_rgba(0,200,83,0.3)] border border-[#00C853]'
                                        }`}
                                >
                                    {isLoading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Sending...</>
                                    ) : (
                                        <><Send size={18} /> {targetAudience === 'specific' ? 'Send Email' : 'Send Broadcast'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    )
}
