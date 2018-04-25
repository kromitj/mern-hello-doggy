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
	console.log("Indide of Admin Register")
	if (req.body.isAdmin) { // replace with adminTest
		if (req.body.adminSecret !== ADMIN_SECRET) {
			return res.status(403).json({ error: "Forbidden", message: "You don't have permission"})
		}
	}
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
	if (req.body.adminSecret !== ADMIN_SECRET ) {
		return res.status(403).json({ error: "Internal Error", message: "Somthing Went Wrong"})
	}
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
				console.log(user.basicInfo)
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
router.get('/shelters', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.isAdmin !== true) {
		return res.status(403).json({ error: "Forbidden", message: "You don't have permission"})
	} else {
		Shelter.find({})
		.then(shelters => {
			res.json(shelters)
		})
	}
})

router.get('/shelters/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.isAdmin !== true) {
		return res.status(403).json({ error: "Forbidden", message: "You don't have permission"})
	} else {
		Shelter.findById(req.params.id)
		.then(shelter => {
			res.json(shelter)
		})
	}
})


router.post('/shelters/create', passport.authenticate('jwt', { session: false}), (req, res) => {
		if (req.user.isAdmin !== true) {
			return res.status(403).json({ error: "Forbidden", message: "You don't have permission"})
		} else {
			const body = req.body;

			const shelterParams = {
				name: body.name, 
				address: body.address, 
				phoneNumber: body.phoneNumber, 
				website: body.website
			}
			const newShelter = new Shelter(shelterParams)
			newShelter.save()
			.then(() => res.json({newShelter}))			
		}
	
})

router.post('/:shelter/:shelter-admin', passport.authenticate('jwt', { session: false}), (req, res) => {
	
	if (req.user.isAdmin !== true || req.body.adminSecret !== ADMIN_SECRET) {
			return res.status(403).json({ error: "Forbidden", message: "You don't have permission"})
		} else {
			const body = req.body;
			const shelterAdminId = mongoose.Types.ObjectId(body.shelterAdminId)
			const ShelterId = mongoose.Types.ObjectId(body.shelterId)

			User.findById(shelterAdminId)
			.then((shelterAdmin) => {
				shelterAdmin.isShelterAdmin = true
				shelterAdmin.role = "shelter-admin-verified"
				Shelter.findById(ShelterId)
				.then((shelter) => {
					shelter.shelterAdminId = shelterAdmin._id;
					shelterAdmin.shelterId = shelter._id
					shelterAdmin.save()
					shelter.save()
					.then(() => res.json(shelter))
				})
			})
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
				role: "admin"
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

const newUserIsAdminValidation = (user) => {

}
const newUserIsUnique = (user) => {

}

module.exports = router;