const { db } = require('../config/firebase');

const logFood = async (userId, foodString) => {
    try {
        const timestamp = new Date().toISOString();
        const docRef = await db.collection('foodLogs').add({
            userId,
            food: foodString,
            timestamp
        });
        return { id: docRef.id, food: foodString, timestamp };
    } catch (error) {
        console.error('Error logging food:', error);
        throw error;
    }
};

const getRecentLogs = async (userId, limit = 5) => {
    try {
        const snapshot = await db.collection('foodLogs')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        if (snapshot.empty) {
            return [];
        }

        const logs = [];
        snapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        
        return logs;
    } catch (error) {
        console.error('Error fetching recent food logs:', error);
        throw error;
    }
};

module.exports = { logFood, getRecentLogs };
