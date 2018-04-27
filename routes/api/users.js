// DEPENDENCIES-----------------------------------------------------
//--------------------------------------------------------------------
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const mongoose = require('mongoose');

// MONGOOSE MODELS--------------------------------------------------
//--------------------------------------------------------------------
const User = require('../../models/User');
const Shelter = require('../../models/Shelter');

// CONSTANT VARIABLES-----------------------------------------------
//--------------------------------------------------------------------
const JWS_SECRET = require('../../config/keys').jwsSecret;
const ADMIN_SECRET = require('../../config/keys').adminSecretPassword;

// USER ROUTES -----------------------------------------------------
//--------------------------------------------------------------------
const router = express.Router();

router.get('/new', (req, res) => {
	res.json({message: "Users Login Form"})
})

router.post('/', (req, res) => { 
  User.findOne({ email: req.body.email})
  .then((user) => {
  	if(user) {
  		return res.status(400).json({ error: "Bad Request", message: "Dev - Email already being used"})
  	} else {
  		populateUserParams(req.body)		  
		  .then(userParams => {
			  const newUser = new User(userParams)
			  newUser.save()
			  .then(user => res.status(201).json({ message: "Dev - request has been fulfilled", userId: newUser._id}))
			  .catch((err) => {
			  	console.log(err)
			  	res.status(201).json({ error: "Created", message: `Dev - ${err.message}`})
			  })
		  })
  	}
  })
})

router.get('/session', (req, res) => {
	res.json({message: "Users Login Form"})
})

router.post('/session', (req, res) => {
	const userUsername = req.body.username;
	const password = req.body.password;
	User.findOne({username: userUsername})
	.then(user => {
		if(!user) { res.status(400).json({error: "Bad Request", message: "Dev - Password or USERNAME is incorrect"})}
		bcrypt.compare(password, user.passwordDigest)
		.then(isMatch => {
			if (isMatch) {
				jwt.sign(user.basicInfo, JWS_SECRET, { expiresIn: 3600}, (err, token) => {
					res.json({
						success: true,
						token: "Bearer " + token
					})					
				})
			}	else { res.status(400).json({error: "Bad Request", message: "Dev - PASSWORD or username is incorrect"})}
		})
	})
})



// HELPER FUNCTIONS-------------------------------------------------
//--------------------------------------------------------------------
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



module.exports = router;