const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShelterSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true
	},
	phoneNumber: {
		type: String,
		required: true
	},
	website: {
		type: String,
		required: true
	},
	shelterAdminId:  {
		type: Schema.Types.ObjectId,
		ref: 'shelter'
	},
});
ShelterSchema.virtual('basicInfo').get(function () {
  return {id: this._id};
});



const Shelter = mongoose.model('Shelter', ShelterSchema);

module.exports = Shelter;