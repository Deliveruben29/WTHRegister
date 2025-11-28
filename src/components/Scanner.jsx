import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Scanner({ onScan, onClose }) {
    const [error, setError] = useState('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
                scanner.clear();
            },
            (errorMessage) => {
                // ignore errors for better UX, only log if critical
                // console.log(errorMessage);
            }
        );

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner. ", error);
            });
        };
    }, [onScan]);

    return (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Scan QR Code</h3>
                <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                    Close
                </button>
            </div>
            <div id="reader" style={{ width: '100%' }}></div>
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>
    );
}
