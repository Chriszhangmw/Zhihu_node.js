const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({ prefix: '/questions/:questionId/answers' });
const { find, checkAnswerExist, findById,
    create, checkAnswerer, update, delete: del,
} = require('../controllers/answer');

const { secret } = require('../config');
const auth = jwt({ secret });


router.get('/', find);
router.post('/', auth, create);
router.get('/:id', checkAnswerExist, findById);
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update);
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del);




module.exports = router;

