// document.service.js

(function() {
	
	angular
		.module("myApp")
		.service("DocumentService", DocumentService);
	
	DocumentService.$inject = ["$http", "$q", "CountService", "SFQService", "NotificationService", "ModalService"];
	function DocumentService($http, $q, CountService, SFQService, NotificationService, ModalService) {
		var service = {};
		
		service.Alert 			= Alert;
		service.Complete		= Complete;
		service.Confirm			= Confirm;
		service.New				= New;
		service.OpenDoc			= OpenDoc;
		service.Save			= Save;
		service.SignOff			= SignOff;
		service.View			= View;
		
		return service;

		function Alert(value) {
			return ModalService.showModal({
				templateUrl	: "../app/components/dialog/dialogGenericTemplate.html",
				controller  : "DialogBoxController",
				preClose	: (modal) => {modal.element.modal("hide")},
				inputs	: {
					title		: "Action Summary",
					content		: value
				}
			}).then(function(modal) {
				modal.element.modal();
				return modal.close.then(function(res) {
					return res;
				});
			});
		}

		function Confirm(value) {
			return ModalService.showModal({
				templateUrl	: "../app/components/dialog/dialogConfirmTemplate.html",
				controller  : "DialogBoxController",
				preClose	: (modal) => {modal.element.modal("hide")},
				inputs	: {
					title		: "Confirm Action",
					content		: value
				}
			}).then(function(modal) {
				modal.element.modal();
				return modal.close.then(function(res) {
					return res;
				});
			});
		}

		function Complete(param) {

			return $http.post("/meet/results/all", param).then(function(res) {
				//send email if result isActionNeeded
				if (res.data.counter > 0) {
					param.SF_MeetingStatus = "Pending";
					//send email to all action owners
					var count = 0;
					for(i=0; i < res.data.results.length; i++) {
						var token = res.data.results[i];
						if(token.isActionNeeded === "Yes") {
							count = count++;
							token.showRevise = "N";

							//send to action owner
							$http.post("/fetchBpNotif", token).then(function(result) {
								var data = result.data.search;
								if(data.return.count > 0) {
									var array = data.entry[0].attribute;
									var user = {
										preferredfirstname 	: array[Index(array, "preferredfirstname")].value[0],
										mail				: array[Index(array, "mail")].value[0]
									}

									//make subject field more dynamic
									//construct proper mail body
									//sender email should technically be application server
									NotificationService.SendEmail(token.F_ExecDisplay + " requires your action", user.preferredfirstname + " <" + user.mail + ">", "", token._id);
									SFQService.Save(token);
								}
							});
						}
					}

					Alert("Action completed successfuly!");

					/*if(count > 0) {
						alert("Successfully sent notification(s)");
					}
					else {
						alert("Completed")
					}*/
				}
				else {
					param.SF_MeetingStatus = "Completed";
				}
				return Save(param);
				
			}, Error("fail"));
		}
		
		function New(type) {
			//Initialize meet document model			
			var meet = {};
			
			meet.Participants 			= [{
											F_EmployeeNumber: "",
											F_EmployeeName: "",
											F_EmployeeBusinessTitle: "",
											F_EmployeeDept: "",
											F_EmployeeContactNo: ""
										  }];
			
			meet.F_ExecutiveName 		= ""
			meet.SF_SessionType 		= type;
			meet.SF_MeetingStatus		= "Draft";
			meet.F_InterviewDate 		= new Date().toLocaleDateString("en-US"); //defaults to Today
			
			CountService.SetMeetNumber(type).then(function(res) {
				meet.F_IDExecMeeting = res;
			});
			
			return meet;
		}
		
		function OpenDoc(id) {
			return $http.post("/meet/"+ id)
				.then(function(res) 
				{
					return res.data.meets[0];
				}, function() {
					return ({status: "fail"});
				});
		}
		
		function Save(param) {
			var meeting = {};
			
			if(param.hasOwnProperty("_id")) {
					//overwrite
					return $http.put("/meet/"+ param._id, param)
						.then(function(res) {
							meeting = res.data;
							return meeting;
						}, Error("fail"));
				}
				else {
					//new
					return $http.post("/meet/new/" + param.SF_SessionType, param)
						.then(function(res) {
							meeting = res.data.meet;
							return meeting;
						}, Error("fail"));
				}
		}		
		
		function SignOff(param) {
			param.SF_MeetingStatus = "Completed";
			
			return $http.post("/meet/results/all", param).then(function(res) {
				return Save(param);
			}, Error("fail"));
		}
		
		function View(query) {
			//query for meet documents
			return $http.post("/home/" + query)
					.then(function(res) {
						return res.data;
					  },
					  function() {
						 alert("Unknown error.Could not fetch list");
					  });
		}
		
		function Index(array, name) {
			var index = array.map(function(i) {
				return i.name;
			}).indexOf(name);
			
			return index;
		}

		function Error(err) {
			return ({status: err});
		}
	};
})();