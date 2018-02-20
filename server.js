//server.js

//SETUP

const url 		= "mongodb://heinz:admin@ds025232.mlab.com:25232/nodejs"

// define all packages needed
var express			= require ("express");
var app				= express();
var port 			= process.env.PORT || 3000; 	// use port 3000
var bodyParser		= require("body-parser");		// use body parser to process JSON?
var cookieParser	= require("cookie-parser");		// package for cookie
var router 			= express.Router();				// handle routings
var mongoose 		= require("mongoose");			// handle db connection
var nodemailer		= require("nodemailer");		// package for notification sending
var Excel 			= require('exceljs');

var db;

//configure express static directory
app.use(express.static(__dirname));

//configure body parser to allow us to use POST (i.e. req.body)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//configure cookies (for local storage)
app.use(cookieParser());

//connect to database
mongoose.connect(url, function(err) {
	if (err) throw err;
});

db = mongoose.connection;
db.on("error", function() {
	console.log("mongoDB error");
});

db.once("open", function() {
	console.log("mongoDB connection successful!");
});

db.on("disconnected", function(){
	mongoose.connect(url);
	db =  mongoose.connection;
});

//fetch models
var User				= require("./app/models/userModel.js");				// user model
var Meet				= require("./app/models/meetResultModel");			// meeting document model
var SFQ 				= require("./app/models/sfqModel");					// result document model	
var EX					= require("./app/models/executiveCounterModel"); 	// counter model
var ConfigDoc			= require("./app/models/configDocModel");

//if you have middlewares. Put them here
router.use(function(req, res, next) {
	console.log("Processing"); //log to know that we are processing
	next();
});

//set up route handlers

//routing for '/home'
router.route("/home/:query")
	.get(function(req, res) {
		res.sendfile("index.html");
	})
	
	//display only authorized entries?
	/*
		Find all documents which contain user name
		Return them filtered according to parameter
	*/

	.post(function(req, res) {
		var query;
		var filter;
		
		switch (req.params.query) {
			case "All":
				query = {};
				filter = 'SF_SessionType';
				break;
				
			case "Draft":
				query = {SF_MeetingStatus: "Draft"};
				filter = 'SF_SessionType';
				break;
				
			case "Pending":
				query = {SF_MeetingStatus: "Pending"};
				filter = 'SF_SessionType';
				break;
				
			case "Completed":
				query = {SF_MeetingStatus: "Completed"};
				filter = 'SF_SessionType';
				break;
				
			case "Executive":
				query = {SF_SessionType: "Executive"};
				filter = "";
				break;
				
			case "Roundtable":
				query = {SF_SessionType: "Roundtable"};
				filter = ""
				break;

			case "Executive_byExecutive":
				query = {SF_SessionType: "Executive"};
				filter = 'F_ExecutiveName';
				break;
				
			case "Executive_byInterviewee":
				query = {SF_SessionType: "Executive"};
				filter = 'Participants[0].F_EmployeeName';
				break;

			case "Executive_byStatus":
				query = {SF_SessionType: "Executive"};
				filter = 'SF_MeetingStatus';
				break;

			case "Roundtable_byChair":
				query = {SF_SessionType: "Roundtable"};
				filter = 'F_ExecutiveName';
				break;
				
			case "Roundtable_byParticipant":
				query = {SF_SessionType: "Roundtable"};
				filter = "F_EmployeeName"	;
				break;

			case "Roundtable_byStatus":
				query = {SF_SessionType: "Roundtable"};
				filter = 'SF_MeetingStatus';
				break;

			case "Configuration":
				query = {};
				filter = "";
				break;

			default:
				query = {F_IDExecMeeting: "undefined"};
		}
		
		if(req.params.query === "Configuration") {
			ConfigDoc.find(query, function(err, configdocs) {
				if (err) return res.send(err);

				if(configdocs.length > 0) {
					res.send({query: req.params.query, configdocs, filter: filter});
				}
				else {
					res.send({status: "fail", query: req.params.query});
				}
			});
		}
		else {
			Meet.find(query, function(err, meets) {
				if (err) return res.send(err);
				
				if(meets.length > 0) {
					res.send({query: req.params.query, meets, filter: filter});
				}
				else {
					res.send({status: "fail", query: req.params.query});
				}
			});
		}
	});

