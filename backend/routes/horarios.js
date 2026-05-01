const router = require('express').Router();
const { getAll, upsert, addHora, remove, removeHora } = require('../controllers/horariosController');
const { protect } = require('../middleware/auth');

router.get('/', getAll);                          // público
router.post('/', protect, upsert);                // crear/actualizar día
router.patch('/:id/horas', protect, addHora);     // agregar hora a un día
router.delete('/:id', protect, remove);           // eliminar día completo
router.delete('/:id/horas/:hora', protect, removeHora); // quitar una hora

module.exports = router;
