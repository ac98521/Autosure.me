(function() {
	angular
		.module("myApp")
		.controller("HomeController", HomeController);
		
		HomeController.$inject = ["$location", "$http", "DocumentService", "data", "$scope", "AuthenticationService"];
		function HomeController($location, $http, DocumentService, data, $scope, AuthenticationService) {
			var vm = this;

			vm.sorting = {
				property	: "F_IDExecMeeting",
				reverse		: false
			}

			//$scope.user.preferredfirstname = AuthenticationService.GetCurrentUser().preferredfirstname;
			//vm.data = data;
			//DisplayDate();
			//vm.DisplayDate	 	= DisplayDate;

			//Initialize
			Initialize();
			vm.New 				= New;
			vm.OpenConfig		= OpenConfig;
			vm.OpenDocument 	= OpenDocument;
			vm.sortBy			= sortBy;
			
			function New(type) {
				$location.path("/meet/new/" + type);
			}
			
			function OpenDocument(id) {
				$location.path("/meet/" + id);
			}

			function OpenConfig(param) {
				$location.path("/configuration/" + param);
			}

			function DisplayDate() {
				var options = { year: 'numeric', month: 'long', day: 'numeric' };

				for(i=0; i<= vm.data.meets.length-1; i++) {
					vm.data.meets[i].F_InterviewDate = new Date(vm.data.meets[i].F_InterviewDate).toLocaleDateString("en-US", options);
				}
			}

			function formatData(meets) {
				var arrData = [];
				for(i=0; i<=meets.length-1; i++) {

					var reformattedArray = meets[i].Participants.map(function(obj) {
						var rObj = {
							_id 				: meets[i]._id,
							SF_MeetingStatus 	: meets[i].SF_MeetingStatus,
							F_IDExecMeeting 	: meets[i].F_IDExecMeeting,
							F_ExecutiveName 	: meets[i].F_ExecutiveName,
							F_InterviewDate 	: meets[i].F_InterviewDate,
							F_EmployeeName 		: obj.F_EmployeeName
						};

						console.log(rObj);
						arrData.push(rObj);
						return rObj;
					});

				}

				return arrData;
			}

			function Initialize() {
				$scope.user.preferredfirstname = AuthenticationService.GetCurrentUser().preferredfirstname;
				vm.data 		= data;
				if(vm.data.query === "Roundtable_byParticipant") {
					vm.data.meets = formatData(vm.data.meets);
				}

				SetViewName(vm.data.query);

				console.log(vm.data);
			}

			function SetViewName(param) {
				switch (param) {
					case "Draft":
					vm.data.viewname = "My Records \\ Draft";
					break;

					case "Pending":
					vm.data.viewname = "My Records \\ Pending";
					break;

					case "Completed":
					vm.data.viewname = "My Records \\ Completed";
					break;

					case "Executive":
					vm.data.viewname = "All Records \\ Executive";
					break;

					case "Executive_byExecutive":
					vm.data.viewname = "All Records \\ Executive Results \\ by Executive";
					break;

					case "Executive_byInterviewee":
					vm.data.viewname = "All Records \\ Executive Results \\ by Interviewee";
					break;

					case "Executive_byStatus":
					vm.data.viewname = "All Records \\ Executive Results \\ by Status";
					break;

					case "Roundtable":
					vm.data.viewname = "All Records \\ Roundtable Results";
					break;

					case "Roundtable_byChair":
					vm.data.viewname = "All Records \\ Roundtable Results \\ by Chair";
					break;

					case "Roundtable_byParticipant":
					vm.data.viewname = "All Records \\ Roundtable Results \\ by Participant";
					break;

					case "Roundtable_byStatus":
					vm.data.viewname = "All Records \\ Roundtable Results \\ by Status";
					break;

					case "Roundtable":
					vm.data.viewname = "All Records \\ Roundtable Results";
					break;

					case "Configuration":
					vm.data.viewname = "Administration \\ Configuration";
					break;

					case "EventLogs":
					vm.data.viewname = "Administration \\ Event Logs";
					break;

					default:
					vm.data.viewname = "All Records"
				}
			}

			function sortBy(param) {
				if (param != null && vm.sorting.property === param) {
					vm.sorting.reverse = !vm.sorting.reverse;
				}
				else {
					vm.sorting.reverse = false;
				}

				vm.sorting.property = param;
			}
		}
})();