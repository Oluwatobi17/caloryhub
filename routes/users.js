var express = require('express');
var router = express.Router();

var User = require('../models/users');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users login post. */
router.get('/login', function(req, res, next) {
	res.render('login',{title: 'Login'});
});

passport.serializeUser(function(user , done){
	done(null, user.id);
});

passport.deserializeUser(function(id , done){
	User.getUserById(id, function(err, user){
		done(err, user);
	});
});

passport.use('blog-members', new LocalStrategy(
	function(username, password, done){
		User.checkUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown user trying'});
			}
			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err; 
				if(isMatch){
					return done(null, user);
				}else{
					return done(null, false, {message:'Invalid password'});
				}
			});
		});
	}
));

router.post('/login', passport.authenticate('blog-members', {failureRedirect:'/users/login', failureFlash:'Invalid username or password'}), function(req, res){
	req.flash('success', 'You are now logged in');
	res.redirect('/');
});

router.get('/register', function(req, res, next) {
	res.render('register',{
		title: 'Sign up: Become a caloryhub user' 
	});
});

router.post('/register', function(req, res, next) {
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	/*if(req.files.profileimage!=null){
		var profileimage = req.files.profileimage;
	}else{
		var profileimage = 'no_image.jpg';
	}*/

	req.checkBody('name','name field is required').notEmpty();
	req.checkBody('username','Username field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2','Password does not match').equals(req.body.password);
	req.checkBody('email','Email given is invalid').isEmail();
  
	var errors = req.validationErrors();

	if(errors){
		res.render('register', {
	  		errors: errors,
	  		name: name,
	  		username: username,
	  		email: email,
	  		password: password,
	  		password2: password2
  		
  		});
	}else{
		var newUser = new User({
			name: name,
			username: username,
	  		email: email,
	  		password: password,
	  		profileimage: profileimage
		});
	  	
	  	User.createUser(newUser, function(err, user){
	  		if(err) throw err;
	  	});

		req.flash('success', 'You are now registered');
		res.redirect('/');
  }
  	
}); 

/* Login the current user out */
router.get('/logout',function(req, res){
	req.logout();
	req.flash('success','You are now logged out');
	res.redirect('/');
});

module.exports = router;
