const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');


const validateRegistration = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

const validatePasswordReset = [
  check('email', 'Please include a valid email').isEmail(),
  check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];


router.post('/register', validateRegistration, userController.register);
router.post('/login', userController.login);


router.get('/me', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);


router.post(
  '/reset-password', 
  [auth, role('admin')], 
  validatePasswordReset, 
  userController.resetUserPassword
);

router.get('/doctors', auth, userController.listDoctors);
router.get('/patients', auth, userController.listPatients);
router.get('/all', [auth, role('admin')], userController.listUsers);
router.put('/:id', [auth, role('admin')], userController.updateUser);
router.delete('/:id', [auth, role('admin')], userController.deleteUser);

module.exports = router;