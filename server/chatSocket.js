const ChatSession = require('./models/ChatSession')
const Registration = require('./models/Registration')
const { sendConfirmationEmail } = require('./utils/mailer')
const { Op } = require('sequelize')

// Smart AI auto-responder — knows about AI for Everybody event
const AI_NAME = 'Mindset AI'
const AI_RESPONSES = {
    greetings: [
        "Hey! 😊 Welcome — really glad you stopped by. What can I do for you today?",
        "Hi there! Thanks for reaching out. How can I help you?",
        "Hello! 👋 Good to see you here. What's on your mind?",
        "Hey, welcome! Feel free to ask me anything — I'm here to help.",
    ],
    event: [
        "So AI for Everybody is basically our way of making AI accessible to everyone across Africa. Think of it as a full day where you'll learn how AI tools like ChatGPT can actually help in your day-to-day life — whether that's in your job, your business, or just making things easier. No tech background needed at all!",
        "Great question! AI for Everybody is a free event where we bring together experts and everyday people to explore AI together. The whole point is that you don't need to be a techie — we'll break everything down in a way that makes sense. It's happening March 21, 2026, and honestly, it's going to be amazing.",
        "It's an event we're really excited about! The idea is simple — AI is changing the world, and everyone deserves to understand it and use it. So we've put together a day of talks, demos, and hands-on sessions that'll take you from zero to confident with AI tools.",
    ],
    date: [
        "It's happening on March 21, 2026! 📅 Definitely save that date — you don't want to miss it.",
        "March 21, 2026 is the big day! We're putting the final touches on everything now. Have you registered yet?",
        "The date is March 21, 2026. It's coming up pretty quickly actually — make sure you grab your spot!",
    ],
    registration: [
        "Super easy! Just scroll down on our website and you'll see the registration form. Fill in your details and you're done — takes about a minute. Oh, and it's completely free! 🎉",
        "You can register right here on the site — there's a form on the homepage. Literally takes a minute, and there's no cost at all. Or if you'd like, I can actually register you right here in this chat! Just say 'register me' and I'll walk you through it.",
        "The easiest way is through the form on our website. But honestly, I can also help you register right here if you want — just tell me and I'll get you sorted!",
    ],
    topics: [
        "Oh, we've got a packed schedule! We're covering things like:\n\n• How to use ChatGPT and AI assistants effectively\n• AI for business and entrepreneurship\n• AI in healthcare and education\n• Prompt engineering (basically, how to talk to AI properly)\n• Hands-on workshops where you'll actually build things\n\nThe cool part is everything's designed for real-world use — not just theory.",
        "We're covering a lot of ground! From the basics of what AI actually is, to hands-on stuff with ChatGPT, AI for your business, AI in education and healthcare, and even some advanced topics for those who want to dive deeper. There'll be workshops too, so you'll get to practice, not just listen.",
    ],
    cost: [
        "It's completely free! 🎊 Seriously — no hidden fees, no catch. We genuinely believe everyone should have access to AI education, regardless of their budget.",
        "100% free! We made that decision early on because we want to remove every barrier to learning about AI. Just register and show up — that's all you need.",
        "No cost at all — it's free! We think AI education should be available to everyone, so we made sure money isn't a factor.",
    ],
    who: [
        "Honestly? Everyone! That's kind of the whole point of the name 😄 But specifically, we see a lot of students, entrepreneurs, job seekers, educators, and professionals attending. You definitely don't need any technical background — we start from the basics.",
        "Anyone who's curious about AI! We've designed the event so it doesn't matter if you've never touched a computer or if you're already using ChatGPT daily. There's something for every level. Students, business owners, teachers, you name it.",
        "The event is literally for everybody — that's why we called it that 😊 Whether you're a complete beginner or already playing with AI tools, you'll find sessions that are right for your level.",
    ],
    contact: [
        "You can always reach us at hello@mindsetai.co.uk 📧 Or honestly, just ask me anything right here — I'm pretty good at answering questions! If I can't help, I'll make sure a human team member gets back to you.",
        "Best way is right here in this chat! But if you prefer email, you can reach our team at hello@mindsetai.co.uk. We usually respond within a few hours.",
    ],
    speakers: [
        "We've got some really impressive speakers lined up — tech leaders, AI researchers, successful entrepreneurs, and educators who are super passionate about Africa's AI future. 🌍 I don't want to spoil all the surprises, but let's just say you'll be learning from people who are actually doing this stuff, not just talking about it.",
        "Without giving too much away, we've brought together some brilliant minds from tech, business, and education. People who are actively using AI to make a difference. The lineup is going to be announced fully very soon!",
    ],
    location: [
        "The event details including the exact venue are on our website. Make sure you register to get all the location info sent directly to your email!",
        "Check out our website for the full venue details! Once you register, we'll send you everything you need — directions, schedule, the works.",
    ],
    whatIsAI: [
        "Great question! AI — or artificial intelligence — is basically when computers can do things that normally require human intelligence. Think of ChatGPT writing text, or your phone recognizing your face. It's not sci-fi anymore, it's something you can use right now in your daily life. That's actually what our event is all about — showing you how!",
        "In simple terms, AI is technology that can learn, understand, and make decisions kind of like humans do. You've probably already used it without realizing — Google search, Netflix recommendations, even your phone's autocorrect. Our event will show you how to use it more intentionally to actually improve your life and work.",
    ],
    chatgpt: [
        "ChatGPT is an AI tool made by OpenAI — think of it like a super smart assistant you can have a conversation with. You can ask it to write emails, explain concepts, help with homework, brainstorm ideas, create content... honestly the list goes on. We'll be doing hands-on sessions with it at the event!",
        "It's essentially an AI you can talk to that understands natural language. You can use it for writing, learning, coding, brainstorming — pretty much anything that involves text. And the best part? You don't need to be techy to use it. We'll show you exactly how at the event.",
    ],
    howToUseAI: [
        "There are so many ways! Here are some things people use AI for right now:\n\n• Writing emails and documents faster\n• Learning new topics (it's like having a personal tutor)\n• Running a business — marketing, customer service, data analysis\n• Creating content for social media\n• Coding and building apps\n• Research and summarizing long documents\n\nAt our event, we'll walk you through all of this hands-on!",
        "The possibilities are pretty wild honestly. You can use AI to write, learn, create, organize, and automate so many things. The key is knowing how to ask it the right questions — that's called prompt engineering, and we've got a whole session on it at the event. Would you like to register and learn in person?",
    ],
    africanContext: [
        "That's exactly why we started this! AI has massive potential in Africa — from agriculture to fintech to healthcare. The continent is already seeing incredible AI innovations, and we believe every African should understand and benefit from these tools. Our event focuses specifically on how AI applies to our context.",
        "Africa is actually at an exciting point with AI right now. There are startups and innovations popping up all over the continent. Our event specifically looks at how AI can be used in African contexts — whether that's business, education, agriculture, or healthcare. It's really inspiring stuff.",
    ],
    career: [
        "AI skills are becoming huge for careers right now. Companies everywhere are looking for people who understand AI — even if you're not a developer. Knowing how to use AI tools effectively can set you apart in basically any field. Our event will help you build exactly those skills!",
        "Honestly, learning about AI is one of the best moves you can make for your career right now. Every industry is being impacted — marketing, finance, healthcare, education, you name it. Even basic AI literacy makes you more valuable. That's what our event is all about — giving you practical skills you can use immediately.",
    ],
    business: [
        "AI can be a real game-changer for businesses! You can use it for:\n\n• Automating customer support\n• Writing marketing copy and social media content\n• Analyzing your data and finding insights\n• Streamlining operations\n• Personalizing customer experiences\n\nWe have specific sessions for entrepreneurs at the event — definitely worth checking out!",
        "If you're running a business, AI can genuinely save you hours every week. Things like content creation, email responses, data analysis, even market research — AI can help with all of it. And the best part is you don't need a tech team to get started. We cover this in detail at the event!",
    ],
    thanks: [
        "You're welcome! 😊 Happy to help. Let me know if anything else comes to mind!",
        "No problem at all! That's what I'm here for. Feel free to come back anytime if you have more questions.",
        "Anytime! 😊 Don't hesitate to ask if you think of anything else.",
    ],
    goodbye: [
        "Take care! 👋 Hope to see you at the event on March 21! Don't forget to register if you haven't already.",
        "Bye for now! 👋 Really hope you can make it to the event. It's going to be great!",
        "See you later! Looking forward to hopefully meeting you at AI for Everybody. Cheers! ✌️",
    ],
    help: [
        "Of course! Here's what I can help you with:\n\n📅 Event date and schedule\n📝 Registration (I can even register you right here!)\n📚 Topics we'll cover\n🎤 Our speakers\n💰 Pricing (spoiler: it's free!)\n👥 Who should attend\n🤖 What AI is and how to use it\n💼 AI for your career or business\n\nJust ask away — no question is too basic!",
    ],
    nameQuestion: [
        "I can see the name you shared when starting the chat! But beyond that, I'm not able to remember personal details between sessions. How can I help you today?",
        "I know the name you entered when you started chatting! Is there anything about the event or AI I can help you with? 😊",
    ],
    identity: [
        "I'm Mindset AI! 😊 I'm part of the AI for Everybody team, here to help you with questions about the event, AI topics, registration, and more.",
        "Great question! I'm Mindset AI, the virtual assistant for AI for Everybody. I can help you with event details, registration, and all things AI!",
        "I'm Mindset AI — your friendly assistant for the AI for Everybody event. Think of me as your go-to for event info, AI questions, and registration help!",
    ],
    fallback: [
        "Hmm, that's an interesting one! I want to make sure I give you a proper answer. Could you rephrase that or give me a bit more context? I'm pretty knowledgeable about AI, the event, registration, and related topics.",
        "I'm not 100% sure I understood that correctly. Could you say that a different way? I can help with things like event details, registration, AI questions, career advice around AI, and more!",
        "That's a bit outside what I know about right now, but I'd love to help if you could rephrase. Or if you'd prefer, I can connect you with a human team member who might have the answer!",
        "Interesting question! I might need a bit more context to give you a good answer. Feel free to rephrase, or ask me about the event, AI in general, registration, careers — I'm pretty good with those topics!",
    ],
}

