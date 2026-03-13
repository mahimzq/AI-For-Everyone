import { useState, useEffect } from 'react'

export default function LoadingScreen() {
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setHidden(true), 1500)
        return () => clearTimeout(timer)
    }, [])

    if (hidden) return null

    return (
        <div className="loading-screen">
            <div className="text-center">
                <img
                    src="/images/logo.png"
                    alt="Mindset"
                    className="loading-logo w-28 sm:w-36 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                />
                <div className="flex gap-1.5 justify-center">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                                background: i === 0 ? '#7C3AED' : i === 1 ? '#00C853' : '#06B6D4',
                                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
