// Date utilities using native JS

// We'll use native Date for simplicity if date-fns is not installed, but date-fns is better.
// Since I didn't install date-fns, I'll write native helpers.

export const timeUtils = {
    formatTime: (dateString) => {
        if (!dateString) return '--:--';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    formatDate: (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    },

    calculateDurationMinutes: (start, end) => {
        if (!start || !end) return 0;
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return Math.floor((endTime - startTime) / 60000); // minutes
    },

    formatDuration: (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    },

    getWeeklyHours: (records) => {
        // records is an array of { checkIn: ISOString, checkOut: ISOString }
        // We assume records are sorted or we just sum them all if they belong to current week
        // For this prototype, we'll just sum ALL records for simplicity or filter by current week.

        const now = new Date();
        // Start of week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        let totalMinutes = 0;

        records.forEach(record => {
            const recordDate = new Date(record.checkIn);
            if (recordDate >= monday) {
                if (record.checkOut) {
                    totalMinutes += timeUtils.calculateDurationMinutes(record.checkIn, record.checkOut);
                } else {
                    // If currently working, count until now? Or just ignore?
                    // Usually we ignore until checked out for "completed" hours, 
                    // but for "current" status we might want to show elapsed.
                    // Let's ignore for total weekly calculation until checked out.
                }
            }
        });

        return totalMinutes;
    }
};
