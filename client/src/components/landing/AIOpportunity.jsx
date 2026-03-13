import { motion } from 'framer-motion'
import { FileText, Smartphone, Clock, Zap, ArrowRight } from 'lucide-react'

export default function AIOpportunity() {
    const oldWay = [
        'Business proposals',
        'Market research reports',
        'Marketing content',
        'Lesson plans',
        'Presentation slides',
    ]

    const aiWay = [
        'Instant business proposals',
        'AI-powered research summaries',
        'Social media strategy & content',
        'Complete lecture materials',
        'Interactive dashboards & slides',
    ]

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
                    <p className="accent-text text-neon-purple mb-3">The AI Opportunity</p>
                    <h2 className="heading-lg text-white mb-4">
                        The Cost of <span className="text-red-400">Ignoring</span> AI
                    </h2>
                </motion.div>

                {/* Comparison Image */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <img
                        src="/images/ai-opportunity.png"
                        alt="Old way vs AI way comparison"
                        className="w-full max-h-[400px] object-cover rounded-2xl border border-white/5"
                    />
                </motion.div>

                {/* Comparison Cards */}
                <div className="grid md:grid-cols-2 gap-5 mb-12">
                    {/* Old Way */}
                    <motion.div
                        className="glass-card rounded-2xl p-7 relative overflow-hidden group"
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <FileText size={24} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-lg text-white">The Old Way</h3>
                                <p className="text-xs text-slate-500">Without AI tools</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-xl p-4 mb-5 text-center">
                            <p className="font-accent text-2xl font-bold text-red-400">£500+</p>
                            <p className="text-slate-500 text-sm mt-1">and 14 days</p>
                        </div>
                        <ul className="space-y-2.5">
                            {oldWay.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-body">
                                    <Clock size={14} className="text-red-400/60 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* AI Way */}
                    <motion.div
                        className="glass-card rounded-2xl p-7 relative overflow-hidden group"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-green to-transparent" />
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-primary-green/10 flex items-center justify-center">
                                <Smartphone size={24} className="text-primary-green" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-lg text-white">The AI Way</h3>
                                <p className="text-xs text-slate-500">With AI tools</p>
                            </div>
                        </div>
                        <div className="glass-card rounded-xl p-4 mb-5 text-center">
                            <p className="font-accent text-2xl font-bold text-primary-green">5 minutes</p>
                            <p className="text-slate-500 text-sm mt-1">and zero cost</p>
                        </div>
                        <ul className="space-y-2.5">
                            {aiWay.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-body">
                                    <Zap size={14} className="text-primary-green/60 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Bottom Note */}
                <motion.div
                    className="glass-card glow-border rounded-2xl p-6 text-center max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <p className="font-heading font-semibold text-white text-lg">
                        📱 Requirement: Bring a smartphone or laptop.
                    </p>
                    <p className="gradient-text font-bold mt-1">
                        Leave with finished work.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
