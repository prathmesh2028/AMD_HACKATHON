require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const { usingMock } = require('./config/firebase');

const app = express();
const INITIAL_PORT = parseInt(process.env.PORT || '5000', 10);
let currentPort = INITIAL_PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: "ok", port: currentPort });
});

// Legacy root endpoint
app.get('/', (req, res) => {
    res.json({ success: true, message: 'NutriEngine API is running in real-time!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Global API Error caught:', err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error', details: err.message });
});

// Smart Port Handling & Safe Boot
const startServer = (port) => {
    const server = app.listen(port)
        .on('listening', () => {
            currentPort = port;
            console.log('\n======================================');
            console.log(`🚀 NutriEngine Backend Online!`);
            console.log(`🌐 URL: http://localhost:${port}`);
            console.log(`🧠 AI Status: Gemini Active`);
            console.log(`💾 Database: ${usingMock ? 'In-Memory Hacks (Mock DB)' : 'Connected to Firestore'}`);
            console.log('======================================\n');
        })
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`⚠️ Port ${port} busy -> switched to ${port + 1}`);
                startServer(port + 1); // Try the next port recursively
            } else {
                console.error('❌ Critical Server Boot Error:', err);
            }
        });
};

// Initiate boot sequence
startServer(INITIAL_PORT);
