const { getModel } = require('../config/gemini');

const runAI = async (prompt, imageBase64, imageMimeType) => {
    try {
        const model = getModel();
        
        // We prompt the model to return valid JSON
        let contentPayload = prompt;
        if (imageBase64 && imageMimeType) {
            contentPayload = [
                prompt,
                { inlineData: { data: imageBase64, mimeType: imageMimeType } }
            ];
        }

        const result = await model.generateContent(contentPayload);
        const text = result.response.text();
        
        console.log("Raw AI Output:", text);
        
        let parsedResult = text;
        try {
            // Strip markdown block if model ignored the "DON'T USE MARKDOWN" instruction
            const cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
            parsedResult = JSON.parse(cleanText);
        } catch (e) {
            console.warn("AI didn't return valid JSON structure, returning raw text fallback");
        }

        return parsedResult;
    } catch (error) {
        console.error('Gemini AI execution failed:', error.message);
        throw error;
    }
};

module.exports = { runAI };
