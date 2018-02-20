var express = require('express');
var router = express.Router();
var multer = require('multer');

var Post = require('../models/posts');
var Categories = require('../models/categories');

/* GET posts listing. */
router.get('/add', ensureAuthentication,function(req, res, next) {
	Categories.find({}, function(err, categories){
		res.render('addpost', {
			title: 'Add a new post in Caloryhub',
			categories: categories
		});
	});
});

/* POST post from users*/
var imageName = null;
router.post('/add', function(req, res, next) {
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
				res.redirect('/');
			});
    	}
	});
});

/* GET /posts/#{post._id}/addcomment/ */
router.get('/:id/addcomment', ensureAuthentication,function(req, res, next){
	Post.find({_id: req.params.id}, function(err, infos){
		res.render('onepost', {
			title: 'Add comments to a post on Caloryhub',
			infos: infos
		});
	});
});

/* POST /posts/#{post._id}/addcomment/ */
router.post('/:id/addcomment', function(req, res, next){
	var comment = {
		author: req.body.author,
		body: req.body.body,
		date: new Date
	}
	Post.update(
		{_id: req.params.id},
		{
			$push:{
				comments: comment
			}
		}, function(err, success){
			req.flash('success', 'Comment added')
			res.redirect('/posts/'+req.params.id+'/addcomment');
		}
	);
});

/* This look into /posts/#{post._id}/#{user.username}/like/ for liking a post */
/*router.get('/:id/like/', function(req, res, next){
	Post.find({_id: req.params.id}, function(err, post){
		var author = 'Ibrahim';
		var value = post.Like
		for(var i=0; i<value; i++){
			if(value[i].author==author){
				Post.Like.remove({author: author}, function(err){
					req.flash('success', 'Like removed');
					res.redirect('/');
				});
			}else{
				Post.update(
					{_id: req.params.id},
					{
						$push:{
							author: author
						}
					},function(err){
						req.flash('success', 'Like added');
						res.redirect('/')
					}
				);
			}
		}
	});
});*/

function ensureAuthentication(req, res , next){
	if(req.isAuthenticated()){
		return next()
	}else{
		req.flash('success', 'Ensure to login for full access');
		res.redirect('/users/login');
	}
}

module.exports = router;
