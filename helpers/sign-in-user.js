const User = require('../models/User');
const bcrypt = require("bcryptjs");
// const jwt = require('jsonwebtoken');
const ADMIN_SECRET = require('../config/keys').adminSecretPassword;


const signInUser = (username, password, jwt) => {
	return new Promise( (resolve, reject) => {
		User.findOne({username})
		.then(user => {
			if (!user) { resolve({ success: false , error: "bad username"}) }
			bcrypt.compare(password, user.passwordDigest)
			.then(isMatch => {
				if (isMatch) {
					jwt.sign(user.basicInfo, JWS_SECRET, { expiresIn: 3600}, (err, token) => {
						resolve({ success: true, payLoad: token})
					})
				} else { resolve({success: false, error: "wrong password"})}
			}).catch(err => reject({success: false, error: err}))
		}).catch((err) => reject({success: false, error: err}))
	})
}

module.exports = signInUser;