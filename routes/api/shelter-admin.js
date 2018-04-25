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
const Animal = require('../../models/Animal');

// CONSTANT VARIABLES-----------------------------------------------
//--------------------------------------------------------------------
const JWS_SECRET = require('../../config/keys').jwsSecret;
const ADMIN_SECRET = require('../../config/keys').adminSecretPassword;

// USER ROUTES -----------------------------------------------------
//--------------------------------------------------------------------
const router = express.Router();

router.get('/new', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (!req.user) {
		return res.status(400).json({ error: "Sign In or Sign Up", message: "Sign in Or Sign up first then"})
	} else {
		res.json({message: "SHelterAdmin Sign up Form"})
		
	}
})

router.post('/create', passport.authenticate('jwt', { session: false}),(req, res) => {   
  if (!req.user) {
		return res.status(400).json({ error: "Sign In or Sign Up", message: "Sign in Or Sign up first then"})
	} else {
  req.user.role = "shelter-admin-init"
  req.user.save()
  .then(user => res.json(user.basicInfo))
  .catch(err => console.log(err))		
  }  	
})

router.post('/login', (req, res) => {
	const userUsername = req.body.username;
	const password = req.body.password;
	console.log(req.body)
	User.findOne({username: userUsername})
	.then(user => {
		if(!user) { res.status(404).json({error: "Invalid Email Or Password", message: "Password or Email is incorrect"})}
		bcrypt.compare(password, user.passwordDigest)
		.then(isMatch => {
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

router.get('/:username/shelter', passport.authenticate('jwt', { session: false}), (req, res) => {
	console.log(req.user)
	Shelter.findById(req.user.shelterId)
	.then(shelter => {
		res.json(shelter)
	})
})

router.post('/:username/animal/create', passport.authenticate('jwt', { session: false}), (req, res) => {
	console.log("Doggie: ", req.user.isShelterAdmin)
	if(req.user.isShelterAdmin) {
		req.body.shelterId = req.user._id;
		const newDog = new Animal(req.body)
		newDog.save()
		.then(dog => res.json(dog))
	  .catch(err => console.log(err))	
		
	}
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
				isAdmin: reqBody.isAdmin || false,
				role: "shelter-admin-init"
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