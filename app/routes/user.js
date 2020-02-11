const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({ prefix: '/users' });
const { find, findById,
    create, update, delete: del,
    login, checkOwner, listFollowing, follow,
    unfollow, listFollower, checkUserExist,
    followTopics, unfollowTopics, listFollowerTopics,
    listQuestions, likeAnswer, unlikeAnswer, listLikingAnswers,
    listDislikingAnswers, dislikeAnswer, undislikeAnswer,
    listCollectingAnswers, collectAnswer, uncollectAnswer,

} = require('../controllers/user');

const { secret } = require('../config');
const { checkTopicExist } = require('../controllers/topic');
const { checkAnswerExist } = require('../controllers/answer');

const auth = jwt({ secret });

router.get('/', find);
router.post('/', create);
router.get('/:id', findById);
router.delete('/:id', auth, checkOwner, del);
router.patch('/:id', auth, checkOwner, update);
router.post('/login', login);
router.get('/:id/following', listFollowing); //获得某人的关注列表
router.put('/following/:id', auth, checkUserExist, follow) //关注某人
router.delete('/following/:id', auth, checkUserExist, unfollow) //取消关注某人
router.get('/:id/followers', listFollower) //获取粉丝列表

router.put('/followingTopic/:id', auth, checkTopicExist, followTopics) //关注话题
router.delete('/followingTopic/:id', auth, checkTopicExist, unfollowTopics) //取消关注话题
router.get('/:id/followingTopics', listFollowerTopics) //获取话题列表

router.get('/:id/questions', listQuestions);//获取某用户的问题列表

router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer) //点赞答案
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer) //取消点赞答案
router.get('/:id/likingAnswerss', listLikingAnswers) //获取改用户所有赞过的答案

router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer) //踩答案
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer) //取消踩答案
router.get('/:id/dislikingAnswerss', listDislikingAnswers) //获取改用户所有踩过的答案

router.put('/collecting/:id', auth, checkAnswerExist, dislikeAnswer, collectAnswer) //收藏答案
router.delete('/collecting/:id', auth, checkAnswerExist, uncollectAnswer) //取消收藏答案
router.get('/:id/collectings', listCollectingAnswers) //获取改用户所有收藏过的答案


module.exports = router;

