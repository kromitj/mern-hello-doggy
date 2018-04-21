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
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	passwordDigest: {
		type: String,
	}
});
AdminSchema.virtual('basicInfo').get(function () {
  return {id: this._id, username: this.username, email: this.email};
});



const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;