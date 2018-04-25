const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
 firstName: {
 	type: String,
 	required: true
 },
 lastName: {
 	type: String,
 	required: true
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
 isAdmin: {
 	type: Boolean,
 	default: false,
 	required: true
 },
 isShelterAdmin: {
 	type: Boolean,
 	defualt: false,
 },
 shelterId: {
 	type: Schema.Types.ObjectId,
	ref: 'shelter'
 },
 role: {
 	type: String
 }
});
UserSchema.virtual('basicInfo').get(function () {
  return {id: this._id, isAdmin: this.isAdmin};
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

