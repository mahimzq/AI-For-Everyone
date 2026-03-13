import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const VerifyTicket = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // 'loading', 'valid', 'invalid', 'error'
    const [data, setData] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'https://ai4you.mindsetai.cloud/api';
                const response = await fetch(`${apiUrl}/registrations/verify/${token}`);
                const result = await response.json();

                if (response.ok && result.valid) {
                    setStatus('valid');
                    setData(result.registration);
                } else {
                    setStatus(response.status === 403 ? 'invalid' : 'error');
                    setMessage(result.message || 'Verification failed.');
                    if (result.registration) {
                        setData(result.registration);
                    }
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage('Cannot connect to verification server.');
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token]);

    return (
        <div style={{ backgroundColor: '#050B14', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: 'white', padding: '20px' }}>
            <div style={{ background: 'linear-gradient(145deg, #0A1628, #11223A)', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', border: '1px solid #1E3A5F', textAlign: 'center' }}>
                <h2 style={{ color: '#00E676', fontSize: '16px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>AI For Everybody</h2>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px', letterSpacing: '2px', textTransform: 'uppercase' }}>Ticket Verification</h1>
                
                {status === 'loading' && (
                    <div style={{ color: '#00E676', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <div style={{ width: '20px', height: '20px', border: '3px solid #00E676', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Verifying...
                    </div>
                )}

                {status === 'valid' && data && (
                    <div>
                        <div style={{ fontSize: '80px', color: '#00E676', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ fontSize: '32px', color: '#00E676', marginBottom: '10px', fontWeight: 'bold' }}>Valid Pass</h2>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                            <p style={{ color: '#8C9BAB', fontSize: '14px', textTransform: 'uppercase', marginBottom: '5px' }}>Attendee Name</p>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: '0 0 20px 0' }}>{data.full_name}</p>
                            
                            <p style={{ color: '#8C9BAB', fontSize: '14px', textTransform: 'uppercase', marginBottom: '5px' }}>Profession</p>
                            <p style={{ fontSize: '18px', color: '#E2E8F0', margin: '0' }}>{data.profession}</p>
                        </div>
                    </div>
                )}

                {status === 'invalid' && (
                    <div>
                         <div style={{ fontSize: '80px', color: '#FF3D00', marginBottom: '20px' }}>⛔</div>
                        <h2 style={{ fontSize: '28px', color: '#FF3D00', marginBottom: '10px', fontWeight: 'bold' }}>Not Confirmed</h2>
                        <p style={{ color: '#E2E8F0', fontSize: '16px' }}>{message}</p>
                        {data && (
                             <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
                                <p style={{ color: '#8C9BAB', fontSize: '14px', textTransform: 'uppercase', marginBottom: '5px' }}>Registered Name</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: '0 0 10px 0' }}>{data.full_name}</p>
                                <p style={{ color: '#FF3D00', fontSize: '14px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>Status: {data.status}</p>
                             </div>
                        )}
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div style={{ fontSize: '80px', color: '#FFB300', marginBottom: '20px' }}>⚠️</div>
                        <h2 style={{ fontSize: '28px', color: '#FFB300', marginBottom: '10px', fontWeight: 'bold' }}>Invalid Ticket</h2>
                        <p style={{ color: '#E2E8F0', fontSize: '16px' }}>{message}</p>
                    </div>
                )}

                <div style={{ marginTop: '40px' }}>
                    <Link to="/" style={{ color: '#00E676', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', padding: '10px 20px', border: '1px solid #00E676', borderRadius: '8px', transition: 'all 0.3s ease' }}>
                        Return to Homepage
                    </Link>
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VerifyTicket;
