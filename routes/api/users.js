const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const passport = require("passport");

const jwsSecret = require('../../config/keys').jwsSecret;
const validateRegisterInput = require('../../validation/register');
const User = require('../../models/User')
const router = express.Router();


router.post('/register', (req, res) => { 
	console.log(req.body)
  User.findOne({ email: req.body.email})
  .then((user) => {
  	if(user) {
  		return res.status(400).json({ error: "Email Exists", message: "Email already being used"})
  	} else {
  		populateUserParams(req.body)		  
		  .then(userParams => {
			  const newUser = new User(userParams)
			  newUser.save()
			  .then(user => res.json(user.basicInfo))
			  .catch(err => console.log(err))		  	
		  })
  	}
  })
})

router.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password
	User.findOne({email})
	.then(user => {
		if(!user) { res.status(404).json({error: "Invalid Email Or Password", message: "Password or Email is incorrect"})}
		bcrypt.compare(password, user.password)
		.then(isMatch => {
			if (isMatch) {
				jwt.sign(user.basicInfo, jwsSecret, { expiresIn: 3600}, (err, token) => {
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

router.get('/current', passport.authenticate('jwt', { session: false}), (req, res) => {
	res.json(req.user)
})

const populateUserParams = (reqBody) => {
	return new Promise((resolve, reject) => {
		genBcrypt(reqBody.password)
		.then((hash, err) => {
			const params = {name: reqBody.name, email: reqBody.email, avatar: gravatar.url({s: '200', r: 'pg', d: 'mm'}), password: hash };
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