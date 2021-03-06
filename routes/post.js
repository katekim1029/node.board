const express = require('express');
const path = require('path');
const multer = require('multer');
const db = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + Date.now() + ext);
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }
});

router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => {
  const fileNames = req.files.map(f => f.filename);
  res.json(fileNames);
});

router.post('/', isLoggedIn, upload.array('image'), async (req, res, next) => {
  try {
    const newPost = await db.Post.create({
      title: req.body.title,
      body: req.body.body,
      UserId: req.user.id
    });
    if(req.files) {
      await Promise.all(req.files.map((image) => {
        return db.Image.create({
            src: image.filename,
            PostId: newPost.id
        })
      }));
    }
    const postInfo = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{
        model: db.User,
        attributes: ['id', 'name'],
      },{
        model: db.Image,
      }]
    });
    return res.json(postInfo);
  } catch(e) {
    console.error(e);
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const posts = await db.Post.findAll({
      include: [{
        model: db.User,
        attributes: ['id', 'name', 'createdAt'],
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch(e) {
    console.error(e);
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const posts = await db.Post.findOne({
      where: { id: req.params.id },
      include: [{
        model: db.User,
        attributes: ['id', 'name', 'createdAt'],
      }, {
        model: db.Image,
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch(e) {
    console.error(e);
    next(e);
  }
});

router.delete('/:id', isLoggedIn, async (req, res, next) => {
  try {
    const posts = await db.Post.findOne({
      where: { id: req.params.id }
    });
    if(posts.UserId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden'});
      return;
    }
    await db.Post.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.send('삭제 완료되었습니다');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
