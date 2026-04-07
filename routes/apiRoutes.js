const express = require('express');
const router = express.Router();
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logFood } = require('../services/foodService');
const { buildContext } = require('../services/contextService');
const { buildMasterPrompt } = require('../prompts/systemPrompt');
const { runAI } = require('../services/aiService');
const { evaluateTriggers } = require('../services/intelligenceEngine');

// Fake user profile to pass if none provided natively
const defaultProfile = {
    age: 26,
    weight: '75kg',
    goal: 'fat loss',
    activity: 'moderately active',
    location: 'Office'
};

// 1. Log food manually
router.post('/log-food', async (req, res) => {
    try {
        const { userId, food } = req.body;
        if (!userId || !food) throw new Error('Missing userId or food');

        const result = await logFood(userId, food);
        
        // Smart trigger: Auto recommendation logic check on log
        const context = await buildContext(userId, defaultProfile);
        const triggers = evaluateTriggers(context);

        successResponse(res, { log: result, activeTriggers: triggers }, 'Food logged successfully');
    } catch (error) {
        errorResponse(res, error);
    }
});

// 2. Fetch context
router.get('/context/:userId', async (req, res) => {
    try {
        const context = await buildContext(req.params.userId, defaultProfile);
        const triggers = evaluateTriggers(context);
        successResponse(res, { context, behaviors: triggers });
    } catch (error) {
        errorResponse(res, error);
    }
});

// 3. Main analysis endpoint (Dynamic via type)
const handleAIRequest = async (req, res, inputType) => {
    try {
        const { userId, input, imageBase64, imageMimeType } = req.body;
        if (!userId) throw new Error('Missing userId');

        // Build context
        const contextData = await buildContext(userId, defaultProfile);
        
        // Inject Context into Master Prompt System
        const prompt = buildMasterPrompt(contextData, inputType, input || 'User triggered action.');
        
        // Execute Gemini
        const aiOutputJSON = await runAI(prompt, imageBase64, imageMimeType);

        successResponse(res, aiOutputJSON);
    } catch (error) {
        errorResponse(res, error);
    }
};

router.post('/analyze', (req, res) => handleAIRequest(req, res, 'food_analysis'));
router.post('/recommendation', (req, res) => handleAIRequest(req, res, 'recommendation'));
router.post('/chat', (req, res) => handleAIRequest(req, res, 'chat'));
router.post('/habit', (req, res) => handleAIRequest(req, res, 'habit_analysis'));

module.exports = router;
