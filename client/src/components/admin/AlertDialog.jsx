import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle, X, Loader2 } from 'lucide-react'

const AlertContext = createContext(null)

// Alert Types and their styles
const ALERT_CONFIG = {
    success: {
        icon: CheckCircle2,
        glow: 'shadow-[0_0_40px_rgba(0,200,83,0.15)]',
        border: 'border-primary-green/30',
        iconBg: 'bg-primary-green/15',
        iconColor: 'text-primary-green',
        buttonBg: 'bg-primary-green hover:bg-primary-green/90',
        buttonText: 'text-primary-dark',
        ring: 'ring-primary-green/20',
    },
    error: {
        icon: XCircle,
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
        border: 'border-red-500/30',
        iconBg: 'bg-red-500/15',
        iconColor: 'text-red-400',
        buttonBg: 'bg-red-500 hover:bg-red-600',
        buttonText: 'text-white',
        ring: 'ring-red-500/20',
    },
    warning: {
        icon: AlertTriangle,
        glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/15',
        iconColor: 'text-amber-400',
        buttonBg: 'bg-amber-500 hover:bg-amber-600',
        buttonText: 'text-primary-dark',
        ring: 'ring-amber-500/20',
    },
    info: {
        icon: Info,
        glow: 'shadow-[0_0_40px_rgba(59,130,246,0.15)]',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/15',
        iconColor: 'text-blue-400',
        buttonBg: 'bg-blue-500 hover:bg-blue-600',
        buttonText: 'text-white',
        ring: 'ring-blue-500/20',
    },
    confirm: {
        icon: AlertTriangle,
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
        border: 'border-red-500/30',
        iconBg: 'bg-red-500/15',
        iconColor: 'text-red-400',
        buttonBg: 'bg-red-500 hover:bg-red-600',
        buttonText: 'text-white',
        ring: 'ring-red-500/20',
    },
}

function AlertModal({ alert, onClose }) {
    const [closing, setClosing] = useState(false)
    const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info
    const Icon = config.icon

    const handleClose = useCallback((result) => {
        setClosing(true)
        setTimeout(() => onClose(result), 200)
    }, [onClose])

    // Auto-close for non-confirm alerts
    useEffect(() => {
        if (alert.type !== 'confirm' && alert.autoClose !== false) {
            const timer = setTimeout(() => handleClose(true), alert.duration || 3000)
            return () => clearTimeout(timer)
        }
    }, [alert, handleClose])

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') handleClose(false)
            if (e.key === 'Enter' && alert.type === 'confirm') handleClose(true)
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [alert, handleClose])

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
            onClick={() => alert.type === 'confirm' ? handleClose(false) : handleClose(true)}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={`relative w-full max-w-sm bg-[#0f172a] rounded-2xl border ${config.border} ${config.glow} ring-1 ${config.ring} overflow-hidden transition-all duration-200 ${closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-alert-in'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Glow bar at top */}
                <div className={`h-1 w-full ${config.iconBg}`}>
                    <div className={`h-full ${config.buttonBg} opacity-60`} style={{ width: '100%' }} />
                </div>

                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center ${config.glow}`}>
                            <Icon size={32} className={config.iconColor} />
                        </div>
                    </div>

                    {/* Title */}
                    {alert.title && (
                        <h3 className="text-center text-white font-heading font-bold text-lg mb-2">{alert.title}</h3>
                    )}

                    {/* Message */}
                    <p className="text-center text-gray-400 font-body text-sm leading-relaxed">{alert.message}</p>

                    {/* Buttons */}
                    <div className={`mt-6 ${alert.type === 'confirm' ? 'flex gap-3' : ''}`}>
                        {alert.type === 'confirm' ? (
                            <>
                                <button
                                    onClick={() => handleClose(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-body text-sm hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleClose(true)}
                                    className={`flex-1 py-2.5 rounded-xl ${config.buttonBg} ${config.buttonText} font-heading font-bold text-sm transition-all hover:shadow-lg`}
                                >
                                    {alert.confirmText || 'Confirm'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleClose(true)}
                                className={`w-full py-2.5 rounded-xl ${config.buttonBg} ${config.buttonText} font-heading font-bold text-sm transition-all hover:shadow-lg`}
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Toast notification (for non-blocking alerts)
function ToastNotification({ toast, onClose }) {
    const [closing, setClosing] = useState(false)
    const config = ALERT_CONFIG[toast.type] || ALERT_CONFIG.info
    const Icon = config.icon

    useEffect(() => {
        const timer = setTimeout(() => {
            setClosing(true)
            setTimeout(() => onClose(), 300)
        }, toast.duration || 3000)
        return () => clearTimeout(timer)
    }, [toast, onClose])

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0f172a] border ${config.border} ${config.glow} ring-1 ${config.ring} min-w-[300px] max-w-md transition-all duration-300 ${closing ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0 animate-toast-in'}`}
        >
            <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={config.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
                {toast.title && <p className="text-white font-body text-sm font-semibold">{toast.title}</p>}
                <p className="text-gray-400 font-body text-xs">{toast.message}</p>
            </div>
            <button onClick={() => { setClosing(true); setTimeout(onClose, 300) }} className="text-gray-500 hover:text-white transition p-1">
                <X size={14} />
            </button>
        </div>
    )
}

// Provider component
export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([])
    const [toasts, setToasts] = useState([])

    const showAlert = useCallback((options) => {
        return new Promise((resolve) => {
            const id = Date.now() + Math.random()
            setAlerts(prev => [...prev, { ...options, id, resolve }])
        })
    }, [])

    const showToast = useCallback((options) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { ...options, id }])
    }, [])

    const handleAlertClose = useCallback((alert, result) => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id))
        alert.resolve(result)
    }, [])

    const handleToastClose = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Convenience methods
    const contextValue = {
        // Modal alerts (blocking)
        alert: (message, title) => showAlert({ type: 'info', message, title }),
        success: (message, title) => showAlert({ type: 'success', message, title: title || 'Success' }),
        error: (message, title) => showAlert({ type: 'error', message, title: title || 'Error' }),
        warning: (message, title) => showAlert({ type: 'warning', message, title: title || 'Warning' }),
        confirm: (message, title, confirmText) => showAlert({ type: 'confirm', message, title: title || 'Are you sure?', confirmText }),

        // Toast notifications (non-blocking)
        toast: {
            success: (message, title) => showToast({ type: 'success', message, title }),
            error: (message, title) => showToast({ type: 'error', message, title }),
            warning: (message, title) => showToast({ type: 'warning', message, title }),
            info: (message, title) => showToast({ type: 'info', message, title }),
        },
    }

    return (
        <AlertContext.Provider value={contextValue}>
            {children}

            {/* Modal Alerts */}
            {alerts.map(alert => (
                <AlertModal key={alert.id} alert={alert} onClose={(result) => handleAlertClose(alert, result)} />
            ))}

            {/* Toast Notifications */}
            {toasts.length > 0 && (
                <div className="fixed top-4 right-4 z-[101] space-y-3">
                    {toasts.map(toast => (
                        <ToastNotification key={toast.id} toast={toast} onClose={() => handleToastClose(toast.id)} />
                    ))}
                </div>
            )}
        </AlertContext.Provider>
    )
}

// Hook to use alerts
export function useAlert() {
    const context = useContext(AlertContext)
    if (!context) throw new Error('useAlert must be used within an AlertProvider')
    return context
}
