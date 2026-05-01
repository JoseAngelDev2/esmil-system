const router = require('express').Router();
const { getAll, getOne, create, updateEstado, getStats } = require('../controllers/pedidosController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.post('/', create);                          // público (el frontend lo usa)
router.put('/:id', protect, updateEstado);

module.exports = router;
