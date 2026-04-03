import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'

const tools = [
    {
        name: 'ChatGPT',
        developer: 'OpenAI',
        description: 'The world\'s most popular AI assistant for writing, coding, and problem-solving.',
        appleId: '6448311069',
        appleUrl: 'https://apps.apple.com/gb/app/chatgpt/id6448311069',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
        color: '#10a37f',
    },
    {
        name: 'Google Gemini',
        developer: 'Google',
        description: 'Google\'s most capable AI model for chat, images, and productivity.',
        appleId: '6477489729',
        appleUrl: 'https://apps.apple.com/gb/app/google-gemini/id6477489729',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.bard',
        color: '#4285F4',
    },
    {
        name: 'Perplexity',
        developer: 'Perplexity AI',
        description: 'AI-powered search engine that gives direct answers with cited sources.',
        appleId: '1668000334',
        appleUrl: 'https://apps.apple.com/gb/app/perplexity-ai-search-chat/id1668000334',
        androidUrl: 'https://play.google.com/store/apps/details?id=ai.perplexity.app.android',
        color: '#20B2AA',
    },
    {
        name: 'Grok',
        developer: 'xAI',
        description: 'xAI\'s witty and powerful AI with real-time web access and image generation.',
        appleId: '6670324846',
        appleUrl: 'https://apps.apple.com/gb/app/grok-ai-chat-video/id6670324846',
        androidUrl: 'https://play.google.com/store/apps/details?id=ai.x.grok',
        color: '#1DA1F2',
    },
    {
        name: 'Claude',
        developer: 'Anthropic',
        description: 'Anthropic\'s thoughtful AI assistant — great for analysis, writing, and complex reasoning.',
        appleId: '6473753684',
        appleUrl: 'https://apps.apple.com/us/app/claude-by-anthropic/id6473753684',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.anthropic.claude',
        color: '#D97757',
    },
    {
        name: 'ChatOn AI',
        developer: 'AIBY',
        description: 'Fast AI chat assistant powered by GPT-4 for everyday tasks and creativity.',
        appleId: '1661308505',
        appleUrl: 'https://apps.apple.com/gb/app/chaton-ai-chat-bot-assistant/id1661308505',
        androidUrl: 'https://play.google.com/store/apps/details?id=ai.chat.gpt.bot',
        color: '#7C3AED',
    },
    {
        name: 'CapCut',
        developer: 'Bytedance',
        description: 'AI-powered video editor with auto-captions, effects, and smart editing tools.',
        appleId: '1500855883',
        appleUrl: 'https://apps.apple.com/gb/app/capcut-photo-video-editor/id1500855883',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.lemon.lvoverseas',
        color: '#000000',
    },
    {
        name: 'Notebook LLM',
        developer: 'APTE Ltd',
        description: 'Smart AI note-taker that summarises, organises, and answers questions from your notes.',
        appleId: '6737346766',
        appleUrl: 'https://apps.apple.com/gb/app/notebook-llm-smart-note-taker/id6737346766',
        androidUrl: null,
        color: '#FF6B35',
    },
    {
        name: 'Microsoft Copilot',
        developer: 'Microsoft',
        description: 'Microsoft\'s AI assistant powered by GPT-4 — integrated with search, images, and Office.',
        appleId: '6472538445',
        appleUrl: 'https://apps.apple.com/us/app/microsoft-copilot/id6472538445',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.microsoft.copilot',
        color: '#0078D4',
    },
    {
        name: 'Canva',
        developer: 'Canva',
        description: 'AI-powered design tool for creating stunning graphics, videos, and presentations.',
        appleId: '897446215',
        appleUrl: 'https://apps.apple.com/us/app/canva-ai-video-photo-editor/id897446215',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.canva.editor',
        color: '#8B5CF6',
    },
    {
        name: 'ElevenLabs',
        developer: 'Eleven Labs Inc.',
        description: 'Turn text into ultra-realistic AI voice in seconds — perfect for content creators.',
        appleId: '6743162587',
        appleUrl: 'https://apps.apple.com/us/app/elevenlabs-ai-voice-generator/id6743162587',
        androidUrl: 'https://play.google.com/store/apps/details?id=io.elevenlabs.coreapp',
        color: '#F59E0B',
    },
    {
        name: 'Adobe Express',
        developer: 'Adobe Inc.',
        description: 'Quick AI-powered graphic design, video editing, and content creation for everyone.',
        appleId: '1051937863',
        appleUrl: 'https://apps.apple.com/us/app/adobe-express-create-anything/id1051937863',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.adobe.spark.post',
        color: '#FF0000',
    },
]

