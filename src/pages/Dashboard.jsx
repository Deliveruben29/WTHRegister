import { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { timeUtils } from '../utils/time';
import Scanner from '../components/Scanner';
import Modal from '../components/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { LogOut, QrCode, Clock, Calendar, AlertCircle, Scan, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [records, setRecords] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [weeklyMinutes, setWeeklyMinutes] = useState(0);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    // Clear toast after 3 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const loadData = () => {
        const userRecords = storage.getRecords(user.id);
        setRecords(userRecords);

        // Check if currently working (last record has no checkOut)
        const last = userRecords[userRecords.length - 1];
        if (last && !last.checkOut) {
            setCurrentRecord(last);
        } else {
            setCurrentRecord(null);
        }

        setWeeklyMinutes(timeUtils.getWeeklyHours(userRecords));
    };

    const handleScan = (data) => {
        // In a real app, we'd validate the QR data (e.g. "OFFICE_LOCATION_ID")
        // For this test, any scan triggers the action.

        const now = new Date().toISOString();
        let message = '';

        if (currentRecord) {
            // Check Out
            const updated = { ...currentRecord, checkOut: now };
            storage.updateLastRecord(user.id, updated);
            message = `Checked Out at ${timeUtils.formatTime(now)}`;
        } else {
            // Check In
            const newRecord = { checkIn: now, checkOut: null };
            storage.saveRecord(user.id, newRecord);
            message = `Checked In at ${timeUtils.formatTime(now)}`;
        }

        setToast(message);
        setIsScanning(false);
        loadData();
    };

    const isWorking = !!currentRecord;
    const overtimeMinutes = Math.max(0, weeklyMinutes - (40 * 60));

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>

            {/* Toast Notification */}
            {toast && (
                <div className="toast-success">
                    <CheckCircle2 size={24} color="var(--success)" />
                    {toast}
                </div>
            )}

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="animate-fade-in">
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Hi, {user?.name}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }} className="animate-fade-in">
                    <button onClick={() => setShowQRModal(true)} className="btn btn-secondary" title="Show My QR Code">
                        <QrCode size={18} />
                        <span style={{ marginLeft: '0.5rem', display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>My Code</span>
                    </button>
                    <button onClick={logout} className="btn btn-secondary" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Status Card */}
            <div className="card animate-fade-in" style={{
                marginBottom: '2rem',
                textAlign: 'center',
                borderTop: `4px solid ${isWorking ? 'var(--success)' : 'var(--text-muted)'}`,
            }}>
                <div style={{ marginBottom: '1rem' }}>
                    <span className={`status-badge ${isWorking ? 'working' : 'not-working'}`}>
                        {isWorking ? 'CURRENTLY WORKING' : 'NOT WORKING'}
                    </span>
                </div>

                <h2 style={{ fontSize: '3.5rem', fontWeight: '800', margin: '0.5rem 0', letterSpacing: '-1px' }}>
                    {isWorking ? timeUtils.formatTime(currentRecord.checkIn) : '--:--'}
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {isWorking ? 'Started working at' : 'Last check-out time'}
                </p>

                {/* Main Action Area */}
                <div style={{
                    margin: '2rem auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '400px'
                }}>

                    {isScanning ? (
                        <div style={{ width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                            <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />
                        </div>
                    ) : (
                        <>
                            {/* QR Show Wrapper */}
                            <div style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid #e2e8f0',
                                marginBottom: '1.5rem',
                                transition: 'transform 0.2s',
                            }}>
                                <QRCodeCanvas
                                    value={JSON.stringify({
                                        uid: user?.id,
                                        action: isWorking ? 'out' : 'in',
                                        ts: Date.now()
                                    })}
                                    size={160}
                                />
                            </div>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                Scan this at the kiosk OR use your camera
                            </p>

                            <button
                                onClick={() => setIsScanning(true)}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                <Scan size={20} />
                                Start Camera Scan
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                        <Clock size={18} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Weekly Hours</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {timeUtils.formatDuration(weeklyMinutes)}
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'normal' }}> / 40h</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', height: '6px', background: 'var(--surface-light)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (weeklyMinutes / (40 * 60)) * 100)}%`, height: '100%', background: 'var(--primary)', transition: 'width 1s ease-out' }}></div>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                        <AlertCircle size={18} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Overtime</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: overtimeMinutes > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
                        {timeUtils.formatDuration(overtimeMinutes)}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Unpaid overtime this week
                    </p>
                </div>
            </div>

            {/* History */}
            <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Calendar size={18} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Activity</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {records.slice().reverse().map((record, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: 'var(--surface-light)',
                            borderRadius: 'var(--radius-md)',
                            transition: 'background-color 0.2s'
                        }}>
                            <div>
                                <div style={{ fontWeight: '500' }}>{timeUtils.formatDate(record.checkIn)}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {timeUtils.formatTime(record.checkIn)} - {record.checkOut ? timeUtils.formatTime(record.checkOut) : 'Now'}
                                </div>
                            </div>
                            <div style={{ fontWeight: '600', color: record.checkOut ? 'var(--text-main)' : 'var(--success)' }}>
                                {record.checkOut ? timeUtils.formatDuration(timeUtils.calculateDurationMinutes(record.checkIn, record.checkOut)) : 'Running...'}
                            </div>
                        </div>
                    ))}
                    {records.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>No records yet.</p>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            <Modal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                title="My Employee QR Code"
            >
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <QRCodeCanvas value={user?.id || 'unknown'} size={250} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Scan this at the kiosk to check in/out.
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {user?.id}
                    </p>
                </div>
            </Modal>
        </div>
    );
}
