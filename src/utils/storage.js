const USERS_KEY = 'time_tracker_users';
const CURRENT_USER_KEY = 'time_tracker_current_user';
const RECORDS_KEY = 'time_tracker_records';

export const storage = {
    getUsers: () => {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    },

    saveUser: (user) => {
        const users = storage.getUsers();
        users.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    findUser: (email) => {
        const users = storage.getUsers();
        return users.find(u => u.email === email);
    },

    login: (email, password) => {
        const user = storage.findUser(email);
        if (user && user.password === password) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: () => {
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Time Records
    getRecords: (userId) => {
        const allRecords = localStorage.getItem(RECORDS_KEY);
        const parsed = allRecords ? JSON.parse(allRecords) : {};
        return parsed[userId] || [];
    },

    saveRecord: (userId, record) => {
        const allRecords = localStorage.getItem(RECORDS_KEY);
        const parsed = allRecords ? JSON.parse(allRecords) : {};

        if (!parsed[userId]) {
            parsed[userId] = [];
        }

        parsed[userId].push(record);
        localStorage.setItem(RECORDS_KEY, JSON.stringify(parsed));
    },

    updateLastRecord: (userId, updatedRecord) => {
        const allRecords = localStorage.getItem(RECORDS_KEY);
        const parsed = allRecords ? JSON.parse(allRecords) : {};

        if (parsed[userId] && parsed[userId].length > 0) {
            parsed[userId][parsed[userId].length - 1] = updatedRecord;
            localStorage.setItem(RECORDS_KEY, JSON.stringify(parsed));
        }
    }
};
