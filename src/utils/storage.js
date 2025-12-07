import { supabase } from './supabase';

export const storage = {
    // Time Records
    getRecords: async (userId) => {
        const { data, error } = await supabase
            .from('time_records')
            .select('*')
            .eq('user_id', userId)
            .order('check_in', { ascending: true });

        if (error) {
            console.error('Error fetching records:', error);
            return [];
        }

        // Map snake_case to camelCase for frontend compatibility
        return data.map(record => ({
            id: record.id,
            checkIn: record.check_in,
            checkOut: record.check_out,
            // Keep original for reference if needed
            raw: record
        }));
    },

    saveRecord: async (userId, record) => {
        const { data, error } = await supabase
            .from('time_records')
            .insert([{
                user_id: userId,
                check_in: record.checkIn,
                check_out: record.checkOut
            }])
            .select();

        if (error) {
            console.error('Error saving record:', error);
            throw error;
        }
        return data;
    },

    updateLastRecord: async (userId, updatedRecord) => {
        // Prepare update object
        const updateData = { check_out: updatedRecord.checkOut };

        // If we have the specific record ID, use it (safest)
        if (updatedRecord.id) {
            const { error } = await supabase
                .from('time_records')
                .update(updateData)
                .eq('id', updatedRecord.id);
            if (error) console.error('Error updating record by ID:', error);
            return;
        }

        // Fallback: match by check_in time (less safe but works for migration)
        const { error } = await supabase
            .from('time_records')
            .update(updateData)
            .eq('user_id', userId)
            .eq('check_in', updatedRecord.checkIn);

        if (error) console.error('Error updating record by timestamp:', error);
    }
};
