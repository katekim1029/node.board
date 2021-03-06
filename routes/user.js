const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || !req.isAuthenticated()) {
      return res.json();
    }
    const userInfo = await db.User.findOne({ 
      where: { id: user.id },
      attributes: ['id', 'name', 'email', 'createdAt'],
    });
    return res.json(userInfo);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.post('/', isNotLoggedIn, async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const oldUser = await db.User.findOne({
      where: {
        email: req.body.email
      }
    });
    if(oldUser) {
      return res.status(400).json({
        error: '이미 가입되어 있습니다'
      })
    }
    await db.User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash
    });
    authLocal(req, res, next);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  // email & password 검사
  // 세션에 저장
  // 프론트에 쿠키 내보내주기
  authLocal(req, res, next)
});

router.post('/logout', isLoggedIn, (req, res) => { // 실제 주소는 /user/logout
  console.log('logout');
  req.logout();
  req.session.destroy();
  // res.clearCookie('connect.sid');
  return res.status(200).send('로그아웃 되었습니다.');
});

const authLocal = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { 
      console.error(err);
      return next(err); 
    }
    if (info) { 
      return res.status(400).json({ error: info.error});
    }
    return req.login(user, async (err) => {
      if (err) {
        console.error(err);
        return next(err); 
      }
      const userInfo = await db.User.findOne({ 
        where: { id: user.id },
        attributes: ['id', 'name', 'email', 'createdAt'],
      });
      return res.json(userInfo);
    });
  })(req, res, next);
}

module.exports = router;
