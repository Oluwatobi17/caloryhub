var mongoose = require('mongoose');

mongoose.connect('mongodb://Gadoo:ganiu123456@ds241658.mlab.com:41658/caloryhub');

// Category schema
var CategorySchema = mongoose.Schema({
	title : {
		type: String,
		require: true,
		unique: true
	}
});

var Category  = module.exports = mongoose.model('categories',CategorySchema, 'categories');

module.exports.savePost = function(post, callback){
	post.save(callback);
}