//routing for '/meet'
router.route("/meet/:id")
	.get(function(req, res) {
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {	
		
		Meet.find({_id: req.params.id}, function(err, meets) {
				if (err) return res.send(err);
				res.send({status: "success", meets});
		});
	})
	
	.put(function(req, res) {
		Meet.findById(req.params.id, function(err, meet) {
			if (err) return res.send(err);
			
			//overwrite meet with result parameters
			meet.SF_MeetingStatus		= req.body.SF_MeetingStatus;
			meet.SF_SessionType			= req.body.SF_SessionType;
			meet.F_IDExecMeeting		= req.body.F_IDExecMeeting;
			meet.F_MeetingCategory   	= req.body.F_MeetingCategory;
			meet.Participants			= req.body.Participants.slice();
			meet.F_InterviewDate		= req.body.F_InterviewDate;
			meet.F_ExecutiveName		= req.body.F_ExecutiveName;
			meet.F_DelegateName			= req.body.F_DelegateName;
			meet.F_Comments				= req.body.F_Comments;
			
			meet.save(function(err) {
				if (err) return res.send(err);
				res.send(meet);
			});
		});
	});

router.route("/meet/new/:type")
	.get(function(req, res) {
		res.sendfile("index.html");
	})

	.post(function(req, res) {
		var meet = new Meet({
		
			SF_MeetingStatus	: req.body.SF_MeetingStatus, //"Draft", 							//default status
			SF_SessionType		: req.params.type, 					// variable [Executive/Roundtable]
			F_IDExecMeeting		: req.body.F_IDExecMeeting,
			F_MeetingCategory   : req.body.F_MeetingCategory,
			Participants		: req.body.Participants.slice(), 	// copy array to meet.Participants array		
			F_InterviewDate		: req.body.F_InterviewDate,
			F_ExecutiveName		: req.body.F_ExecutiveName,
			F_DelegateName		: req.body.F_DelegateName,
			F_Comments			: req.body.F_Comments,
		});
				
		meet.save(function(err) {
			if (err) res.send(err);
			res.send({status: "success", meet});
		});	
	});

router.route("/meet/all/:id")
	.get(function(req, res) {
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {
		SFQ.find({F_IDExecMeeting: req.params.id}, function(err, results) {
			if (err) return res.send(err);
			
			if(results.length > 0 ) {
				res.send({status: "success", results});
			}
			else {
				res.send({status: "fail", results});
			}
		});
	});

router.route("/meet/results/all")
	.post(function(req, res) {
		var query = {
			F_IDExecMeeting		: req.body._id,
		};
		
		SFQ.find(query, function(err, results) {
			var counter = 0;
			if (err) res.send(err);
			
			// find way to control edit mode
			if(req.body.SF_MeetingStatus === "Draft") {
				for(i=0; i<results.length; i++) {
					if(results[i].isActionNeeded === "Yes" && !(results[i].hasOwnProperty("ActionSolution"))) {
						results[i].F_ResultStatus = "Pending Acceptance";
						counter++;
					}
					else {
						results[i].F_ResultStatus = "Closed";
					}
					results[i].save();
				}
			}
			else if(req.body.SF_MeetingStatus === "Pending") {
				for(i=0; i<results.length; i++) {
					if(results[i].isActionNeeded === "Yes") {
						results.showRevise = "Y";
						results[i].save();
					}
					
				}
			}
			
			res.send({counter, results});
		});
	});

//routing for '/result'
router.route("/result/:id")
	.get(function(req, res) {
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {
		SFQ.find({_id: req.params.id}, function(err, results) {
				if (err) return res.send(err);
				res.send({status: "success", results}); //return meet object
			});
	})
	
	.put(function(req, res) {
		SFQ.findById(req.params.id, function(err, result) {
			if (err) return res.send(err);
			
			result.F_ResultStatus		= req.body.F_ResultStatus;
			result.F_IDExecMeeting		= req.body.F_IDExecMeeting;
			result.F_ExecDisplay		= req.body.F_ExecDisplay;
			result.IQuestion   			= req.body.IQuestion;
			result.IAnswer				= req.body.IAnswer;
			result.IAnswerType			= req.body.IAnswerType;
			result.isActionNeeded		= req.body.isActionNeeded;
			result.ActionOwner			= req.body.ActionOwner;
			result.ActionDeadline		= req.body.ActionDeadline;
			result.ActionClosedDate		= req.body.ActionClosedDate;
			result.ActionSolution		= req.body.ActionSolution;
			
			//misc fields
			result.F_Comments			= req.body.F_Comments;
			result.showRevise			= req.body.showRevise;
			result.PrevActionSolution	= req.body.PrevActionSolution;
			
			result.save(function(err) {
				if (err) return res.send({status: "fail"});
				res.send(result); // return update model
			});
		});
	});
	
router.route("/result/new/:id")
	.get(function(req, res) {
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {
		var result = new SFQ({
		
			F_ResultStatus		: req.body.F_ResultStatus, //if action needed is 'No' set this to completed
			F_IDExecMeeting		: req.body.F_IDExecMeeting, // id key of meeting. Binds result to meeting doc
			F_ExecDisplay		: req.body.F_ExecDisplay,
			
			IQuestion   		: req.body.IQuestion,
			IAnswerType			: req.body.IAnswerType, // copy array to meet.Participants array		
			IAnswer				: req.body.IAnswer,
			isActionNeeded		: req.body.isActionNeeded,
			
			ActionOwner			: req.body.ActionOwner,
			ActionDeadline		: req.body.ActionDeadline,
			ActionClosedDate	: req.body.ActionClosedDate,
			ActionSolution		: req.body.ActionSolution,
			F_Comments			: "",
			PrevActionSolution	: "",
			showRevise			: "Y"
		});
		
		result.save(function(err) {
			if (err) res.send(err);
			console.log(result);
			res.send(result);
		});
	});

//routing for notification
router.route("/notification/:id")
	.get(function(req, res) {
		//render notification html
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {
		//fetch result document using id token
		
		SFQ.find({_id: req.params.id}, function(err, result) {
			if (err) res.send(err);
			
			res.send({status: "success", result});
		});
	});
	
router.route("/notification/update/:id")
	.put(function(req, res) {
		SFQ.findById(req.params.id, function(err, result) {
			if (err) return (err);
			
			// check if status field is pending
			//update fields
			result.ActionSolution 		= req.body.ActionSolution;
			result.ActionClosedDate 	= new Date().toLocaleDateString("en-US");
			result.showRevise			= "Y";
		  	result.Comments 			= ""; //clear comments field
			
			result.save(function(err) {
				if (err) res.send({status: "fail"});
				res.send(result);
			});
		});
	});

//routing for config docs

router.route("/configuration/:id")
	.get(function(req, res) {
		res.sendfile("index.html");
	})

	.post(function(req, res) {
		ConfigDoc.find({_id: req.params.id}, function(err, configdocs) {
				if (err) return res.send(err);
				res.send({status: "success", configdocs});
		});
	})

	.put(function(req, res) {
		ConfigDoc.findById(req.params.id, function(err, configdoc) {
			configdoc.keyword 	= req.body.keyword;
			configdoc.value 	= req.body.value;

			configdoc.save(function(err) {
				if (err) return res.send(err);
				res.send({status: "success", configdoc});
			})
		});
	});

router.route("/configuration/new")
	.get(function(req, res) {
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {
		var configdoc = new ConfigDoc({
			keyword		: req.body.keyword,
			value		: req.body.value
		});
		
		configdoc.save(function(err) {
			if (err) res.send(err);
			res.send(configdoc);
		});
	});

//counter route
router.route("/count/:type")
	
	.put(function(req, res) {
		var query = {keyword: req.params.type + "Counter"};
		
		ConfigDoc.findOne(query, function(err, count) {
			count.value = parseInt(count.value) + 1;
			
			count.save(function(err) {
				res.send(count);
			});
		});
	});

//bluepages route
router.route("/fetchBp")
	.post(function(req, res) {
		
		var http = require('http');

		//http://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/serialnumber=123795ph1.list/byjson
		//http://bluepages.ibm.com/BpHttpApisv3/wsapi?allByNotesIDLite=CN=Heinz%20Nielsen%20Buenaventura/OU=Philippines/O=IBM@IBMPH
		var options = {
		  host: 'bluepages.ibm.com',
		  path: '/BpHttpApisv3/slaphapi?ibmperson/serialnumber=' + req.body.serialnum + 'PH1.list/byjson'


		  //path: '/BpHttpApisv3/slaphapi?ibmperson/serialnumber=' + req.body.Participants[0].F_EmployeeNumber + 'PH1.list/byjson'
		  //path: '/BpHttpApisv3/wsapi?allByNotesIDLite=CN=Heinz%20Nielsen%20Buenaventura/OU=Philippines/O=IBM@IBMPH'
		};

		callback = function(response) {
		  var str = '';
			
		  console.log(response.statusCode);
		  response.setEncoding("utf8");
		  //another chunk of data has been recieved, so append it to `str`
		  response.on('data', function (chunk) {
			str += chunk;
		  });

		  //the whole response has been recieved, so we just print it out here
		  response.on('end', function () {
			var body = str;
			//res.send({status: "success", body});
			res.send(body);
		  });
		}
		
		var data = http.request(options, callback).end();
	});


router.route("/fetchBpNotif")
	.post(function(req, res) {
		console.log(req.body.ActionOwner);

		var http = require('http');

		//http://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/serialnumber=123795ph1.list/byjson
		//http://bluepages.ibm.com/BpHttpApisv3/wsapi?allByNotesIDLite=CN=Heinz%20Nielsen%20Buenaventura/OU=Philippines/O=IBM@IBMPH
		var options = {
		  host: 'bluepages.ibm.com',
		  path: '/BpHttpApisv3/slaphapi?ibmperson/serialnumber=' + req.body.ActionOwner + 'PH1.list/byjson'
		  //path: '/BpHttpApisv3/slaphapi?ibmperson/notesemail=CN=Heinz%20Nielsen%20Buenaventura/OU=Philippines/O=IBM@IBMPH' 
		};

		callback = function(response) {
		  var str = '';
			
		  console.log(response.statusCode);
		  response.setEncoding("utf8");
		  //another chunk of data has been recieved, so append it to `str`
		  response.on('data', function (chunk) {
			str += chunk;
		  });

		  //the whole response has been recieved, so we just print it out here
		  response.on('end', function () {
			var body = str;
			//res.send({status: "success", body});
			res.send(body);
		  });
		}
		
		var data = http.request(options, callback).end();
	});

//login route
router.route("/login")
	.get(function(req, res) {
		//render notification html
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {
		//find user with same credentials
		var user = new User({
			serialnum 	: req.body.serialnum,
			password	: req.body.password
		});
		User.find({serialnum : user.serialnum, password: user.password}, function(err, users) {
			if(users.length > 0) {
				res.send({status:"success", users});
			}
			else {
				//no users with same credentials registered
				res.send({status: "fail"});
			}
		});
	});
	
//register route
router.route("/register")
	.get(function(req, res) {
		//render notification html
		res.sendfile("index.html");
	})
	
	.post(function(req, res) {
		//check if existing already
		//IRL, registration should send activation email
		var user = new User({
			serialnum 	: req.body.serialnum,
			password 	: req.body.password
		});
		
		User.find({serialnum: user.serialnum}, function(err, users) {
			if (users.length > 0){
				res.send({status: "fail"});
			}
			else {
				user.save(function(err) {
					if (err) res.send(err);
					res.send({status: "success"});
				});	
			}
		});
	});

//email route
router.route("/sendEmail")
	.post(function(req, res) {
		var transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "zzzievher@gmail.com",
				pass: "samsung12345"
			}
		});
		
		var mailOptions = {
			from		: '"EIRDB Tool Test Email" <zzzievher@gmail.com>',
			subject		: req.body.subject,
			to			: req.body.to,
			html		: req.body.html
		};
		
		transporter.sendMail(mailOptions, function(err, info) {
			if (err) return console.log(err);
			console.log("sent", info.messageId, info.response);
			res.send({status: "success"});
		});
	});

//Excel route
router.route("/ReportBuilder")
	.post(function(req, res) {
		//build query
		var query = {};

		//required parameters. Defaults to "All"
		if(req.body.report_meetingType != "All") {
			query.SF_SessionType = req.body.report_meetingType;
		}

		if(req.body.report_status != "All") {
			query.SF_MeetingStatus = req.body.report_status;
		}

		if(req.body.report_date != "All") {
			query.F_InterviewDate = req.body.report_date;
		}

		//optional paramaters. Authors, Interviewee & Department Code is under work
		if(req.body.report_executive != null) {
			query.F_ExecutiveName = req.body.report_executive;
		}

		if(req.body.report_delegate != null) {
			query.F_DelegateName = req.body.report_delegate;
		}

		if(req.body.report_interviewee != null) {
			query.Participants.F_EmployeeName = req.body.report_interviewee;
		}

		if(req.body.report_department != null) {
			query.Participants.F_EmployeeDept;
		}
		
		console.log(query);

		//create new excel workbook
		var workbook = new Excel.Workbook();
		var worksheet = workbook.addWorksheet("Sheet1");
		
		worksheet.addRow(["Executive Meeting No.", "Employee CNUM", "Employee Name","Business Title", "Department Code", "Contact Number", "Date of Interview", "Executive Name", "Delegate Name", "Question", "Answer", "Question Type", "Action Required?", "Action Owner", "Action Deadline", "Action Closed Date", "Action Solution"]);
		worksheet.getRow(1).font = { name: 'Calibri', family: 4, size: 11, bold: true };
		worksheet.getRow(1).commit();
		//Asynchronous loops
		//https://mostafa-samir.github.io/async-iterative-patterns-pt1/
		Meet.find(query, function(err, meets) {
			var count = 0;
			var rowIndex = 2 //begin write at row 2. 1st row is for headers

			if(meets.length <= 0) {
				res.send({status: "success", records: count});
				return workbook.xlsx.writeFile("Report Builder Test.xlsx");
			}

			IterateOver(meets, function(meet, report) {

				if(meet != undefined) {
					SFQ.find({F_IDExecMeeting: meet._id}, function(error, sfqs) {
						count++;
						IterateOver(sfqs, function(sfq, check) {
							//perform operations
							var row = worksheet.getRow(rowIndex);

							row.getCell(1).value 		= meet.F_IDExecMeeting;

							for(i=0; i<=meet.Participants.length-1; i++){
								if(i<=0) {
									row.getCell(2).value		= meet.Participants[i].F_EmployeeNumber;
									row.getCell(3).value		= meet.Participants[i].F_EmployeeName;
									row.getCell(4).value		= meet.Participants[i].F_EmployeeBusinessTitle;
									row.getCell(5).value		= meet.Participants[i].F_EmployeeDept;
									row.getCell(6).value		= meet.Participants[i].F_EmployeeContactNo;
								}
								else {
									row.getCell(2).value		= row.getCell(2).value + "\r\n" + meet.Participants[i].F_EmployeeNumber;
									row.getCell(3).value		= row.getCell(3).value + "\r\n" + meet.Participants[i].F_EmployeeName;
									row.getCell(4).value		= row.getCell(4).value + "\r\n" + meet.Participants[i].F_EmployeeBusinessTitle;
									row.getCell(5).value		= row.getCell(5).value + "\r\n" + meet.Participants[i].F_EmployeeDept;
									row.getCell(6).value		= row.getCell(6).value + "\r\n" + meet.Participants[i].F_EmployeeContactNo;
								}
							}

							for(i=2; i<=6; i++) {
								row.getCell(i).alignment = {wrapText: true};
							}

							row.getCell(7).value		= meet.F_InterviewDate;
							row.getCell(8).value		= meet.F_ExecutiveName;
							row.getCell(9).value		= meet.F_DelegateName;


							if(sfq != undefined) {
								row.getCell(10).value		= sfq.IQuestion;
								row.getCell(11).value		= sfq.IAnswer;
								row.getCell(12).value		= sfq.IAnswerType;
								row.getCell(13).value		= sfq.isActionNeeded;
								row.getCell(14).value		= sfq.ActionOwner;
								row.getCell(15).value		= sfq.ActionDeadline;
								row.getCell(16).value		= sfq.ActionClosedDate;
								row.getCell(17).value		= sfq.ActionSolution;
							}

							row.commit();
							rowIndex++; //prepare to write on next row;
							check();
						}, function() {
							//if count = meet length, then this is last entry. Return completed excel file
							if(count >= meets.length){
								//this means 
								console.log("returning excel");
								res.send({status: "success", records: count});
								return workbook.xlsx.writeFile("Report Builder Test.xlsx");
							}
						})
					});
				}

				report();

			},  function() {
				console.log("queueing items...");
			})
		});

		function IterateOver(list, iterator, callback) {
		    // this is the function that will start all the jobs
		    // list is the collections of item we want to iterate over
		    // iterator is a function representing the job when want done on each item
		    // callback is the function we want to call when all iterations are over

		    var itemIndex = 0;  // here we'll keep track of how many reports we've got

		    // start first job only
		    iterator(list[0], report);

		    function report() {
		        // this function resembles the phone number in the analogy above
		        // given to each call of the iterator so it can report its completion
				itemIndex++;
		        // loop thru all items
		        if(itemIndex >= list.length){
		        	callback();
		        }
		        else {
		        	iterator(list[itemIndex], report);
		        }
		    }
		}
	});

//miscellaneouse routes
router.route("/Homepage")
	.get(function(req, res) {
		res.sendfile("index.html");
	});

router.route("/HowToUse")
	.get(function(req, res) {
		res.sendfile("index.html");
	})


//USE ROUTES DEFINED
app.use(router);
app.use(invalidUrl); //redirect all invalid URLs to 404

//FIRE UP THE SERVER
app.listen(port, function () {
	console.log("Initializing...");
	
	//initialize counter docs if not yet existing
	var exCount = new ConfigDoc({
		keyword	: "ExecutiveCounter",
		value 	: "0"
	});

	ConfigDoc.find({keyword: "ExecutiveCounter"}, function(err, count) {
		if(count.length <= 0) {
			exCount.save();
		}
	});

	var rtCount = new ConfigDoc({
		keyword		: "RoundtableCounter",
		value		: "0"
	});

	ConfigDoc.find({keyword: "RoundtableCounter"}, function(err, count) {
		if(count.length <= 0) {
			rtCount.save();
		}
	});
	
	console.log("Server started at " + port);
});

function invalidUrl(req, res) {
	res.sendfile("404.html");
}