const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

const getModel = () => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY is not set. Real AI responses will fail.');
    }
    // For general highly reasoning prompt tasks, we use generic gemini models
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

module.exports = { getModel };
