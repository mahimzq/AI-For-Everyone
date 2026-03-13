import { motion } from 'framer-motion'
import { Brain, Target, Layers, Share2 } from 'lucide-react'

const pillars = [
    {
        number: '01',
        icon: <Brain size={28} />,
        title: 'AI Intuition',
        description: 'Recognising strong vs. weak AI outputs. Understanding why AI behaves the way it does to adjust strategies predictably.',
        accent: '#7C3AED',
    },
    {
        number: '02',
        icon: <Target size={28} />,
        title: 'Context Engineering',
        description: 'The art of structured background information. Defining role, objective, and audience before prompting.',
        accent: '#00C853',
    },
    {
        number: '03',
        icon: <Layers size={28} />,
        title: 'Orchestration Skills',
        description: 'Matching tools to task complexity. Breaking down complex work and automating repetitive processes.',
        accent: '#06B6D4',
    },
    {
        number: '04',
        icon: <Share2 size={28} />,
        title: 'Scaling & Sharing',
        description: 'Saving structured prompts and building organisational efficiency to reduce outsourcing costs.',
        accent: '#FFD700',
    },
]

export default function LearningPillars() {
    return (
        <section className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-4 opacity-80" />


            <div className="container-max relative">
                {/* Heading */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-purple mb-3">What You'll Master</p>
                    <h2 className="heading-lg text-white mb-4">
                        Core <span className="gradient-text">Learning Pillars</span>
                    </h2>
                    <p className="body-text max-w-2xl mx-auto">
                        Four essential skills that will transform how you work with artificial intelligence.
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 gap-5 lg:gap-6">
                    {pillars.map((pillar, i) => (
                        <motion.div
                            key={pillar.number}
                            className="glass-card glass-card-hover rounded-2xl p-7 relative group cursor-default overflow-hidden"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                        >
                            {/* Accent top border */}
                            <div
                                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `linear-gradient(90deg, transparent, ${pillar.accent}, transparent)` }}
                            />

                            {/* Number */}
                            <span className="font-accent text-5xl font-bold absolute top-5 right-6 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                                {pillar.number}
                            </span>

                            {/* Icon */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                                style={{
                                    background: `${pillar.accent}15`,
                                    color: pillar.accent,
                                }}
                            >
                                {pillar.icon}
                            </div>

                            {/* Content */}
                            <h3 className="font-heading font-bold text-lg text-white mb-3 group-hover:text-white transition-colors">
                                {pillar.title}
                            </h3>
                            <p className="body-text text-sm leading-relaxed">
                                {pillar.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
