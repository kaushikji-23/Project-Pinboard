var express = require('express');
var router = express.Router();
const usermodel = require("./users");
const postmodel = require("./post");
const passport = require('passport');
const localstrategy = require("passport-local");
const upload = require('./multer');

passport.use(new localstrategy(usermodel.authenticate()));


router.get('/', function(req, res, next) {
  res.render('index', {nav: false});
});

router.get('/register', function(req, res, next) {
  res.render('register', {nav: false});
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user =
   await usermodel
     .findOne({username: req.session.passport.user})
     .populate("posts")
  res.render('profile', {user, nav: true});
});

router.get('/show/allposts', isLoggedIn, async function(req, res, next) {
  const user =
   await usermodel
     .findOne({username: req.session.passport.user})
     .populate("posts")
  res.render('show', {user, nav: true});
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user = await usermodel.findOne({username: req.session.passport.user})
  const posts = await postmodel.find().populate("user")
  res.render("feed",{user, posts, nav: true})
});


router.get('/add', isLoggedIn, async function(req, res, next) {
  const user = await usermodel.findOne({username: req.session.passport.user})
  res.render('add', {user, nav: true});
});

router.post('/createpost', isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  const user = await usermodel.findOne({username: req.session.passport.user})
  const post = await postmodel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});


router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
 const user = await usermodel.findOne({username: req.session.passport.user})
 user.profileimage = req.file.filename;
 await user.save();
 res.redirect("/profile");
});


router.post('/register', function(req, res, next) {
  const data = new usermodel({
     username: req.body.username,
     email: req.body.email,
     contact: req.body.contact,
     name: req.body.fullname
  })
  
  usermodel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile")
    })
  })
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: "/",
  successRedirect: "/profile",
}), function(req, res, next) {

});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
 
});

//for make route protected we used isloggedin in other routes
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}



module.exports = router;
