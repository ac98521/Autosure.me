//config model

//Grab all required packages & add a schema to use
var mongoose 	= require("mongoose");
var Schema 		= mongoose.Schema;

var configDocSchema = new Schema({
	keyword	: String,
	value	: String
});

module.exports = mongoose.model("configDoc", configDocSchema);