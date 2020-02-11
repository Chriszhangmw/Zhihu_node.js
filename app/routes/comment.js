const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments' });
const {
    find, findById, create, update, delete: del,
    checkCommentExist, checkCommentator,
} = require('../controllers/comment');

const { secret } = require('../config');

const auth = jwt({ secret });

router.get('/', find);
router.post('/', auth, create);
router.get('/:id', checkCommentExist, findById);
router.patch('/:id', auth, checkCommentExist, checkCommentator, update);
router.delete('/:id', auth, checkCommentExist, checkCommentator, del);

module.exports = router;




module.exports = router;

