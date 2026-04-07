/**
 * Standardizes API responses
 */
const successResponse = (res, data, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, error, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || error
    });
};

module.exports = { successResponse, errorResponse };
