import { motion } from 'framer-motion'
import { MessageCircle, FolderKanban, Workflow, Code2 } from 'lucide-react'

const levels = [
    {
        level: 1,
        icon: <MessageCircle size={22} />,
        title: 'Chat',
        tools: 'Perplexity, Claude, Copilot',
        time: 'Minutes',
        width: '50%',
        gradient: 'from-neon-blue to-neon-cyan',
        accent: '#3B82F6',
    },
    {
        level: 2,
        icon: <FolderKanban size={22} />,
        title: 'Projects',
        tools: 'Claude, Copilot',
        time: '10 minutes',
        width: '70%',
        gradient: 'from-primary-green to-emerald-glow',
        accent: '#00C853',
    },
    {
        level: 3,
        icon: <Workflow size={22} />,
        title: 'Workflows',
        tools: 'Make, Zapier, n8n',
        time: 'Hours to days',
        width: '85%',
        gradient: 'from-gold-accent to-yellow-500',
        accent: '#FFD700',
    },
    {
        level: 4,
        icon: <Code2 size={22} />,
        title: 'Software & Agents',
        tools: 'Cursor, Windsurf, Descript',
        time: 'Weeks',
        width: '100%',
        gradient: 'from-neon-purple to-purple-400',
        accent: '#7C3AED',
    },
]

export default function TechFramework() {
    return (
        <section className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-1 opacity-80" />


            <div className="container-max relative">
                {/* Heading */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-cyan mb-3">The Technical Framework</p>
                    <h2 className="heading-lg text-white mb-4">
                        Four Ways to <span className="gradient-text">Use AI</span>
                    </h2>
                    <p className="body-text max-w-2xl mx-auto">
                        From simple conversations to building complete software — discover where you fit and where you're headed.
                    </p>
                </motion.div>

                {/* Bars */}
                <div className="max-w-3xl mx-auto space-y-5">
                    {levels.map((lvl, i) => (
                        <motion.div
                            key={lvl.level}
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.6 }}
                        >
                            {/* Level */}
                            <div className="w-10 text-center flex-shrink-0">
                                <span
                                    className="font-accent text-sm font-bold"
                                    style={{ color: lvl.accent }}
                                >
                                    L{lvl.level}
                                </span>
                            </div>

                            {/* Bar */}
                            <div className="flex-1">
                                <motion.div
                                    className={`bg-gradient-to-r ${lvl.gradient} rounded-xl p-4 text-primary-dark relative overflow-hidden`}
                                    style={{ width: '0%' }}
                                    whileInView={{ width: lvl.width }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                >
                                    <div className="flex items-center gap-3 min-w-[260px]">
                                        <div className="flex-shrink-0 opacity-80">{lvl.icon}</div>
                                        <div>
                                            <h4 className="font-heading font-bold text-sm">{lvl.title}</h4>
                                            <p className="text-xs opacity-70">{lvl.tools}</p>
                                        </div>
                                        <span className="ml-auto font-accent text-[10px] font-semibold whitespace-nowrap opacity-70">
                                            {lvl.time}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
