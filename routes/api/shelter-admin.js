// DEPENDENCIES-----------------------------------------------------
//--------------------------------------------------------------------
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const mongoose = require('mongoose');
const _ = require("underscore");
// MONGOOSE MODELS--------------------------------------------------
//--------------------------------------------------------------------
const User = require('../../models/User');
const Shelter = require('../../models/Shelter');
const Animal = require('../../models/Animal');

// CONSTANT VARIABLES-----------------------------------------------
//--------------------------------------------------------------------
const JWS_SECRET = require('../../config/keys').jwsSecret;
const ADMIN_SECRET = require('../../config/keys').adminSecretPassword;
const errorMessages = require('../status-messages')

// USER ROUTES -----------------------------------------------------
//--------------------------------------------------------------------
const router = express.Router();

router.get('/', (req, res) => {
	res.json({message: "SHelterAdmin Sign up Form"})
})

// @@Route - www.hello-doggy/shelter-admin/
// @@TYPE  - POST
// @@DESC  - Creates a Shelter and Assignes the User as a Shelter-Admin that needs to be approved by admin
router.post('/', passport.authenticate('jwt', { session: false}),(req, res) => {   

  if (!req.user) {
		return res.status(401).json({ error: "Unauthorized", message: "Dev-Sign in Or Sign up first then try again"})
	} else {
	const shelterParams = _.pick(req.body, Shelter.shelterCreateSafeFields);
  const newShelter = new Shelter(shelterParams);

  newShelter.shelterAdminId = req.user_id;

  req.user.userType = {
  	role: "shelter-admin",
  	approved: false,
  	shelterId: newShelter._id
  }

  req.user.save()
  newShelter.save()
  .then(user => res.json(user.basicInfo))
  .catch(err => console.log(err))		
  }  	
})

router.get('/session', (req, res) => {
	res.json({message: "Shelter Admin Login Form"})
})

router.post('/session', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	User.findOne({username: username})
	.then(user => {
		if(!user) { res.status(400).json({error: "Bad Request", message: "Dev-Password or USERNAME is incorrect"})}
		if (!hasShelterAdminRights(user)) res.status(401).json({ error: "Unauthorized", message: "Dev-Wrong Signed in User need Shelter Admin rights"})
		
		bcrypt.compare(password, user.passwordDigest)
		.then(isMatch => {
			if (isMatch) {
				jwt.sign(user.basicInfo, JWS_SECRET, { expiresIn: 3600}, (err, token) => {
					res.json({
						success: true,
						token: "Bearer " + token
					})					
				})
			} else { res.status(400).json({error: "Bad Request", message: "Dev-PASSWORD or username is incorrect"})}
		})
	})
})

// hello-doggy/shelter-admin/kromitj/shelter
router.get('/:username/shelter', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (!hasShelterAdminRights(user)) res.status(401).json({ error: "Unauthorized", message: "Dev-Wrong Signed in User need Shelter Admin rights"})
		
	Shelter.findById(req.user.userType.shelterId)
	.then(shelter => {
		res.json(shelter)
	})
})

router.get('/:username/animals/new', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (!hasShelterAdminRights(user)) res.status(401).json({ error: "Unauthorized", message: "Dev-Wrong Signed in User need Shelter Admin rights"})
	else {
		res.json({message: "Shelter Admin Animal new"})		
	}
})

router.post('/:username/animal/create', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (!hasShelterAdminRights(user)) res.status(401).json({ error: "Unauthorized", message: "Dev-Wrong Signed in User need Shelter Admin rights"})
	else {
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
				userRole: {
					role: "shelter-admin",
					approved: false
				}
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

const hasShelterAdminRights = (user) => {
	console.log(user.userType.role === "shelter-admin" && user.userType.approved === true)
	return (user.userType.role === "shelter-admin" && user.userType.approved === true)
}

module.exports = router;