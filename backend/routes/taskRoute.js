const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/createTask', taskController.createTask);
router.get('/getTaskById/:id', taskController.getTaskById);
router.get('/getAllTasks', taskController.getAllTasks);
router.put('/updateTask/:id', taskController.updateTask);
router.delete('/deleteTask/:id', taskController.deleteTask);
router.put('/updateTasksOrder', taskController.updateTasksOrder); // Correct the path if it's differentmodule.exports = router;



module.exports = router;