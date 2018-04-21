// OUTSIDE DEPENDENTS
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const passport = require('passport');

// ROUTES
const users = require("./routes/api/users");
const posts = require("./routes/api/posts");
const profiles = require("./routes/api/profiles");
const admin = require("./routes/api/admin");
const shelter = require("./routes/api/shelter");

// KEYS & CONSTANT VALUES
const DB = require('./config/keys').mongoURI;
const PORT = process.env.PORT || 5000;

// INIT EXRESS APP
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.use(passport.initialize());

// CONNECT PASSPORT TO PASSPORT CONFIG FILE
require('./config/passport')(passport);

// CONNECT API ROUTES TO EXPRESS APP
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profiles', profiles);
app.use('/api/admin', admin);
app.use('/api/profiles', profiles);
app.use('/api/shelter', shelter);

mongoose.connect(DB)
.then(() => console.log(`Connected to DB at: ${DB}`))
.catch((err) => console.log(err))

app.get('/', (req, res) => res.send("Hello WOrld"));


app.listen(PORT, console.log(`Server running on port: ${PORT}`));