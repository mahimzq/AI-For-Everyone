import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, CheckCircle2, AlertCircle, Loader2, ChevronDown, Search, MessageCircle, ChevronRight, Download } from 'lucide-react'
import axios from 'axios'

const countryCodes = [
    { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
    { code: '+221', country: 'Senegal', flag: '🇸🇳' },
    { code: '+243', country: 'DR Congo', flag: '🇨🇩' },
    { code: '+242', country: 'Congo', flag: '🇨🇬' },
    { code: '+241', country: 'Gabon', flag: '🇬🇦' },
    { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+235', country: 'Chad', flag: '🇹🇩' },
    { code: '+236', country: 'Central African Rep.', flag: '🇨🇫' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
    { code: '+257', country: 'Burundi', flag: '🇧🇮' },
    { code: '+228', country: 'Togo', flag: '🇹🇬' },
    { code: '+229', country: 'Benin', flag: '🇧🇯' },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+223', country: 'Mali', flag: '🇲🇱' },
    { code: '+227', country: 'Niger', flag: '🇳🇪' },
    { code: '+244', country: 'Angola', flag: '🇦🇴' },
    { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲' },
    { code: '+265', country: 'Malawi', flag: '🇲🇼' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
]

const schema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(8, 'Please enter a valid phone number'),
    transaction_id: z.string().min(2, 'Payment transaction ID or MoMo number is required'),
    profession: z.string().min(1, 'Please select your profession'),
    ai_experience: z.string().min(1, 'Please select your AI experience level'),
    learning_goals: z.string().optional(),
    referral_source: z.string().optional(),
})

const professions = [
    'Student', 'Graduate', 'Job Seeker', 'Public Sector Worker',
    'Private Sector Worker', 'Entrepreneur', 'Educator/Lecturer',
    'Faith Leader', 'Other',
]

const experiences = [
    'Complete Beginner',
    'Heard of AI but never used it',
    'Used ChatGPT/Claude a few times',
    'Regular AI user',
]

const referrals = [
    'WhatsApp', 'Social Media', 'Friend/Colleague',
    'Flyer/Poster', 'Website', 'Other',
]

export default function RegistrationForm() {
    const [status, setStatus] = useState('idle')
    const [selectedCountry, setSelectedCountry] = useState(countryCodes[0])
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
    const [countrySearch, setCountrySearch] = useState('')
    const [whatsappCount, setWhatsappCount] = useState('0')
    const dropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setCountryDropdownOpen(false)
                setCountrySearch('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredCountries = countryCodes.filter(c =>
        c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
    )

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    })

    // ── Auto-sync offline registrations when the page loads ──
    useEffect(() => {
        const syncOfflineRegistrations = async () => {
            try {
                const stored = JSON.parse(localStorage.getItem('registrations') || '[]')
                if (stored.length === 0) return

                const res = await axios.post('/api/registrations/sync', { registrations: stored })
                if (res.status === 200) {
                    // Successfully synced — clear localStorage
                    localStorage.removeItem('registrations')
                    console.log(`✅ Auto-synced ${stored.length} offline registration(s)`)
                }
            } catch {
                // Server still unreachable — keep stored data for next attempt
            }
        }

        const fetchWhatsappCount = async () => {
            try {
                const res = await axios.get('/api/settings/whatsapp-count')
                setWhatsappCount(res.data.count)
            } catch (err) {
                console.error('Failed to fetch whatsapp count:', err)
            }
        }

        syncOfflineRegistrations()
        fetchWhatsappCount()
    }, [])

    const onSubmit = async (data) => {
        setStatus('loading')
        try {
            // Try API first
            const res = await axios.post('/api/registrations', {
                ...data,
                country_code: selectedCountry.code,
            })
            // 201 = immediate success, 202 = queued (both are success for the user)
            if (res.status === 201 || res.status === 202) {
                // Also store individual registration in a separate key for easy access by other components
                localStorage.setItem('last_registration_email', data.email)
                window.dispatchEvent(new Event('user-registered'))
                setStatus('success')
                reset()
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setStatus('duplicate')
            } else {
                // Backend not available — save locally and show success
                try {
                    const existing = JSON.parse(localStorage.getItem('registrations') || '[]')
                    const isDuplicate = existing.some(r => r.email === data.email)
                    if (isDuplicate) {
                        setStatus('duplicate')
                        return
                    }
                    existing.push({
                        ...data,
                        country_code: selectedCountry.code,
                        registered_at: new Date().toISOString(),
                    })
                    localStorage.setItem('registrations', JSON.stringify(existing))
                    localStorage.setItem('last_registration_email', data.email)
                    window.dispatchEvent(new Event('user-registered'))
                    setStatus('success')
                    reset()
                } catch {
                    setStatus('error')
                }
            }
        }
    }

    const inputClass = (field) =>
        `w-full px-4 py-3 rounded-xl bg-white/5 border ${errors[field] ? 'border-red-400' : 'border-white/10'
        } text-white placeholder-gray-500 font-body focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green/30 transition-colors`

    const selectClass = (field) =>
        `w-full px-4 py-3 rounded-xl bg-white/5 border ${errors[field] ? 'border-red-400' : 'border-white/10'
        } text-white font-body focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green/30 transition-colors appearance-none cursor-pointer`

    if (status === 'success') {
        return (
            <section id="register" className="section-padding bg-primary-dark grid-bg relative overflow-hidden">
                <div className="container-max">
                    <motion.div
                        className="max-w-lg mx-auto text-center glass-card glow-border rounded-3xl p-10"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CheckCircle2 size={64} className="text-primary-green mx-auto mb-6" />
                        <h3 className="heading-md text-white mb-4">You're In! 🎉</h3>
                        <p className="body-text mb-2">
                            Check your email for confirmation.
                        </p>
                        <p className="text-primary-green font-heading font-semibold text-lg">
                            See you on 21 March at Djeuga Palace.
                        </p>
                        
                        <div className="mt-8 space-y-3">
                            <a
                                href="#resources"
                                className="w-full btn-primary !py-4 flex items-center justify-center gap-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                <Download size={20} />
                                Get Free Resources
                            </a>
                            <button
                                onClick={() => setStatus('idle')}
                                className="w-full text-slate-400 hover:text-white text-sm font-body transition-colors"
                            >
                                Register Another Person
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        )
    }

    return (
        <section id="register" className="section-padding bg-primary-dark grid-bg relative overflow-hidden">
            <div className="section-divider mb-16" />
            <div className="container-max">
                {/* Heading */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-purple mb-3">Secure Your Spot</p>
                    <h2 className="heading-lg text-white mb-4">
                        <span className="gradient-text">Register</span> Now
                    </h2>
                    <p className="body-text max-w-xl mx-auto">
                        Limited spaces available. Reserve your spot for the AI revolution.
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="glass-card glow-border rounded-3xl p-6 sm:p-8 lg:p-10 space-y-5"
                    >
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-body text-gray-400 mb-1.5">Full Name *</label>
                            <input
                                {...register('full_name')}
                                placeholder="Enter your full name"
                                className={inputClass('full_name')}
                            />
                            {errors.full_name && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.full_name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-body text-gray-400 mb-1.5">Email Address *</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className={inputClass('email')}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Phone with Country Code */}
                        <div>
                            <label className="block text-sm font-body text-gray-400 mb-1.5">Phone Number *</label>
                            <div className="flex gap-2">
                                {/* Country Code Dropdown */}
                                <div className="relative flex-shrink-0" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                                        className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body text-sm hover:border-primary-green/50 transition-colors min-w-[130px]"
                                    >
                                        <span className="text-lg">{selectedCountry.flag}</span>
                                        <span className="text-gray-300">{selectedCountry.code}</span>
                                        <ChevronDown size={14} className={`text-gray-500 ml-auto transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {countryDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-1 w-72 max-h-64 overflow-hidden rounded-xl bg-[#0d1f35] border border-white/10 shadow-2xl z-50 flex flex-col">
                                            {/* Search */}
                                            <div className="p-2 border-b border-white/10">
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search country..."
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-green/50"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            {/* Country List */}
                                            <div className="overflow-y-auto max-h-52">
                                                {filteredCountries.map((c, i) => (
                                                    <button
                                                        key={`${c.code}-${c.country}-${i}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedCountry(c)
                                                            setCountryDropdownOpen(false)
                                                            setCountrySearch('')
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-primary-green/10 transition-colors ${selectedCountry.country === c.country ? 'bg-primary-green/15 text-primary-green' : 'text-gray-300'
                                                            }`}
                                                    >
                                                        <span className="text-lg">{c.flag}</span>
                                                        <span className="flex-1 text-left truncate">{c.country}</span>
                                                        <span className="text-gray-500 text-xs">{c.code}</span>
                                                    </button>
                                                ))}
                                                {filteredCountries.length === 0 && (
                                                    <p className="text-center text-gray-500 text-sm py-4">No countries found</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    {...register('phone')}
                                    placeholder="Phone number"
                                    className={`flex-1 ${inputClass('phone')}`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.phone.message}
                                </p>
                            )}
                        </div>

                        {/* Two columns */}
                        <div className="grid sm:grid-cols-2 gap-5">
                            {/* Profession */}
                            <div>
                                <label className="block text-sm font-body text-gray-400 mb-1.5">Profession *</label>
                                <select {...register('profession')} className={selectClass('profession')}>
                                    <option value="">Select profession</option>
                                    {professions.map(p => (
                                        <option key={p} value={p} className="bg-primary-dark">{p}</option>
                                    ))}
                                </select>
                                {errors.profession && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle size={14} /> {errors.profession.message}
                                    </p>
                                )}
                            </div>

                            {/* AI Experience */}
                            <div>
                                <label className="block text-sm font-body text-gray-400 mb-1.5">AI Experience *</label>
                                <select {...register('ai_experience')} className={selectClass('ai_experience')}>
                                    <option value="">Select experience</option>
                                    {experiences.map(e => (
                                        <option key={e} value={e} className="bg-primary-dark">{e}</option>
                                    ))}
                                </select>
                                {errors.ai_experience && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle size={14} /> {errors.ai_experience.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Learning Goals */}
                        <div>
                            <label className="block text-sm font-body text-gray-400 mb-1.5">What do you hope to learn? (optional)</label>
                            <textarea
                                {...register('learning_goals')}
                                rows={3}
                                placeholder="Tell us what you'd like to take away from this conference..."
                                className={inputClass('learning_goals')}
                            />
                        </div>

                        {/* Referral */}
                        <div>
                            <label className="block text-sm font-body text-gray-400 mb-1.5">How did you hear about us? (optional)</label>
                            <select {...register('referral_source')} className={selectClass('referral_source')}>
                                <option value="">Select source</option>
                                {referrals.map(r => (
                                    <option key={r} value={r} className="bg-primary-dark">{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Error Messages */}
                        {status === 'duplicate' && (
                            <div className="bg-gold-accent/10 border border-gold-accent/30 rounded-xl p-4 flex items-center gap-3">
                                <AlertCircle className="text-gold-accent flex-shrink-0" size={20} />
                                <p className="text-gold-accent font-body text-sm">
                                    This email is already registered. See you at the event! 🎉
                                </p>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                <p className="text-red-400 font-body text-sm">
                                    Something went wrong. Please try again or contact us directly.
                                </p>
                            </div>
                        )}

                        {/* Payment Instructions & Confirmation */}
                        <div className="bg-[#0f172a]/80 border border-primary-green/30 rounded-2xl p-5 sm:p-6 text-center shadow-inner mt-4">
                            <h3 className="text-lg font-heading font-bold text-white mb-1">Event Pass: <span className="text-primary-green">10,000 CFA</span></h3>
                            <p className="text-gray-300 font-body mb-4 text-sm">Please complete your payment via MTN Mobile Money (MoMo) to secure your registration.</p>

                            <div className="bg-black/40 rounded-xl p-3 sm:p-4 inline-block border border-white/10 mb-5">
                                <p className="text-primary-green font-mono text-lg sm:text-xl font-bold tracking-wider">MoMo &bull; 677 147 748</p>
                                <p className="text-gray-400 text-xs mt-1 font-medium uppercase tracking-widest">Arnold Chiy</p>
                            </div>

                            <div className="text-left mt-2 px-2 pb-2">
                                <label className="block text-sm font-body text-gray-300 mb-1.5">MoMo Number or Transaction ID *</label>
                                <input
                                    {...register('transaction_id')}
                                    placeholder="e.g. 677 123 456 or TXN-12345..."
                                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${errors.transaction_id ? 'border-red-400' : 'border-white/10'} text-white placeholder-gray-500 font-body focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green/30 transition-colors`}
                                />
                                {errors.transaction_id && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle size={14} /> {errors.transaction_id.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 size={20} className="animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Reserve My Spot
                                    <Send size={18} className="ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* WhatsApp Channel Section */}
                <motion.div
                    className="max-w-2xl mx-auto mt-12 glass-card border-[#25D366]/30 bg-[#25D366]/5 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl group-hover:opacity-20 transition-opacity">
                        <MessageCircle size={120} className="text-[#25D366]" />
                    </div>

                    <div className="w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#25D366]/30 shadow-[0_0_30px_rgba(37,211,102,0.2)]">
                        <MessageCircle size={32} className="text-[#25D366]" />
                    </div>
                    <h3 className="heading-md text-white mb-3 relative z-10">Follow the <span className="text-[#25D366]">AI For Everyone</span> Channel</h3>
                    <p className="body-text mb-8 relative z-10 max-w-lg mx-auto">Join our official WhatsApp channel for real-time announcements, speaker reveals, and exclusive AI resources leading up to the event.</p>

                    <a
                        href="https://whatsapp.com/channel/0029Vb7TnfaLdQejJGEbbI3H"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-black font-heading font-bold rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] relative z-10"
                    >
                        Join Channel <ChevronRight size={20} />
                    </a>

                    <div className="mt-6 flex items-center justify-center gap-2 text-white/40 font-body text-sm font-bold uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                        Live Member Count: <span className="text-white text-base">{Number(whatsappCount).toLocaleString()}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
