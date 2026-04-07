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

module.exports = { evaluateTriggers };
