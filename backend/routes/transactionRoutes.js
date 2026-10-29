const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportCSV,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect); // All transaction routes protected

router.get('/summary', getSummary);
router.get('/export/csv', exportCSV);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
