const express = require('express');
const session = require('express-session');
const pug = require('pug');
const path = require('path');
const mongoose = require("mongoose");
const User = require("./userModel");
const Order = require("./orderModel");
const e = require('express');
const MongoDBStore = require('connect-mongodb-session')(session);


//Connect session data to the database so that the session data can be stored in the database
let mongoStore = new MongoDBStore({

    uri: 'mongodb://localhost/a4',
    collection: 'sessiondata'
});

const app = express();
app.set("view engine", "pug");
app.set('views', path.join(__dirname, 'views'));


//Middleware
app.use(express.static(__dirname + '/views'));
app.use(express.json()); 
app.use(express.urlencoded({extended: true}));

//Session
app.use(
    session({ 
        secret: 'some secret key here',
        resave: false,
        saveUninitialized: false, 
        store: mongoStore
    })
);

//If a GET request was made to /, run this code
app.get("/", (req, res) => {

    //Initializes the session data to false
    if (req.session.loggedIn != true) {

        req.session.loggedIn = false;
        req.session.username = false;
        req.session.loginID = false;
        req.session.save();
    }

    //Render the home page
    res.set('Content-Type', 'text/html');
    res.render("index.pug", {loginStatus: req.session.loggedIn, loginUser: req.session.username, userID: req.session.loginID});
});

//If a GET request was made to /register, run this code
app.get("/register", (req, res) => {

    //Render the register page
    res.set('Content-Type', 'text/html');
    res.render("register.pug", {loginStatus: req.session.loggedIn});
});

//If a POST request was made to /register, run this code
app.post("/register", (req, res) => {

    //Connect to the database
    mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(err, results){

        //Look for a pre-existing user in the databasae that has the same username that the client is trying to register an account with
        User.find({username: req.body.username}, function(err, result) {


            //No pre-existing user found, create a new user
            if (result.length == 0) {

                //Give the new user a username and password set by the client, and default it's privacy to false and it's order history to empty.
                let newUser = new User({username: req.body.username, password: req.body.password, privacy: false, orderhistory: []});
                newUser.save(function(err){
                    if(err) throw err;

                    //After the account has been created, log the user in.
                    req.session.loggedIn = true;
                    req.session.username = req.body.username;
                    req.session.loginID = newUser._id;
                    req.session.save();

                   

                    //Send a success status to redirect the newly logged in user to their profile page
                    res.status(200);
                    res.set('Content-Type', 'application/json');
                    res.send(JSON.stringify(newUser._id));


                    //Close the connection to the database
                    mongoose.connection.close();
                });                
            }

            //A pre-existing user with the matching username was found. Can't have duplicate usernames, therefore send an error status to the client.
            else {

                res.status(406);
                res.send();

                //Close the connection to the database
                mongoose.connection.close();
            }
        })
    });
});


//If a GET request was made to /users, run this code
app.get("/users", (req, res) => {


    //Connect to the database
    mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(err, results){

        //Look for users in the database that match the name query
        User.find().where({username: new RegExp(req.query.name, 'i')}).exec(function(err, result) {

            let foundUsers = [];

            //Create an object out of all the found users, and then add the user objects into an array
            for (let i = 0; i < result.length; i++) {

                let userObject = {};
                
                userObject.username = result[i].username;
                userObject.password = result[i].password;
                userObject.privacy = result[i].privacy;
                userObject.id = result[i]._id;
                foundUsers[i] = userObject;
            }

           
            //Render the users page, sending it the newly created array of user objects
            res.set('Content-Type', 'text/html');
            res.render("users.pug", {loginStatus: req.session.loggedIn, Users: JSON.stringify(foundUsers), userID: req.session.loginID});
            mongoose.connection.close();

        });
    });
}); 


//If a GET request was made to /users with a parameter, run this code
app.get("/users/:userID", (req, res) => {

    let chosenUser = req.params.userID;

    //Connect to the database
    mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(err, results){

        //Find the requested user
        User.find({_id: chosenUser},  function(err, result){


            //If the requested profile is set to private and the requesting client is not logged in as the owner of the profile
            if (result[0].privacy == true && (req.session.username != result[0].username)) {

                //Close the connection to the database
                mongoose.connection.close();

                //Send an error message to the client
                res.status(403);
                res.send("You must be the owner of this profile to view this profile");
            }

            //If the user is logged in and looking at their own page, or if the profile is not set to private, close the connection to the database and generate the user page
            if ((req.session.loggedIn == true && req.session.username == result[0].username) || result[0].privacy == false) {

                let profileOwner = (req.session.username == result[0].username)

                mongoose.connection.close();
                res.set('Content-Type', 'text/html');
                res.render("userpage.pug", {user: result[0], loginStatus: req.session.loggedIn, profileOwner: profileOwner, userID: req.session.loginID});
            }

            
            //Close the connection to the database
            mongoose.connection.close();

        });
    });
});

