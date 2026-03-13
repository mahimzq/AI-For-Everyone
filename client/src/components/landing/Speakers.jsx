import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

const speakers = [
    {
        name: 'Clement Tala',
        photo: '/images/arnold-chiy.jpg',
        title: 'Co-Founder, Mindset | AI Strategist',
        location: 'United Kingdom',
        bio: 'Passionate about bridging the digital divide in Africa through practical AI education. Co-creator of the "AI for Everyday Africans" initiative.',
    },
    {
        name: 'Arnold Chiy',
        photo: '/images/clement-tala.png',
        title: 'Co-Founder, Mindset | AI Educator',
        location: 'United Kingdom',
        bio: 'Dedicated to empowering African professionals with hands-on AI skills. Advocate for responsible AI adoption across the continent.',
    },
]

export default function Speakers() {
    return (
        <section id="speakers" className="section-padding relative overflow-hidden">
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
                    <p className="accent-text text-neon-purple mb-3">Meet Your Mentors</p>
                    <h2 className="heading-lg text-white mb-4">
                        Speakers & <span className="gradient-text">Mentors</span>
                    </h2>
                </motion.div>

                {/* Speaker Cards */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
                    {speakers.map((speaker, i) => (
                        <motion.div
                            key={speaker.name}
                            className="glass-card glass-card-hover rounded-2xl overflow-hidden group"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2, duration: 0.6 }}
                        >
                            {/* Photo */}
                            <div className="relative h-72 sm:h-80 overflow-hidden">
                                <img
                                    src={speaker.photo}
                                    alt={speaker.name}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1330] via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #7C3AED, #00C853)' }} />
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <h3 className="font-heading font-bold text-xl text-white mb-1">
                                    {speaker.name}
                                </h3>
                                <p className="gradient-text font-body font-semibold text-sm mb-2">
                                    {speaker.title}
                                </p>
                                <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
                                    <MapPin size={13} />
                                    <span>Based in {speaker.location}</span>
                                </div>
                                <p className="text-slate-400 font-body text-sm leading-relaxed">
                                    {speaker.bio}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
