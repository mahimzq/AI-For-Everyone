import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, X, Mail, CheckCircle2, Loader2, AlertCircle, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useOnboarding } from '../../context/OnboardingContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function Resources() {
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloadModal, setDownloadModal] = useState(null) // Stores the resource to download
    const [email, setEmail] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [error, setError] = useState('')
    const modalRef = useRef(null)
    const { completed } = useOnboarding()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await axios.get('/api/resources')
                setResources(res.data)
            } catch (err) {
                console.error('Failed to fetch resources:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchResources()

        // Pre-fill email from localStorage (set after registration)
        const lastEmail = localStorage.getItem('last_registration_email')
        if (lastEmail) {
            setEmail(lastEmail)
        } else {
            const storedRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]')
            if (storedRegistrations.length > 0) {
                setEmail(storedRegistrations[storedRegistrations.length - 1].email || '')
            }
        }
    }, [])

    const handleDownloadClick = (resource) => {
        if (!completed) {
            navigate('/onboarding?redirect=/#resources')
            return
        }
        setDownloadModal(resource)
    }

    const triggerDownload = async (e) => {
        e.preventDefault()
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address')
            return
        }

        setError('')
        setIsDownloading(true)

        try {
            // Trigger download via window.location or a direct link
            // Using a hidden link to trigger the browser download behavior
            // Reliably remove any trailing slashes or /api from the base URL
            const cleanUrl = API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
            const downloadUrl = `${cleanUrl}/api/resources/${downloadModal.id}/download?email=${encodeURIComponent(email)}`
            
            // We use a link element to trigger the download so the browser handles it correctly
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', downloadModal.file_name)
            document.body.appendChild(link)
            link.click()
            link.remove()

            // Close modal after a short delay
            setTimeout(() => {
                setDownloadModal(null)
                setIsDownloading(false)
            }, 1000)
        } catch (err) {
            setError('Download failed. Please try again.')
            setIsDownloading(false)
        }
    }

    return (
        <section id="resources" className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-1 opacity-80" />

            <div className="section-divider mb-20 relative" />

            <div className="container-max relative">
                {/* Heading */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-cyan mb-3">Digital Toolkit</p>
                    <h2 className="heading-lg text-white mb-4">
                        Free <span className="gradient-text">Resources</span>
                    </h2>
                    <p className="body-text max-w-2xl mx-auto">
                        Download these exclusive AI guides and frameworks after completing your registration.
                    </p>
                </motion.div>

                {/* Resource Cards */}
                {loading ? (
                    <div className="flex justify-center py-10 text-white">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5 max-w-4xl mx-auto">
                        {resources.length === 0 ? (
                            <p className="col-span-full text-center text-gray-400 font-body">No resources available at the moment.</p>
                        ) : resources.map((resource, i) => (
                            <motion.div
                                key={resource.id}
                                className="glass-card glass-card-hover rounded-2xl p-6 group relative overflow-hidden"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                {/* Accent top line */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-[px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary-green to-transparent"
                                />

                                <div className="w-12 h-12 rounded-xl bg-primary-green/10 flex items-center justify-center mb-4 text-primary-green border border-primary-green/20">
                                    <FileText size={24} />
                                </div>

                                <h3 className="font-heading font-bold text-lg text-white mb-2 group-hover:text-primary-green transition-colors">
                                    {resource.title}
                                </h3>
                                <p className="text-slate-400 font-body text-sm mb-6 leading-relaxed">
                                    {resource.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <button
                                        onClick={() => handleDownloadClick(resource)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-green/10 text-primary-green text-sm font-bold hover:bg-primary-green hover:text-black transition-all border border-primary-green/30"
                                    >
                                        {completed ? <Download size={16} /> : <Lock size={16} />}
                                        {completed ? 'Download PDF' : 'Unlock'}
                                    </button>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                        {resource.download_count} Downloads
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Email Modal */}
            <AnimatePresence>
                {downloadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                            ref={modalRef}
                        >
                            <div className="p-1 bg-gradient-to-r from-primary-green to-neon-cyan" />
                            
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-heading font-bold text-white mb-1">Download Resource</h3>
                                        <p className="text-gray-400 text-sm font-body">{downloadModal.title}</p>
                                    </div>
                                    <button 
                                        onClick={() => setDownloadModal(null)}
                                        className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={triggerDownload} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-heading font-bold text-primary-green uppercase tracking-widest">
                                            Confirm Your Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email to track download"
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-body focus:outline-none focus:border-primary-green transition-all"
                                                required
                                            />
                                        </div>
                                        {error && (
                                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                                                <AlertCircle size={12} /> {error}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isDownloading}
                                        className="w-full py-4 rounded-2xl bg-primary-green text-black font-heading font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,200,83,0.4)] transition-all disabled:opacity-50"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Preparing Download...
                                            </>
                                        ) : (
                                            <>
                                                Start Download
                                                <Download size={20} />
                                            </>
                                        )}
                                    </button>
                                    
                                    <p className="text-center text-gray-500 text-[10px] font-body leading-tight">
                                        By downloading, you agree to receive follow-up resources via email.
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}
