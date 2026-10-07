/**
 * Auth routes
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body().custom((value, { req }) => {
    if (!req.body.name && !req.body.full_name) {
      throw new Error('Name is required');
    }
    return true;
  }),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.get('/me', authenticate, authController.getMe);
router.get('/profile', authenticate, authController.getMe);
router.post('/refresh', authController.refreshToken);

module.exports = router;
