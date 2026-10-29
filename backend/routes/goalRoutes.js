const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  addDeposit,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.patch('/:id/deposit', addDeposit);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

module.exports = router;
