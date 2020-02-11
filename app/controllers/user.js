
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const { secret } = require('../config');
const Question = require('../models/questions');
const Answer = require('../models/answers');

class UserCt1 {

    async find(ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        ctx.body = await User.find({ name: new RegExp(ctx.query.q) }).limit(perPage).skip(page * perPage);
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const pupulatedStr = fields.split(';').filter(f => f).map(f => {
            if (f === 'employments') {
                return 'employments.company employments.job';
            }
            if (f === 'education') {
                return 'education.school education.major';
            }
            return f;
        }).join(' ');
        const user = await User.findById(ctx.params.id).select(selectFields).populate(pupulatedStr);
        if (!user) {
            ctx.throw(404, 'not find the user');
        }
        ctx.body = user;
    }

    async create(ctx) {

        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({ name });
        if (repeatedUser) { ctx.throw(409, 'already exsist') }
        else {
            const user = await new User(ctx.request.body).save();
            ctx.body = user;
        }
    }
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            business: { type: 'string', required: false },
            employments: { type: 'array', itemType: 'object', required: false },
            education: { type: 'array', itemType: 'object', required: false },
        });

        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if (!user) { ctx.throw(404); }
        ctx.body = user;
    }
    async delete(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) { ctx.throw(404); }
        ctx.body = user;
    }

    async login(ctx) {

        const user = await User.findOne(ctx.request.body);
        if (!user) { ctx.throw(401, '用户民或密码不正确'); }
        else {
            const { _id, name } = user;
            const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' });
            ctx.body = { token };
        }

    }

    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }

    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        if (!user) { ctx.throw(404); }
        else { ctx.body = user.following; }
    }
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        await next();
    }
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following').populate('following');
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }

    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        console.log(index);
        if (index > -1) {
            me.following.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }
    async listFollower(ctx) {
        const users = await User.find({ following: ctx.params.id });
        ctx.body = users;
    }
    async followTopics(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics').populate('followingTopics');
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }

    async unfollowTopics(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        console.log(index);
        if (index > -1) {
            me.followingTopics.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }
    async listFollowerTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
        if (!user) { ctx.throw(404); }
        else { ctx.body = user.followingTopics; }
    }

    async listQuestions(ctx) {
        const questions = await Question.find({ questioner: ctx.params.id });
        ctx.body = questions;
    }

    async likeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
        }
        ctx.status = 204;
        await next();
    }

    //这里可以理解为取消喜欢
    async unlikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.likingAnswers.splice(index, 1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } });
        }
        ctx.status = 204;
    }
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers');
        if (!user) { ctx.throw(404, '用户不存在'); }
        ctx.body = user.likingAnswers;
    }

    //这里是刻画踩答案，又三个接口，一个是返回用户所有踩过的答案，第二是实现踩的功能，踩的功能对于答案本身没有任何改变，只需要在用户踩过答案列表中加入这个答案就好了
    //而上面的赞功能就不一样的，不论是赞还是不赞，对于答案本身的voteCounte属性值是分别又一个—+1 和-1的影响的
    async listDislikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
        if (!user) { ctx.throw(404, '用户不存在'); }
        ctx.body = user.dislikingAnswers;
    }
    async dislikeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
        await next();
    }
    async undislikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.dislikingAnswers.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async listCollectingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers');
        if (!user) { ctx.throw(404, '用户不存在'); }
        ctx.body = user.collectingAnswers;
    }
    async collectAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
        if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.collectingAnswers.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
        await next();
    }
    async uncollectAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
        const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.collectingAnswers.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }


}

module.exports = new UserCt1();