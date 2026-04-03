import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ParticleBackground from '../shared/ParticleBackground'
import Navbar from '../shared/Navbar'
import { useOnboarding } from '../../context/OnboardingContext'

export default function GalleryPage() {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [lightbox, setLightbox] = useState(null)
    const navigate = useNavigate()
    const { completed } = useOnboarding()

    // Gate: redirect to onboarding if not completed
    useEffect(() => {
        if (!completed) navigate('/onboarding?redirect=/gallery')
    }, [completed])

    useEffect(() => {
        if (!completed) return
        axios.get('/api/gallery')
            .then(res => setPhotos(res.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [completed])

    const closeLightbox = () => setLightbox(null)

    const navigate_photo = (dir) => {
        const idx = photos.findIndex(p => p.id === lightbox.id)
        const next = (idx + dir + photos.length) % photos.length
        setLightbox(photos[next])
    }

    useEffect(() => {
        const handler = (e) => {
            if (!lightbox) return
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowRight') navigate_photo(1)
            if (e.key === 'ArrowLeft') navigate_photo(-1)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [lightbox, photos])

    if (!completed) return null

    return (
        <div className="min-h-screen bg-primary-dark relative">
            <Navbar />
            {/* Background */}
            <div className="absolute inset-0 hero-animated-bg opacity-30 pointer-events-none" />
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
            <ParticleBackground />

            <div className="relative z-10 container-max px-4 pt-28 pb-20">
                {/* Back button */}
                <motion.button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-body text-sm">Back to Home</span>
                </motion.button>

                {/* Heading */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="accent-text text-neon-purple mb-3">Moments & Memories</p>
                    <h1 className="heading-lg text-white mb-3">
                        Event <span className="gradient-text">Gallery</span>
                    </h1>
                    <p className="body-text">
                        Highlights from AI For Everybody events across Cameroon.
                    </p>
                    {!loading && (
                        <p className="text-slate-600 text-sm font-body mt-2">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
                    )}
                </motion.div>

                {/* Grid */}
                {loading ? (
                    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="break-inside-avoid mb-4 rounded-2xl bg-white/5 animate-pulse h-48" />
                        ))}
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center py-32 text-slate-500">
                        <p className="text-5xl mb-4">📷</p>
                        <p className="font-heading text-lg text-white mb-2">No photos yet</p>
                        <p className="font-body text-sm">Check back after the event!</p>
                    </div>
                ) : (
                    <motion.div
                        className="columns-2 sm:columns-3 lg:columns-4 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {photos.map((photo, i) => (
                            <motion.div
                                key={photo.id}
                                className="break-inside-avoid mb-4 group cursor-pointer relative rounded-2xl overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (i % 12) * 0.04, duration: 0.4 }}
                                onClick={() => setLightbox(photo)}
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.caption || ''}
                                    className="w-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end p-4">
                                    {photo.caption && (
                                        <p className="text-white text-sm font-body line-clamp-2">{photo.caption}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                    >
                        <button className="absolute top-4 right-4 p-2 text-white/60 hover:text-white z-10" onClick={closeLightbox}>
                            <X size={28} />
                        </button>
                        {photos.length > 1 && (
                            <button
                                className="absolute left-4 p-3 text-white/60 hover:text-white z-10 bg-white/10 rounded-full hover:bg-white/20 transition"
                                onClick={e => { e.stopPropagation(); navigate_photo(-1) }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <motion.img
                            key={lightbox.id}
                            src={lightbox.url}
                            alt={lightbox.caption || ''}
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={e => e.stopPropagation()}
                        />
                        {photos.length > 1 && (
                            <button
                                className="absolute right-4 p-3 text-white/60 hover:text-white z-10 bg-white/10 rounded-full hover:bg-white/20 transition"
                                onClick={e => { e.stopPropagation(); navigate_photo(1) }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                        <div className="absolute bottom-6 left-0 right-0 text-center space-y-1">
                            {lightbox.caption && (
                                <p className="text-white/80 text-sm font-body">{lightbox.caption}</p>
                            )}
                            <p className="text-white/40 text-xs">
                                {photos.findIndex(p => p.id === lightbox.id) + 1} / {photos.length}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
