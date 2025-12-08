import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { timeUtils } from '../utils/time';
import { pdfGenerator } from '../utils/pdfGenerator';
import Scanner from '../components/Scanner';
import Modal from '../components/Modal';
import MeltingClock from '../components/MeltingClock';
import { QRCodeCanvas } from 'qrcode.react';
import { LogOut, QrCode, Clock, Calendar, AlertCircle, Scan, CheckCircle2, Settings, FileText, Download } from 'lucide-react';

const THEME_COLORS = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
];

export default function Dashboard() {
    const { user, logout, updateWeeklyHours } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [records, setRecords] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [weeklyMinutes, setWeeklyMinutes] = useState(0);
    const [toast, setToast] = useState(null);
    const [weeklyHoursInput, setWeeklyHoursInput] = useState(user?.weeklyHours || 40);

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

    // Sync weeklyHoursInput when user.weeklyHours changes
    useEffect(() => {
        if (user?.weeklyHours) {
            setWeeklyHoursInput(user.weeklyHours);
        }
    }, [user?.weeklyHours]);


    const isWorking = !!currentRecord;
    const userWeeklyHours = user?.weeklyHours || 40;
    const overtimeMinutes = Math.max(0, weeklyMinutes - (userWeeklyHours * 60));

    // Effect for Surrealist Time Dilation Mode
    useEffect(() => {
        if (isWorking) {
            document.body.classList.add('time-dilation-active');
        } else {
            document.body.classList.remove('time-dilation-active');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('time-dilation-active');
        };
    }, [isWorking]);

    const loadData = async () => {
        if (!user) return;

        try {
            const userRecords = await storage.getRecords(user.id);
            setRecords(userRecords);

            // Check if currently working (last record has no checkOut)
            const last = userRecords[userRecords.length - 1];
            if (last && !last.checkOut) {
                setCurrentRecord(last);
            } else {
                setCurrentRecord(null);
            }

            setWeeklyMinutes(timeUtils.getWeeklyHours(userRecords));
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    const handleScan = async (data) => {
        console.log('📷 [1/7] handleScan called with data:', data);

        if (!user) {
            console.error('❌ [2/7] No user found, aborting scan');
            return;
        }

        console.log('✅ [2/7] User OK:', user.id);

        const now = new Date().toISOString();
        let message = '';

        try {
            if (currentRecord) {
                console.log('⏳ [3/7] Checking OUT (currentRecord exists)');
                console.log('   Current record:', currentRecord);
                // Check Out
                const updated = { ...currentRecord, checkOut: now };
                console.log('⏳ [4/7] Calling storage.updateLastRecord...');
                await storage.updateLastRecord(user.id, updated);
                console.log('✅ [5/7] Record updated successfully');
                message = `Checked Out at ${timeUtils.formatTime(now)}`;
            } else {
                console.log('⏳ [3/7] Checking IN (no currentRecord)');
                // Check In
                const newRecord = { checkIn: now, checkOut: null };
                console.log('⏳ [4/7] Calling storage.saveRecord...');
                await storage.saveRecord(user.id, newRecord);
                console.log('✅ [5/7] Record saved successfully');
                message = `Checked In at ${timeUtils.formatTime(now)}`;
            }

            console.log('✅ [6/7] Setting toast and closing scanner');
            setToast(message);
            setIsScanning(false);
            console.log('⏳ [7/7] Reloading data...');
            loadData(); // Reload to get freshness (and IDs)
            console.log('✅ [7/7] Scan process completed successfully!');
        } catch (error) {
            console.error("💥 [EXCEPTION] Scan error:", error);
            setToast("Error saving record. Try again.");
        }
    };

    const handleThemeChange = (color) => {
        document.documentElement.style.setProperty('--primary', color);
        localStorage.setItem('theme-primary', color);
    };

    const handleUpdateWeeklyHours = async () => {
        const hours = parseInt(weeklyHoursInput);

        if (isNaN(hours) || hours < 1 || hours > 168) {
            setToast('Please enter valid hours (1-168)');
            return;
        }

        const result = await updateWeeklyHours(hours);
        if (result.success) {
            setToast(`Weekly hours updated to ${hours}h!`);
        } else {
            setToast('Error updating hours. Try again.');
        }
    };


    const handleDownloadReport = (type) => {
        if (records.length === 0) {
            setToast("No records to export!");
            return;
        }

        try {
            pdfGenerator.generateReport(records, type, user.name, reportMonth);
            setToast(`${type === 'total' ? 'Full' : 'Monthly'} Report Downloaded!`);
            setShowReportModal(false);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            setToast("Error generating PDF. Please try again.");
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px' }}>

            {/* Surrealist Clock Element */}
            <MeltingClock isWorking={isWorking} />

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
                    <button onClick={() => setShowReportModal(true)} className="btn btn-secondary" title="Download Reports">
                        <FileText size={18} />
                    </button>
                    <button onClick={() => setShowSettingsModal(true)} className="btn btn-secondary" title="Customize App">
                        <Settings size={18} />
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
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'normal' }}> / {userWeeklyHours}h</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', height: '6px', background: 'var(--surface-light)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (weeklyMinutes / (userWeeklyHours * 60)) * 100)}%`, height: '100%', background: 'var(--primary)', transition: 'width 1s ease-out' }}></div>
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

            {/* Reports Modal - NEW */}
            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                title="Download Work Reports"
            >
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Option 1: Full History */}
                    <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} color="var(--primary)" />
                            Complete History
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Download a PDF containing all your work logs from the beginning.
                        </p>
                        <button
                            onClick={() => handleDownloadReport('total')}
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <Download size={18} style={{ marginRight: '0.5rem' }} />
                            Download Full Report
                        </button>
                    </div>

                    {/* Option 2: Monthly */}
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} color="var(--primary)" />
                            Monthly Report
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Select a specific month to export.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="month"
                                value={reportMonth}
                                onChange={(e) => setReportMonth(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem'
                                }}
                            />
                            <button
                                onClick={() => handleDownloadReport('month')}
                                className="btn btn-primary"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Settings Modal */}
            <Modal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                title="Customize App"
            >
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Weekly Hours Setting */}
                    <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} color="var(--primary)" />
                            Official Weekly Hours
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Set your contracted weekly hours. Overtime will be calculated based on this value.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                min="1"
                                max="168"
                                value={weeklyHoursInput}
                                onChange={(e) => setWeeklyHoursInput(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: '60px' }}>hours/week</span>
                            <button
                                onClick={handleUpdateWeeklyHours}
                                className="btn btn-primary"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                Save
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Current: {userWeeklyHours}h/week
                        </p>
                    </div>

                    {/* Theme Color Setting */}
                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Theme Color</h4>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose your preferred accent color:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {THEME_COLORS.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => handleThemeChange(color.value)}
                                    style={{
                                        height: '3rem',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: color.value,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    title={color.name}
                                    className="hover-scale"
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    {color.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