const REGISTRATION_PROFESSIONS = [
    'Student',
    'Graduate',
    'Job Seeker',
    'Public Sector Worker',
    'Private Sector Worker',
    'Entrepreneur',
    'Educator/Lecturer',
    'Faith Leader',
    'Other',
]

const REGISTRATION_EXPERIENCES = [
    'Complete Beginner',
    'Heard of AI but never used it',
    'Used ChatGPT/Claude a few times',
    'Regular AI user',
]

const REGISTRATION_REFERRALS = [
    'WhatsApp',
    'Social Media',
    'Friend/Colleague',
    'Flyer/Poster',
    'Website',
    'Other',
]

const REGISTRATION_REVIEW_FIELDS = [
    { number: '1', key: 'full_name', label: 'Full Name' },
    { number: '2', key: 'email', label: 'Email' },
    { number: '3', key: 'phone', label: 'Phone' },
    { number: '4', key: 'profession', label: 'Profession' },
    { number: '5', key: 'ai_experience', label: 'AI Experience' },
    { number: '6', key: 'learning_goals', label: 'Learning Goals' },
    { number: '7', key: 'referral_source', label: 'Referral Source' },
]

const registrationFlows = new Map()

function getAIResponse(message) {
    const msg = message.toLowerCase().trim()

    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|yo|hiya|what'?s up|whats up|bonjour|salut)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.greetings)
    }

    // Thanks
    if (/\b(thank|thanks|cheers|appreciate|merci|grateful)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.thanks)
    }

    // Goodbye
    if (/\b(bye|goodbye|see you|later|take care|gotta go|got to go|au revoir)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.goodbye)
    }

    // Help / what can you do
    if (/^(help|menu|options|what can you do|how can you help)\b/i.test(msg) || msg === '?' || msg === 'help') {
        return pickRandom(AI_RESPONSES.help)
    }

    // Name questions
    if (/\b(my name|who am i|know me|remember me|what'?s my name)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.nameQuestion)
    }

    // Bot identity
    if (/\b(your name|who are you|what are you|are you.*bot|are you.*ai|are you.*human|are you.*real)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.identity)
    }

    // What is AI / explain AI
    if (/\b(what is ai|what'?s ai|explain ai|define ai|meaning of ai|artificial intelligence)\b/i.test(msg) && !/what is ai for everybody/i.test(msg)) {
        return pickRandom(AI_RESPONSES.whatIsAI)
    }

    // ChatGPT specific
    if (/\b(chatgpt|chat gpt|gpt|openai|claude|gemini|bard)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.chatgpt)
    }

    // How to use AI
    if (/\b(how.*(use|start|begin|learn).*ai|use ai|ai tools?|ai app)\b/i.test(msg) || /\b(what can ai do|ai.*(help|useful|purpose))\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.howToUseAI)
    }

    // Career / job related
    if (/\b(career|job|employ|hire|hiring|cv|resume|skill|profession|work|salary|income).*ai\b/i.test(msg) || /\bai.*(career|job|employ|skill|work)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.career)
    }

    // Business related
    if (/\b(business|entrepreneur|startup|start-up|company|marketing|sales|revenue|profit).*ai\b/i.test(msg) || /\bai.*(business|entrepreneur|startup|company|marketing)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.business)
    }

    // Africa / local context
    if (/\b(africa|african|cameroon|nigeria|kenya|ghana|continent|developing)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.africanContext)
    }

    // Event info
    if (/\b(what.*(event|about|is this|ai for everybody)|tell me about|what is this|what'?s this)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.event)
    }

    // Date / schedule
    if (/\b(when|date|time|schedule|march|day|what day|timing|duration|how long)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.date)
    }

    // Location / venue
    if (/\b(where|location|venue|place|address|directions|map|city|town)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.location)
    }

    // Registration
    if (/\b(register|sign up|join|how.*(join|register|attend|participate|get in)|apply|application|enroll)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.registration)
    }

    // Topics
    if (/\b(topic|what.*learn|what.*cover|curriculum|subject|workshop|session|agenda|programme|program|content)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.topics)
    }

    // Cost / pricing
    if (/\b(cost|price|fee|free|pay|charge|money|ticket|how much|expensive|afford|budget)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.cost)
    }

    // Who should attend
    if (/\b(who.*(attend|come|for|joining|target)|audience|beginner|requirement|prerequisite|eligible|qualification)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.who)
    }

    // Contact
    if (/\b(contact|email|reach|phone|call|whatsapp|number|social media|instagram|facebook|twitter)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.contact)
    }

    // Speakers
    if (/\b(speaker|presenter|who.*speaking|expert|facilitator|trainer|instructor|lecturer|panelist)\b/i.test(msg)) {
        return pickRandom(AI_RESPONSES.speakers)
    }

    return pickRandom(AI_RESPONSES.fallback)
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function isRegistrationIntent(message = '') {
    const text = message.toLowerCase()
    return (
        /(register|registration|sign me up|sign-up|sign up|enroll|enrol|join this event|interested to join|interest to join)/i.test(text) &&
        !/(how|where|when).*register/i.test(text)
    )
}

