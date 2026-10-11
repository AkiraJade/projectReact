const multer = require("multer");
const path = require("path");

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

module.exports = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        fieldSize: 25 * 1024 * 1024
    },
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const mime = (file.mimetype || "").toLowerCase();

        const isExtValid = ALLOWED_EXTENSIONS.includes(ext);
        const isMimeValid = ALLOWED_MIMETYPES.includes(mime);

        if (!isExtValid || !isMimeValid) {
            return cb(new Error("Unsupported file type. Please upload a JPG, PNG, or WebP image."), false);
        }

        cb(null, true);
    },
});