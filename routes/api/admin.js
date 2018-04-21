const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const passport = require("passport");

const JWS_SECRET = require('../../config/keys').jwsSecret;
const Admin = require('../../models/Admin');
const Shelter = require('../../models/Shelter');

router.get('/test', (req, res) => res.json({blah: "blah", crazy: "Admin Works"}) );

router.post('/register', (req, res) => { 
	console.log("Register", req.body)
  Admin.findOne({ email: req.body.email})
  .then((admin) => {
  	if(admin) {
  		return res.status(400).json({ error: "Email Exists", message: "Email already being used"})
  	} else {
  		populateAdminParams(req.body)		  
		  .then(adminParams => {
			  const newAdmin = new Admin(adminParams)
			  newAdmin.save()
			  .then(admin => res.json(admin))
			  .catch(err => console.log(err))		  	
		  })
  	}
  })
})

router.post('/login', (req, res) => {
	const adminUsername = req.body.username;
	const password = req.body.password
	Admin.findOne({username: adminUsername})
	.then(admin => {
		if(!admin) { res.status(404).json({error: "Invalid Email Or Password", message: "Password or Email is incorrect"})}
		bcrypt.compare(password, admin.passwordDigest)
		.then(isMatch => {
			if (isMatch) {
				console.log("Admin: ", admin)
				jwt.sign(admin.basicInfo, JWS_SECRET, { expiresIn: 3600}, (err, token) => {
					console.log("Token: ", token)
					console.log("Err: ", err)
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


router.post('/register-shelter', passport.authenticate('jwt', { session: false}), (req, res) => {
	const body = req.body
	// create new Shelter
	const shelterParams = {
		name: body.name, 
		address: body.address, 
		phoneNumber: body.phoneNumber, 
		website: body.website
	}
	const newShelter = new Shelter(shelterParams)
	newShelter.save()
	.then(() => res.json({newShelter}))
	// create new User as the sheltersAdmin
	// save shelter 
	
})

const populateAdminParams = (reqBody) => {
	return new Promise((resolve, reject) => {
		genBcrypt(reqBody.password)
		.then((hash, err) => {
			const params = { 
				firstName: reqBody.firstName, 
				lastName: reqBody.lastName,
				username: reqBody.username,
				email: reqBody.email, 
				passwordDigest: hash,

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