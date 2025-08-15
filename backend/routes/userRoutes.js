const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { validateRegistration } = require('../middleware/validation');


router.post('/register', validateRegistration, userController.register);

router.post('/login', userController.login);

router.get('/me', auth, userController.getProfile);

router.put('/me', auth, userController.updateProfile);

router.get('/doctors', auth, userController.listDoctors);

router.get('/patients', auth, userController.listPatients);

router.get('/', auth, role('admin'), userController.listUsers);

router.delete('/:id', auth, role('admin'), userController.deleteUser);

module.exports = router; 