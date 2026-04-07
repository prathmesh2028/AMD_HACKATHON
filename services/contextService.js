const { getRecentLogs } = require('./foodService');
const { inferHungerLevel, inferEnergyLevel, getHourGap } = require('../utils/timeUtils');
const { getNextBestAction, getBehaviorInsights, calculateHealthScore } = require('./intelligenceEngine');

/**
 * Builds the runtime context for the Prompt Engine
 */
const buildContext = async (userId, userProfile = {}) => {
    const time = new Date().toISOString();
    
    // 1. Fetch recent food logs
    const recentLogs = await getRecentLogs(userId, 5);
    
    // 2. Identify last meal
    let lastMeal = null;
    let gapInHours = 0;
    if (recentLogs.length > 0) {
        // Assume the first one is the latest (since ordered by timestamp desc)
        const latestLog = recentLogs[0];
        lastMeal = latestLog.timestamp; // We can parse this nicely in UI later
        gapInHours = getHourGap(lastMeal, time);
    }
    
    // 3. Generate crude history summary (in a real app, AI could summarize weekly patterns)
    const historySummary = recentLogs.length > 0 
        ? `User logged ${recentLogs.length} items recently. Mostly: ${recentLogs.map(l => l.food).join(', ')}` 
        : 'New user, no established pattern yet.';

    // 4. Infer Live State
    const liveState = {
        hunger: inferHungerLevel(gapInHours),
        energy: inferEnergyLevel(gapInHours, time)
    };

    const recentFoodsList = recentLogs.map(l => l.food);
    
    const contextObject = {
        profile: userProfile,
        time,
        last_meal: lastMeal || 'No logs yet',
        gap_hours: gapInHours,
        recent_foods: recentFoodsList,
        history_summary: historySummary,
        liveState
    };
    
    // Attach lightweight additions
    contextObject.next_best_action = getNextBestAction(contextObject);
    contextObject.insights = getBehaviorInsights(recentFoodsList);
    contextObject.health_score = calculateHealthScore(recentFoodsList, gapInHours);

    return contextObject;
};

module.exports = { buildContext };
