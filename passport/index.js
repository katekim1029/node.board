const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../models');

module.exports = () => {
  
  passport.serializeUser((user, done) => {
    console.log('serializeUser() 호출됨');
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    console.log('deserializeUser() 호출됨');
    try {
      const user = await db.User.findOne({ 
        where: { id },
        attributes: ['id'],
      });
      done(null, user); // req.user, req.isAuthenticated() === true,
    } catch (err) {
      console.error(err);
      return done(err);
    }
  });

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
  }, async (email, password, done) => {
      try {
          const user = await db.User.findOne({ where: { email } });
          if (!user) {
              return done(null, false, { error: 'Incorrect username.' });
          }
          const validPassword = await bcrypt.compare(password, user.password);
          if(!validPassword) {
              return done(null, false, { error: 'Incorrect password.' });
          }
          return done(null, user);
      } catch(err) {
          console.error(err);
          return done(err);
      }
  }));
};
