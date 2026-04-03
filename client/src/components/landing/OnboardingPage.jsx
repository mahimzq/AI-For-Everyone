import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2, User, Mail, Phone, CreditCard, Copy, Check } from 'lucide-react'
import axios from 'axios'
import Navbar from '../shared/Navbar'
import { useOnboarding } from '../../context/OnboardingContext'
import ParticleBackground from '../shared/ParticleBackground'

const MOMO_NUMBER = '677 147 748'
const MOMO_NAME = 'Arnold Chiy'
const ACCESS_FEE = '5,000 CFA'

const steps = ['Your Info', 'Payment', 'Done']

export default function OnboardingPage() {
    const [step, setStep] = useState(0)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', transaction_id: '' })
    const { complete } = useOnboarding()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirect = searchParams.get('redirect') || '/gallery'

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const copyMomo = () => {
        navigator.clipboard.writeText(MOMO_NUMBER.replace(/\s/g, ''))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleInfoSubmit = (e) => {
        e.preventDefault()
        if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
            setError('Please fill in all required fields.')
            return
        }
        if (!form.email.includes('@')) {
            setError('Please enter a valid email address.')
            return
        }
        setError('')
        setStep(1)
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault()
        if (!form.transaction_id.trim()) {
            setError('Please enter your MoMo number or transaction ID.')
            return
        }
        setError('')
        setLoading(true)
        try {
            await axios.post('/api/onboarding', form)
        } catch {
            // Continue even if backend fails — access is stored locally
        }
        complete({ full_name: form.full_name, email: form.email })
        setLoading(false)
        setStep(2)
    }

    const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-body focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green/30 transition-colors'

    return (
        <div className="min-h-screen bg-primary-dark relative overflow-hidden">
            <Navbar />
            <div className="absolute inset-0 hero-animated-bg opacity-30 pointer-events-none" />
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
            <ParticleBackground />

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20 pb-12">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <img src="/images/logo.png" alt="Mindset" className="h-14 mx-auto mb-4" />
                        <h1 className="heading-md text-white mb-2">Unlock Full Access</h1>
                        <p className="body-text text-sm">Get access to the Gallery and exclusive Resources</p>
                    </motion.div>

                    {/* Step indicators */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        {steps.map((label, i) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${i === step ? 'bg-primary-green text-black' : i < step ? 'bg-primary-green/20 text-primary-green' : 'bg-white/10 text-slate-500'}`}>
                                    {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                                    {label}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-6 h-px ${i < step ? 'bg-primary-green' : 'bg-white/20'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 0: Personal Info */}
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                className="glass-card glow-border rounded-3xl p-8"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="font-heading font-bold text-white text-xl mb-6 flex items-center gap-2">
                                    <User size={20} className="text-primary-green" /> Your Details
                                </h2>
                                <form onSubmit={handleInfoSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-body text-gray-400 mb-1.5">Full Name *</label>
                                        <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Enter your full name" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-body text-gray-400 mb-1.5">Email Address *</label>
                                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-body text-gray-400 mb-1.5">Phone Number *</label>
                                        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="6XX XXX XXX" className={inputClass} />
                                    </div>
                                    {error && <p className="text-red-400 text-sm font-body">{error}</p>}
                                    <button type="submit" className="btn-primary w-full justify-center mt-2">
                                        Continue to Payment <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 1: Payment */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                className="glass-card glow-border rounded-3xl p-8"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="font-heading font-bold text-white text-xl mb-6 flex items-center gap-2">
                                    <CreditCard size={20} className="text-primary-green" /> Complete Payment
                                </h2>

                                {/* Payment instruction */}
                                <div className="bg-primary-green/5 border border-primary-green/20 rounded-2xl p-5 mb-6 text-center">
                                    <p className="text-slate-300 font-body text-sm mb-1">Access Fee</p>
                                    <p className="text-primary-green font-heading font-bold text-3xl mb-4">{ACCESS_FEE}</p>
                                    <p className="text-slate-400 font-body text-sm mb-3">Send via MTN Mobile Money to:</p>
                                    <div className="bg-black/40 rounded-xl p-3 border border-white/10 inline-flex flex-col items-center gap-1 w-full">
                                        <p className="text-primary-green font-mono text-xl font-bold tracking-wider">{MOMO_NUMBER}</p>
                                        <p className="text-gray-400 text-xs uppercase tracking-widest">{MOMO_NAME}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={copyMomo}
                                        className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-body transition"
                                    >
                                        {copied ? <Check size={14} className="text-primary-green" /> : <Copy size={14} />}
                                        {copied ? 'Copied!' : 'Copy Number'}
                                    </button>
                                </div>

                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-body text-gray-400 mb-1.5">
                                            MoMo Number or Transaction ID *
                                        </label>
                                        <input
                                            value={form.transaction_id}
                                            onChange={e => set('transaction_id', e.target.value)}
                                            placeholder="e.g. 677 123 456 or TXN-12345"
                                            className={inputClass}
                                        />
                                        <p className="text-slate-600 text-xs font-body mt-1.5">Enter the number you paid from, or the transaction ID</p>
                                    </div>
                                    {error && <p className="text-red-400 text-sm font-body">{error}</p>}
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => { setStep(0); setError('') }} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition font-body">
                                            Back
                                        </button>
                                        <button type="submit" disabled={loading} className="flex-1 btn-primary justify-center disabled:opacity-50">
                                            {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                                            {loading ? 'Processing...' : 'Confirm & Get Access'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 2: Success */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                className="glass-card glow-border rounded-3xl p-10 text-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <CheckCircle2 size={64} className="text-primary-green mx-auto mb-5" />
                                <h2 className="heading-md text-white mb-3">Access Granted! 🎉</h2>
                                <p className="body-text mb-2">Welcome, <span className="text-primary-green font-semibold">{form.full_name}</span>!</p>
                                <p className="text-slate-400 font-body text-sm mb-8">
                                    You now have full access to the Gallery and Resources.
                                </p>
                                <button
                                    onClick={() => navigate(redirect)}
                                    className="btn-primary w-full justify-center"
                                >
                                    Continue <ArrowRight size={18} className="ml-2" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
