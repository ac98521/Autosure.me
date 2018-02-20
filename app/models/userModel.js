// user model

//Grab all required packages & add a schema to use
var mongoose 	= require("mongoose");
var Schema 		= mongoose.Schema;

//simple registration & validation model
//add a role for future versions!
var userSchema = new Schema({
	serialnum	: String,
	password	: String	//IRL, password and other sensitive info needs to be encrypted
});

module.exports = mongoose.model("user", userSchema);