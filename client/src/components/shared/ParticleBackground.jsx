import { useCallback } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export default function ParticleBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine)
    }, [])

    const options = {
        fullScreen: false,
        background: { color: 'transparent' },
        fpsLimit: 60,
        particles: {
            color: { value: ['#00C853', '#00E676', '#FFD700'] },
            links: {
                color: '#00C853',
                distance: 150,
                enable: true,
                opacity: 0.15,
                width: 1,
            },
            move: {
                enable: true,
                speed: 0.8,
                direction: 'none',
                random: true,
                straight: false,
                outModes: { default: 'out' },
            },
            number: {
                density: { enable: true, area: 1200 },
                value: 60,
            },
            opacity: {
                value: { min: 0.1, max: 0.4 },
                animation: {
                    enable: true,
                    speed: 0.5,
                    minimumValue: 0.1,
                },
            },
            size: {
                value: { min: 1, max: 3 },
            },
        },
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: 'grab',
                },
            },
            modes: {
                grab: {
                    distance: 140,
                    links: { opacity: 0.3 },
                },
            },
        },
        detectRetina: true,
    }

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={options}
            className="absolute inset-0 z-0"
        />
    )
}
