const errorMessages = {
	"bad username" : { status: 400, error: "Bad Request", "message": "Dev - Password or USERNAME is incorrect"},
	"wrong password": { status: 400, error: "Bad Request", "message": "Dev - PASSWORD or username is incorrect"},
	"invalid admin secret": { status: 400, error: "Bad Request", "message": "Dev - Admin Password Incorrect"},
	"admin exists": { status: 403, error: "Forbidden", "message": "Dev - Can only have one admin"},
	"email taken": { status: 400, error: "Bad Request", "message": "Dev - Email already being used"},
	"sign-in needed": { status: 400, error: "Bad Request", "message": "Dev - Sign-In or Sign-Up First"},

}

module.exports = errorMessages;