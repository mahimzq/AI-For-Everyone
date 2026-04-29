import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import { animate, stagger } from 'animejs'
import axios from 'axios'
import Navbar from '../shared/Navbar'
import ParticleBackground from '../shared/ParticleBackground'
import { useOnboarding } from '../../context/OnboardingContext'

export default function UserLogin() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useOnboarding()
    const navigate = useNavigate()

    const cardRef = useRef(null)
    const elementsRef = useRef([])

    useEffect(() => {
        // Main Card Entrance (Elastic drop-down)
        animate(cardRef.current, {
            translateY: [-50, 0],
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 1200,
            ease: 'outElastic(1, .6)'
        })

        // Stagger inner elements
        animate(elementsRef.current, {
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 800,
            delay: stagger(100, { start: 300 }),
            ease: 'outQuint'
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Animate button click pulse
        animate(e.target.querySelector('button[type="submit"]'), {
            scale: [1, 0.95, 1],
            duration: 400,
            ease: 'outQuad'
        })

        try {
            const res = await axios.post('/api/onboarding/login', form)
            
            // Exit animation
            animate(cardRef.current, {
                opacity: 0,
                translateY: -30,
                scale: 0.95,
                duration: 600,
                ease: 'inQuint',
                onComplete: () => {
                    login(res.data.user)
                    navigate('/user-dashboard')
                }
            })
            
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.')
            setLoading(false)
            
            // Error shake animation
            animate(cardRef.current, {
                translateX: [0, -10, 10, -10, 10, 0],
                duration: 400,
                ease: 'inOutSine'
            })
        }
    }

    const inputClass = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-body focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green/30 transition-colors'

    const addToRefs = (el) => {
        if (el && !elementsRef.current.includes(el)) {
            elementsRef.current.push(el)
        }
    }

    return (
        <div className="min-h-screen bg-primary-dark relative overflow-hidden">
            <Navbar />
            <div className="absolute inset-0 hero-animated-bg opacity-30 pointer-events-none" />
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
            <ParticleBackground />

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20 pb-12">
                <div
                    ref={cardRef}
                    className="w-full max-w-md glass-card glow-border rounded-3xl p-8 opacity-0"
                >
                    <div ref={addToRefs} className="text-center mb-6">
                        <h2 className="heading-md text-white">Welcome Back</h2>
                        <p className="text-slate-400 font-body text-sm mt-2">Log in to check your payment status and access the gallery.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div ref={addToRefs}>
                            <label className="block text-sm font-body text-gray-400 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="you@example.com"
                                className={inputClass}
                                required
                            />
                        </div>
                        <div ref={addToRefs}>
                            <label className="block text-sm font-body text-gray-400 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                placeholder="Enter your password"
                                className={inputClass}
                                required
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm font-body text-center">{error}</p>}

                        <div ref={addToRefs}>
                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2 disabled:opacity-50 origin-center">
                                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <LogIn size={18} className="mr-2" />}
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>
                        
                        <div ref={addToRefs} className="text-center mt-4">
                            <p className="text-sm text-gray-400 font-body">Don't have an account? <Link to="/onboarding" className="text-primary-green hover:underline">Complete Onboarding</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
