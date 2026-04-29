import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Globe } from 'lucide-react'

const tools = [
    // CHATBOTS & ASSISTANTS
    { name: 'ChatGPT', developer: 'OpenAI', description: 'The world\'s most popular AI assistant for writing, coding, and problem-solving.', appleId: '6448311069', appleUrl: 'https://apps.apple.com/gb/app/chatgpt/id6448311069', androidUrl: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt', color: '#10a37f' },
    { name: 'Google Gemini', developer: 'Google', description: 'Google\'s most capable AI model for chat, images, and everyday productivity.', appleId: '6477489729', appleUrl: 'https://apps.apple.com/gb/app/google-gemini/id6477489729', androidUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.bard', color: '#4285F4' },
    { name: 'Claude', developer: 'Anthropic', description: 'Thoughtful AI assistant — great for analysis, writing, and complex reasoning.', appleId: '6473753684', appleUrl: 'https://apps.apple.com/us/app/claude-by-anthropic/id6473753684', androidUrl: 'https://play.google.com/store/apps/details?id=com.anthropic.claude', color: '#D97757' },
    { name: 'Microsoft Copilot', developer: 'Microsoft', description: 'Microsoft\'s AI assistant powered by GPT-4 — integrated with search, images, and Office.', appleId: '6472538445', appleUrl: 'https://apps.apple.com/us/app/microsoft-copilot/id6472538445', androidUrl: 'https://play.google.com/store/apps/details?id=com.microsoft.copilot', color: '#0078D4' },
    { name: 'Perplexity', developer: 'Perplexity AI', description: 'AI-powered search engine that gives direct answers with cited sources.', appleId: '1668000334', appleUrl: 'https://apps.apple.com/gb/app/perplexity-ai-search-chat/id1668000334', androidUrl: 'https://play.google.com/store/apps/details?id=ai.perplexity.app.android', color: '#20B2AA' },
    { name: 'Grok', developer: 'xAI', description: 'xAI\'s witty and powerful AI with real-time web access and image generation.', appleId: '6670324846', appleUrl: 'https://apps.apple.com/gb/app/grok-ai-chat-video/id6670324846', androidUrl: 'https://play.google.com/store/apps/details?id=ai.x.grok', color: '#1DA1F2' },
    { name: 'DeepSeek', developer: 'DeepSeek', description: 'Powerful open-source AI for reasoning, coding, and deep analysis — free to use.', appleId: '6740052297', appleUrl: 'https://apps.apple.com/us/app/deepseek-ai-assistant/id6740052297', androidUrl: 'https://play.google.com/store/apps/details?id=com.deepseek.chat', color: '#4E6EF2' },
    { name: 'Meta AI', developer: 'Meta', description: 'Meta\'s AI assistant built into WhatsApp, Instagram, Facebook, and Messenger.', appleId: '6504781705', appleUrl: 'https://apps.apple.com/us/app/meta-ai/id6504781705', androidUrl: 'https://play.google.com/store/apps/details?id=com.meta.ai', color: '#0668E1' },
    { name: 'Character.AI', developer: 'Character.AI', description: 'Chat with AI characters — from historical figures to your own original creations.', appleId: '1643301733', appleUrl: 'https://apps.apple.com/us/app/character-ai/id1643301733', androidUrl: 'https://play.google.com/store/apps/details?id=com.character.ai', color: '#7C3AED' },
    { name: 'Pi', developer: 'Inflection AI', description: 'Your personal AI — supportive, smart, and always ready for real conversation.', appleId: '6470622846', appleUrl: 'https://apps.apple.com/us/app/pi-your-personal-ai/id6470622846', androidUrl: 'https://play.google.com/store/apps/details?id=ai.inflection.pi', color: '#8B5CF6' },
    { name: 'Replika', developer: 'Luka Inc.', description: 'Your AI companion — available 24/7 to chat, support, and grow with you.', appleId: '1164009626', appleUrl: 'https://apps.apple.com/us/app/replika-virtual-ai-companion/id1164009626', androidUrl: 'https://play.google.com/store/apps/details?id=ai.replika.app', color: '#FF6B81' },
    { name: 'ChatOn AI', developer: 'AIBY', description: 'Fast AI chat assistant powered by GPT-4 for everyday tasks and creativity.', appleId: '1661308505', appleUrl: 'https://apps.apple.com/gb/app/chaton-ai-chat-bot-assistant/id1661308505', androidUrl: 'https://play.google.com/store/apps/details?id=ai.chat.gpt.bot', color: '#9333EA' },
    { name: 'You.com', developer: 'You.com', description: 'AI search engine that lets you chat, research, and create — all in one place.', appleId: '6450299487', appleUrl: 'https://apps.apple.com/us/app/you-com-ai-search-browser/id6450299487', androidUrl: 'https://play.google.com/store/apps/details?id=com.youcom.search', color: '#0EA5E9' },

    // PRODUCTIVITY & WRITING
    { name: 'Grammarly', developer: 'Grammarly', description: 'AI writing assistant that checks grammar, clarity, and tone — everywhere you type.', appleId: '1158877342', appleUrl: 'https://apps.apple.com/us/app/grammarly-keyboard-ai-writing/id1158877342', androidUrl: 'https://play.google.com/store/apps/details?id=com.grammarly.android.keyboard', color: '#15C39A' },
    { name: 'Notion AI', developer: 'Notion Labs', description: 'All-in-one workspace with built-in AI for notes, documents, and project management.', appleId: '1232780281', appleUrl: 'https://apps.apple.com/us/app/notion-notes-docs-tasks/id1232780281', androidUrl: 'https://play.google.com/store/apps/details?id=notion.id', color: '#191919' },
    { name: 'Notebook LLM', developer: 'Google', description: 'Smart AI note-taker that summarises, organises, and answers questions from your notes.', appleId: '6737346766', appleUrl: 'https://apps.apple.com/gb/app/notebook-llm-smart-note-taker/id6737346766', androidUrl: null, color: '#FF6B35' },
    { name: 'Otter.ai', developer: 'Otter.ai', description: 'AI meeting assistant that records, transcribes, and summarises your conversations.', appleId: '1338595184', appleUrl: 'https://apps.apple.com/us/app/otter-ai-voice-meeting-notes/id1338595184', androidUrl: 'https://play.google.com/store/apps/details?id=com.aisense.otter', color: '#7B2FF7' },
    { name: 'Speechify', developer: 'Speechify Inc.', description: 'AI text-to-speech reader — listen to any document, article, or PDF out loud.', appleId: '1209815024', appleUrl: 'https://apps.apple.com/us/app/speechify-audiobook-ai-reader/id1209815024', androidUrl: 'https://play.google.com/store/apps/details?id=com.cliffweitzman.speechifyMobile2', color: '#FF6600' },
    { name: 'QuillBot', developer: 'QuillBot', description: 'AI paraphrasing tool that rewrites text to improve clarity, style, and impact.', appleId: '1619551803', appleUrl: 'https://apps.apple.com/us/app/quillbot-ai-writing-tool/id1619551803', androidUrl: 'https://play.google.com/store/apps/details?id=com.quillbot.quillbot', color: '#00B96B' },
    { name: 'Jasper AI', developer: 'Jasper AI', description: 'AI content platform for writing blogs, ads, emails, and social posts at scale.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://www.jasper.ai', color: '#7C3AED' },
    { name: 'Copy.ai', developer: 'Copy.ai', description: 'Generate marketing copy, product descriptions, and email campaigns in seconds.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://www.copy.ai', color: '#6366F1' },

    // IMAGE & PHOTO AI
    { name: 'Midjourney', developer: 'Midjourney', description: 'One of the most powerful AI image generators — create breathtaking, artistic visuals.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://www.midjourney.com', color: '#000000' },
    { name: 'Adobe Firefly', developer: 'Adobe Inc.', description: 'Adobe\'s generative AI — create stunning images and design assets from text prompts.', appleId: '6451996481', appleUrl: 'https://apps.apple.com/us/app/adobe-firefly/id6451996481', androidUrl: 'https://play.google.com/store/apps/details?id=com.adobe.firefly', color: '#FF0000' },
    { name: 'Canva', developer: 'Canva', description: 'AI-powered design tool for creating graphics, videos, and presentations.', appleId: '897446215', appleUrl: 'https://apps.apple.com/us/app/canva-ai-video-photo-editor/id897446215', androidUrl: 'https://play.google.com/store/apps/details?id=com.canva.editor', color: '#8B5CF6' },
    { name: 'Lensa AI', developer: 'Prisma Labs', description: 'Transform your photos into stunning AI portraits and artistic avatars instantly.', appleId: '1436732536', appleUrl: 'https://apps.apple.com/us/app/lensa-ai-photo-video-editor/id1436732536', androidUrl: 'https://play.google.com/store/apps/details?id=com.lensa.app', color: '#FF4080' },
    { name: 'PhotoRoom', developer: 'PhotoRoom', description: 'AI background removal and photo editing — perfect for product shots and content.', appleId: '1455009060', appleUrl: 'https://apps.apple.com/us/app/photoroom-ai-photo-editor/id1455009060', androidUrl: 'https://play.google.com/store/apps/details?id=com.photoroom.app', color: '#5B21B6' },
    { name: 'Remini', developer: 'Bending Spoons', description: 'Restore and enhance old or blurry photos using AI — bring memories back to life.', appleId: '1470373330', appleUrl: 'https://apps.apple.com/us/app/remini-ai-photo-enhancer/id1470373330', androidUrl: 'https://play.google.com/store/apps/details?id=com.bigwinepot.nwdn.international', color: '#0EA5E9' },
    { name: 'NightCafe', developer: 'NightCafe Studio', description: 'Create stunning AI artwork using multiple styles and models — free to start.', appleId: '1558586638', appleUrl: 'https://apps.apple.com/us/app/nightcafe-ai-art-generator/id1558586638', androidUrl: 'https://play.google.com/store/apps/details?id=com.nightcafe.creator', color: '#1E1B4B' },
    { name: 'Wonder AI', developer: 'Codeway', description: 'Generate breathtaking AI artwork from text prompts in seconds — stunning styles.', appleId: '1549708911', appleUrl: 'https://apps.apple.com/us/app/wonder-ai-art-generator/id1549708911', androidUrl: 'https://play.google.com/store/apps/details?id=com.codeway.wonder', color: '#A855F7' },
    { name: 'Picsart', developer: 'PicsArt Inc.', description: 'All-in-one AI photo and video editor with powerful creative tools and filters.', appleId: '587366035', appleUrl: 'https://apps.apple.com/us/app/picsart-ai-photo-video-editor/id587366035', androidUrl: 'https://play.google.com/store/apps/details?id=com.picsart.studio', color: '#E91E8C' },
    { name: 'Facetune', developer: 'Lightricks', description: 'AI portrait editor for flawless selfies and professionally retouched photos.', appleId: '1149994032', appleUrl: 'https://apps.apple.com/us/app/facetune/id1149994032', androidUrl: 'https://play.google.com/store/apps/details?id=com.lightricks.facetune.free', color: '#FF6B9D' },
    { name: 'Prisma', developer: 'Prisma Labs', description: 'Transform your photos into famous art styles using AI neural networks.', appleId: '1122649300', appleUrl: 'https://apps.apple.com/us/app/prisma-photo-editor/id1122649300', androidUrl: 'https://play.google.com/store/apps/details?id=com.neuralprisma', color: '#FF6B35' },
    { name: 'WOMBO Dream', developer: 'WOMBO', description: 'Turn any text prompt into beautiful AI artwork — fun, fast, and free.', appleId: '1564114621', appleUrl: 'https://apps.apple.com/us/app/wombo-dream-ai-art-generator/id1564114621', androidUrl: 'https://play.google.com/store/apps/details?id=com.womboai.wombobot', color: '#A855F7' },
    { name: 'StarryAI', developer: 'StarryAI Inc.', description: 'Generate stunning AI art and own your creations — multiple styles available.', appleId: '1580512844', appleUrl: 'https://apps.apple.com/us/app/starryai-art-generator-app/id1580512844', androidUrl: 'https://play.google.com/store/apps/details?id=com.starryai', color: '#6366F1' },
    { name: 'Fotor', developer: 'Everimaging', description: 'AI photo editor with one-click enhancements, HDR effects, and portrait retouching.', appleId: '440159963', appleUrl: 'https://apps.apple.com/us/app/fotor-photo-editor-pro/id440159963', androidUrl: 'https://play.google.com/store/apps/details?id=com.everimaging.photoeffectstudio', color: '#F59E0B' },
    { name: 'Meitu', developer: 'Meitu Inc.', description: 'AI beauty and photo editor with powerful face retouching and artistic style tools.', appleId: '416048305', appleUrl: 'https://apps.apple.com/us/app/meitu/id416048305', androidUrl: 'https://play.google.com/store/apps/details?id=com.meitu.meiyancamera', color: '#FF4D6D' },

    // VIDEO AI
    { name: 'CapCut', developer: 'Bytedance', description: 'AI-powered video editor with auto-captions, effects, and smart editing tools.', appleId: '1500855883', appleUrl: 'https://apps.apple.com/gb/app/capcut-photo-video-editor/id1500855883', androidUrl: 'https://play.google.com/store/apps/details?id=com.lemon.lvoverseas', color: '#000000' },
    { name: 'Runway', developer: 'Runway AI', description: 'Professional AI video generation — turn text or images into stunning video clips.', appleId: '1665480845', appleUrl: 'https://apps.apple.com/us/app/runway-ai-video-generator/id1665480845', androidUrl: 'https://play.google.com/store/apps/details?id=com.runwayml.runwayapp', color: '#3B82F6' },
    { name: 'HeyGen', developer: 'HeyGen', description: 'Create AI avatar videos — type your script and generate a professional video.', appleId: '6476834284', appleUrl: 'https://apps.apple.com/us/app/heygen-ai-video-generator/id6476834284', androidUrl: 'https://play.google.com/store/apps/details?id=com.heygen.app', color: '#6366F1' },
    { name: 'InShot', developer: 'InShot Inc.', description: 'Powerful AI video editor with music, filters, smart trim, and text tools.', appleId: '997362198', appleUrl: 'https://apps.apple.com/us/app/inshot-video-editor/id997362198', androidUrl: 'https://play.google.com/store/apps/details?id=com.camerasideas.instashot', color: '#7C2D12' },
    { name: 'Captions', developer: 'Captions AI', description: 'AI auto-captions and smart video editing — perfect for social media creators.', appleId: '1541407293', appleUrl: 'https://apps.apple.com/us/app/captions-ai-video-maker/id1541407293', androidUrl: 'https://play.google.com/store/apps/details?id=com.captions.ai', color: '#EC4899' },
    { name: 'Adobe Express', developer: 'Adobe Inc.', description: 'Quick AI graphic design, video editing, and content creation for everyone.', appleId: '1051937863', appleUrl: 'https://apps.apple.com/us/app/adobe-express-create-anything/id1051937863', androidUrl: 'https://play.google.com/store/apps/details?id=com.adobe.spark.post', color: '#FF0000' },
    { name: 'Pika', developer: 'Pika Labs', description: 'Turn ideas into cinematic AI videos — text to video in seconds.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://pika.art', color: '#7C3AED' },

    // AUDIO & MUSIC AI
    { name: 'ElevenLabs', developer: 'Eleven Labs Inc.', description: 'Turn text into ultra-realistic AI voice in seconds — perfect for content creators.', appleId: '6743162587', appleUrl: 'https://apps.apple.com/us/app/elevenlabs-ai-voice-generator/id6743162587', androidUrl: 'https://play.google.com/store/apps/details?id=io.elevenlabs.coreapp', color: '#F59E0B' },
    { name: 'Suno', developer: 'Suno AI', description: 'Create full original songs from text prompts — vocals, instruments, and lyrics.', appleId: '6473901012', appleUrl: 'https://apps.apple.com/us/app/suno-make-and-explore-music/id6473901012', androidUrl: 'https://play.google.com/store/apps/details?id=com.suno.android', color: '#6D28D9' },
    { name: 'Udio', developer: 'Udio', description: 'Generate professional-quality music in any genre from simple text descriptions.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://www.udio.com', color: '#8B5CF6' },
    { name: 'Murf AI', developer: 'Murf', description: 'Studio-quality AI voice generator with 120+ voices across 20+ languages.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://murf.ai', color: '#F97316' },

    // TRANSLATION & LANGUAGE
    { name: 'DeepL Translate', developer: 'DeepL', description: 'The world\'s most accurate AI translator — supports 30+ languages fluently.', appleId: '1301471852', appleUrl: 'https://apps.apple.com/us/app/deepl-translate/id1301471852', androidUrl: 'https://play.google.com/store/apps/details?id=com.deepl.mobiletranslator', color: '#0F3057' },
    { name: 'Google Translate', developer: 'Google', description: 'Instant AI translation for 100+ languages with real-time camera translation.', appleId: '414706506', appleUrl: 'https://apps.apple.com/us/app/google-translate/id414706506', androidUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.translate', color: '#4285F4' },
    { name: 'Microsoft Translator', developer: 'Microsoft', description: 'AI translation for text, voice, and camera — works offline in 70+ languages.', appleId: '1018345470', appleUrl: 'https://apps.apple.com/us/app/microsoft-translator/id1018345470', androidUrl: 'https://play.google.com/store/apps/details?id=com.microsoft.translator', color: '#00A4EF' },

    // LEARNING & EDUCATION
    { name: 'Duolingo', developer: 'Duolingo', description: 'AI-powered language learning — gamified lessons for 40+ languages, free to start.', appleId: '570060128', appleUrl: 'https://apps.apple.com/us/app/duolingo-language-lessons/id570060128', androidUrl: 'https://play.google.com/store/apps/details?id=com.duolingo', color: '#58CC02' },
    { name: 'Khan Academy', developer: 'Khan Academy', description: 'Free AI-powered education with Khanmigo tutor — any subject, any level.', appleId: '469863705', appleUrl: 'https://apps.apple.com/us/app/khan-academy/id469863705', androidUrl: 'https://play.google.com/store/apps/details?id=org.khanacademy.android', color: '#14BF96' },

    // AI DESIGN & PRESENTATION
    { name: 'Gamma', developer: 'Gamma', description: 'Create beautiful AI-powered presentations, documents, and web pages instantly.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://gamma.app', color: '#6366F1' },
    { name: 'Beautiful.ai', developer: 'Beautiful.ai', description: 'AI presentation maker that designs slides for you — smart, fast, and stunning.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://www.beautiful.ai', color: '#FF6B35' },

    // AI CODING
    { name: 'GitHub Copilot', developer: 'GitHub', description: 'AI pair programmer that writes code, suggests completions, and explains logic.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://github.com/features/copilot', color: '#24292E' },
    { name: 'Cursor', developer: 'Anysphere', description: 'AI-first code editor — write, edit, and debug code with natural language.', appleId: null, appleUrl: null, androidUrl: null, webUrl: 'https://www.cursor.com', color: '#000000' },
]

function AppCard({ tool, index }) {
    const [iconUrl, setIconUrl] = useState(null)
    const isWebOnly = !tool.appleUrl && !tool.androidUrl && tool.webUrl

    useEffect(() => {
        if (!tool.appleId) return
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
            transition={{ delay: (index % 12) * 0.05, duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <div className="flex items-center gap-4">
                {iconUrl ? (
                    <img src={iconUrl} alt={tool.name} className="w-16 h-16 rounded-2xl shadow-lg flex-shrink-0 object-cover" />
                ) : (
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        style={{ backgroundColor: tool.color + '33', border: `1px solid ${tool.color}44` }}
                    >
                        {isWebOnly
                            ? <Globe size={28} style={{ color: tool.color }} />
                            : <Smartphone size={28} style={{ color: tool.color }} />
                        }
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="font-heading font-bold text-white text-base leading-tight">{tool.name}</h3>
                    <p className="text-xs text-gray-500 font-body mt-0.5">{tool.developer}</p>
                    {isWebOnly && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 font-body">Web App</span>
                    )}
                </div>
            </div>

            <p className="text-gray-400 font-body text-xs leading-relaxed flex-1">{tool.description}</p>

            <div className="flex flex-col gap-2">
                {isWebOnly ? (
                    <>
                        <a
                            href={tool.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <Globe className="w-5 h-5 text-white flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-400 font-body leading-none">Open in</p>
                                <p className="text-xs text-white font-heading font-semibold leading-tight">Web Browser</p>
                            </div>
                        </a>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                            <Smartphone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-600 font-body leading-none">No mobile app</p>
                                <p className="text-xs text-gray-600 font-heading font-semibold leading-tight">Desktop recommended</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {tool.appleUrl && (
                            <a
                                href={tool.appleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-gray-400 font-body leading-none">Download on the</p>
                                    <p className="text-xs text-white font-heading font-semibold leading-tight">App Store</p>
                                </div>
                            </a>
                        )}

                        {tool.androidUrl ? (
                            <a
                                href={tool.androidUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                    <path d="M3.18 23.76a2 2 0 0 1-1-.28 2.06 2.06 0 0 1-1-1.82V2.34a2.06 2.06 0 0 1 1-1.82 2 2 0 0 1 2.06.06l17.15 9.66a2.06 2.06 0 0 1 0 3.52L4.24 23.42a2 2 0 0 1-1.06.34z" fill="#00C853" />
                                    <path d="M3.18 23.76a2 2 0 0 1-1-.28L13.5 12 3.12.52a2 2 0 0 1 1.12.16L17.38 8l-7.06 4-7.14 11.76z" fill="#00BFA5" />
                                    <path d="M21.39 13.76 17.38 16l-3.88-4 3.88-4 4.01 2.24a2.06 2.06 0 0 1 0 3.52z" fill="#FFD600" />
                                    <path d="M3.12.52 13.5 12l-3.18 3.18L3.18.8a2 2 0 0 1-.06-.28z" fill="#FF3D00" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-gray-400 font-body leading-none">Get it on</p>
                                    <p className="text-xs text-white font-heading font-semibold leading-tight">Google Play</p>
                                </div>
                            </a>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-gray-600 font-body leading-none">iOS only</p>
                                    <p className="text-xs text-gray-600 font-heading font-semibold leading-tight">Not on Android</p>
                                </div>
                            </div>
                        )}
                    </>
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
                    <p className="text-slate-600 text-sm font-body mt-3">{tools.length} tools across all categories</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {tools.map((tool, i) => (
                        <AppCard key={tool.name} tool={tool} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}
