const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/categoriasController');
const { protect } = require('../middleware/auth');

router.get('/', getAll);             // público (el frontend lo usa)
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
