import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const RegistrationStatusContext = createContext({ closed: false })

export function RegistrationStatusProvider({ children }) {
    const [closed, setClosed] = useState(false)

    const check = async () => {
        try {
            const res = await axios.get('/api/registrations/status')
            setClosed(res.data.closed)
        } catch { /* keep current state on error */ }
    }

    useEffect(() => {
        check()
        // Re-check every 60 seconds so it flips automatically at 22:00
        const interval = setInterval(check, 60_000)
        return () => clearInterval(interval)
    }, [])

    return (
        <RegistrationStatusContext.Provider value={{ closed }}>
            {children}
        </RegistrationStatusContext.Provider>
    )
}

export const useRegistrationStatus = () => useContext(RegistrationStatusContext)
