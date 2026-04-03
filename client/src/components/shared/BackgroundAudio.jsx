import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function BackgroundAudio() {
    const audioRef = useRef(null)
    const [muted, setMuted] = useState(false)
    const [started, setStarted] = useState(false)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        audio.volume = 0.4
        audio.loop = true

        // Try autoplay immediately
        const tryPlay = () => {
            audio.play().then(() => {
                setStarted(true)
            }).catch(() => {
                // Blocked by browser — wait for first user interaction
            })
        }

        tryPlay()

        // On first interaction, start playing if not already
        const onInteraction = () => {
            if (!started) {
                audio.play().then(() => setStarted(true)).catch(() => {})
            }
            document.removeEventListener('click', onInteraction)
            document.removeEventListener('touchstart', onInteraction)
            document.removeEventListener('keydown', onInteraction)
        }

        document.addEventListener('click', onInteraction)
        document.addEventListener('touchstart', onInteraction)
        document.addEventListener('keydown', onInteraction)

        return () => {
            document.removeEventListener('click', onInteraction)
            document.removeEventListener('touchstart', onInteraction)
            document.removeEventListener('keydown', onInteraction)
        }
    }, [started])

    const toggle = (e) => {
        e.stopPropagation()
        const audio = audioRef.current
        if (!audio) return
        if (muted) {
            audio.muted = false
            setMuted(false)
        } else {
            audio.muted = true
            setMuted(true)
        }
    }

    return (
        <>
            <audio ref={audioRef} src="/website-audio.mpeg" preload="auto" />
            <button
                onClick={toggle}
                title={muted ? 'Unmute music' : 'Mute music'}
                className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-all"
            >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </>
    )
}
