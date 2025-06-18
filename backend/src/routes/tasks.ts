import express, { Request, Response } from 'express';
import { Task } from '../models/Task';
import { Column } from '../models/Column';

const router = express.Router();

// GET /api/tasks/:columnId - Fetch all tasks for a column
router.get('/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;
    const column = await Column.findById(columnId).populate('tasks');
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.json(column.tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { columnId, content } = req.body;
    const task = new Task({ content });
    await task.save();
    
    // Add task to column's tasks array
    await Column.findByIdAndUpdate(columnId, {
      $push: { tasks: task._id }
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update task content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const task = await Task.findByIdAndUpdate(id, { content }, { new: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { columnId } = req.body;
    
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Remove task from column's tasks array
    await Column.findByIdAndUpdate(columnId, {
      $pull: { tasks: id }
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PUT /api/tasks/:id/move - Move task to different column
router.put('/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { fromColumnId, toColumnId } = req.body;
    
    // Remove task from old column
    await Column.findByIdAndUpdate(fromColumnId, {
      $pull: { tasks: id }
    });
    
    // Add task to new column
    await Column.findByIdAndUpdate(toColumnId, {
      $push: { tasks: id }
    });
    
    const task = await Task.findById(id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to move task' });
  }
});

// PUT /api/tasks/reorder - Reorder tasks
router.put('/reorder', async (req, res) => {
  try {
    const { taskIds } = req.body;
    // For now, just return success - reordering logic can be added later
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

export default router;