module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    let error = { ...err };
    error.message = err.message || 'Internal Server Error';

    // Handling Multer Errors (e.g. LIMIT_FILE_SIZE or unsupported file)
    if (err.name === 'MulterError') {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'File is too large. Maximum allowed size is 5MB.'
            : err.message;
        return res.status(400).json({
            success: false,
            message
        });
    }

    if (err.message && err.message.includes('Unsupported file type')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Wrong Mongoose Object ID Error (CastError)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        return res.status(404).json({
            success: false,
            message
        });
    }

    // Handling Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message).join(', ');
        return res.status(400).json({
            success: false,
            message
        });
    }

    // Handling Mongoose duplicate key errors
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue || {})} entered`;
        return res.status(400).json({
            success: false,
            message
        });
    }

    // Handling wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'JSON Web Token is invalid. Try Again.';
        return res.status(401).json({
            success: false,
            message
        });
    }

    // Handling Expired JWT error
    if (err.name === 'TokenExpiredError') {
        const message = 'JSON Web Token has expired. Please log in again.';
        return res.status(401).json({
            success: false,
            message
        });
    }

    const isDevelopment = process.env.NODE_ENV === 'DEVELOPMENT';
    res.status(err.statusCode).json({
        success: false,
        message: error.message,
        ...(isDevelopment ? { error: err, stack: err.stack } : {})
    });
};
