import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
    { label: 'About', href: '#mission' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Resources', href: '#resources' },
    { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
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
                    {navLinks.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleClick(e, link.href)}
                            className="font-body text-sm text-slate-400 hover:text-white transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-neon-purple after:transition-all after:duration-300 hover:after:w-full"
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="#register"
                        onClick={(e) => handleClick(e, '#register')}
                        className="btn-primary !py-2.5 !px-6 !text-sm !rounded-xl"
                    >
                        Register Now
                    </a>
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
            <div
                className={`md:hidden absolute top-full left-0 right-0 bg-primary-dark/95 backdrop-blur-xl transition-all duration-300 ${isOpen ? 'max-h-screen opacity-100 border-b border-neon-purple/20' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
            >
                <div className="px-6 py-4 flex flex-col gap-3">
                    {navLinks.map(link => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleClick(e, link.href)}
                            className="font-body text-slate-400 hover:text-white transition py-2.5 border-b border-white/5"
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="#register"
                        onClick={(e) => handleClick(e, '#register')}
                        className="btn-primary text-center mt-2"
                    >
                        Register Now
                    </a>
                </div>
            </div>
        </nav>
    )
}
