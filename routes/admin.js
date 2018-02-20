var express = require('express');
var router = express.Router();
var multer = require('multer');

var User = require('../models/users');
var Admin = require('../models/admin');
var Post = require('../models/posts');
var Category = require('../models/categories');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// this is to affirm authentication
var loggedIn = false;
/* GET admin users */
router.get('/', adminAuthentication, function(req, res, next) {
	User.find({}, function(err, users){
		res.render('admin',{
			title: 'Blog Users',
			confirm: 'admin',
			users: users
		});
	});
});


/* GET adminuser login post. */
router.get('/login', function(req, res, next) {
	res.render('adminLogin',{title: 'Login'});
});

passport.serializeUser(function(admin , done){
	done(null, admin.id);
});

passport.deserializeUser(function(id , done){
	Admin.getUserById(id, function(err, admin){
		done(err, admin);
	});
});

passport.use('admin', new LocalStrategy(
	function(username, password, done){
		Admin.checkUserByUsername(username, function(err, admin){
			if(err) throw err;
			if(!admin){
				return done(null, false, {message: 'Unknown admin user trying'});
			}
			Admin.comparePassword(password, admin.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					loggedIn = true;
					return done(null, admin);
				}else{
					return done(null, false, {message:'Invalid password'});
				}
			});
		});
	}
));

router.post('/login', passport.authenticate('admin', {failureRedirect:'/admin/login', failureFlash:'Invalid username or password'}), function(req, res){
	loggedIn = true;
	req.flash('success', 'You are now logged in');
	res.redirect('/admin');
});

router.get('/register',adminAuthentication,function(req, res, next) {
	res.render('adminRegister',{
		title: 'Register',
		confirm: 'admin'
	});
});

router.post('/register',adminAuthentication,function(req, res, next) {
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

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
		var newUser = new Admin({
			name: name,
			username: username,
	  		email: email,
	  		password: password
		});
	  	
	  	Admin.createUser(newUser, function(err, admin){
	  		if(err) throw err;
	  	});

		req.flash('success', 'You are now registered');
		res.redirect('/admin');
  }
  	
}); 

/* GET /admin/posts */
router.get('/posts', adminAuthentication,function(req, res, next){
	Post.find({}, function(err, posts){
		res.render('allposts', {
			title: 'Blog Posts',
			posts: posts,
			confirm: 'admin'
		});
	});
});

/* GET /admin/categories */
router.get('/categories', adminAuthentication,function(req, res, next){
	Category.find({}, function(err, categories){
		res.render('allcategories', {
			title: 'Blog Categories',
			categories: categories,
			confirm: 'admin'
		});
	});
});

/* GET /admin/addpost */
router.get('/addpost', adminAuthentication,function(req, res, next){
	Category.find({}, function(err, cat){
		res.render('adminAdd', {
			title: 'Admin Add Post',
			categories: cat,
			confirm: 'admin'
		});
	});
});

/* POST post from users*/
var imageName = null;
router.post('/add', adminAuthentication,function(req, res, next) {
	var storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/images/uploads/')
		},
		filename: function (req, file, cb) {
			imageName = file.fieldname + '-' + Date.now()+ '.jpg';
			cb(null, imageName);
		}
	});
	var upload = multer({ storage: storage }).single('image');

	upload(req, res, function (err) {
		if (err) {
    		req.flash('error','Error occurred when uploading image');
    	}else{
    		if(imageName == null){
    			imageName = 'Desert.jpg';
    		}
			var post = new Post({
				author: req.body.author,
				title: req.body.title,
				body: req.body.body,
				date: new Date(),
				image: imageName,
				category: req.body.category
			});
			Post.savePost(post, function(err, suc){
				if(err) throw err
				req.flash('success', 'Post added successfully');
				res.redirect('/admin/posts');
			});
    	}
	});
});

/* GET /admin/addcategory */
router.get('/addcategory', adminAuthentication,function(req, res, next){
	res.render('adminAddCat', {
		title: 'Admin Add Category',
		confirm: 'admin'
	});
});

/* POST category from admin user */
router.post('/addcategory', adminAuthentication,function(req, res, next) {
	var category = new Category({
		title: req.body.title
	});
	Category.savePost(category, function(err, suc){
		if(err) throw err
		req.flash('success', 'Admin: Category added successfully');
		res.redirect('/admin/categories');
	});
});

/* remove user by listening to /admin/#{user._id}/delete' */
router.get('/:id/delete', adminAuthentication,function(req, res, next){
	User.remove({_id: req.params.id}, function(err){
		req.flash('success', 'User account removed successfully!');
		res.redirect('/admin');
	});
});

/* /* remove posts by listening to '/admin/#{post._id}/delete' */
router.get('/:id/deletePost',adminAuthentication, function(req, res, next){
	Post.remove({_id: req.params.id}, function(err){
		req.flash('success', 'Post removed successfully!');
		res.redirect('/admin/posts');
	});
});

/* remove category by listening to '/admin/#{category._id}/deleteCategory' */
router.get('/:id/deleteCategory',adminAuthentication, function(req, res, next){
	Category.remove({_id: req.params.id}, function(err){
		req.flash('success', 'Category removed successfully!');
		res.redirect('/admin/categories');
	});
});

/* Login the current user out */
router.get('/logout',function(req, res){
	loggedIn = false;
	req.logout();
	req.flash('success','Admin logged out');
	res.redirect('/');
});

function adminAuthentication(req, res , next){
	if(loggedIn){
		return next();
	}else{
		req.flash('error', 'Ensure to login for full access');
		res.redirect('/admin/login');
	}
}

module.exports = router;