function isSkipValue(value = '') {
    return /^(skip|none|n\/a|na|no)$/i.test(value.trim())
}

function normalizeWhitespace(text = '') {
    return text.replace(/\s+/g, ' ').trim()
}

function validateEmail(value = '') {
    const email = normalizeWhitespace(value).toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
    return email
}

function normalizePhone(value = '') {
    const phone = normalizeWhitespace(value)
    const digits = phone.replace(/[^\d]/g, '')
    if (digits.length < 8) return null
    return phone
}

function getCountryCodeFromPhone(phone = '') {
    const match = phone.match(/^\+\d{1,4}/)
    return match ? match[0] : '+237'
}

function matchFromOptions(rawValue = '', options = []) {
    const value = normalizeWhitespace(rawValue)
    if (!value) return null

    const byIndex = Number.parseInt(value, 10)
    if (!Number.isNaN(byIndex) && byIndex >= 1 && byIndex <= options.length) {
        return options[byIndex - 1]
    }

    const normalized = value.toLowerCase()
    const exact = options.find((opt) => opt.toLowerCase() === normalized)
    if (exact) return exact

    const contains = options.find((opt) => opt.toLowerCase().includes(normalized) || normalized.includes(opt.toLowerCase()))
    if (contains) return contains

    return null
}

