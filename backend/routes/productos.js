const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/productosController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAll);              // público
router.get('/:id', getOne);           // público
router.post('/', protect, upload.single('imagen'), create);
router.put('/:id', protect, upload.single('imagen'), update);
router.delete('/:id', protect, remove);

module.exports = router;
