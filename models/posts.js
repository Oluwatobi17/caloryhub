var mongoose = require('mongoose');

mongoose.connect('mongodb://Gadoo:ganiu123456@ds241658.mlab.com:41658/caloryhub');

// Post schema
var PostSchema = mongoose.Schema({
	author : {
		type: String,
		index: true,
		require: true
	},
	title: {
		type: String,
		require: true
	},
	body: {
		type: String,
		require: true
	},
	date:{
		type: Date,
		default: Date.now
	},
	category : {
		type: String,
		require: true
	},
	comments : [{
		author: String,
		body: String,
		date: String
	}],
	Likes: [{
		author: String
	}],
	image: String

});

var Post  = module.exports = mongoose.model('posts',PostSchema, 'posts');
module.exports.savePost = function(post, callback){
	post.save(callback);
}

module.exports.like = function(author, callback){
	Like.find(author, callback);
}