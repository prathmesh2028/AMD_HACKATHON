const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

let db;
let usingMock = false;

// Mock database for hackathon failsafe
const mockDB = {
    collections: {},
    collection(name) {
        if (!this.collections[name]) this.collections[name] = [];
        return {
            add: async (data) => {
                const doc = { id: Date.now().toString(), ...data };
                mockDB.collections[name].push(doc);
                return { id: doc.id };
            },
            where(field, op, value) {
                // simple mock where clause
                const filtered = mockDB.collections[name].filter(item => {
                    if (op === '==') return item[field] === value;
                    return true;
                });
                return {
                    orderBy() { return this; },
                    limit(n) {
                        return {
                            get: async () => {
                                const docs = filtered.slice(-n).map(doc => ({
                                    id: doc.id,
                                    data: () => doc
                                }));
                                return { empty: docs.length === 0, docs };
                            }
                        };
                    },
                    get: async () => {
                        const docs = filtered.map(doc => ({
                            id: doc.id,
                            data: () => doc
                        }));
                        return { empty: docs.length === 0, docs };
                    }
                };
            }
        };
    }
};

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(`../${serviceAccountPath}`);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log('🔥 Firebase connected successfully.');
    } else {
        console.warn('⚠️ Firebase credentials not found at path:', serviceAccountPath);
        console.warn('🛠️ Falling back to in-memory Mock DB for hackathon stability.');
        db = mockDB;
        usingMock = true;
    }
} catch (error) {
    console.error('❌ Failed to init Firebase:', error.message);
    db = mockDB;
    usingMock = true;
}

module.exports = { db, admin, usingMock };
