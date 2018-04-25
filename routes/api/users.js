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

router.post('/register', (req, res) => { 
	if (req.body.idAdmin == true) { return res.status(400).json({ error: "Internal Error", message: "Something went wrong"})}
  User.findOne({ email: req.body.email})
  .then((user) => {
  	if(user) {
  		return res.status(400).json({ error: "Email Exists", message: "Email already being used"})
  	} else {
  		populateUserParams(req.body)		  
		  .then(adminParams => {
			  const newAdmin = new User(adminParams)
			  newAdmin.save()
			  .then(admin => res.json(admin))
			  .catch(err => console.log(err))		  	
		  })
  	}
  })
})

router.post('/login', (req, res) => {
	const userUsername = req.body.username;
	const password = req.body.password;
	console.log(userUsername)
	User.findOne({username: userUsername})
	.then(user => {
		console.log(user)
		if(!user) { res.status(404).json({error: "Invalid Email Or Password", message: "Password or Email is incorrect"})}
		bcrypt.compare(password, user.passwordDigest)
		.then(isMatch => {
				console.log(isMatch)
			if (isMatch) {
				jwt.sign(user.basicInfo, JWS_SECRET, { expiresIn: 3600}, (err, token) => {
					res.json({
						success: true,
						token: "Bearer " + token
					})					
				})
			}
				else { res.json({message: "Failure"})}
		})
	})
})



// HELPER FUNCTIONS-------------------------------------------------
//--------------------------------------------------------------------
const populateUserParams = (reqBody) => {
	return new Promise((resolve, reject) => {
		genBcrypt(reqBody.password)
		.then((hash, err) => {
			const params = { 
				firstName: reqBody.firstName, 
				lastName: reqBody.lastName,
				username: reqBody.username,
				email: reqBody.email, 
				passwordDigest: hash,
				isAdmin: reqBody.isAdmin || false
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
				if (hash) { resolve(hash) }
				else { reject(err) }
			})
		})		
	})
}



module.exports = router;