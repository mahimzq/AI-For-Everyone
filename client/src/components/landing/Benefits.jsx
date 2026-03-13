import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const benefits = [
    'Gain future-proof AI skills applicable to any profession',
    'Learn how AI can help you find a job faster',
    'Upgrade your CV using AI tools',
    'Increase income opportunities as a worker',
    'Learn faster and research better as a student',
    'Become future-proof in the AI era as a professional',
    'Leave with real, finished outputs created during the session',
    'Receive a digital certificate of participation',
]

export default function Benefits() {
    return (
        <section className="section-padding relative overflow-hidden">
            {/* Animated Fluid Background */}
            <div className="absolute inset-0 bg-fluid-2 opacity-80" />


            <div className="container-max relative">
                {/* Heading */}
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-cyan mb-3">Why Attend</p>
                    <h2 className="heading-lg text-white mb-4">
                        Benefits of <span className="gradient-text">Attending</span>
                    </h2>
                </motion.div>

                {/* Benefits Grid */}
                <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            className="glass-card glass-card-hover rounded-xl p-5 flex items-start gap-4 group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-green/20 transition-colors">
                                <CheckCircle2 size={18} className="text-primary-green" />
                            </div>
                            <p className="font-body text-slate-300 text-sm leading-relaxed">{benefit}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
