const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
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
 permissions: {
 	type: []
 }
});
AdminSchema.virtual('basicInfo').get(function () {
  return {id: this._id, isAdmin: this.isAdmin};
});

const Admin = mongoose.model('admin', UserSchema);

module.exports = User;

