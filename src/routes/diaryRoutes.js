const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateDiaryEntry } = require('../middlewares/validationMiddleware');

// All diary routes require authentication
router.use(authenticateToken);

// GET /diary - Get all user's diary entries with pagination
router.get('/', diaryController.getDiaries);

// GET /diary/:id - Get specific diary entry
router.get('/:id', diaryController.getDiaryById);

// POST /diary - Create new diary entry
router.post('/', validateDiaryEntry, diaryController.createDiary);

// PUT /diary/:id - Update diary entry
router.put('/:id', validateDiaryEntry, diaryController.updateDiary);

// DELETE /diary/:id - Delete diary entry
router.delete('/:id', diaryController.deleteDiary);

module.exports = router;