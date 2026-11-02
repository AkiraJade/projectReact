const mongoose = require('mongoose');

let cachedPromise = null;

const connectDatabase = async () => {
    if (!process.env.DB_URI) {
        throw new Error('DB_URI environment variable is missing.');
    }

    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (!cachedPromise) {
        cachedPromise = mongoose.connect(process.env.DB_URI, {
            serverSelectionTimeoutMS: 5000,
        }).then((con) => {
            console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
            return con;
        }).catch((err) => {
            cachedPromise = null;
            throw err;
        });
    }

    return cachedPromise;
};

module.exports = connectDatabase;
