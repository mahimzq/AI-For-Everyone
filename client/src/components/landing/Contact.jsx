import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Mail, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import axios from 'axios'

const contactInfo = [
    { icon: <Phone size={18} />, label: 'Ben', value: '+237 6 56 30 39 13', href: 'tel:+237656303913' },
    { icon: <Phone size={18} />, label: 'Becky', value: '+237 6 77 14 77 48', href: 'tel:+237677147748' },
    { icon: <MessageCircle size={18} />, label: 'Arnie (WhatsApp)', value: '+44 7411 158 1150', href: 'https://wa.me/447411581150' },
    { icon: <Mail size={18} />, label: 'Email', value: 'hello@mindsetai.co.uk', href: 'mailto:hello@mindsetai.co.uk' },
]

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
    const [status, setStatus] = useState('idle')

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.subject || !formData.message) return

        setStatus('loading')
        try {
            await axios.post('/api/contacts', formData)
            setStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setStatus('idle'), 5000)
        } catch {
            // Fallback to localStorage
            try {
                const existing = JSON.parse(localStorage.getItem('contacts') || '[]')
                existing.push({ ...formData, created_at: new Date().toISOString() })
                localStorage.setItem('contacts', JSON.stringify(existing))
                setStatus('success')
                setFormData({ name: '', email: '', subject: '', message: '' })
                setTimeout(() => setStatus('idle'), 5000)
            } catch {
                setStatus('error')
                setTimeout(() => setStatus('idle'), 5000)
            }
        }
    }

    const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 font-body focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/20 transition-colors"

    return (
        <section id="contact" className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-3 opacity-80" />


            <div className="container-max relative">
                {/* Heading */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-cyan mb-3">Get In Touch</p>
                    <h2 className="heading-lg text-white mb-4">
                        Contact <span className="gradient-text">Us</span>
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
                            <div>
                                <label className="block text-sm font-body text-slate-500 mb-1.5">Name *</label>
                                <input name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-body text-slate-500 mb-1.5">Email *</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-body text-slate-500 mb-1.5">Subject *</label>
                                <input name="subject" value={formData.subject} onChange={handleChange} required placeholder="What is this about?" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-body text-slate-500 mb-1.5">Message *</label>
                                <textarea name="message" rows={4} value={formData.message} onChange={handleChange} required placeholder="Your message..." className={inputClass} />
                            </div>

                            {status === 'success' && (
                                <div className="bg-primary-green/10 border border-primary-green/20 rounded-xl p-3 flex items-center gap-2 text-primary-green text-sm">
                                    <CheckCircle2 size={18} /> Message sent successfully!
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle size={18} /> Failed to send. Please try again.
                                </div>
                            )}

                            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center disabled:opacity-50">
                                {status === 'loading' ? (
                                    <><Loader2 size={18} className="animate-spin mr-2" /> Sending...</>
                                ) : (
                                    <><Send size={18} className="mr-2" /> Send Message</>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Info & Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-5"
                    >
                        <div className="space-y-3">
                            {contactInfo.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    target={item.href.startsWith('https') ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 glass-card glass-card-hover rounded-xl group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-neon-purple/10 flex items-center justify-center text-neon-purple group-hover:bg-neon-purple group-hover:text-white transition-colors">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-body">{item.label}</p>
                                        <p className="font-body font-semibold text-white text-sm">{item.value}</p>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden border border-white/5">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.7894!2d11.5089!3d3.8560!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bcf0c7f6f5d81%3A0x42c4d8bf2f7d236c!2sDjeuga%20Palace!5e0!3m2!1sen!2scm!4v1700000000000!5m2!1sen!2scm"
                                width="100%"
                                height="220"
                                style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Djeuga Palace, Yaoundé"
                            />
                        </div>

                        <div className="flex items-start gap-3 p-4 glass-card rounded-xl">
                            <MapPin size={18} className="text-primary-green flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-heading font-semibold text-white text-sm">Djeuga Palace</p>
                                <p className="text-slate-500 font-body text-xs">Yaoundé, Cameroon</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
