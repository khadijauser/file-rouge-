const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');


router.get('/', serviceController.listServices);


router.post('/', [auth, role('admin')], serviceController.createService);
router.put('/:id', [auth, role('admin')], serviceController.updateService);
router.delete('/:id', [auth, role('admin')], serviceController.deleteService);

module.exports = router;


