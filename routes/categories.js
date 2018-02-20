var express = require('express');
var router = express.Router();

var Categories = require('../models/categories');
var Post = require('../models/posts');

/* GET /categories/addcategory. */
router.get('/addcategory', ensureAuthentication,function(req, res, next) {
	res.render('addcategory', {
		title:'Add a new category in Caloryhub'
	});
});

/* POST category from users */
router.post('/addcategory', ensureAuthentication,function(req, res, next) {
	var category = new Categories({
		title: req.body.title
	});
	Categories.savePost(category, function(err, suc){
		if(err) throw err
		req.flash('success', 'Category added successfully');
		res.redirect('/posts/add');
	});
});


/* GET /categories/#{post.category} */
router.get('/:category', ensureAuthentication,function(req, res, next){
	Post.find({category: req.params.category}, function(err, catposts){
		var title = 'Posts on '+req.params.category+' in Caloryhub'
		res.render('viewcategory', {
			title: title,
			catposts: catposts
		});
	});
});

function ensureAuthentication(req, res , next){
	if(req.isAuthenticated()){
		return next()
	}else{
		req.flash('success', 'Ensure to login for full access');
		res.redirect('/users/login');
	}
}

/* /categories/search */
router.post('/search', ensureAuthentication,function(req, res, next){
	var request = req.body.request;
	request = request.replace(request[0], request[0].toUpperCase());
	Post.find({category: request}, function(err, catposts){
		res.render('viewcategory2', {
			title: req.body.request,
			catposts: catposts
		});
	});
});

module.exports = router;
