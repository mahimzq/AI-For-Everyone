import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/shared/Navbar'
import ScrollToTop from './components/shared/ScrollToTop'
import LoadingScreen from './components/shared/LoadingScreen'
import Hero from './components/landing/Hero'
import Mission from './components/landing/Mission'
import AIOpportunity from './components/landing/AIOpportunity'
import LearningPillars from './components/landing/LearningPillars'
import TechFramework from './components/landing/TechFramework'
import Schedule from './components/landing/Schedule'
import Speakers from './components/landing/Speakers'
import WhoShouldAttend from './components/landing/WhoShouldAttend'
import Benefits from './components/landing/Benefits'
import Resources from './components/landing/Resources'
import AIToolsShowcase from './components/landing/AIToolsShowcase'
import GalleryPage from './components/landing/Gallery'
import RegistrationForm from './components/landing/RegistrationForm'
import Contact from './components/landing/Contact'
import Footer from './components/landing/Footer'
import ChatWidget from './components/landing/ChatWidget'
import AdminLogin from './components/admin/AdminLogin'
import Dashboard from './components/admin/Dashboard'
import VerifyTicket from './components/public/VerifyTicket'
import { RegistrationStatusProvider } from './context/RegistrationStatusContext'
import { OnboardingProvider } from './context/OnboardingContext'
import OnboardingPage from './components/landing/OnboardingPage'
import BackgroundAudio from './components/shared/BackgroundAudio'

function LandingPage() {
    const [isRegistered, setIsRegistered] = useState(() => {
        return !!localStorage.getItem('last_registration_email')
    })
    const { hash } = useLocation()

    // Scroll to section when navigated from another page (e.g. /gallery → /#schedule)
    useEffect(() => {
        if (!hash) return
        const tryScroll = (attempts = 0) => {
            const el = document.querySelector(hash)
            if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
            if (attempts < 10) setTimeout(() => tryScroll(attempts + 1), 150)
        }
        tryScroll()
    }, [hash])

    useEffect(() => {
        // Listen for registration events dispatched from RegistrationForm
        const handleRegistered = () => setIsRegistered(true)
        window.addEventListener('user-registered', handleRegistered)

        // Also listen for storage changes (e.g. from another tab)
        const handleStorage = (e) => {
            if (e.key === 'last_registration_email' && e.newValue) {
                setIsRegistered(true)
            }
        }
        window.addEventListener('storage', handleStorage)

        return () => {
            window.removeEventListener('user-registered', handleRegistered)
            window.removeEventListener('storage', handleStorage)
        }
    }, [])

    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <Mission />
                <AIOpportunity />
                <LearningPillars />
                <TechFramework />
                <Schedule />
                <Speakers />
                <WhoShouldAttend />
                <Benefits />
                <Resources />
                <AIToolsShowcase />
                <RegistrationForm />
                <Contact />
            </main>
            <Footer />
            <ScrollToTop />
            <ChatWidget />
        </>
    )
}

function App() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1800)
        return () => clearTimeout(timer)
    }, [])

    return (
        <RegistrationStatusProvider>
            <OnboardingProvider>
                <Router>
                    {loading && <LoadingScreen />}
                    <BackgroundAudio />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/*" element={<Dashboard />} />
                        <Route path="/gallery" element={<GalleryPage />} />
                        <Route path="/onboarding" element={<OnboardingPage />} />
                        <Route path="/verify/:token" element={<VerifyTicket />} />
                    </Routes>
                </Router>
            </OnboardingProvider>
        </RegistrationStatusProvider>
    )
}

export default App
