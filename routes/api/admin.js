// DEPENDENCIES-----------------------------------------------------
//--------------------------------------------------------------------
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const mongoose = require('mongoose');
const _ = require('underscore');

// MONGOOSE MODELS--------------------------------------------------
//--------------------------------------------------------------------
const User = require('../../models/User');
const Shelter = require('../../models/Shelter');

// CONSTANT VARIABLES-----------------------------------------------
//--------------------------------------------------------------------
const JWS_SECRET = require('../../config/keys').jwsSecret;
const ADMIN_SECRET = require('../../config/keys').adminSecretPassword;
const errorMessages = require('../status-messages')

// HELPER FUNCTIONS-----------------------------------------------
//--------------------------------------------------------------------
const createUser = require("../../helpers/user-creater");

// USER ROUTES -----------------------------------------------------
//--------------------------------------------------------------------
const router = express.Router();

// @@Route - www.hello-doggy/admin
// @@TYPE  - GET
// @@DESC  - Returns the info for a sign-up or sign-in form
router.get('/', (req, res) => {
	res.json({message: "Admin sign up "})
})

router.post('/', (req, res) => { 
	createUser(req.body, "admin")
	.then(response => {
		if (response.success === false) {
			const msg = errorMessages[response.error];	
			return res.status(msg.status).json({ error: msg.error, message: msg.message})
		} else if (response.success) {
				res.json({success: true, message: "User was successfuly created"})
		} else { 
			console.log("Create User wasn't caught: it returned: ", response)
			return res.status(500).json({ error: "Internal Error", message: "Dev - Something Went Wong"})
		}
	}).catch(err => {
		res.json({success: false, error: err.payload.name, message: err.payload.message})
		console.log(err)
	})	
})

// @@Route - www.hello-doggy/admin/session
// @@TYPE  - GET
// @@DESC  - Returns the info for a log-up form
router.get('/session', (req, res) => {
	res.json({message: "Admin sign in "})
})

// @@Route - www.hello-doggy/admin/session
// @@TYPE  - POST
// @@DESC  - Creates a session for an Admin
router.post('/session', (req, res) => {
	if (req.body.adminSecret !== ADMIN_SECRET ) {
		return res.status(401).json({ error: "Unauthorized", message: "Dev-Wrong Signed in User need Admin rights"})
	}
	const userUsername = req.body.username;
	const password = req.body.password;

	User.findOne({username: userUsername})
	.then(user => {
		if(!user) { res.status(404).json({error: "Invalid Email Or Password", message: "Dev-USERNAME or password is incorrect"})}
		bcrypt.compare(password, user.passwordDigest)
		.then(isMatch => {
			if (isMatch) {
				jwt.sign(user.basicInfo, JWS_SECRET, { expiresIn: 3600}, (err, token) => {
					res.json({
						success: true,
						token: "Bearer " + token
					})					
				})
			}	else { res.status(400).json({message: "Dev-username or PASSWORD is wrong"})}
		})
	})
})

// @@Route - www.hello-doggy/admin/shelters
// @@TYPE  - GET
// @@DESC  - Returns all existing shelters
router.get('/shelters', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.userType.role !== "admin") {
		return res.status(401).json({ error: "Unauthorized", message: "Dev- User needs to have admin rights"})
	} else { // used to guard against random role types falling through
		Shelter.find({})
		.then(shelters => {
			res.json(shelters)
		})
	}
})

// @@Route - www.hello-doggy/admin/shelter/new
// @@TYPE  - GET
// @@DESC  - Returns the info for a new shelter form
router.get('/shelters/new', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.userType.role !== "admin") {
		return res.status(401).json({ error: "Unauthorized", message: "Dev- User needs to have admin rights"})
	} else {
	res.json({message: "Admin create a new shelter Form"})
	}
})

// @@Route - www.hello-doggy/admin/shelter
// @@TYPE  - POST
// @@DESC  - Creates a new Shelter
router.post('/shelters/', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.userType.role !== "admin") {
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

// @@Route - www.hello-doggy/admin/shelter/unapproved
// @@TYPE  - GET
// @@DESC  - Returnes all Shelter that havn't been approved yet
router.get('/shelters/unapproved', passport.authenticate('jwt', { session: false}), (req, res) => {
	Shelter.find({adminApproved: false})
	.then(unapprovedShelters => {
		res.json(unapprovedShelters)
	})
})

// @@Route - www.hello-doggy/admin/shelters/:id
// @@TYPE  - GET
// @@DESC  - Returns the info of a single shelter using it's unique id
router.get('/shelters/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.userType.role !== "admin") {
		return res.status(401).json({ error: "Unauthorized", message: "Dev-Signed in User neeeds admin rights"})
	} else {
		Shelter.findById(req.params.id)
		.then(shelter => {
			res.json(shelter )
		}).catch(err => {
			res.status(400).json({ error: 400, message: "Dev - Invalid form info"})
		})
	}
})

// @@Route - www.hello-doggy/admin/shelters/:id
// @@TYPE  - PUT
// @@DESC  -  Updates a shelters attributes using its unique id
router.put('/shelters/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.userType.role !== "admin") {
		return res.status(401).json({ error: "Unauthorized", message: "Dev-Signed in User neeeds admin rights"})
	} else {
	const fieldsToUpdate = _.pick(req.body, Shelter.shelterCreateSafeFields);
		const shelterId = req.params.id
		Shelter.findByIdAndUpdate(shelterId, fieldsToUpdate, (err, shelter) => {
	    if(err) return res.json(err);

	    res.json({ success: true});
		});
	}
})
// @@Route - www.hello-doggy/admin/shelters/:id
// @@TYPE  - DELETE
// @@DESC  - Delets a shelter useing its unique id
router.delete('/shelters/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
		if (req.user.userType.role !== "admin") {
			return res.status(401).json({ error: "Unauthorized", message: "Dev- Signed un User needs Admin rights"})
		} else {
			const shelterId = mongoose.Types.ObjectId(req.params.id)
			Shelter.findByIdAndRemove(shelterId, (err, shelter) => { 
		    if (shelter === null) return res.status(400).send({error: "Bad Request", message: "Dev- Invalid Shelter ID"});
		    
		    return res.status(200).json({message: `${shelterId} was Successfuly Deleted`});
			});				
		}	
})


// @@Route - www.hello-doggy/admin/shelters/:shelterId/:shelterAdminId
// @@TYPE  - Put
// @@DESC  - Assiges a shelterAdmin to a Shelter
router.put('/shelters/:shelter/:shelterAdmin', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.user.userType.role !== "admin" || req.body.adminSecret !== ADMIN_SECRET) {
			return res.status(401).json({ error: "Unauthorized", message: "Dev-Signed In User needs Admin rights"})
		} else {
			const ShelterId = mongoose.Types.ObjectId(req.params.shelter)
			const shelterAdminId = mongoose.Types.ObjectId(req.params.shelterAdmin)

			User.findById(shelterAdminId)
			.then((shelterAdmin) => {
				shelterAdmin.userType = {
					role: "shelter-admin",
					shelterId: ShelterId,
					approved: true
				}

				Shelter.findById(ShelterId)
				.then((shelter) => {
					shelter.shelterAdminId = shelterAdmin._id;
					shelter.adminApproved = true;
					shelterAdmin.save()
					shelter.save()
					.then(() => res.json(shelter))
				})
			})
		}			
})


// HELPER FUNCTIONS-------------------------------------------------
//--------------------------------------------------------------------



const hasShelterAdminRights = (user) => {
	console.log(user.userType.role === "admin")
	return (user.userType.role === "admin")
}






module.exports = router;