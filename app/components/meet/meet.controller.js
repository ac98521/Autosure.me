(function() {
	angular
		.module("myApp")
		.controller("MeetController", MeetController);
		
		MeetController.$inject = ["$http", "$location", "$timeout","DocumentService", "docData"];
		function MeetController($http, $location, $timeout, DocumentService, docData) {
			var vm = this;

			//initialize
			Initialize();

			vm.AddParticipant	= AddParticipant;
			vm.Remove			= Remove;


			vm.AddResult 	= AddResult;
			vm.OpenDocument = OpenDocument;
			vm.Process 		= Process;
			vm.Save			= Save;


			function AddParticipant(param) {
				console.log("adding");
				var participant = {
					F_EmployeeNumber: "",
					F_EmployeeName: "",
					F_EmployeeBusinessTitle: "",
					F_EmployeeDept: "",
					F_EmployeeContactNo: ""
				}
				param.Participants.push(participant);
				console.log(param);
			}

			function Remove(param, index) {
				param.Participants.splice(index, 1);
			}



			function AddResult(param) {
				//Prompt to save first
				DocumentService.Confirm("The document needs to be saved first. Proceed?")
					.then(function(confirm) {
						if(confirm === "yes") {
							DocumentService.Save(param).then(function(res) {
								$location.path("/result/new/"+ res._id);
							});
						}
				});

				/*if(confirm("The document needs to be saved first. Proceed?")){
					DocumentService.Save(param).then(function(res) {
						$location.path("/result/new/"+ res._id);
					});
				}*/
			}
			
			function OpenDocument(id) {
				$location.path("/result/" + id);
			}
			
			function Process(param) {
				//call field validation first
				if (isValid(param)) {
					//if meet status is pending then Sign Off
					if (param.SF_MeetingStatus === "Pending") {
						SignOff(param);
					}
					
					//else, set appropriate status
					else {
						
						Complete(param);
					}
				}
			}
			
			function Save(param) {
				DocumentService.Save(param).then(function(res) {
					vm.meet = res;
					vm.meet.F_InterviewDate = DisplayDate(vm.meet.F_InterviewDate);
				});
			}
			
			
			function Complete(param) {
				//validation required
				
				//check if any results are still pending
					//check if results have action pending & action solution is empty
					// set status of these docs to pending acceptance
					// else set to closed
				//set status of exec form to "Pending" if yes
				//set to "Completed" if no
				

				DocumentService.Confirm("Once submitted, you will not be able to edit this anymore. Proceed?")
					.then(function(confirm) {
						if(confirm === "yes") {
							DocumentService.Complete(param).then(function(res) {
								//alert("Successfully sent notifications!");
								$location.path("/home/All");
							});
						}
				});

				/*if(confirm("Once submitted, you will not be able to edit this anymore. Proceed?")) {
					DocumentService.Complete(param).then(function(res) {
							//alert("Successfully sent notifications!");
							$location.path("/home/All");
					});
				}*/
			}
			
			function SignOff(param) {
				//set meet status to closed then save
				//set all action required results to closed

				DocumentService.Confirm("This will close all results regardless of status. Proceed?")
					.then(function(confirm) {
						if(confirm === "yes") {
							param.SF_MeetingStatus = "Completed";
							DocumentService.SignOff(param).then(function() {
								$location.path("home/All");
							});
						}
				});

				/*if(confirm("This will close all results regardless of status. Proceed?")) {
					
					param.SF_MeetingStatus = "Completed";
					DocumentService.SignOff(param).then(function() {
						$location.path("home/All");
					});
				}*/
			}
			
			function DisplayDate(param) {
				//Manipulates date so it displays in MMM dd, yyyy format
				if(param != null){
					var dt = new Date(param);
					var options = { year: 'numeric', month: 'long', day: 'numeric' };
					return dt.toLocaleDateString("en-US", options);
				}
				else {
					return null;
				}
			}

			function Error(err) {
				return ({status: err});
			}

			function Initialize() {
				vm.meet 	= docData.meet;
				vm.result 	= docData.result;
				vm.meet.F_InterviewDate = DisplayDate(vm.meet.F_InterviewDate);
			}

			function isValid(param) {
				//return true if all required fields passed the validation

				//loop for all participants?
				if(param.Participants[0].F_EmployeeNumber === "") {
					alert("Employee Number is required");
					return false;
				}
				else if(param.Participants[0].F_EmployeeName === "") {
					alert("Employee Name is required");
					return false;
				}
				else if(param.Participants[0].F_EmployeeBusinessTitle === "") {
					alert("Business Title is required");
					return false;
				}
				else if(param.Participants[0].F_EmployeeDept === "") {
					alert("Department Code is required");
					return false;
				}
				else if(param.Participants[0].F_EmployeeContactNo === "") {
					alert("Contact Number is required");
					return false;
				}
				else if(param.F_ExecutiveName === "") {
					alert("Executive Name is required");
					return false;
				}
				else {
					return true;
				}
			}


			// Code for auto-filling fields. Use in conjuction with a button?
			/*
			vm.fetchBp		= fetchBp;

			function fetchBp(param) {
				console.log(param);
				$http.post("/fetchBp", param).then(function(res) {
					var data = res.data.search;
					var array = data.entry[0].attribute;
					vm.meet.Participants[0].F_EmployeeName = array[Index(array, "notesemail")].value[0];
				});
			}

			function Index(array, name) {
				var index = array.map(function(i) {
					return i.name;
				}).indexOf(name);
				
				return index;
			}*/
		}
})();
