const { isLateNight } = require('../utils/timeUtils');

/**
 * Checks context for any behavioral triggers and generates a system event/action
 */
const evaluateTriggers = (contextData) => {
    const triggers = [];

    // Rule 1: Time gap > 4 hours
    if (contextData.gap_hours && contextData.gap_hours > 4) {
        triggers.push({
            type: 'SUGGEST_MEAL',
            message: 'Blood sugar likely dropping. We should proactively suggest a protein-rich meal right now.'
        });
    }

    // Rule 2: Late Night Eating
    if (isLateNight(contextData.time)) {
        triggers.push({
            type: 'LATE_NIGHT_WARNING',
            message: 'It is late night. The user’s circadian rhythm is shutting down digestion. We should warn against heavy meals.'
        });
    }

    // Rule 3: Auto recommendation on app load
    if (contextData.gap_hours === 0 && contextData.recent_foods.length === 0) {
       triggers.push({
           type: 'WELCOME_RECOMMENDATION',
           message: 'New user or no food logged yet. Suggesting an optimal first meal.'
       });
    }

    return triggers;
};

const getNextBestAction = (contextData) => {
    if (contextData.gap_hours && contextData.gap_hours > 4) {
        return "It's been over 4 hours since your last meal. Suggest eating a balanced, protein-rich meal soon.";
    }
    return "You're good on meals for now! Stay hydrated or grab a light snack if you feel hungry.";
};

const getBehaviorInsights = (recentFoods) => {
    const insights = [];
    const foods = recentFoods.map(f => f.toLowerCase());
    
    const hasJunk = foods.some(f => f.includes('samosa') || f.includes('pizza') || f.includes('burger') || f.includes('chips') || f.includes('fries'));
    const hasProtein = foods.some(f => f.includes('chicken') || f.includes('egg') || f.includes('dal') || f.includes('paneer') || f.includes('protein'));
    
    if (hasJunk) insights.push("You tend to snack on processed foods or junk items.");
    if (!hasProtein && foods.length > 0) insights.push("Your recent protein intake seems low.");
    
    return insights.slice(0, 2);
};

const calculateHealthScore = (recentFoods, gapHours) => {
    let score = 100;
    const foods = recentFoods.map(f => f.toLowerCase());
    
    const hasJunk = foods.some(f => f.includes('samosa') || f.includes('pizza') || f.includes('burger') || f.includes('chips'));
    const hasProtein = foods.some(f => f.includes('chicken') || f.includes('egg') || f.includes('dal') || f.includes('paneer') || f.includes('protein'));
    
    if (hasJunk) score -= 20;
    if (!hasProtein && foods.length > 0) score -= 10;
    if (gapHours && gapHours > 6) score -= 10;
    
    // Clamp score
    if (score < 0) score = 0;
    
    return `Health Score: ${score}/100`;
};

module.exports = { evaluateTriggers, getNextBestAction, getBehaviorInsights, calculateHealthScore };
