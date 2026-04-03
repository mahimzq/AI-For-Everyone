import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegistrationStatus } from '../../context/RegistrationStatusContext'

const navLinks = [
    { label: 'About', href: '#mission' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Resources', href: '#resources' },
    { label: 'AI Tools', href: '#ai-tools', badge: '🔥' },
    { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState('')
    const { closed } = useRegistrationStatus()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Track active section with IntersectionObserver
    useEffect(() => {
        const sectionIds = navLinks.map(l => l.href.replace('#', ''))
        const observers = []

        sectionIds.forEach(id => {
            const el = document.getElementById(id)
            if (!el) return
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
                { rootMargin: '-30% 0px -60% 0px' }
            )
            obs.observe(el)
            observers.push(obs)
        })

        return () => observers.forEach(o => o.disconnect())
    }, [])

    const handleClick = (e, href) => {
        e.preventDefault()
        setIsOpen(false)
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isOpen
                ? 'bg-primary-dark/90 backdrop-blur-xl shadow-lg shadow-neon-purple/5 border-b border-white/5'
                : 'bg-transparent'
                }`}
        >
            <div className="container-max flex items-center justify-between h-16 sm:h-20">
                {/* Logo */}
                <a href="#hero" onClick={(e) => handleClick(e, '#hero')} className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="Mindset" className="h-10 sm:h-12 md:h-14 lg:h-16" />
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => {
                        const id = link.href.replace('#', '')
                        const isActive = activeSection === id
                        const isAITools = link.badge

                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleClick(e, link.href)}
                                className={`relative font-body text-sm transition-colors duration-200 flex items-center gap-1.5 ${
                                    isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {/* Active underline */}
                                <span className="relative">
                                    {link.label}
                                    <motion.span
                                        className="absolute bottom-[-4px] left-0 h-[2px] rounded-full"
                                        style={{ background: isAITools ? 'linear-gradient(90deg,#00C853,#7C3AED)' : '#7C3AED' }}
                                        initial={false}
                                        animate={{ width: isActive ? '100%' : '0%' }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                    />
                                </span>

                                {/* AI Tools badge */}
                                {isAITools && (
                                    <motion.span
                                        className="text-[10px] leading-none px-1.5 py-0.5 rounded-full font-bold"
                                        style={{ background: 'linear-gradient(135deg,#00C853,#7C3AED)', color: '#fff' }}
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        NEW
                                    </motion.span>
                                )}
                            </a>
                        )
                    })}
                    <AnimatePresence mode="wait">
                        {closed ? (
                            <motion.a
                                key="closed"
                                href="#register"
                                onClick={(e) => handleClick(e, '#register')}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-1.5 !py-2.5 !px-5 !text-sm !rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 font-heading font-semibold hover:bg-red-500/20 transition-colors"
                            >
                                🔒 Registration Closed
                            </motion.a>
                        ) : (
                            <motion.a
                                key="open"
                                href="#register"
                                onClick={(e) => handleClick(e, '#register')}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="btn-primary !py-2.5 !px-6 !text-sm !rounded-xl"
                            >
                                Register Now
                            </motion.a>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="md:hidden absolute top-full left-0 right-0 bg-primary-dark/97 backdrop-blur-xl border-b border-neon-purple/20"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        <div className="px-6 py-4 flex flex-col gap-1">
                            {navLinks.map((link, i) => {
                                const id = link.href.replace('#', '')
                                const isActive = activeSection === id
                                return (
                                    <motion.a
                                        key={link.href}
                                        href={link.href}
                                        onClick={(e) => handleClick(e, link.href)}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`flex items-center justify-between font-body py-3 border-b border-white/5 transition-colors ${
                                            isActive ? 'text-white' : 'text-slate-400'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {link.label}
                                            {link.badge && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white"
                                                    style={{ background: 'linear-gradient(135deg,#00C853,#7C3AED)' }}>
                                                    NEW
                                                </span>
                                            )}
                                        </span>
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
                                        )}
                                    </motion.a>
                                )
                            })}
                            {closed ? (
                                <a
                                    href="#register"
                                    onClick={(e) => handleClick(e, '#register')}
                                    className="mt-3 flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 font-heading font-semibold text-sm"
                                >
                                    🔒 Registration Closed
                                </a>
                            ) : (
                                <a
                                    href="#register"
                                    onClick={(e) => handleClick(e, '#register')}
                                    className="btn-primary text-center mt-3"
                                >
                                    Register Now
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
