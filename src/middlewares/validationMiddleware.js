const { body } = require('express-validator');

const validationMiddleware = {
  // User registration validation
  validateRegistration: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
  ],

  // User login validation
  validateLogin: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Diary entry validation
  validateDiaryEntry: [
    body('title')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters')
      .trim(),
    
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters long')
      .isLength({ max: 10000 })
      .withMessage('Content must not exceed 10,000 characters')
      .trim()
  ],

  // Search validation
  validateSearch: [
    body('query')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters')
      .trim(),
    
    body('dateFrom')
      .optional()
      .isISO8601()
      .withMessage('dateFrom must be a valid date'),
    
    body('dateTo')
      .optional()
      .isISO8601()
      .withMessage('dateTo must be a valid date')
      .custom((value, { req }) => {
        if (req.body.dateFrom && value < req.body.dateFrom) {
          throw new Error('dateTo must be after dateFrom');
        }
        return true;
      })
  ]
};

module.exports = validationMiddleware;