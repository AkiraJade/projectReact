const User = require('../models/user')
const jwt = require("jsonwebtoken")

exports.isAuthenticatedUser = async (req, res, next) => {
    let token = req.cookies?.token;
    if ((!token || token === 'null' || token === 'undefined' || token === 'false') && req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
        const bearer = req.headers.authorization.split(' ')[1];
        if (bearer && bearer !== 'null' && bearer !== 'undefined' && bearer !== 'false') {
            token = bearer;
        }
    }

    if (!token || token === 'null' || token === 'undefined' || token === 'false') {
        return res.status(401).json({ message: 'Login first to access this resource' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }
        if (req.user.isDeleted === true || req.user.status === 'deactivated') {
            return res.status(401).json({ message: 'Your account has been deactivated or removed' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired authentication token' });
    }
};

exports.authorizeRoles = (...roles) => {

    return (req, res, next) => {
        // console.log(roles, req.user, req.body);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role (${req.user.role}) is not allowed to acccess this resource` })

        }
        next()
    }
}