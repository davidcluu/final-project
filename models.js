/**
 * Load dependencies
 */
var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;

/**
 * Schema
 */
var FBUserSchema = new Schema({
  'Name': String,
  'facebookID': String
});

var CategorySchema = new Schema({
	'categoryName': String,
	'count': { type: Number, default: 0 }
});

var SubCategorySchema = new Schema({
	'category': String,
	'subCategoryName': String,
	'user': String,
	'count': {type: Number, default: 0}
});

var ThreadSchema = new Schema({
	'user': String,
	'subCategory': String,
	'threadName': String,
	'content': String,
	'count': { type: Number, default: 0 },
	'posted': { type: Date, default: Date.now() }
});

var CommentSchema = new Schema({
	'user': String,
	'thread': String,
	'content': String,
	'count': { type: Number, default: 0 },
	'posted': { type: Date, default: Date.now() }
});

var RecentlyViewedSchema = new Schema({
	'threadName': String,
	'threadURL': String
});

exports.FBUser = mongoose.model('FBUser', FBUserSchema);
exports.SubCategory = mongoose.model('SubCategory', SubCategorySchema);
exports.Thread = mongoose.model('Thread', ThreadSchema);
exports.Comment = mongoose.model('Comment', CommentSchema);
