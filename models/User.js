const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
 name: {
 	type: String,
 	required: true
 },
 email: {
 	type: String,
 	required: true
 },
 password: {
 	type: String,
 	required: true
 },
 avatar: {
 	type: String,
 	required: true
 },
 date: {
 	type: Date,
 	default: Date.now()
 }
});
UserSchema.virtual('basicInfo').get(function () {
  return {id: this._id, name: this.name, email: this.email, avatar: this.avatar};
});

const User = mongoose.model('users', UserSchema);

module.exports = User;