function matchProfession(rawValue = '') {
    const normalized = rawValue.toLowerCase()

    if (/educator|lecturer|teacher/.test(normalized)) return 'Educator/Lecturer'
    if (/job/.test(normalized)) return 'Job Seeker'
    if (/public/.test(normalized)) return 'Public Sector Worker'
    if (/private/.test(normalized)) return 'Private Sector Worker'
    if (/entrepreneur|business|founder/.test(normalized)) return 'Entrepreneur'
    if (/faith|pastor|church|imam|relig/.test(normalized)) return 'Faith Leader'

    return matchFromOptions(rawValue, REGISTRATION_PROFESSIONS)
}

function matchExperience(rawValue = '') {
    const normalized = rawValue.toLowerCase()

    if (/beginner|new|never used/.test(normalized)) return 'Complete Beginner'
    if (/heard/.test(normalized)) return 'Heard of AI but never used it'
    if (/few|sometimes|once|twice|chatgpt/.test(normalized)) return 'Used ChatGPT/Claude a few times'
    if (/regular|daily|often|advanced|expert/.test(normalized)) return 'Regular AI user'

    return matchFromOptions(rawValue, REGISTRATION_EXPERIENCES)
}

function matchReferral(rawValue = '') {
    const normalized = rawValue.toLowerCase()

    if (/whatsapp/.test(normalized)) return 'WhatsApp'
    if (/social|facebook|instagram|twitter|x|linkedin|tiktok/.test(normalized)) return 'Social Media'
    if (/friend|colleague|coworker|co-worker/.test(normalized)) return 'Friend/Colleague'
    if (/flyer|poster/.test(normalized)) return 'Flyer/Poster'
    if (/website|site|web/.test(normalized)) return 'Website'

    return matchFromOptions(rawValue, REGISTRATION_REFERRALS)
}

function getProfessionPrompt() {
    return `Great. What's your profession?\n1. Student\n2. Graduate\n3. Job Seeker\n4. Public Sector Worker\n5. Private Sector Worker\n6. Entrepreneur\n7. Educator/Lecturer\n8. Faith Leader\n9. Other\n(Reply with number or text)`
}

function getExperiencePrompt() {
    return `What's your AI experience level?\n1. Complete Beginner\n2. Heard of AI but never used it\n3. Used ChatGPT/Claude a few times\n4. Regular AI user\n(Reply with number or text)`
}

function getReferralPrompt() {
    return `How did you hear about this event?\n1. WhatsApp\n2. Social Media\n3. Friend/Colleague\n4. Flyer/Poster\n5. Website\n6. Other\n(Reply with number, text, or type "skip")`
}

function getRegistrationStartPrompt() {
    return "Absolutely, I can register you right here. Let's do it now.\nWhat's your full name?"
}

function getRegistrationReviewPrompt(data = {}) {
    const lines = REGISTRATION_REVIEW_FIELDS.map((field) => {
        const value = data[field.key]
        return `${field.number}. ${field.label}: ${value && String(value).trim() ? value : 'Not provided'}`
    })

    return `Please confirm your registration details:\n${lines.join('\n')}\n\nReply "confirm" to submit, or "edit <number>" to change any answer.`
}

