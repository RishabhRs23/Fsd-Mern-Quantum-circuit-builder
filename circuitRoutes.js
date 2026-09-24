const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCircuits,
  getCircuitById,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  simulate,
  simulateSaved,
  listTemplates,
  getTemplate
} = require('../controllers/circuitController');

// Templates (public list of fundamental algorithms available)
router.get('/templates/list', listTemplates);
router.get('/templates/:key', getTemplate);

// Ad-hoc simulation (no save required)
router.post('/simulate', protect, simulate);

// CRUD
router.route('/').get(protect, getCircuits).post(protect, createCircuit);
router
  .route('/:id')
  .get(protect, getCircuitById)
  .put(protect, updateCircuit)
  .delete(protect, deleteCircuit);

router.post('/:id/simulate', protect, simulateSaved);

module.exports = router;
