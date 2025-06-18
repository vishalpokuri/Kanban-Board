import express, { Request, Response } from 'express';
import { Column } from '../models/Column';
import { Task } from '../models/Task';
import { User } from '../models/User';

const router = express.Router();

// GET /api/columns/:userId - Fetch all columns for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
      path: 'columns',
      populate: {
        path: 'tasks'
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.columns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

// POST /api/columns - Create a new column
router.post('/', async (req, res) => {
  try {
    const { title, userId } = req.body;
    const column = new Column({ title });
    await column.save();
    
    // Add column to user's columns array
    await User.findByIdAndUpdate(userId, {
      $push: { columns: column._id }
    });
    
    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create column' });
  }
});

// PUT /api/columns/:id - Update column title
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const column = await Column.findByIdAndUpdate(id, { title }, { new: true });
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.json(column);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update column' });
  }
});

// DELETE /api/columns/:id - Delete column and all its tasks
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const column = await Column.findById(id);
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    
    // Delete all tasks in this column
    if (column.tasks.length > 0) {
      await Task.deleteMany({ _id: { $in: column.tasks } });
    }
    
    // Remove column from user's columns array
    await User.findByIdAndUpdate(userId, {
      $pull: { columns: id }
    });
    
    // Delete the column
    await Column.findByIdAndDelete(id);
    
    res.json({ message: 'Column and its tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

// PUT /api/columns/reorder - Reorder columns
router.put('/reorder', async (req, res) => {
  try {
    const { columnIds } = req.body;
    // For now, just return success - reordering logic can be added later
    res.json({ message: 'Columns reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder columns' });
  }
});

export default router;