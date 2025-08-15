const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { validateAppointment } = require('../middleware/validation');

router.post('/', auth, validateAppointment, appointmentController.bookAppointment);

router.get('/', auth, appointmentController.getAppointments);

router.get('/upcoming', auth, appointmentController.getUpcomingAppointments);

router.put('/:id', auth, role('doctor', 'admin'), appointmentController.updateAppointmentStatus);

router.delete('/:id', auth, appointmentController.deleteAppointment);

module.exports = router; 
