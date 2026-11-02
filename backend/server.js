const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const app = require('./app');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');

connectDatabase();

if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// In standard/local Node environment, start the HTTP server
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
        console.log(`server started on port: ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
}

module.exports = app;
