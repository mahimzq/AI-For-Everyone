import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, ArrowRight, ChevronDown, MessageCircle } from 'lucide-react'
import ParticleBackground from '../shared/ParticleBackground'
import CountdownTimer from '../shared/CountdownTimer'
import axios from 'axios'
import { useRegistrationStatus } from '../../context/RegistrationStatusContext'

const heroImages = [
    '/images/hero-slide-1.png',
    '/images/hero-slide-2.png',
    '/images/hero-slide-3.png',
]

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [whatsappCount, setWhatsappCount] = useState('0')
    const { closed: registrationClosed } = useRegistrationStatus()

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroImages.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

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

    const scrollTo = (id) => {
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Video-style image slideshow background */}
            <div className="absolute inset-0">
                <AnimatePresence mode="sync">
                    <motion.img
                        key={currentSlide}
                        src={heroImages[currentSlide]}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ opacity: { duration: 1.5 }, scale: { duration: 8, ease: 'linear' } }}
                    />
                </AnimatePresence>
                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-primary-dark/70" />
                {/* Gradient mesh on top */}
                <div className="absolute inset-0 hero-animated-bg opacity-60" />
            </div>

            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-30" />

            {/* Orbit rings */}
            <div className="orbit-ring w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15" />
            <div className="orbit-ring w-[900px] h-[900px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" style={{ animationDirection: 'reverse', animationDuration: '40s' }} />

            {/* Particles */}
            <ParticleBackground />

            {/* Content */}
            <div className="relative z-10 text-center px-4 w-[80%] max-w-none mx-auto pt-24 pb-12">
                {/* Logo */}
                <motion.div
                    className="animate-float mb-8"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <img
                        src="/images/logo.png"
                        alt="Mindset Logo"
                        className="w-36 sm:w-44 lg:w-52 mx-auto drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                    />
                </motion.div>

                {/* Label */}
                <motion.div
                    className="flex flex-col items-center gap-3 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <p className="accent-text text-neon-purple purple-glow tracking-[0.25em]">
                        Yaoundé AI Career Acceleration Conference
                    </p>
                    
                    {/* Live WhatsApp Count Badge */}
                    <motion.a
                        href="https://whatsapp.com/channel/0029Vb7TnfaLdQejJGEbbI3H"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-[10px] font-bold uppercase tracking-widest hover:bg-[#25D366]/20 transition-all group"
                        whileHover={{ scale: 1.05 }}
                    >
                        <MessageCircle size={14} className="group-hover:animate-bounce" />
                        Live Community Reach: <span className="text-white ml-1">{Number(whatsappCount).toLocaleString()} Members</span>
                    </motion.a>
                </motion.div>

                {/* Main Title */}
                <motion.h1
                    className="heading-xl text-white mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <span className="gradient-text">AI FOR EVERYBODY</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="font-body text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    Empowering Africa with practical AI skills. Join the movement that's shaping the future of work across the continent.
                </motion.p>

                {/* Event Info */}
                <motion.div
                    className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <div className="glass-card rounded-2xl px-5 py-3 flex items-center justify-center gap-2.5">
                        <Calendar size={16} className="text-neon-purple" />
                        <span className="text-sm font-body text-slate-300">Saturday 21 March 2026 · 10:00 – 16:00</span>
                    </div>
                    <div className="glass-card rounded-2xl px-5 py-3 flex items-center justify-center gap-2.5">
                        <MapPin size={16} className="text-primary-green" />
                        <span className="text-sm font-body text-slate-300">Djeuga Palace, Yaoundé, Cameroon</span>
                    </div>
                </motion.div>

                {/* Countdown */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                >
                    <CountdownTimer />
                </motion.div>

                {/* Registration Notice — always visible */}
                <motion.div
                    className={`mb-6 mx-auto max-w-xl px-5 py-4 rounded-2xl border text-center ${
                        registrationClosed
                            ? 'border-red-500/40 bg-red-500/10'
                            : 'border-yellow-500/40 bg-yellow-500/10'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ delay: 1.3, duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {registrationClosed ? (
                        <>
                            <p className="text-red-400 font-heading font-bold text-sm mb-1">🔒 Online Registration Closed at 22:00 UK Time</p>
                            <p className="text-slate-400 font-body text-xs">
                                Still want to register? Contact the admin for direct registration via{' '}
                                <a href="https://whatsapp.com/channel/0029Vb7TnfaLdQejJGEbbI3H" target="_blank" rel="noopener noreferrer" className="text-[#25D366] underline">WhatsApp</a>.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-yellow-400 font-heading font-bold text-sm mb-1">⏰ Registration Closes Tonight at 22:00 UK Time</p>
                            <p className="text-slate-400 font-body text-xs">
                                Secure your spot now — registration closes at 22:00 UK time. After that, contact admin for direct registration.
                            </p>
                        </>
                    )}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                >
                    {!registrationClosed && (
                        <button onClick={() => scrollTo('#register')} className="btn-primary">
                            Join the AI Movement
                            <ArrowRight className="ml-2" size={18} />
                        </button>
                    )}
                    <button onClick={() => scrollTo('#mission')} className="btn-secondary">
                        Discover What You'll Learn
                        <ChevronDown className="ml-2" size={18} />
                    </button>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    className="mt-8 accent-text gradient-text-gold tracking-[0.2em]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                >
                    Awareness · Access · Action
                </motion.p>
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {heroImages.map((_, i) => (
                    <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-neon-purple w-6' : 'bg-white/30'}`}
                        onClick={() => setCurrentSlide(i)}
                    />
                ))}
            </div>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-primary-dark to-transparent z-[1]" />
        </section>
    )
}
