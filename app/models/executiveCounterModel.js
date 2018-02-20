//EX Counter Model

//Grab all required packages & add a schema to use
var mongoose 	= require("mongoose");
var Schema 		= mongoose.Schema;

var CounterSchema = new Schema({
	name	: String,
	seq		: Number
});

module.exports = mongoose.model("Counter", CounterSchema);