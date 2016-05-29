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

exports.FBUser = mongoose.model('FBUser', FBUserSchema);
