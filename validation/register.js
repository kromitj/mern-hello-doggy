const Validator = require('validator');

module.exports = function validatRegisterInput(data) {
	let errors = {};
	let isValid = true;
	if (Validator.isLength(data.name, {min: 2, max: 30})) {
		isValid = false;
		errors.name = 'Name must be between 2 and 30 characters'
	}
	return {
		errors,
		isValid
	}
}