function getReviewFieldByNumber(number = '') {
    return REGISTRATION_REVIEW_FIELDS.find((field) => field.number === String(number))
}

function parseEditFieldNumber(message = '') {
    const text = normalizeWhitespace(message)
    if (!text) return null

    const namedMatch = text.match(/^(edit|change|update)\s+(\d+)$/i)
    if (namedMatch) {
        const field = getReviewFieldByNumber(namedMatch[2])
        return field ? field.number : null
    }

    const directMatch = text.match(/^(\d+)$/)
    if (directMatch) {
        const field = getReviewFieldByNumber(directMatch[1])
        return field ? field.number : null
    }

    return null
}

function getEditPrompt(fieldKey = '') {
    if (fieldKey === 'full_name') return 'Please send the correct full name.'
    if (fieldKey === 'email') return 'Please send the correct email address.'
    if (fieldKey === 'phone') return 'Please send the correct phone number.'
    if (fieldKey === 'profession') return getProfessionPrompt()
    if (fieldKey === 'ai_experience') return getExperiencePrompt()
    if (fieldKey === 'learning_goals') return 'Please send the correct learning goals, or type "skip".'
    if (fieldKey === 'referral_source') return getReferralPrompt()
    return 'Please send the updated value.'
}

// Simulate human-like typing delay
function getTypingDelay(text) {
    const words = text.split(' ').length
    const baseDelay = 800 + Math.random() * 600  // 800-1400ms "thinking"
    const typingTime = words * 120 + Math.random() * 300 // ~120ms per word
    return Math.min(baseDelay + typingTime, 4000) // cap at 4 seconds
}

// Extract IP from socket
function getSocketIP(socket) {
    const forwarded = socket.handshake.headers['x-forwarded-for']
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return socket.handshake.address?.replace('::ffff:', '') || 'unknown'
}

