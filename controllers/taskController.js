const Task = require('../models/Task');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getMyTasks = catchAsync(async (req, res) => {
    const tasks = await Task.find({ owner: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: tasks });
});

exports.createTask = catchAsync(async (req, res, next) => {
    const { title, priority } =  req.body;
    if (!title) return next(new AppError('Title is required', 400));
    const task = await Task.create({ title, priority, owner: req.user.id});
    res.status(201).json({ success: true, data: task });
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user.id}, 
        req.body,
        { 
            new: true, 
            runValidators: true 
        }
    );
    if (!task) return next(new AppError('Task not found', 404));
    res.json({ success: true, data: task });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
      const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
      if (!task) return next(new AppError('Task not found', 404));
      res.json({ success: true, message: 'Task deleted' });
    });