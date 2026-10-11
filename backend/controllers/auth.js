const User = require('../models/user');
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const sendEmail = require('../utils/sendEmail')
const sendToken = require('../utils/jwtToken');

exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }

        let avatarData = {
            public_id: 'default_avatar',
            url: 'https://res.cloudinary.com/dgneiaky7/image/upload/v1788417006/avatars/sycta145jvdzqjukfgxw.png'
        };

        if (req.body.avatar) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
                    folder: 'avatars',
                    width: 150,
                    crop: "scale"
                });
                avatarData = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            } catch (err) {
                console.log('Avatar upload error:', err.message);
            }
        } else if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'avatars',
                    width: 150,
                    crop: "scale"
                });
                avatarData = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            } catch (err) {
                console.log('Avatar file upload error:', err.message);
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            avatar: avatarData,
            role: 'user'
        });

        sendToken(user, 201, res);
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}

exports.loginUser = async (req, res, next) => {
    console.log(req.body)
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' })
    }


    // Finding user in database

    let user = await User.findOne({ email }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }


    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);


    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }
    // const token = user.getJwtToken();

    // res.status(201).json({
    //     success: true,
    //     token,
    //     user
    // });
    user = await User.findOne({ email })
    sendToken(user, 200, res)
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'User not found with this email' })

    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset password url
    const resetUrl = `${req.protocol}://localhost:5173/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message })

    }
}

exports.resetPassword = async (req, res, next) => {
    console.log(req.params.token)
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    console.log(user)

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })

    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })

    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = user.getJwtToken();
    return res.status(201).json({
        success: true,
        token,
        user
    });

}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    console.log(user)

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        }

        // Update avatar
        if (req.body.avatar && req.body.avatar !== '') {
            let user = await User.findById(req.user.id)
            if (user?.avatar?.public_id && !user.avatar.public_id.includes('default')) {
                try {
                    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
                } catch (e) {
                    console.log('Error removing old avatar:', e.message);
                }
            }
            try {
                const uploadRes = await cloudinary.v2.uploader.upload(req.body.avatar, {
                    folder: 'avatars',
                    width: 150,
                    crop: "scale"
                });
                newUserData.avatar = {
                    public_id: uploadRes.public_id,
                    url: uploadRes.secure_url
                }
            } catch (err) {
                console.log('Avatar upload failed:', err.message);
            }
        }

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
        })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        return res.status(200).json({
            success: true,
            user
        })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        const isMatched = await user.comparePassword(req.body.oldPassword);
        if (!isMatched) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }
        user.password = req.body.password;
        await user.save();
        const token = user.getJwtToken();

        return res.status(200).json({
            success: true,
            user,
            token
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.allUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id: ${req.params.id}` });
        }

        if (user.avatar?.public_id && !user.avatar.public_id.includes('default')) {
            try {
                await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            } catch (err) {
                console.log('Error destroying avatar:', err.message);
            }
        }

        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        // useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}

exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    return res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}