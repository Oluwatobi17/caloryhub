var express = require('express');
var router = express.Router();
var Posts = require('../models/posts');

/* GET home page. */
router.get('/', function(req, res, next) {
	Posts.find({}, function(err, posts){
		res.render('index', {
			title: 'Caloryhub Home page, undisputed',
			posts: posts
		});
	}).sort({date: -1});;
});

module.exports = router;
