const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({ prefix: '/questions' });
const { find, checkQuestionExist, findById,
    create, checkQuestioner, update, delete: del,
} = require('../controllers/question');

const { secret } = require('../config');
const auth = jwt({ secret });


router.get('/', find);
router.post('/', auth, create);
router.get('/:id', checkQuestionExist, findById);
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update);
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del);




module.exports = router;

