import { useState } from 'react'
import { Send, Users, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import { useAlert } from './AlertDialog'

export default function MarketingPanel() {
    const { showAlert } = useAlert()
    const [subject, setSubject] = useState('')
    const [htmlBody, setHtmlBody] = useState('')
    const [targetAudience, setTargetAudience] = useState('all')
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const handleSend = async (e) => {
        e.preventDefault()

        if (!subject.trim() || !htmlBody.trim()) {
            showAlert('Validation Error', 'Subject and Body are required.', 'info')
            return
        }

        showAlert(
            'Confirm Broadcast',
            `Are you sure you want to send this email to ${targetAudience} users? This cannot be undone.`,
            'danger',
            async () => {
                setIsLoading(true)
                setSuccessMessage('')
                try {
                    const token = localStorage.getItem('adminToken')
                    const res = await axios.post(
                        '/api/marketing/send',
                        { subject, htmlBody, targetAudience },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    setSuccessMessage(`Success! ${res.data.message}`)
                    setSubject('')
                    setHtmlBody('')
                } catch (err) {
                    console.error(err)
                    const msg = err.response?.data?.message || 'Failed to send marketing emails'
                    showAlert('Error', msg, 'danger')
                } finally {
                    setIsLoading(false)
                }
            }
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
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

            {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-emerald-200 text-sm font-body">{successMessage}</p>
                </div>
            )}

            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
                <form onSubmit={handleSend} className="space-y-6">
                    {/* Audience Selection */}
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
                        </select>
                    </div>

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
                            Note: This content is wrapped automatically inside your beautiful black and green 'Official Event Pass' email template. The user's name is dynamically inserted at the top.
                        </p>
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
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Preparing Broadcast...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Email Broadcast
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
