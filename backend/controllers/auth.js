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

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'avatars',
                    width: 300,
                    crop: "scale"
                });
                avatarData = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            } catch (err) {
                console.log('Avatar file upload error:', err.message);
            }
        } else if (req.body.avatar && typeof req.body.avatar === 'string' && req.body.avatar.trim() !== '') {
            try {
                const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
                    folder: 'avatars',
                    width: 300,
                    crop: "scale"
                });
                avatarData = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            } catch (err) {
                console.log('Avatar upload error:', err.message);
            }
        }

        // Parse and validate optional delivery address
        let addressObj = null;
        if (req.body.address) {
            try {
                addressObj = typeof req.body.address === 'string' ? JSON.parse(req.body.address) : req.body.address;
            } catch (e) {
                addressObj = null;
            }
        } else if (
            req.body.addressLine1 || req.body.city || req.body.postalCode ||
            req.body.country || req.body.recipientName || req.body.phone
        ) {
            addressObj = {
                label: req.body.label || 'Home',
                recipientName: req.body.recipientName,
                phone: req.body.phone,
                addressLine1: req.body.addressLine1,
                addressLine2: req.body.addressLine2 || '',
                city: req.body.city,
                province: req.body.province || '',
                postalCode: req.body.postalCode,
                country: req.body.country,
                isDefault: req.body.isDefault !== undefined ? (req.body.isDefault === true || req.body.isDefault === 'true') : true
            };
        }

        let userAddresses = [];
        if (addressObj) {
            const hasAnyField = Object.entries(addressObj).some(
                ([k, v]) => k !== 'isDefault' && k !== 'label' && typeof v === 'string' && v.trim() !== ''
            );

            if (hasAnyField) {
                const { recipientName, phone, addressLine1, city, postalCode, country } = addressObj;
                if (!recipientName?.trim() || !phone?.trim() || !addressLine1?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Incomplete delivery address: Recipient name, phone, address line 1, city, postal code, and country are required.'
                    });
                }

                userAddresses.push({
                    label: addressObj.label?.trim() || 'Home',
                    recipientName: recipientName.trim(),
                    phone: phone.trim(),
                    addressLine1: addressLine1.trim(),
                    addressLine2: (addressObj.addressLine2 || '').trim(),
                    city: city.trim(),
                    province: (addressObj.province || '').trim(),
                    postalCode: postalCode.trim(),
                    country: country.trim(),
                    isDefault: true
                });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            avatar: avatarData,
            addresses: userAddresses,
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

    if (user.isDeleted === true || user.status === 'deactivated') {
        return res.status(401).json({ message: 'Your account has been deactivated or removed. Please contact support.' });
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
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;

        let newAvatarData = null;
        let oldPublicId = user.avatar?.public_id;

        if (req.file) {
            try {
                const uploadRes = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'avatars',
                    width: 300,
                    crop: "scale"
                });
                newAvatarData = {
                    public_id: uploadRes.public_id,
                    url: uploadRes.secure_url
                };
            } catch (err) {
                console.log('Avatar file upload failed:', err.message);
                return res.status(400).json({ success: false, message: 'Avatar upload failed: ' + err.message });
            }
        } else if (req.body.avatar && typeof req.body.avatar === 'string' && req.body.avatar.trim() !== '') {
            try {
                const uploadRes = await cloudinary.v2.uploader.upload(req.body.avatar, {
                    folder: 'avatars',
                    width: 300,
                    crop: "scale"
                });
                newAvatarData = {
                    public_id: uploadRes.public_id,
                    url: uploadRes.secure_url
                };
            } catch (err) {
                console.log('Avatar upload failed:', err.message);
                return res.status(400).json({ success: false, message: 'Avatar upload failed: ' + err.message });
            }
        }

        if (newAvatarData) {
            user.avatar = newAvatarData;
        }

        await user.save();

        // Destroy old Cloudinary avatar only after database update succeeds
        if (newAvatarData && oldPublicId && !oldPublicId.includes('default')) {
            try {
                await cloudinary.v2.uploader.destroy(oldPublicId);
            } catch (e) {
                console.log('Error destroying old avatar asset:', e.message);
            }
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// =========================================================================
// SAVED ADDRESS MANAGEMENT CONTROLLERS
// =========================================================================

exports.getUserAddresses = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            addresses: user.addresses || []
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.addAddress = async (req, res, next) => {
    try {
        const { label, recipientName, phone, addressLine1, addressLine2, city, province, postalCode, country, isDefault } = req.body;

        if (!recipientName?.trim() || !phone?.trim() || !addressLine1?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Recipient name, phone, address line 1, city, postal code, and country are required.'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const shouldBeDefault = isDefault === true || isDefault === 'true' || (user.addresses && user.addresses.length === 0);

        if (shouldBeDefault && user.addresses) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }

        const newAddress = {
            label: label?.trim() || 'Home',
            recipientName: recipientName.trim(),
            phone: phone.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: (addressLine2 || '').trim(),
            city: city.trim(),
            province: (province || '').trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
            isDefault: shouldBeDefault,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        user.addresses.push(newAddress);
        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Address added successfully',
            addresses: user.addresses
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const { label, recipientName, phone, addressLine1, addressLine2, city, province, postalCode, country, isDefault } = req.body;

        if (recipientName !== undefined) address.recipientName = recipientName.trim();
        if (phone !== undefined) address.phone = phone.trim();
        if (addressLine1 !== undefined) address.addressLine1 = addressLine1.trim();
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
        if (city !== undefined) address.city = city.trim();
        if (province !== undefined) address.province = province.trim();
        if (postalCode !== undefined) address.postalCode = postalCode.trim();
        if (country !== undefined) address.country = country.trim();
        if (label !== undefined) address.label = label.trim();

        if (!address.recipientName || !address.phone || !address.addressLine1 || !address.city || !address.postalCode || !address.country) {
            return res.status(400).json({
                success: false,
                message: 'Recipient name, phone, address line 1, city, postal code, and country are required.'
            });
        }

        if (isDefault === true || isDefault === 'true') {
            user.addresses.forEach(a => { a.isDefault = false; });
            address.isDefault = true;
        }

        address.updatedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            addresses: user.addresses
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const wasDefault = address.isDefault;
        user.addresses.pull({ _id: addressId });

        // Policy: if default address was deleted, set the first remaining address as default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            addresses: user.addresses
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

exports.setDefaultAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const target = user.addresses.id(addressId);
        if (!target) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        user.addresses.forEach(a => {
            a.isDefault = a._id.toString() === addressId;
        });

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            addresses: user.addresses
        });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

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
        const users = await User.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Soft-delete / Deactivate Customer => DELETE /api/v1/admin/user/:id
exports.deleteUser = async (req, res, next) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ success: false, message: 'You cannot deactivate your own administrative account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id: ${req.params.id}` });
        }

        if (user.isDeleted === true) {
            return res.status(400).json({ success: false, message: 'User is already deactivated and in Trash' });
        }

        user.isDeleted = true;
        user.status = 'deactivated';
        user.deletedAt = new Date();
        user.deletedBy = req.user.id;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Customer account deactivated and moved to Trash'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Restore Customer => PUT /api/v1/admin/user/:id/restore
exports.restoreUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id: ${req.params.id}` });
        }

        if (!user.isDeleted) {
            return res.status(400).json({ success: false, message: 'Customer account is not in Trash' });
        }

        user.isDeleted = false;
        user.status = 'active';
        user.deletedAt = null;
        user.deletedBy = null;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'Customer account restored successfully'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Get all trashed customers => GET /api/v1/admin/trash/users
exports.getTrashUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isDeleted: true })
            .populate('deletedBy', 'name email')
            .sort({ deletedAt: -1 });
        return res.status(200).json({
            success: true,
            users
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

// Permanent delete customer (with order dependency protection) => DELETE /api/v1/admin/user/:id/permanent
exports.permanentDeleteUser = async (req, res, next) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ success: false, message: 'You cannot permanently delete your own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id: ${req.params.id}` });
        }

        // Check if customer has historical order records
        const Order = require('../models/order');
        const ordersCount = await Order.countDocuments({ user: req.params.id });
        if (ordersCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot permanently delete this customer because they have historical orders on record. The account will remain deactivated in Trash to preserve receipt and audit integrity.'
            });
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
            message: 'Customer account permanently deleted'
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

// Social Login (Firebase) => /api/v1/auth/social-login
exports.socialLogin = async (req, res, next) => {
    try {
        const { name, email, avatar, uid, provider } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required for social login' });
        }

        let user = await User.findOne({ email });

        if (user && (user.isDeleted === true || user.status === 'deactivated')) {
            return res.status(401).json({ success: false, message: 'Your account has been deactivated or removed. Please contact support.' });
        }

        if (!user) {
            // Auto-register: create account with a random secure password
            const randomPassword = Math.random().toString(36).slice(-12) + uid.slice(-4);
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: randomPassword,
                avatar: avatar ? { public_id: `${provider}_${uid}`, url: avatar } : {
                    public_id: 'default_avatar',
                    url: 'https://res.cloudinary.com/dgneiaky7/image/upload/v1788417006/avatars/sycta145jvdzqjukfgxw.png'
                },
                role: 'user'
            });
        }

        // Issue JWT
        const token = user.getJwtToken ? user.getJwtToken() : require('jsonwebtoken').sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_TIME || '7d' }
        );

        const options = {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'lax'
        };

        res.status(200).cookie('token', token, options).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};