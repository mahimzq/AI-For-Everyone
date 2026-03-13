import { motion } from 'framer-motion'
import { Clock, BookOpen, Lightbulb, Laptop } from 'lucide-react'

const sessions = [
    {
        time: '10:00 – 12:00',
        period: 'Morning',
        icon: <BookOpen size={22} />,
        title: 'Awareness & Mindset',
        accent: '#7C3AED',
        items: [
            'Understanding the AI shift',
            'Real-world cost/time comparisons',
            'What AI is and isn\'t',
            'Why Africa cannot miss this shift',
        ],
    },
    {
        time: '12:00 – 14:00',
        period: 'Mid-Day',
        icon: <Lightbulb size={22} />,
        title: 'Practical Demonstrations',
        accent: '#00C853',
        items: [
            'Context engineering techniques',
            'Talk-it-out prompting',
            'Strategic AI thinking',
            'Matching tasks to models',
            'Context windows and token budgeting',
        ],
    },
    {
        time: '14:00 – 16:00',
        period: 'Afternoon',
        icon: <Laptop size={22} />,
        title: 'Guided Practical',
        accent: '#FFD700',
        items: [
            'Real-time content creation on personal devices',
            'Business proposals & reports',
            'Social media strategy',
            'Marketing content & lecture materials',
            'Leave with finished outputs',
        ],
    },
]

export default function Schedule() {
    return (
        <section id="schedule" className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-3 opacity-80" />

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
                    <p className="accent-text text-neon-purple mb-3">Event Schedule</p>
                    <h2 className="heading-lg text-white mb-4">
                        Saturday, <span className="gradient-text">21 March 2026</span>
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Clock size={16} />
                        <span className="font-body text-sm">10:00 – 16:00 | Djeuga Palace, Yaoundé</span>
                    </div>
                </motion.div>

                {/* Timeline */}
                <div className="relative max-w-3xl mx-auto">
                    {/* Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, #7C3AED, #00C853, #FFD700)' }} />

                    <div className="space-y-6">
                        {sessions.map((session, i) => (
                            <motion.div
                                key={session.period}
                                className="relative flex gap-6"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2, duration: 0.6 }}
                            >
                                {/* Node */}
                                <div className="flex-shrink-0 relative z-10">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                                        style={{
                                            background: `${session.accent}20`,
                                            color: session.accent,
                                            border: `1px solid ${session.accent}30`,
                                        }}
                                    >
                                        {session.icon}
                                    </div>
                                </div>

                                {/* Card */}
                                <div className="glass-card glass-card-hover rounded-2xl p-6 flex-1 relative overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 w-[2px] h-full"
                                        style={{ background: session.accent }}
                                    />
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span
                                            className="px-3 py-1 rounded-lg font-accent text-[10px] font-bold"
                                            style={{
                                                background: `${session.accent}15`,
                                                color: session.accent,
                                            }}
                                        >
                                            {session.period}
                                        </span>
                                        <span className="text-slate-500 font-body text-sm">{session.time}</span>
                                    </div>
                                    <h3 className="font-heading font-bold text-lg text-white mb-3">{session.title}</h3>
                                    <ul className="space-y-2">
                                        {session.items.map((item, j) => (
                                            <li key={j} className="flex items-start gap-2 text-slate-400 text-sm font-body">
                                                <span style={{ color: session.accent }} className="mt-0.5 flex-shrink-0 text-xs">●</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
