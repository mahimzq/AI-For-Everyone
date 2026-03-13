import { motion } from 'framer-motion'
import { Briefcase, Building2, Lightbulb, Church, GraduationCap, Megaphone } from 'lucide-react'

const audiences = [
    { icon: <Briefcase size={28} />, title: 'Bankers & Corporate Managers', accent: '#7C3AED' },
    { icon: <Building2 size={28} />, title: 'Civil Servants & Admin Staff', accent: '#3B82F6' },
    { icon: <Lightbulb size={28} />, title: 'Entrepreneurs & Small Business Owners', accent: '#00C853' },
    { icon: <Church size={28} />, title: 'Faith Leaders & Religious Professionals', accent: '#FFD700' },
    { icon: <GraduationCap size={28} />, title: 'Educators, Lecturers & Students', accent: '#06B6D4' },
    { icon: <Megaphone size={28} />, title: 'Admins & Marketers', accent: '#F472B6' },
]

export default function WhoShouldAttend() {
    return (
        <section className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-2 opacity-80" />

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
                    <p className="accent-text text-neon-cyan mb-3">Who Is This For?</p>
                    <h2 className="heading-lg text-white mb-4">
                        Who Should <span className="gradient-text">Attend</span>
                    </h2>
                </motion.div>

                {/* Audience Cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {audiences.map((audience, i) => (
                        <motion.div
                            key={audience.title}
                            className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.6 }}
                        >
                            {/* Accent Background Glow */}
                            <div
                                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                                style={{ background: audience.accent }}
                            />

                            {/* Icon */}
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10 shadow-lg"
                                style={{
                                    background: `${audience.accent}15`,
                                    color: audience.accent,
                                    border: `1px solid ${audience.accent}30`
                                }}
                            >
                                {audience.icon}
                            </div>

                            {/* Content */}
                            <h3 className="font-heading font-bold text-xl text-white mb-3 relative z-10 group-hover:-translate-y-1 transition-transform duration-300">
                                {audience.title}
                            </h3>
                            <p className="text-slate-400 font-body text-sm leading-relaxed relative z-10">
                                {audience.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom text */}
                <motion.div
                    className="text-center mt-12 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <p className="text-slate-300 font-body text-sm lg:text-base leading-relaxed">
                        Whether you are looking to streamline operations, innovate your business model, or simply understand the AI landscape, <span className="text-primary-green font-semibold">this masterclass is your starting point.</span>
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
