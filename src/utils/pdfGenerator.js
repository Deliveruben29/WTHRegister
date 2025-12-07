import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { timeUtils } from './time';

export const pdfGenerator = {
    generateReport: (records, type = 'total', userName = 'Employee', selectedMonth = null) => {
        const doc = new jsPDF();
        const now = new Date();
        const title = type === 'total'
            ? `Total Work Report - ${userName}`
            : `Monthly Work Report (${selectedMonth}) - ${userName}`;

        // 1. Filter Data
        let filteredRecords = records.filter(r => r.checkOut); // Only completed sessions

        if (type === 'month' && selectedMonth) {
            filteredRecords = filteredRecords.filter(r => {
                const recordDate = new Date(r.checkIn);
                const recordMonth = recordDate.toISOString().slice(0, 7); // YYYY-MM
                return recordMonth === selectedMonth;
            });
        }

        // 2. Calculate Totals
        let totalMinutes = 0;
        const tableRows = filteredRecords.map(r => {
            const date = timeUtils.formatDate(r.checkIn);
            const start = timeUtils.formatTime(r.checkIn);
            const end = timeUtils.formatTime(r.checkOut);
            const durationMins = timeUtils.calculateDurationMinutes(r.checkIn, r.checkOut);
            const durationStr = timeUtils.formatDuration(durationMins);

            totalMinutes += durationMins;

            return [date, start, end, durationStr];
        });

        // 3. Document Header
        doc.setFontSize(18);
        doc.text(title, 14, 20);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${now.toLocaleString()}`, 14, 30);
        doc.text(`Total Records: ${filteredRecords.length}`, 14, 37);
        doc.text(`Total Hours Worked: ${timeUtils.formatDuration(totalMinutes)}`, 14, 44);

        // 4. Draw Table
        doc.autoTable({
            startY: 55,
            head: [['Date', 'Start Time', 'End Time', 'Duration']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // 5. Save
        const fileName = `${userName.replace(/\s+/g, '_')}_${type}_Report.pdf`;
        doc.save(fileName);
    }
};
