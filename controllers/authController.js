const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
     if (!name || !email || !password) 
        return next(new AppError('All fields are required', 400));

     const existing = await User.findOne({ email });
     if (existing)
        return next(new AppError('Email already registered', 409));

     const hashedPassword = await bcrypt.hash(password, 10);
     const user = await User.create({ name, email, password: hashedPassword });

     res.status(201).json({ success: true, message: 'Registered successfully', userId: user._id });
});


exports.login = catchAsync(async (req, res, next)=>{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user)
        return next(new AppError('Invalid email or password', 401));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError('Invalid email or password', 401));

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { 
        expiresIn: '7d' 
    });
      res.json({ 
        success: true, 
        message: `Welcome back, ${user.name}!`, 
        token 
    });
});

