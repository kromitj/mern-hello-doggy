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

router.get('/new', (req, res) => {
	res.json({message: "Users Login Form"})
})

router.post('/', (req, res) => { 
  createUser(req.body, "user")
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
		console.log(err)})	
})


router.get('/session', (req, res) => {
	res.json({message: "Users Login Form"})
})

router.post('/session', (req, res) => {
	signInUser(req.body.username, req.body.password, jwt)
	.then(response => {
		if (!response.success) {
			const resp = signInStateTable[response.error]
			res.status(resp.status).json({error: resp.error, message: resp.message})
		} else {
			res.json({ success: true, token: `Bearer ${response.payLoad}`})
		}
	})
})

router.put('/:username', passport.authenticate('jwt', { session: false}), (req, res) => {
	if (req.params.username !== req.user.username) { res.json("Dev - messsage loged in user doesn't match user being modified")}
		const userParmsToUpdate = _.pick(req.body, User.userCreateSafeFields)
		User.findByIdAndUpdate(req.user._id, userParmsToUpdate, (err, user) => {
	    if(err) return res.json(err);

	    res.json({ success: true});
		});
})



// HELPER FUNCTIONS-------------------------------------------------
//--------------------------------------------------------------------
const signInStateTable = {
	"bad username" : { status: 400, error: "Bad Request", "message": "Dev - Password or USERNAME is incorrect"},
	"wrong password": { status: 400, error: "Bad Request", "message": "Dev - PASSWORD or username is incorrect"}
}

const signInUser = (username, password) => {
	return new Promise( (resolve, reject) => {
		User.findOne({username})
		.then(user => {
			if (!user) { resolve({ success: false , error: "bad username"}) }
			bcrypt.compare(password, user.passwordDigest)
			.then(isMatch => {
				if (isMatch) {
					
					jwt.sign(user.basicInfo, JWS_SECRET, { expiresIn: 3600}, (err, token) => {
						resolve({ success: true, payLoad: token})
					})
				} else { resolve({success: false, error: "wrong password"})}
			}).catch(err => reject({success: false, error: err}))
		}).catch((err) => reject({success: false, error: err}))
	})
}




module.exports = router;