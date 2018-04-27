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
const user = require('../../models/Shelter');

// CONSTANT VARIABLES-----------------------------------------------
//--------------------------------------------------------------------
const JWS_SECRET = require('../../config/keys').jwsSecret;
const ADMIN_SECRET = require('../../config/keys').adminSecretPassword;


// HELPER FUNCTIONS-----------------------------------------------
//--------------------------------------------------------------------
const createUser = require("../../helpers/user-creater");
console.log(createUser)
// USER ROUTES -----------------------------------------------------
//--------------------------------------------------------------------
const router = express.Router();

router.get('/new', (req, res) => {
	res.json({message: "Users Login Form"})
})

router.post('/', (req, res) => { 
  createUser(req.body)
  .then((response) => {
  	console.log(response)
  	if (response === 'user taken') {
  		console.log('user Taken --------------')
  		return res.status(400).json({ error: "Bad Request", message: "Dev - Email already being used"})
  	} else {
  		console.log("yooooooooooooooo")
  		res.status(201).json({ message: "Dev - request has been fulfilled", userId: newUser._id})
  	}
  }).catch(err => { res.status(201).json({ error: "Created", message: `Dev - ${err.message}`})})

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





module.exports = router;