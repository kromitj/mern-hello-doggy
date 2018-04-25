const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnimalSchema = new Schema({
	shelterId: {
		type: Schema.Types.ObjectId,
		ref: 'shelter'
	},
	name: {
 	type: String,
 	required: true
 },
 age: {
 	type: String,
 	required: true
 },
 type: {
 	type: String,
 	required: true
 }
});

const Animal = mongoose.model('Animal', AnimalSchema);

module.exports = Animal;