function AppCard({ tool, index }) {
    const [iconUrl, setIconUrl] = useState(null)

    useEffect(() => {
        fetch(`https://itunes.apple.com/lookup?id=${tool.appleId}&country=gb`)
            .then(r => r.json())
            .then(data => {
                const artwork = data?.results?.[0]?.artworkUrl512
                if (artwork) setIconUrl(artwork)
            })
            .catch(() => {})
    }, [tool.appleId])

    return (
        <motion.div
            className="glass-card glow-border rounded-2xl p-5 flex flex-col gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            {/* Icon + Info */}
            <div className="flex items-center gap-4">
                {iconUrl ? (
                    <img
                        src={iconUrl}
                        alt={tool.name}
                        className="w-16 h-16 rounded-2xl shadow-lg flex-shrink-0 object-cover"
                    />
                ) : (
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        style={{ backgroundColor: tool.color + '33', border: `1px solid ${tool.color}44` }}
                    >
                        <Smartphone size={28} style={{ color: tool.color }} />
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="font-heading font-bold text-white text-base leading-tight">{tool.name}</h3>
                    <p className="text-xs text-gray-500 font-body mt-0.5">{tool.developer}</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 font-body text-xs leading-relaxed flex-1">{tool.description}</p>

            {/* Download Buttons */}
            <div className="flex flex-col gap-2">
                {/* Apple App Store */}
                <a
                    href={tool.appleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                    <svg className="w-5 h-5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 font-body leading-none">Download on the</p>
                        <p className="text-xs text-white font-heading font-semibold leading-tight">App Store</p>
                    </div>
                </a>

                {/* Google Play */}
                {tool.androidUrl ? (
                    <a
                        href={tool.androidUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                            <path d="M3.18 23.76a2 2 0 0 1-1-.28 2.06 2.06 0 0 1-1-1.82V2.34a2.06 2.06 0 0 1 1-1.82 2 2 0 0 1 2.06.06l17.15 9.66a2.06 2.06 0 0 1 0 3.52L4.24 23.42a2 2 0 0 1-1.06.34z" fill="#00C853"/>
                            <path d="M3.18 23.76a2 2 0 0 1-1-.28L13.5 12 3.12.52a2 2 0 0 1 1.12.16L17.38 8l-7.06 4-7.14 11.76z" fill="#00BFA5"/>
                            <path d="M21.39 13.76 17.38 16l-3.88-4 3.88-4 4.01 2.24a2.06 2.06 0 0 1 0 3.52z" fill="#FFD600"/>
                            <path d="M3.12.52 13.5 12l-3.18 3.18L3.18.8a2 2 0 0 1-.06-.28z" fill="#FF3D00"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 font-body leading-none">Get it on</p>
                            <p className="text-xs text-white font-heading font-semibold leading-tight">Google Play</p>
                        </div>
                    </a>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <svg className="w-5 h-5 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-600 font-body leading-none">iOS only</p>
                            <p className="text-xs text-gray-600 font-heading font-semibold leading-tight">Not on Android</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default function AIToolsShowcase() {
    return (
        <section id="ai-tools" className="section-padding bg-primary-dark relative overflow-hidden">
            <div className="section-divider mb-16" />
            <div className="container-max">
                {/* Heading */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-purple mb-3">Get Started Today</p>
                    <h2 className="heading-lg text-white mb-4">
                        Top <span className="gradient-text">AI Tools</span> to Download
                    </h2>
                    <p className="body-text max-w-xl mx-auto">
                        These are the tools we'll be exploring at the conference. Download them now and come ready to learn.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {tools.map((tool, i) => (
                        <AppCard key={tool.appleId} tool={tool} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}
