import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Zap, Eye, Wrench, MessageCircle } from 'lucide-react'
import axios from 'axios'

function Counter({ end, duration = 2, suffix = '' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const inView = useInView(ref, { once: true })

    useEffect(() => {
        if (!inView) return
        let start = 0
        const step = end / (duration * 60)
        const timer = setInterval(() => {
            start += step
            if (start >= end) {
                setCount(end)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 1000 / 60)
        return () => clearInterval(timer)
    }, [inView, end, duration])

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    )
}

export default function Mission() {
    const [whatsappCount, setWhatsappCount] = useState('0')

    useEffect(() => {
        const fetchWhatsappCount = async () => {
            try {
                const res = await axios.get('/api/settings/whatsapp-count')
                setWhatsappCount(res.data.count)
            } catch (err) {
                console.error('Failed to fetch whatsapp count:', err)
            }
        }
        fetchWhatsappCount()
    }, [])

    const pillCards = [
        { icon: <Eye size={20} />, label: 'Demystify', color: 'from-neon-blue to-neon-cyan' },
        { icon: <Zap size={20} />, label: 'Demonstrate', color: 'from-primary-green to-emerald-glow' },
        { icon: <Wrench size={20} />, label: 'Equip', color: 'from-gold-accent to-yellow-500' },
    ]

    return (
        <section id="mission" className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-2 opacity-80" />

            <div className="section-divider mb-20 relative" />

            <div className="container-max relative">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="accent-text text-neon-purple mb-4">Our Mission</p>
                        <h2 className="heading-lg text-white mb-6">
                            AI Is Not the Future.{' '}
                            <span className="gradient-text">It Is the Present.</span>
                        </h2>
                        <div className="glass-card rounded-2xl p-5 mb-6 border-l-2 border-neon-purple/50">
                            <p className="body-text italic text-slate-300">
                                "Africa must not be a consumer only. We must become creators, innovators, and early adopters."
                            </p>
                        </div>
                        <p className="body-text mb-8">
                            The goal is not just a workshop but the launch of a movement to empower 1 million
                            Africans with practical AI skills. Our mission is to demystify AI, demonstrate its
                            power, and equip everyday professionals with tools they can use immediately.
                        </p>

                        {/* Pill Cards */}
                        <div className="flex flex-wrap gap-3">
                            {pillCards.map((pill, i) => (
                                <motion.div
                                    key={pill.label}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${pill.color} text-primary-dark font-heading font-semibold text-sm`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                >
                                    {pill.icon}
                                    {pill.label}
                                    {i < pillCards.length - 1 && <span className="ml-1 text-lg">→</span>}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Stat Card - Fixed: removed overflow-hidden, wider card */}
                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="glass-card glow-border rounded-3xl p-8 sm:p-12 text-center relative w-full max-w-lg">
                            {/* Decorative glow */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-neon-purple/10 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-primary-green/10 blur-3xl pointer-events-none" />

                            <p className="accent-text text-neon-purple mb-4 relative z-10">Our Target</p>
                            <div className="font-accent text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-4 relative z-10 whitespace-nowrap">
                                <Counter end={1000000} duration={2.5} />
                            </div>
                            <p className="font-heading text-lg sm:text-xl text-white font-semibold mb-2 relative z-10">
                                Africans to Be Empowered
                            </p>
                            <p className="body-text text-sm relative z-10">
                                With practical AI skills for career growth & economic opportunity
                            </p>

                            {/* WhatsApp Live Community - Replacing Progress Bar */}
                            <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-3 h-3 rounded-full bg-[#25D366] animate-pulse shadow-[0_0_10px_#25D366]" />
                                    <h4 className="text-white/80 font-heading text-sm font-bold uppercase tracking-widest">
                                        WhatsApp Live Community
                                    </h4>
                                </div>
                                <div className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/30 py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(37,211,102,0.15)]">
                                    <MessageCircle size={40} className="text-[#25D366]" />
                                    <div className="text-left">
                                        <div className="font-accent text-4xl sm:text-5xl font-bold text-white tracking-wide">
                                            {Number(whatsappCount).toLocaleString()}
                                        </div>
                                        <div className="text-[#25D366] font-semibold text-sm uppercase tracking-wide">
                                            Members Joined
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

