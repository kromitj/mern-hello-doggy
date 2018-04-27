const bcrypt = require("bcryptjs");

const genBcrypt = (password, userParams) => {
	return new Promise((resolve, reject)=>{
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				if (hash) { return resolve(hash) }
				else { return reject(err) }
			})
		})		
	})
}

module.exports = genBcrypt