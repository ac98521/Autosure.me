//Meeting Results Model

//Grab all required packages & add a schema to use
var mongoose 	= require("mongoose");
var Schema 		= mongoose.Schema;


var meetResultSchema = new Schema({
	//Hidden Fields (Values are set on create)
	// Add field for mode?
	SF_MeetingStatus 		: String,
	SF_SessionType			: String,
	/*
	SF_Authors				: [{type: String}],
	SF_Readers				: [{type: String}],
	*/
	
	F_IDExecMeeting			: String,
	F_MeetingCategory		: String,
	
	//Meeting Details
	//Following fields should be array with max 25?
	Participants			: [{
								F_EmployeeNumber		: String, 		//computed 
								F_EmployeeName			: String,		 //{type: String, required: true},
								F_EmployeeBusinessTitle	: String, 		//computed
								F_EmployeeDept			: String, 		//computed
								F_EmployeeContactNo		: String, 		//computed
							  }],
	
	//Meeting Results
	F_InterviewDate			: {type: Date, default: Date.now},		//defaults to Today
	F_ExecutiveName			: String,								//{type: String, required: true}, //set on create
	F_DelegateName			: String,
	F_Comments				: String,
});

module.exports = mongoose.model("meetResult", meetResultSchema);