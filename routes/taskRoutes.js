const express = require('express');
    const router = express.Router();
    const verifyToken = require('../middleware/verifyToken');
    const { getMyTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

    router.use(verifyToken); // EVERY route below this line requires a valid JWT

    router.route('/')
      .get(getMyTasks)
      .post(createTask);

    router.route('/:id')
      .patch(updateTask)
      .delete(deleteTask);

    module.exports = router;