//If a POST request was made to /changePrivacy, run this code
app.post("/changePrivacy", (req, res) => {

    //Connect to the database
    mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(err, results){

    
        //If the client is logged in as the user of the account they are trying to change the privacy setting of
        if (req.body.username == req.session.username) {

            //Find and update the user with the new privacy status
            User.findOneAndUpdate({username: req.session.username}, {privacy: req.body.privacyStatus}, function(err, result) {

            
                //Close connection to the database and send a success status
                mongoose.connection.close();
                res.status(200);
                res.send();
            })
        }

        //If the client is not logged in as the user of the account they are trying to change the privacy setting of
        else {

            //Close connection to the database and send a failure status
            mongoose.connection.close();
            res.status(404);
            res.send();
        }
    });
});


//If a POST request was made to /login, run this code
app.post("/login", (req, res) => {

    //Connect to the database
    mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(err, results){

        //Look for a user in the database with the same username the client is trying to log in with
        User.find({username: req.body.username}, function(err, result) {


            //If the user does not exist
            if (result.length == 0) {

                //Send a failure status
                res.status(406);
                res.send();

                //Close the connection to the database
                mongoose.connection.close();
            }

            //User found, check to see if the password matches
            else {

                //Password matches, log them in and send a success code
                if (req.body.password == result[0].password) {

                    req.session.loggedIn = true;
                    req.session.username = req.body.username;
                    req.session.loginID = result[0]._id;
                    req.session.save();

                    res.status(200);
                    res.send();

                    //Close connection to the database
                    mongoose.connection.close();
                }

                //Password doesn't match, send an error status. This will alert the user that they have entered in the incorrect password
                else {

                    res.status(418);
                    res.send();

                    //Close connection to the database
                    mongoose.connection.close();
                }
            }
        })
    });
});

//If a POST request was made to /logout, run this code
app.post("/logout", (req, res) => {

    //Adjust the session data
    req.session.loggedIn = false;
    req.session.username = false;
    req.session.loginID = false;
    req.session.save()

    //Send a success status
    res.status(200);
    res.send();
});

//If a GET request was made to /orderform, run this code
app.get("/orderform", (req, res) => {

    //If the user is logged in 
    if (req.session.loggedIn) {

        //Render the order form page
        res.set('Content-Type', 'text/html');
        res.render("orderform.pug", {userID: req.session.loginID});
    }


    //If the user is not logged in
    else {

        //Send them an error status/error message
        res.status(401);
        res.send('You must be logged in to access this page');
    }
});

//If a POST request was made to /orders, run this code
app.post("/orders", (req, res) => {

    //Connect to the database
    mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(err, results){

        
        //Create the new order. Link it to the client's username.
        let newOrder = new Order({customerName: req.session.username, order: req.body});
        newOrder.save(function(err){
            if(err) throw err;

           
            req.body["orderID"] = newOrder._id;

            //Add the order to the client's order history in the database
            User.findOneAndUpdate({username: req.session.username}, {$push: {orderhistory: req.body}}, function(err, result) {

                //Close the connection to the database and send a success status
                mongoose.connection.close();
                res.status(200);
                res.send();
            })
        }); 
    });
});

//If a GET request was made to /orders with a parameter, run this code
app.get("/orders/:orderID", (req, res) => {

    let orderID = req.params.orderID;
   
    //Connect to the database
    mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function(err, results){

        //Find the order in the database
        Order.find({_id: orderID},  function(err, result){


            //Find the status of the customer's privacy
            User.find({name: result[0].customerName}, function(err, foundUser) {



                //If the customer's account is public, or if the requesting client is logged in as the customer
                if (foundUser[0].privacy == false || req.sessions.username == result[0].customerName) {

                    //Render the order summary page off the selected order
                    res.set('Content-Type', 'text/html');
                    res.render("orderSummary.pug", {loginStatus: req.session.loggedIn, userID: req.session.loginID, orderInfo : result[0]});
                    mongoose.connection.close();
                }

                //If the customer's account is private or if the requesting client is not logged in as the customer
                else {

                    //Send an error status and close the connection to the database
                    res.status(403);
                    res.send("This order's customer's account is private. You must be logged in as the user to view the order");
                    mongoose.connection.close();
                }
            });
        });  
    });
})


//Start the server
app.listen(3000);
console.log("Server listening at http://localhost:3000");