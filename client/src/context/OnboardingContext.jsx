import { createContext, useContext, useState } from 'react'

const OnboardingContext = createContext({ completed: false, complete: () => {} })

export function OnboardingProvider({ children }) {
    const [completed, setCompleted] = useState(() => {
        return !!localStorage.getItem('onboarding_complete')
    })

    const complete = (data) => {
        localStorage.setItem('onboarding_complete', 'true')
        localStorage.setItem('onboarding_user', JSON.stringify(data))
        setCompleted(true)
    }

    return (
        <OnboardingContext.Provider value={{ completed, complete }}>
            {children}
        </OnboardingContext.Provider>
    )
}

export const useOnboarding = () => useContext(OnboardingContext)
