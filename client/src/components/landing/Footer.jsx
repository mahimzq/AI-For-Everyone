import { Instagram, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react'

const quickLinks = [
    { label: 'About', href: '#mission' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Register', href: '#register' },
    { label: 'Contact', href: '#contact' },
]

const socialLinks = [
    { icon: <Instagram size={18} />, href: '#', label: 'Instagram' },
    { icon: <Facebook size={18} />, href: '#', label: 'Facebook' },
    { icon: <Twitter size={18} />, href: '#', label: 'X/Twitter' },
    { icon: <Linkedin size={18} />, href: '#', label: 'LinkedIn' },
    { icon: <MessageCircle size={18} />, href: 'https://wa.me/447411581150', label: 'WhatsApp' },
]

export default function Footer() {
    const scrollTo = (e, href) => {
        e.preventDefault()
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <footer className="bg-primary-dark border-t border-white/5">
            <div className="container-max py-12">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/images/logo.png" alt="Mindset" className="h-10" />
                        </div>
                        <p className="body-text text-sm mb-4 max-w-xs">
                            Empowering Africa with practical AI skills. Awareness, Access & Action.
                        </p>
                        <p className="accent-text gradient-text-gold text-xs">
                            "Built with AI. For Africa."
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading font-semibold text-white mb-4 text-sm">Quick Links</h4>
                        <ul className="space-y-2">
                            {quickLinks.map(link => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        onClick={(e) => scrollTo(e, link.href)}
                                        className="font-body text-slate-500 hover:text-neon-purple transition-colors text-sm"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-heading font-semibold text-white mb-4 text-sm">Connect</h4>
                        <div className="flex gap-2.5">
                            {socialLinks.map(link => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:bg-neon-purple hover:text-white transition-all duration-300"
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="section-divider my-8" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-body">
                    <p>© 2026 Mindset. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Designed & Developed by{' '}
                        <a href="https://www.facebook.com/eWebcity" target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                            eWebCity
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    )
}
