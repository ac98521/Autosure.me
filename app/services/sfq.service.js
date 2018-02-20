// sfq.service.js

(function() {
	
	angular
		.module("myApp")
		.service("SFQService", SFQService);
	
	SFQService.$inject = ["$http", "ModalService", "NotificationService", "ModalService"];
	function SFQService($http, ModalService, NotificationService, ModalService) {
		var service = {};
		
		service.Alert 			= Alert;
		service.GetAllResults	= GetAllResults;
		service.New				= New;
		service.OpenDoc			= OpenDoc;
		service.Revise			= Revise;
		service.Save			= Save;
		
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
				return modal.close.then(function() {
					return ({status: "success"});
				});
			});
		}

		function GetAllResults(id) {
			return $http.post("/meet/all/" + id)
				.then(function(res) {
					return res.data;
				},function() {
					//alert("Unknown error. Could not fetch list");
					Alert("Unknown error. Could not fetch list");
					return ({status: "fail"});
				});
		}
		
		function New(key, id) {
			//Initialize result document model		
			var result = {};
					  
			result.F_IDExecMeeting 	= key;
			result.F_ExecDisplay	= id;
			result.F_ResultStatus 	= "Draft";
			result.IQuestion		= "";
			result.IQuestionType	= "";
			result.IAnswer			= "";
			result.isActionNeeded 	= "No";
			result.ActionOwner		= "";
			result.ActionDeadline	= null; //changed date from "" to null to handle invalid dates
			result.ActionClosedDate = null; //changed date from "" to null to handle invalid dates
			result.ActionSolution	= "";

			//inlcude comments(reason field) & new deadline in initialization?
			result.F_Comments		= "";
			
			return result;
		}
		
		function OpenDoc(id) {
			return $http.post("/result/"+ id)
				.then(function(res) 
				{
					return res.data.results[0];
				}, function() {
					return ({status: "fail"});
				});
		}
		
		function Revise(param) {
			ModalService.showModal({
					templateUrl	: "../app/components/dialog/dialogReviseTemplate.html",
					controller  : "DialogBoxController",
					preClose	:(modal) => {modal.element.modal("hide")},
					inputs	: {
						title		: "Action Summary",
						content		: null
					}
				}).then(function(modal) {
					modal.element.modal();
					modal.close.then(function(res) {
						if(res.hasOwnProperty("revise_reason") && res.hasOwnProperty("revise_deadline") && res.revise_reason != null && res.revise_deadline != null) {
							//Prompt is filled-up. Proceed with revision

							param.PrevActionSolution 		= param.ActionSolution; //save prev solution for display purposes in notification
							param.ActionSolution 			= "";
							param.ActionClosedDate 			= null;
							param.showRevise 				= "N";
							param.ActionDeadline 			= res.revise_deadline;
							param.F_Comments 				= res.revise_reason;
							//AddAudit
							
							Save(param);
							//alert("Successfully sent revise notice. You may close this window");
							Alert("Successfully sent revise notice. You may close this window");
							//send notification to Action Owner
							$http.post("/fetchBpNotif", param).then(function(result) {
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
									NotificationService.SendEmail(param.F_ExecDisplay + " requires your action", user.preferredfirstname + " <" + user.mail + ">", "", param._id);
									Save(param);
								}
							});
						}
					});
				});
		}

		function Save(param) {
			if(param.hasOwnProperty("_id")) {
				//overwrite
				return $http.put("/result/"+ param._id, param).then(function(res) {
					var result = res.data;
					return result;					
				}, Error("fail"));
			}
			else {
				//new doc
				console.log(param);
				return $http.post("/result/new/" + param.F_IDExecMeeting, param).then(function(res) {
					var result = res.data;
					return result;
				}, Error("fail"));
				
			}
		}

		function Index(array, name) {
			var index = array.map(function(i) {
				return i.name;
			}).indexOf(name);
			
			return index;
		}
	};
})();