import { useState, useEffect, useCallback } from 'react'

const COLORS = [
    '#00C853', '#00E676', '#FFD700', '#FF6D00',
    '#E040FB', '#448AFF', '#00BCD4', '#76FF03',
    '#FF4081', '#7C4DFF', '#18FFFF', '#FFAB40',
]

function getRandomColor(exclude) {
    let color
    do {
        color = COLORS[Math.floor(Math.random() * COLORS.length)]
    } while (color === exclude)
    return color
}

export default function CountdownTimer() {
    const targetDate = new Date('2026-03-21T10:00:00+01:00').getTime()

    const calculateTimeLeft = useCallback(() => {
        const now = new Date().getTime()
        const diff = targetDate - now

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
        }
    }, [targetDate])

    const [time, setTime] = useState(calculateTimeLeft)
    const [secColor, setSecColor] = useState('#00C853')
    const [sparkles, setSparkles] = useState([])
    const [isFlipping, setIsFlipping] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(calculateTimeLeft())
            setSecColor(prev => getRandomColor(prev))
            setIsFlipping(true)

            // Create sparkle particles
            const newSparkles = Array.from({ length: 8 }, (_, i) => ({
                id: Date.now() + i,
                x: (Math.random() - 0.5) * 60,
                y: (Math.random() - 0.5) * 60,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                scale: 0.5 + Math.random() * 1,
            }))
            setSparkles(newSparkles)

            setTimeout(() => {
                setIsFlipping(false)
                setSparkles([])
            }, 700)
        }, 1000)

        return () => clearInterval(timer)
    }, [calculateTimeLeft])

    const TimeUnit = ({ value, label, color, animate }) => (
        <div className="flex flex-col items-center">
            <div
                className="relative"
                style={{ perspective: '300px' }}
            >
                <div
                    className="rounded-xl w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${color}33`,
                        boxShadow: `0 0 20px ${color}22, inset 0 0 20px ${color}11`,
                        transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
                        transform: animate ? 'rotateX(0deg)' : 'none',
                        animation: animate ? 'countFlip 0.5s ease-out' : 'none',
                    }}
                >
                    <span
                        className="font-accent text-2xl sm:text-4xl font-bold"
                        style={{
                            color: color,
                            textShadow: `0 0 15px ${color}88, 0 0 30px ${color}44`,
                            transition: 'color 0.3s ease, text-shadow 0.3s ease',
                        }}
                    >
                        {String(value).padStart(2, '0')}
                    </span>

                    {/* Sparkle particles */}
                    {animate && sparkles.map(s => (
                        <div
                            key={s.id}
                            style={{
                                position: 'absolute',
                                width: 4 * s.scale,
                                height: 4 * s.scale,
                                borderRadius: '50%',
                                background: s.color,
                                boxShadow: `0 0 6px ${s.color}`,
                                left: '50%',
                                top: '50%',
                                animation: 'sparkleOut 0.7s ease-out forwards',
                                transform: `translate(-50%, -50%)`,
                                '--sx': `${s.x}px`,
                                '--sy': `${s.y}px`,
                            }}
                        />
                    ))}
                </div>
            </div>
            <span
                className="mt-2 text-xs sm:text-sm font-body uppercase tracking-wider"
                style={{ color: `${color}99`, transition: 'color 0.5s ease' }}
            >
                {label}
            </span>
        </div>
    )

    return (
        <div className="flex gap-2 sm:gap-4 justify-center items-start">
            <TimeUnit value={time.days} label="Days" color="#00C853" />
            <div className="flex items-center text-primary-green text-xl sm:text-2xl font-bold mt-5 sm:mt-6">:</div>
            <TimeUnit value={time.hours} label="Hours" color="#00E676" />
            <div className="flex items-center text-primary-green text-xl sm:text-2xl font-bold mt-5 sm:mt-6">:</div>
            <TimeUnit value={time.minutes} label="Mins" color="#FFD700" />
            <div className="flex items-center text-xl sm:text-2xl font-bold mt-5 sm:mt-6" style={{ color: secColor, transition: 'color 0.3s ease' }}>:</div>
            <TimeUnit value={time.seconds} label="Secs" color={secColor} animate={isFlipping} />
        </div>
    )
}
