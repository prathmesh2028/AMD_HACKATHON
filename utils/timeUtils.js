/**
 * Helper to calculate the difference in hours between two ISO timestamps
 */
const getHourGap = (pastTimeISO, currentTimeISO = new Date().toISOString()) => {
    const past = new Date(pastTimeISO).getTime();
    const current = new Date(currentTimeISO).getTime();
    return (current - past) / (1000 * 60 * 60);
};

/**
 * Checks if current time is considered "Late Night" (e.g., between 9 PM and 4 AM)
 */
const isLateNight = (currentTimeISO) => {
    const hour = new Date(currentTimeISO).getHours();
    return hour >= 21 || hour < 4;
};

/**
 * Infer hunger level based on meal gap
 */
const inferHungerLevel = (gapInHours) => {
    if (gapInHours < 2) return 'Not Hungry';
    if (gapInHours < 4) return 'Moderate';
    return 'Starving';
};

/**
 * Infer energy level based on meal gap and time of day
 */
const inferEnergyLevel = (gapInHours, currentTimeISO) => {
    const hour = new Date(currentTimeISO).getHours();
    if (hour >= 14 && hour <= 16 && gapInHours > 4) return 'Low/Crash'; // The 3 PM crash
    if (gapInHours > 6) return 'Low';
    return 'Normal';
};

module.exports = { getHourGap, isLateNight, inferHungerLevel, inferEnergyLevel };
