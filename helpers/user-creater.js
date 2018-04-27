const User = require('../models/User')
const genBcrypt = require("./gen-bcrypt");

const createUser = (params) => {
	return new Promise( (resolve, reject) => {
		if (emailIsTaken(params.email)) { 
			resolve("user taken")
		} else {
	 		populateUserParams(params)
	 		.then(userParams => {
	 			const newUser = new User(userParams)
	 			newUser.save()
	 			.then(user => { resolve(user)})
	 			.catch(err => { reject(err)})
	 		})
		}
	})
}

const emailIsTaken = (email) => {
	 return new Promise( (resolve, reject) => {
		 User.findByEmail(email, (err, userWithEmail) => {
		 		if (!userWithEmail) {
				 	resolve(false);		 			
		 		} else { resolve(true)}
			reject(Error(err))	 		 	  
		 })
	})
}

const populateUserParams = (reqBody) => {
	console.log(reqBody)
	return new Promise((resolve, reject) => {
		genBcrypt(reqBody.password)
		.then((hash, err) => {
			const params = { 
				firstName: reqBody.firstName, 
				lastName: reqBody.lastName,
				username: reqBody.username,
				email: reqBody.email, 
				passwordDigest: hash,
				userType: { role: "basic"}
			};
			if (hash) { resolve(params) }
		 	else { reject(err)};		  
		})
	})
}

module.exports = createUser;