module.exports = function setupChat(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`)

        const emitVisitorHistory = async (browser_id) => {
            if (!browser_id) {
                socket.emit('chat:visitor_history', { sessions: [] })
                return
            }

            const sessions = await ChatSession.findAll({
                where: { browser_id },
                order: [['createdAt', 'DESC']],
                limit: 10,
            })

            socket.emit('chat:visitor_history', { sessions })
        }

        const pushAIMessage = async (sessionId, text, { withTyping = true } = {}) => {
            const latest = await ChatSession.findByPk(sessionId)
            if (!latest || latest.status !== 'waiting') return

            const msg = {
                sender: 'ai',
                text,
                timestamp: new Date().toISOString(),
            }

            const msgs = [...(latest.messages || [])]
            msgs.push(msg)
            await latest.update({ messages: msgs })

            if (!withTyping) {
                io.to(sessionId).emit('chat:message', { sessionId, ...msg })
                io.to('admins').emit('chat:message_update', { sessionId, message: msg })
                return
            }

            io.to(sessionId).emit('chat:typing', { sessionId, sender: 'ai' })
            const delay = getTypingDelay(text)
            setTimeout(async () => {
                const fresh = await ChatSession.findByPk(sessionId)
                if (!fresh || fresh.status !== 'waiting') return
                io.to(sessionId).emit('chat:stop_typing', { sessionId })
                io.to(sessionId).emit('chat:message', { sessionId, ...msg })
                io.to('admins').emit('chat:message_update', { sessionId, message: msg })
            }, delay)
        }

        const startRegistrationFlow = async (sessionId) => {
            registrationFlows.set(sessionId, {
                step: 'full_name',
                data: {},
            })
            await pushAIMessage(sessionId, getRegistrationStartPrompt())
        }

        const completeRegistration = async (sessionId, flowData) => {
            const existing = await Registration.findOne({ where: { email: flowData.email } })
            if (existing) {
                registrationFlows.delete(sessionId)
                await pushAIMessage(sessionId, 'This email is already registered. If this is you, you are already on the registrations list.')
                return true
            }

            const registrationPayload = {
                full_name: flowData.full_name,
                email: flowData.email,
                phone: flowData.phone,
                country_code: flowData.country_code || '+237',
                profession: flowData.profession,
                ai_experience: flowData.ai_experience,
                learning_goals: flowData.learning_goals || null,
                referral_source: flowData.referral_source || null,
            }

            const registration = await Registration.create(registrationPayload)
            sendConfirmationEmail(registration).then((sent) => {
                if (sent) {
                    Registration.update({ confirmation_sent: true }, { where: { id: registration.id } })
                }
            })

            io.to('admins').emit('admin:new_registration', {
                id: registration.id,
                full_name: registration.full_name,
                email: registration.email,
                phone: registration.phone,
                profession: registration.profession,
                ai_experience: registration.ai_experience,
                status: registration.status,
                createdAt: registration.createdAt,
                source: 'chat',
            })

            registrationFlows.delete(sessionId)
            await pushAIMessage(
                sessionId,
                `Done, you are registered successfully. Your registration ID is ${registration.id}. Check your email for confirmation.`
            )
            return true
        }

        const processRegistrationFlow = async (sessionId, message) => {
            const flow = registrationFlows.get(sessionId)
            if (!flow) return false

            const answer = normalizeWhitespace(message)
            if (!answer) {
                await pushAIMessage(sessionId, 'Please share your answer so I can continue your registration.')
                return true
            }

            if (flow.step === 'review') {
                if (/^(confirm|yes|y|correct|submit|done)$/i.test(answer)) {
                    await completeRegistration(sessionId, flow.data)
                    return true
                }

                const editFieldNumber = parseEditFieldNumber(answer)
                if (editFieldNumber) {
                    const field = getReviewFieldByNumber(editFieldNumber)
                    flow.step = 'edit_field'
                    flow.editingField = field.key
                    await pushAIMessage(sessionId, `Updating ${field.label}.\n${getEditPrompt(field.key)}`)
                    return true
                }

                if (/^(no|not|wrong|incorrect)$/i.test(answer)) {
                    await pushAIMessage(sessionId, 'No problem. Reply with "edit <number>" to change a field. Example: edit 2')
                    return true
                }

                await pushAIMessage(sessionId, 'Please reply "confirm" to submit, or "edit <number>" to update an answer.')
                return true
            }

            if (flow.step === 'edit_field') {
                const fieldKey = flow.editingField
                if (!fieldKey) {
                    flow.step = 'review'
                    await pushAIMessage(sessionId, getRegistrationReviewPrompt(flow.data))
                    return true
                }

                if (fieldKey === 'full_name') {
                    if (answer.length < 2) {
                        await pushAIMessage(sessionId, 'Full name must be at least 2 characters. Please send it again.')
                        return true
                    }
                    flow.data.full_name = answer
                } else if (fieldKey === 'email') {
                    const email = validateEmail(answer)
                    if (!email) {
                        await pushAIMessage(sessionId, 'Please enter a valid email address (example: you@example.com).')
                        return true
                    }
                    const existing = await Registration.findOne({ where: { email } })
                    if (existing) {
                        await pushAIMessage(sessionId, 'This email is already registered. Please provide another email.')
                        return true
                    }
                    flow.data.email = email
                } else if (fieldKey === 'phone') {
                    const phone = normalizePhone(answer)
                    if (!phone) {
                        await pushAIMessage(sessionId, 'Please send a valid phone number (minimum 8 digits).')
                        return true
                    }
                    flow.data.phone = phone
                    flow.data.country_code = getCountryCodeFromPhone(phone)
                } else if (fieldKey === 'profession') {
                    const profession = matchProfession(answer)
                    if (!profession) {
                        await pushAIMessage(sessionId, `I couldn't match that profession.\n${getProfessionPrompt()}`)
                        return true
                    }
                    flow.data.profession = profession
                } else if (fieldKey === 'ai_experience') {
                    const aiExperience = matchExperience(answer)
                    if (!aiExperience) {
                        await pushAIMessage(sessionId, `I couldn't match that AI experience level.\n${getExperiencePrompt()}`)
                        return true
                    }
                    flow.data.ai_experience = aiExperience
                } else if (fieldKey === 'learning_goals') {
                    flow.data.learning_goals = isSkipValue(answer) ? null : answer
                } else if (fieldKey === 'referral_source') {
                    if (isSkipValue(answer)) {
                        flow.data.referral_source = null
                    } else {
                        const referral = matchReferral(answer)
                        if (!referral) {
                            await pushAIMessage(sessionId, `I couldn't match that source.\n${getReferralPrompt()}`)
                            return true
                        }
                        flow.data.referral_source = referral
                    }
                }

                flow.step = 'review'
                flow.editingField = null
                await pushAIMessage(sessionId, getRegistrationReviewPrompt(flow.data))
                return true
            }

            if (flow.step === 'full_name') {
                if (answer.length < 2) {
                    await pushAIMessage(sessionId, 'Please share your full name (at least 2 characters).')
                    return true
                }
                flow.data.full_name = answer
                flow.step = 'email'
                await pushAIMessage(sessionId, 'Thanks. What is your email address?')
                return true
            }

            if (flow.step === 'email') {
                const email = validateEmail(answer)
                if (!email) {
                    await pushAIMessage(sessionId, 'Please enter a valid email address (example: you@example.com).')
                    return true
                }

                const existing = await Registration.findOne({ where: { email } })
                if (existing) {
                    registrationFlows.delete(sessionId)
                    await pushAIMessage(sessionId, 'This email is already registered. If this is you, you are already on the registrations list.')
                    return true
                }

                flow.data.email = email
                flow.step = 'phone'
                await pushAIMessage(sessionId, 'Great. What phone number should we use?')
                return true
            }

            if (flow.step === 'phone') {
                const phone = normalizePhone(answer)
                if (!phone) {
                    await pushAIMessage(sessionId, 'Please send a valid phone number (minimum 8 digits).')
                    return true
                }
                flow.data.phone = phone
                flow.data.country_code = getCountryCodeFromPhone(phone)
                flow.step = 'profession'
                await pushAIMessage(sessionId, getProfessionPrompt())
                return true
            }

            if (flow.step === 'profession') {
                const profession = matchProfession(answer)
                if (!profession) {
                    await pushAIMessage(sessionId, `I couldn't match that profession.\n${getProfessionPrompt()}`)
                    return true
                }
                flow.data.profession = profession
                flow.step = 'ai_experience'
                await pushAIMessage(sessionId, getExperiencePrompt())
                return true
            }

            if (flow.step === 'ai_experience') {
                const aiExperience = matchExperience(answer)
                if (!aiExperience) {
                    await pushAIMessage(sessionId, `I couldn't match that AI experience level.\n${getExperiencePrompt()}`)
                    return true
                }
                flow.data.ai_experience = aiExperience
                flow.step = 'learning_goals'
                await pushAIMessage(sessionId, 'What are your learning goals for this event? (Type "skip" if none)')
                return true
            }

            if (flow.step === 'learning_goals') {
                flow.data.learning_goals = isSkipValue(answer) ? null : answer
                flow.step = 'referral_source'
                await pushAIMessage(sessionId, getReferralPrompt())
                return true
            }

            if (flow.step === 'referral_source') {
                if (isSkipValue(answer)) {
                    flow.data.referral_source = null
                } else {
                    const referral = matchReferral(answer)
                    if (!referral) {
                        await pushAIMessage(sessionId, `I couldn't match that source.\n${getReferralPrompt()}`)
                        return true
                    }
                    flow.data.referral_source = referral
                }
                flow.step = 'review'
                await pushAIMessage(sessionId, getRegistrationReviewPrompt(flow.data))
                return true
            }

            registrationFlows.delete(sessionId)
            await pushAIMessage(sessionId, 'Registration flow reset. Say "register me" and I will start again.')
            return true
        }

        // ==================
        // VISITOR starts chat
        // ==================
        socket.on('visitor:start', async (data) => {
            try {
                const { name, email, phone, browser_id } = data
                const visitorIP = getSocketIP(socket)
                const sessionId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

                // Check for returning visitor
                let previousSessions = []
                if (browser_id) {
                    previousSessions = await ChatSession.findAll({
                        where: { browser_id, status: 'ended' },
                        order: [['createdAt', 'DESC']],
                        limit: 5,
                        attributes: ['id', 'visitor_name', 'visitor_email', 'createdAt', 'messages'],
                    })
                }

                const session = await ChatSession.create({
                    id: sessionId,
                    visitor_name: name,
                    visitor_email: email,
                    visitor_phone: phone || '',
                    visitor_ip: visitorIP,
                    browser_id: browser_id || null,
                    status: 'waiting',
                    messages: [],
                })

                socket.join(sessionId)
                socket.chatSessionId = sessionId

                socket.emit('chat:started', {
                    sessionId,
                    message: 'Connecting you to an admin...',
                })

                // Notify all admins (include IP + returning visitor info)
                io.to('admins').emit('chat:new_session', {
                    id: sessionId,
                    visitor_name: name,
                    visitor_email: email,
                    visitor_phone: phone,
                    visitor_ip: visitorIP,
                    browser_id: browser_id || null,
                    is_returning: previousSessions.length > 0,
                    previous_chats: previousSessions.length,
                    status: 'waiting',
                    messages: [],
                    createdAt: session.createdAt,
                })

                console.log(`💬 New chat session: ${sessionId} from ${name} (IP: ${visitorIP}, returning: ${previousSessions.length > 0})`)

                // AI auto-response after 2 seconds if no admin claims
                setTimeout(async () => {
                    const latest = await ChatSession.findByPk(sessionId)
                    if (latest && latest.status === 'waiting') {
                        const greeting = `Hi ${name}! 👋 I'm ${AI_NAME}, your AI assistant. An admin will join when available, but in the meantime, I'm here to help! What would you like to know about AI for Everybody?`
                        await pushAIMessage(sessionId, greeting)
                    }
                }, 2000)

            } catch (err) {
                console.error('Error starting chat:', err)
                socket.emit('chat:error', { message: 'Failed to start chat' })
            }
        })

        // ==================
        // VISITOR reconnects to existing session
        // ==================
        socket.on('visitor:reconnect', async (data) => {
            try {
                const { browser_id } = data
                if (!browser_id) return socket.emit('chat:no_session')

                // Find active or waiting session for this browser
                const session = await ChatSession.findOne({
                    where: {
                        browser_id,
                        status: { [Op.in]: ['waiting', 'active'] },
                    },
                    order: [['createdAt', 'DESC']],
                })

                if (session) {
                    socket.join(session.id)
                    socket.chatSessionId = session.id
                    socket.emit('chat:reconnected', {
                        sessionId: session.id,
                        messages: session.messages,
                        status: session.status,
                        visitor_name: session.visitor_name,
                        visitor_email: session.visitor_email,
                    })
                } else {
                    socket.emit('chat:no_session')
                }
            } catch (err) {
                console.error('Error reconnecting:', err)
                socket.emit('chat:no_session')
            }
        })

        // ==================
        // GET previous chat history for a browser_id
        // ==================
        socket.on('admin:get_visitor_history', async (data) => {
            try {
                const { browser_id } = data
                await emitVisitorHistory(browser_id)
            } catch (err) {
                console.error('Error fetching visitor history:', err)
                socket.emit('chat:visitor_history', { sessions: [] })
            }
        })

        socket.on('visitor:get_history', async (data) => {
            try {
                const { browser_id } = data
                await emitVisitorHistory(browser_id)
            } catch (err) {
                console.error('Error fetching visitor history:', err)
                socket.emit('chat:visitor_history', { sessions: [] })
            }
        })

        // ==================
        // VISITOR sends message
        // ==================
        socket.on('visitor:message', async (data) => {
            try {
                const { sessionId, message } = data
                const session = await ChatSession.findByPk(sessionId)
                if (!session) return

                const msg = {
                    sender: 'visitor',
                    text: message,
                    timestamp: new Date().toISOString(),
                }

                const messages = [...(session.messages || [])]
                messages.push(msg)
                await session.update({ messages })

                io.to(sessionId).emit('chat:message', { sessionId, ...msg })
                io.to('admins').emit('chat:message_update', { sessionId, message: msg })

                // If no admin has claimed, AI responds
                if (session.status === 'waiting') {
                    const handledRegistration = await processRegistrationFlow(sessionId, message)
                    if (handledRegistration) return

                    if (isRegistrationIntent(message)) {
                        await startRegistrationFlow(sessionId)
                        return
                    }

                    const aiText = getAIResponse(message)
                    await pushAIMessage(sessionId, aiText)
                }
            } catch (err) {
                console.error('Error sending visitor message:', err)
            }
        })

        // ==================
        // ADMIN joins chat room
        // ==================
        socket.on('admin:join', () => {
            socket.join('admins')
            socket.isAdmin = true
            console.log(`👤 Admin joined: ${socket.id}`)

            ChatSession.findAll({
                where: { status: { [Op.in]: ['waiting', 'active', 'ended'] } },
                order: [['createdAt', 'DESC']],
            }).then(sessions => {
                socket.emit('chat:sessions', sessions)
            })
        })

        // ==================
        // ADMIN claims a chat
        // ==================
        socket.on('admin:claim', async (data) => {
            try {
                const { sessionId, adminId } = data
                const session = await ChatSession.findByPk(sessionId)
                if (!session) return

                registrationFlows.delete(sessionId)
                await session.update({ status: 'active', admin_id: adminId })

                socket.join(sessionId)
                socket.chatSessionId = sessionId

                io.to(sessionId).emit('chat:admin_joined', {
                    sessionId,
                    message: 'An admin has joined the chat!',
                })

                io.to('admins').emit('chat:session_update', {
                    sessionId,
                    status: 'active',
                    admin_id: adminId,
                })
            } catch (err) {
                console.error('Error claiming chat:', err)
            }
        })

        // ==================
        // ADMIN sends message
        // ==================
        socket.on('admin:message', async (data) => {
            try {
                const { sessionId, message } = data
                const session = await ChatSession.findByPk(sessionId)
                if (!session) return

                const msg = {
                    sender: 'admin',
                    text: message,
                    timestamp: new Date().toISOString(),
                }

                const messages = [...(session.messages || [])]
                messages.push(msg)
                await session.update({ messages })

                io.to(sessionId).emit('chat:message', { sessionId, ...msg })
                io.to('admins').emit('chat:message_update', { sessionId, message: msg })
            } catch (err) {
                console.error('Error sending admin message:', err)
            }
        })

        // ==================
        // ADMIN typing indicator
        // ==================
        socket.on('admin:typing', (data) => {
            io.to(data.sessionId).emit('chat:typing', { sessionId: data.sessionId, sender: 'admin' })
        })

        socket.on('admin:stop_typing', (data) => {
            io.to(data.sessionId).emit('chat:stop_typing', { sessionId: data.sessionId })
        })

        // ==================
        // ADMIN ends chat
        // ==================
        socket.on('admin:end_chat', async (data) => {
            try {
                const { sessionId } = data
                const session = await ChatSession.findByPk(sessionId)
                if (!session) return

                registrationFlows.delete(sessionId)

                await session.update({ status: 'ended' })

                io.to(sessionId).emit('chat:ended', { sessionId, message: 'Chat has been ended by admin.' })
                io.to('admins').emit('chat:session_update', { sessionId, status: 'ended' })
            } catch (err) {
                console.error('Error ending chat:', err)
            }
        })

        // ==================
        // DISCONNECT
        // ==================
        socket.on('disconnect', async () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`)
            if (socket.chatSessionId && !socket.isAdmin) {
                registrationFlows.delete(socket.chatSessionId)

                io.to('admins').emit('chat:visitor_disconnected', { sessionId: socket.chatSessionId })
            }
        })
    })
}
