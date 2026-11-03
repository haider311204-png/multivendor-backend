const User = require('../models/User');
const Setting = require('../models/Setting');
const { hashPassword, comparePassword, generateToken } = require('../utils/authHelper');

// @desc    Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, storeName } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name, email, password: hashedPassword,
            role: role || 'buyer',
            storeName: role === 'seller' ? storeName : undefined,
            isApproved: role === 'seller' ? false : true 
        });

        if (user) {
            res.status(201).json({
                _id: user._id, name: user.name, email: user.email, role: user.role,
                token: generateToken(user._id, user.role)
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate user & get token
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (user.role === 'seller' && !user.isApproved) {
            return res.status(403).json({ message: 'Your seller account is pending admin approval.' });
        }

        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Admin ke liye saare users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Seller ko approve karein
const approveSeller = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isApproved = true;
            const updatedUser = await user.save();
            res.json({ message: 'Seller Approved Successfully', user: updatedUser });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Settings fetch karein
const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find({});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Settings update karein
const updateSettings = async (req, res) => {
    try {
        const { key, value } = req.body;
        let setting = await Setting.findOne({ key });
        if (setting) {
            setting.value = value;
            await setting.save();
        } else {
            setting = await Setting.create({ key, value });
        }
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, getAllUsers, approveSeller, getSettings, updateSettings };