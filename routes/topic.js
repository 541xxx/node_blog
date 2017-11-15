const express = require('express');
const router = express.Router();
const User = require('../models/mongo/user');
const Topic = require('../models/mongo/topic');
const auth = require('../middlewares/auth_user');


/* GET topics listing. */
router.route('/').get(auth(), (req, res, next) => {
  (async () => {
    let topics = await Topic.getTopics();
    return {
      topics
    }
  })().then(r => {
    res.json({
      code: 0,
      topics: r.topics
    })
  }).catch(e => {
    next(e);
  })
}).post(auth(), (req, res, next) => {
  (async() => {
    const user = await User.getUserById(req.body.userId);
    let topic = await Topic.createANewTopic({
      creator: user,
      title: req.body.title,
      content: req.body.content
    });
    return {
      code: 0,
      topic
    }
  })().then(r => {
    res.json(r);
  }).catch(e => {
    next(e);
  }); 
});

router.route('/:id').get(auth(), (req, res, next) => {
  (async() => {
    let topic = await Topic.getTopicById(req.params.id);
    return {
      code: 0,
      topic
    }
  })().then(r => {
    res.json(r);
  }).catch(e => {
    next(e);
  })
}).patch((req, res, next) => {
  (async() => {
    let update = {};
    if (req.body.title) {
      update.title = req.body.title;
    }
    if (req.body.content) {
      update.content = req.body.content;
    }
    let topic = await Topic.updateTopicById(req.params.id, update);
    return {
      code: 0,
      topic
    }
  })().then(r => {
    res.json(r);
  }).catch(e => {
    next(e);
  })
});

router.route('/:id/reply').post((req, res, nexr) => {
  (async() => {
    const user = await User.getUserById(req.body.userId);
    let topic = await Topic.replyATopic({
      topicId: req.params.id,
      creator: user,
      content: req.body.content
    });
    return {
      code: 0,
      topic
    }
  })().then(r => {
    res.json(r);
  }).catch(e => {
    console.log(e);
    next(e);
  }); 
})

module.exports = router;