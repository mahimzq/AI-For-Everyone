import { useState, useEffect, useRef } from 'react'
import { User, Lock, Fingerprint, Mail, Save, Loader2, CheckCircle2, AlertCircle, Shield, Camera, Users, Trash2, UserPlus } from 'lucide-react'
import { startRegistration } from '@simplewebauthn/browser'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export default function SettingsPage() {
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('profile')
    const fileInputRef = useRef(null)

    // Profile form
    const [profileForm, setProfileForm] = useState({ username: '', email: '' })

    // Password form
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

    // Biometric
    const [biometricStatus, setBiometricStatus] = useState({ registered: false, count: 0 })
    const [biometricSupported, setBiometricSupported] = useState(false)
    const [biometricLoading, setBiometricLoading] = useState(false)

    // Team Management
    const [team, setTeam] = useState([])
    const [teamForm, setTeamForm] = useState({ username: '', email: '', password: '', role: 'moderator' })
    const [addingMember, setAddingMember] = useState(false)
    const [loadingTeam, setLoadingTeam] = useState(false)
    
    // Site Settings
    const [siteSettings, setSiteSettings] = useState({ whatsapp_member_count: '0' })
    const [savingSite, setSavingSite] = useState(false)

    const token = localStorage.getItem('adminToken')
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [adminRes, biometricRes] = await Promise.all([
                    axios.get('/api/auth/me', { headers }),
                    axios.get('/api/webauthn/status', { headers }).catch(() => ({ data: { registered: false, count: 0 } })),
                ])
                setAdmin(adminRes.data)
                setProfileForm({ username: adminRes.data.username || '', email: adminRes.data.email || '' })
                setBiometricStatus(biometricRes.data)
            } catch {
                setError('Failed to load settings')
            } finally {
                setLoading(false)
            }
        }

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

        const fetchSiteSettings = async () => {
            try {
                const res = await axios.get('/api/settings/whatsapp-count')
                setSiteSettings({ whatsapp_member_count: String(res.data.count) })
            } catch (err) {
                console.error('Failed to load site settings')
            }
        }

        fetchData()
        checkSupport()
        fetchSiteSettings()
    }, [])

    // Load team members if activeTab changes to 'team'
    useEffect(() => {
        if (activeTab === 'team' && (admin?.role === 'super_admin' || admin?.role === 'admin')) {
            const fetchTeam = async () => {
                setLoadingTeam(true)
                try {
                    const res = await axios.get('/api/auth/team', { headers })
                    setTeam(res.data)
                } catch (err) {
                    setError('Failed to load team members')
                } finally {
                    setLoadingTeam(false)
                }
            }
            fetchTeam()
        }
    }, [activeTab, admin])

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingAvatar(true)
        setError('')
        setSuccess('')

        try {
            const formData = new FormData()
            formData.append('avatar', file)

            const res = await axios.post('/api/auth/me/avatar', formData, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' },
            })

            setAdmin(prev => ({ ...prev, profile_picture: res.data.profile_picture }))
            // Also update in localStorage for Dashboard to pick up
            const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
            adminData.profile_picture = res.data.profile_picture
            localStorage.setItem('adminData', JSON.stringify(adminData))

            setSuccess('Profile picture updated!')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload picture')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')
        try {
            const res = await axios.patch('/api/auth/me', profileForm, { headers })
            setSuccess('Profile updated successfully!')
            setAdmin(prev => ({ ...prev, ...res.data }))
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleSavePassword = async (e) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (passwordForm.newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }
        setSaving(true)
        setError('')
        setSuccess('')
        try {
            await axios.put('/api/auth/me/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            }, { headers })
            setSuccess('Password changed successfully!')
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveSiteSettings = async (e) => {
        e.preventDefault()
        setSavingSite(true)
        setError('')
        setSuccess('')

        try {
            await axios.post('/api/settings', {
                key: 'whatsapp_member_count',
                value: siteSettings.whatsapp_member_count
            }, { headers })
            setSuccess('Site settings updated')
        } catch (err) {
            setError('Failed to save site settings')
        } finally {
            setSavingSite(false)
        }
    }

    const handleSetupBiometric = async () => {
        setBiometricLoading(true)
        setError('')
        setSuccess('')
        try {
            const optionsRes = await axios.post('/api/webauthn/register/options', {}, { headers })
            const regResponse = await startRegistration(optionsRes.data)
            const verifyRes = await axios.post('/api/webauthn/register/verify', regResponse, { headers })
            if (verifyRes.data.verified) {
                setBiometricStatus({ registered: true, count: biometricStatus.count + 1 })
                setSuccess('Face ID / Touch ID has been set up!')
            }
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Biometric setup was cancelled')
            } else {
                setError(err.response?.data?.message || 'Failed to set up biometric')
            }
        } finally {
            setBiometricLoading(false)
        }
    }

    let tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
        { id: 'biometric', label: 'Biometric', icon: <Fingerprint size={18} /> },
    ]

    // Only allow admin / super_admin to see Team tab
    if (admin?.role === 'admin' || admin?.role === 'super_admin') {
        tabs.push({ id: 'team', label: 'Team', icon: <Users size={18} /> })
        tabs.push({ id: 'site', label: 'Site Settings', icon: <Save size={18} /> })
    }

    const getAvatarUrl = () => {
        if (!admin?.profile_picture) return null
        if (admin.profile_picture.startsWith('http')) return admin.profile_picture
        return `${API_URL}${admin.profile_picture}`
    }

    const handleAddTeamMember = async (e) => {
        e.preventDefault()
        setAddingMember(true)
        setError('')
        setSuccess('')
        try {
            const res = await axios.post('/api/auth/team', teamForm, { headers })
            setTeam([res.data, ...team])
            setTeamForm({ username: '', email: '', password: '', role: 'moderator' })
            setSuccess('Team member added successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add team member')
        } finally {
            setAddingMember(false)
        }
    }

    const handleRemoveTeamMember = async (id) => {
        if (!window.confirm('Are you sure you want to remove this team member?')) return
        try {
            await axios.delete(`/api/auth/team/${id}`, { headers })
            setTeam(team.filter(m => m.id !== id))
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove team member')
        }
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-primary-green" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="font-heading font-bold text-2xl text-white">Settings</h1>
                <p className="text-gray-400 font-body text-sm mt-1">Manage your account and preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setError(''); setSuccess('') }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body transition-all flex-1 justify-center ${activeTab === tab.id
                            ? 'bg-primary-green/10 text-primary-green font-semibold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Feedback */}
            {success && (
                <div className="bg-primary-green/10 border border-primary-green/20 rounded-xl p-3 flex items-center gap-2 text-primary-green text-sm">
                    <CheckCircle2 size={16} /> {success}
                </div>
            )}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-5">
                    {/* Avatar section */}
                    <div className="flex items-center gap-5 pb-5 border-b border-white/5">
                        <div className="relative group">
                            {getAvatarUrl() ? (
                                <img src={getAvatarUrl()} alt="Profile"
                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-green/20 group-hover:border-primary-green/40 transition" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-green/30 to-emerald-glow/30 flex items-center justify-center text-primary-green text-3xl font-bold border-2 border-primary-green/20">
                                    {profileForm.username?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                            )}

                            {/* Upload overlay */}
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploadingAvatar ? (
                                    <Loader2 size={20} className="text-white animate-spin" />
                                ) : (
                                    <Camera size={20} className="text-white" />
                                )}
                            </button>

                            <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleAvatarUpload} className="hidden" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-white font-heading font-semibold text-lg">{admin?.username || 'Admin'}</h3>
                            <p className="text-gray-400 font-body text-sm capitalize">{admin?.role?.replace('_', ' ') || 'Admin'}</p>
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="mt-2 text-xs font-body text-primary-green hover:text-primary-green/80 transition">
                                {getAvatarUrl() ? 'Change photo' : 'Upload photo'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-body text-gray-400 mb-1.5">Username</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={profileForm.username}
                                onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-body text-gray-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                value={profileForm.email}
                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary !py-2.5 flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <form onSubmit={handleChangePassword} className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Shield size={20} className="text-primary-green" />
                        <h3 className="text-white font-heading font-semibold">Change Password</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-body text-gray-400 mb-1.5">Current Password</label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-gray-400 mb-1.5">New Password</label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-gray-400 mb-1.5">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                        />
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary !py-2.5 flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                        Update Password
                    </button>
                </form>
            )}

            {/* Site Settings Tab */}
            {activeTab === 'site' && (
                <form onSubmit={handleSaveSiteSettings} className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Save size={20} className="text-primary-green" />
                        <h3 className="text-white font-heading font-semibold">Public Site Configurations</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-primary-green/5 border border-primary-green/10 flex items-start gap-3">
                            <AlertCircle size={20} className="text-primary-green shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-400 font-body leading-relaxed">
                                Settings changed here will be visible on the public landing page immediately after saving.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-body text-gray-400 mb-1.5 flex items-center gap-2">
                                <Users size={14} className="text-primary-green" /> WhatsApp Channel Member Count
                            </label>
                            <input
                                type="number"
                                value={siteSettings.whatsapp_member_count}
                                onChange={e => setSiteSettings({ ...siteSettings, whatsapp_member_count: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                                placeholder="e.g. 1500"
                            />
                            <p className="text-[10px] text-gray-600 mt-2 font-body uppercase tracking-widest font-bold">
                                Current live count on landing page
                            </p>
                        </div>
                    </div>

                    <button type="submit" disabled={savingSite} className="btn-primary !py-2.5 flex items-center gap-2">
                        {savingSite ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Public Settings
                    </button>
                </form>
            )}

            {/* Biometric Tab */}
            {activeTab === 'biometric' && (
                <div className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Fingerprint size={20} className="text-primary-green" />
                        <h3 className="text-white font-heading font-semibold">Face ID / Touch ID</h3>
                    </div>

                    {!biometricSupported ? (
                        <div className="text-center py-8">
                            <Fingerprint size={48} className="text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 font-body text-sm">Biometric authentication is not available on this device/browser.</p>
                            <p className="text-gray-500 font-body text-xs mt-1">Try using Safari on Mac or Chrome with Touch ID.</p>
                        </div>
                    ) : (
                        <>
                            <div className={`flex items-center gap-4 p-4 rounded-xl ${biometricStatus.registered ? 'bg-primary-green/5 border border-primary-green/10' : 'bg-white/5 border border-white/5'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${biometricStatus.registered ? 'bg-primary-green/20' : 'bg-white/10'}`}>
                                    <Fingerprint size={24} className={biometricStatus.registered ? 'text-primary-green' : 'text-gray-500'} />
                                </div>
                                <div>
                                    <p className="text-white font-body font-medium">
                                        {biometricStatus.registered ? 'Biometric Login Enabled' : 'Not Set Up'}
                                    </p>
                                    <p className="text-gray-400 font-body text-sm">
                                        {biometricStatus.registered
                                            ? `${biometricStatus.count} credential${biometricStatus.count > 1 ? 's' : ''} registered`
                                            : 'Set up Face ID or Touch ID for instant sign-in'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleSetupBiometric}
                                disabled={biometricLoading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-green to-emerald-glow text-primary-dark font-heading font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-green/25 transition-all disabled:opacity-50"
                            >
                                {biometricLoading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Setting up...</>
                                ) : biometricStatus.registered ? (
                                    <><Fingerprint size={18} /> Add Another Device</>
                                ) : (
                                    <><Fingerprint size={18} /> Enable Face ID / Touch ID</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Team Management Tab */}
            {activeTab === 'team' && (
                <div className="space-y-6">
                    {/* Add Team Member form */}
                    <form onSubmit={handleAddTeamMember} className="bg-white/5 rounded-2xl border border-white/5 p-6 space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <UserPlus size={20} className="text-primary-green" />
                            <h3 className="text-white font-heading font-semibold">Add Team Member</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-body text-gray-400 mb-1.5">Username</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        required
                                        value={teamForm.username}
                                        onChange={e => setTeamForm({ ...teamForm, username: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-body text-gray-400 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        required
                                        value={teamForm.email}
                                        onChange={e => setTeamForm({ ...teamForm, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-body text-gray-400 mb-1.5">Temporary Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={teamForm.password}
                                        onChange={e => setTeamForm({ ...teamForm, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-body text-gray-400 mb-1.5">Role</label>
                                <div className="relative">
                                    <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <select
                                        value={teamForm.role}
                                        onChange={e => setTeamForm({ ...teamForm, role: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#1e293b] border border-white/10 text-white font-body focus:outline-none focus:border-primary-green transition-colors appearance-none"
                                    >
                                        <option value="moderator">Moderator</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={addingMember} className="btn-primary !py-2.5 flex items-center gap-2 px-6">
                                {addingMember ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                Add Member
                            </button>
                        </div>
                    </form>

                    {/* Team Members List */}
                    <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-white font-heading font-semibold text-lg flex items-center gap-2">
                                <Users size={20} className="text-primary-green" /> Existing Team
                            </h3>
                            <span className="bg-primary-green/10 text-primary-green text-xs font-bold px-2.5 py-1 rounded-full">{team.length}</span>
                        </div>

                        {loadingTeam ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <Loader2 size={24} className="animate-spin text-primary-green mb-2" />
                                <p className="text-sm font-body">Loading team members...</p>
                            </div>
                        ) : team.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm font-body">
                                No team members found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="p-4 text-xs font-heading text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="p-4 text-xs font-heading text-gray-400 uppercase tracking-wider">Role</th>
                                            <th className="p-4 text-xs font-heading text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {team.map(member => (
                                            <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-green/20 to-emerald-glow/20 flex items-center justify-center text-primary-green font-bold text-xs ring-1 ring-primary-green/30">
                                                            {member.username?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-body text-white font-medium">{member.username}</p>
                                                            <p className="text-[11px] font-body text-gray-400">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-body font-medium capitalize ${member.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20' :
                                                            member.role === 'admin' ? 'bg-primary-green/10 text-primary-green ring-1 ring-primary-green/20' :
                                                                member.role === 'moderator' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' :
                                                                    'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20'
                                                        }`}>
                                                        {member.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {member.role !== 'super_admin' && member.id !== admin?.id && (
                                                        <button
                                                            onClick={() => handleRemoveTeamMember(member.id)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                            title="Remove from team"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
