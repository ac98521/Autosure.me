// SFQ Results Model

//Grab all required packages & add a schema to use
var mongoose 	= require("mongoose");
var Schema 		= mongoose.Schema;

var sfqSchema = new Schema({
	//Hidden Fields
	
	showRevise				: String,
	PrevActionSolution		: String,
	/*
	alreadysent				: boolean,
	SF_Authors				: [{type: String}],
	SF_Readers				: [{type: String}],
	*/
	
	F_IDExecMeeting			: String, //{type: Schema.Types.ObjectId, ref: "meetResult"},
	F_ExecDisplay			: String,
	F_Comments				: String,
	
	//Result Details
	F_ResultStatus			: String,
	IQuestion				: String,
	IAnswerType				: String,
	IAnswer					: String,
	isActionNeeded			: String,
	
	//Required Action
	ActionOwner				: String,
	ActionDeadline			: Date,
	ActionClosedDate		: Date,
	ActionSolution			: String,
});

module.exports = mongoose.model("sfqResult", sfqSchema);