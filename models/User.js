const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
 firstName: {
 	type: String,
 },
 lastName: {
 	type: String
 },
 email: {
 	type: String,
 	required: true
 },
 passwordDigest: {
 	type: String,
 	required: true
 },
 username: {
 	type: String,
 	required: true
 },
 avatar: {
 	type: String,
 	required: false
 },
 date: {
 	type: Date,
 	default: Date.now()
 },
 userType: {
 	type: {},
 	required: true
 }
});

UserSchema.virtual('basicInfo').get(function () {
  return {id: this._id, isAdmin: this.isAdmin};
});

UserSchema.statics = {
    userCreateSafeFields: ['firstName', 'lastName', 'avatar']
};

const User = mongoose.model('User', UserSchema);


module.exports = User;

