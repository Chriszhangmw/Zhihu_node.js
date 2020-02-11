const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({ prefix: '/topics' });
const { find, findById, checkTopicExist,
    create, update, listTopicFollower, listQuestions,
} = require('../controllers/topic');

const { secret } = require('../config');
const auth = jwt({ secret });


router.get('/', find);
router.post('/', auth, create);
router.get('/:id', checkTopicExist, findById);
router.patch('/:id', auth, checkTopicExist, update);
router.get('/:id/topicFollowers', checkTopicExist, listTopicFollower)
router.get('/:id/questions', checkTopicExist, listQuestions)




module.exports = router;

