import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2, AlertCircle, Fingerprint, ShieldCheck, Scan, CheckCircle2 } from 'lucide-react'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import axios from 'axios'

export default function AdminLogin() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [biometricLoading, setBiometricLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [hasBiometric, setHasBiometric] = useState(false)
    const [biometricSupported, setBiometricSupported] = useState(false)
    const [showSetupBiometric, setShowSetupBiometric] = useState(false)
    const [biometricSetupDone, setBiometricSetupDone] = useState(false)
    const navigate = useNavigate()

    // Check if WebAuthn is supported in this browser
    useEffect(() => {
        const checkSupport = async () => {
            if (window.PublicKeyCredential) {
                try {
                    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                    setBiometricSupported(available)
                } catch {
                    setBiometricSupported(false)
                }
            }
        }
        checkSupport()
    }, [])

    // Check if biometric is registered when email changes
    useEffect(() => {
        const checkBiometric = async () => {
            if (!form.email || !form.email.includes('@')) {
                setHasBiometric(false)
                return
            }
            try {
                const res = await axios.post('/api/webauthn/auth/options', { email: form.email })
                setHasBiometric(res.data.hasBiometric === true)
            } catch {
                setHasBiometric(false)
            }
        }

        const timer = setTimeout(checkBiometric, 500)
        return () => clearTimeout(timer)
    }, [form.email])

    // Standard login
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)
        try {
            const res = await axios.post('/api/auth/login', form)
            localStorage.setItem('adminToken', res.data.token)

            // After login, offer biometric setup if supported and not yet registered
            if (biometricSupported && !hasBiometric) {
                setShowSetupBiometric(true)
                setLoading(false)
                return
            }

            navigate('/admin')
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    // Biometric login
    const handleBiometricLogin = async () => {
        setError('')
        setSuccess('')
        setBiometricLoading(true)
        try {
            // 1. Get auth options
            const optionsRes = await axios.post('/api/webauthn/auth/options', { email: form.email })
            if (!optionsRes.data.hasBiometric) {
                setError('No biometric credentials found for this account')
                setBiometricLoading(false)
                return
            }

            // 2. Trigger biometric prompt (Face ID / Touch ID)
            const authResponse = await startAuthentication(optionsRes.data)

            // 3. Verify with server
            const verifyRes = await axios.post('/api/webauthn/auth/verify', {
                email: form.email,
                authResponse,
            })

            if (verifyRes.data.verified) {
                localStorage.setItem('adminToken', verifyRes.data.token)
                setSuccess('Biometric verified! Redirecting...')
                setTimeout(() => navigate('/admin'), 800)
            }
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Biometric authentication was cancelled')
            } else {
                setError(err.response?.data?.message || 'Biometric authentication failed')
            }
        } finally {
            setBiometricLoading(false)
        }
    }

    // Setup biometric after successful password login
    const handleSetupBiometric = async () => {
        setBiometricLoading(true)
        setError('')
        try {
            const token = localStorage.getItem('adminToken')
            const headers = { Authorization: `Bearer ${token}` }

            // 1. Get registration options
            const optionsRes = await axios.post('/api/webauthn/register/options', {}, { headers })

            // 2. Trigger biometric enrollment (Face ID / Touch ID)
            const regResponse = await startRegistration(optionsRes.data)

            // 3. Verify with server
            const verifyRes = await axios.post('/api/webauthn/register/verify', regResponse, { headers })

            if (verifyRes.data.verified) {
                setBiometricSetupDone(true)
                setSuccess('Face ID / Touch ID setup complete!')
                setTimeout(() => navigate('/admin'), 1500)
            }
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Biometric setup was cancelled. You can set it up later.')
                setTimeout(() => navigate('/admin'), 1500)
            } else {
                setError(err.response?.data?.message || 'Biometric setup failed')
            }
        } finally {
            setBiometricLoading(false)
        }
    }

    const skipBiometricSetup = () => {
        navigate('/admin')
    }

    // Biometric Setup Screen
    if (showSetupBiometric) {
        return (
            <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-green/20 to-emerald-glow/20 border-2 border-primary-green/30 flex items-center justify-center mb-5 animate-pulse">
                            <Fingerprint size={40} className="text-primary-green" />
                        </div>
                        <h1 className="font-heading text-2xl text-white font-bold">Enable Biometric Login</h1>
                        <p className="text-gray-400 font-body text-sm mt-2 leading-relaxed">
                            Use <span className="text-primary-green font-semibold">Face ID</span> or <span className="text-primary-green font-semibold">Touch ID</span> for faster, more secure sign-ins.
                        </p>
                    </div>

                    <div className="glass-card glow-border rounded-2xl p-8 space-y-6">
                        {biometricSetupDone ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-primary-green/20 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-primary-green" />
                                </div>
                                <p className="text-primary-green font-heading font-semibold text-lg">Setup Complete!</p>
                                <p className="text-gray-400 font-body text-sm">Next time, just use your biometrics to log in instantly.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <Scan size={20} className="text-primary-green flex-shrink-0" />
                                        <span className="text-sm text-gray-300 font-body">Instant sign-in with a glance or a touch</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <ShieldCheck size={20} className="text-primary-green flex-shrink-0" />
                                        <span className="text-sm text-gray-300 font-body">Your biometric data never leaves your device</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSetupBiometric}
                                    disabled={biometricLoading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-green to-emerald-glow text-primary-dark font-heading font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-green/25 transition-all disabled:opacity-50"
                                >
                                    {biometricLoading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Setting up...</>
                                    ) : (
                                        <><Fingerprint size={18} /> Enable Face ID / Touch ID</>
                                    )}
                                </button>

                                <button
                                    onClick={skipBiometricSetup}
                                    className="w-full text-center text-gray-500 text-sm font-body hover:text-gray-300 transition-colors"
                                >
                                    Skip for now →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Main Login Screen
    return (
        <div className="min-h-screen bg-primary-dark flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/images/logo.png" alt="Mindset" className="h-16 mx-auto mb-4 object-contain" />
                    <h1 className="font-accent text-2xl text-primary-green tracking-wider">Admin Portal</h1>
                    <p className="text-gray-400 font-body text-sm mt-1">AI For Everybody Dashboard</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="glass-card glow-border rounded-2xl p-8 space-y-5">
                    <div>
                        <label className="block text-sm font-body text-gray-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                placeholder="admin@mindsetai.co.uk"
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-body focus:outline-none focus:border-primary-green transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-body text-gray-400 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                placeholder="Enter your password"
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-body focus:outline-none focus:border-primary-green transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-primary-green/10 border border-primary-green/20 rounded-xl p-3 flex items-center gap-2 text-primary-green text-sm">
                            <CheckCircle2 size={16} /> {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center disabled:opacity-50"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Signing in...</> : 'Sign In'}
                    </button>

                    {/* Biometric Login Button */}
                    {biometricSupported && hasBiometric && (
                        <>
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/10"></div>
                                <span className="text-xs text-gray-500 font-body uppercase tracking-widest">or</span>
                                <div className="flex-1 h-px bg-white/10"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleBiometricLogin}
                                disabled={biometricLoading || !form.email}
                                className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary-green/50 hover:bg-primary-green/5 text-white font-body text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 group"
                            >
                                {biometricLoading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                                ) : (
                                    <>
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-green/20 to-emerald-glow/20 flex items-center justify-center group-hover:from-primary-green/30 group-hover:to-emerald-glow/30 transition-all">
                                            <Fingerprint size={18} className="text-primary-green" />
                                        </div>
                                        <span>Sign in with <span className="text-primary-green font-semibold">Face ID / Touch ID</span></span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </form>

                <p className="text-center text-gray-500 text-xs font-body mt-6">
                    <a href="/" className="text-primary-green hover:underline">← Back to website</a>
                </p>
                <p className="text-center text-gray-600 text-[10px] font-body mt-3">
                    Designed & Developed by{' '}
                    <a href="https://www.facebook.com/eWebcity" target="_blank" rel="noopener noreferrer"
                        className="text-blue-400/60 hover:text-blue-400 transition">eWebCity</a>
                </p>
            </div>
        </div>
    )
}
