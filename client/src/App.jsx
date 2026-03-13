import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import RegistrationForm from './components/landing/RegistrationForm'
import Contact from './components/landing/Contact'
import Footer from './components/landing/Footer'
import ChatWidget from './components/landing/ChatWidget'
import AdminLogin from './components/admin/AdminLogin'
import Dashboard from './components/admin/Dashboard'
import VerifyTicket from './components/public/VerifyTicket'

function LandingPage() {
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
        <Router>
            {loading && <LoadingScreen />}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={<Dashboard />} />
                <Route path="/verify/:token" element={<VerifyTicket />} />
            </Routes>
        </Router>
    )
}

export default App
