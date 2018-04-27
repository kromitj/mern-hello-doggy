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
	adminApproved: {
		type: Boolean,
		required: true,
		default: false
	}
});
ShelterSchema.virtual('basicInfo').get(function () {
  return {id: this._id};
});

ShelterSchema.statics = {
    shelterCreateSafeFields: ['name', 'address', 'phoneNumber', 'website']
};



const Shelter = mongoose.model('Shelter', ShelterSchema);

module.exports = Shelter;