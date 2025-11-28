import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { timeUtils } from '../utils/time';
import Scanner from '../components/Scanner';
import Modal from '../components/Modal';
import { QRCodeCanvas } from 'qrcode.react';
import { LogOut, QrCode, Clock, Calendar, AlertCircle, Scan } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [records, setRecords] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [weeklyMinutes, setWeeklyMinutes] = useState(0);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

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

        if (currentRecord) {
            // Check Out
            const updated = { ...currentRecord, checkOut: now };
            storage.updateLastRecord(user.id, updated);
            alert(`Checked Out at ${timeUtils.formatTime(now)}`);
        } else {
            // Check In
            const newRecord = { checkIn: now, checkOut: null };
            storage.saveRecord(user.id, newRecord);
            alert(`Checked In at ${timeUtils.formatTime(now)}`);
        }

        setIsScanning(false);
        loadData();
    };

    const isWorking = !!currentRecord;
    const overtimeMinutes = Math.max(0, weeklyMinutes - (40 * 60));

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Hi, {user?.name}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            <div className="card" style={{
                marginBottom: '2rem',
                textAlign: 'center',
                borderTop: `4px solid ${isWorking ? 'var(--success)' : 'var(--text-muted)'}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        backgroundColor: isWorking ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                        color: isWorking ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}>
                        {isWorking ? 'CURRENTLY WORKING' : 'NOT WORKING'}
                    </span>
                </div>

                <h2 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    {isWorking ? timeUtils.formatTime(currentRecord.checkIn) : '--:--'}
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {isWorking ? 'Started working at' : 'Last check-out time'}
                </p>

                {isScanning ? (
                    <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />
                ) : (
                    <button
                        onClick={() => setIsScanning(true)}
                        className={`btn ${isWorking ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ width: '100%', maxWidth: '300px' }}
                    >
                        <Scan size={20} />
                        {isWorking ? 'Scan to Check Out' : 'Scan to Check In'}
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                        <Clock size={18} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Weekly Hours</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {timeUtils.formatDuration(weeklyMinutes)}
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'normal' }}> / 40h</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', height: '6px', background: 'var(--surface-light)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (weeklyMinutes / (40 * 60)) * 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
                    </div>
                </div>

                <div className="card">
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
            <div className="card">
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
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <div>
                                <div style={{ fontWeight: '500' }}>{timeUtils.formatDate(record.checkIn)}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {timeUtils.formatTime(record.checkIn)} - {record.checkOut ? timeUtils.formatTime(record.checkOut) : 'Now'}
                                </div>
                            </div>
                            <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                {record.checkOut ? timeUtils.formatDuration(timeUtils.calculateDurationMinutes(record.checkIn, record.checkOut)) : '...'}
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
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '1rem' }}>
                        <QRCodeCanvas value={user?.id || 'unknown'} size={250} />
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Scan this code at the kiosk to check in or out.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
