const User = require('../models/User')
const genBcrypt = require("./gen-bcrypt");
const ADMIN_SECRET = require('../config/keys').adminSecretPassword;

const createUser = (params, userType) => {
	return new Promise( (resolve, reject) => {
		if (userType === "admin") { 
			if(params.adminSecret !== ADMIN_SECRET) {
				return resolve({success: false, error: 'invalid admin secret'})
			} else  {
				adminExists() 
				.then(response => {
					if (response) { return resolve({success: false, error: 'admin exists'})}
					else { 
						populateUserParams(params, userType)
				 		.then(userParams => {
				 			const newUser = new User(userParams)
				 			newUser.save()
				 			.then(user => { return resolve({success: true, payload: user})})
				 			.catch(err => { return reject({sucess: false, payload: err})})
						})	
				 	}
				})				
			}	
		} else {
			emailIsTaken(params.email) 
			.then(response => {
				console.log(response)
				if (response){return resolve({success: false, error: "email taken"})		
				} else {
					populateUserParams(params, userType)
		 			.then(userParams => {
		 				const newUser = new User(userParams)
		 				newUser.save()
		 				.then(user => { return resolve({success: true, payload: user})})
		 				.catch(err => { return reject({sucess: false, payload: err})})
					})	
				}
			}) 
		}
	})
}

const emailIsTaken = (email) => {
	 return new Promise( (resolve, reject) => {
		 User.findByEmail(email, (err, userWithEmail) => {
		 		if (userWithEmail.length === 0) {
				 	return resolve(false);		 			
		 		} else { return resolve(true)}
			return reject(Error(err))	 		 	  
		 })
	})
}

const adminExists = () => {
	return new Promise((resolve, reject) => {
		User.find({ userType: { role: "admin"}})
		.then(admin => {
			console.log("admin: ", admin)
			if (admin.length === 0) { return resolve(false)}
			else { return resolve(true)}
		}).catch(err => reject(err))		
	})
}

const populateUserParams = (reqBody, userType) => {
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
				userType: userTypeTable[userType]
			};
			if (hash) { return resolve(params) }
		 	else { reject(err)};		  
		})
	})
}

const userTypeTable = {
	"admin": {
		role: "admin"
	},
	"user": {
		role: "basic"
	}
}

module.exports = createUser;

