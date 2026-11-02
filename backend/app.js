const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDatabase = require('./config/database');
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow during dev/preview
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Root health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Dosnoventa API is running successfully'
    });
});

// Serverless DB connection middleware (ensures Mongoose is ready before running any controller)
app.use(async (req, res, next) => {
    try {
        await connectDatabase();
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Database connection failed: ${err.message}. If running on Vercel, please verify that '0.0.0.0/0' is whitelisted in MongoDB Atlas Network Access.`
        });
    }
});

const errorMiddleware = require('./middlewares/errors');

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);

app.use(errorMiddleware);

module.exports = app;
