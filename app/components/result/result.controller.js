(function() {
	angular
		.module("myApp")
		.controller("ResultController", ResultController);
		
		ResultController.$inject = ["$http", "$location", "$route", "sfqData", "SFQService", "NotificationService", "ModalService"];
		function ResultController($http, $location, $route, sfqData, SFQService, NotificationService, ModalService) {
			var vm = this;

			Initialize();

			//Adding a feature to use pop-up forms instead (SUCCESS!)
			//Add code to clear Action Owner & Action Deadline fields when isActionNeeded is set to 'No"


			//Clean-up code!
			//Check and retest the hide when logic of fields
			//Retest results to make sure all's well that ends well

			vm.Accept 			= Accept;
			vm.Revise 			= Revise;
			vm.Save 			= Save;
			vm.SaveAndClose 	= SaveAndClose;

			function Accept(param) {
				//set status to closed
				vm.result.F_ResultStatus = "Closed";
				//clear prev solution
				
				//save
				Save(param).then(function() {
					//alert("Successfully accepted result. You may close this window");
					SFQService.Alert("Successfully accepted result. You may close this window");
				});
			}
			
			function Revise(param) {
				SFQService.Revise(param);
			}

			function Save(param) {
				return SFQService.Save(param).then(function(res) {
					vm.result = res;
					vm.result.ActionClosedDate 	= DisplayDate(vm.result.ActionClosedDate);
					vm.result.ActionDeadline 	= DisplayDate(vm.result.ActionDeadline);
					return ({status: "success"});
				});
			}
			
			function SaveAndClose(param) {
				//do not allow a save when required field is empty
				console.log(param);
				if(isValid(param)) {
					Save(param).then(function () {
						$location.path("/meet/" + vm.result.F_IDExecMeeting);
					});
				}
			}

			function Initialize() {
				vm.result 					= sfqData;
				vm.result.ActionDeadline 	= DisplayDate(vm.result.ActionDeadline);
				vm.result.ActionClosedDate 	= DisplayDate(vm.result.ActionClosedDate);
			}

			function DisplayDate(param) {
				if(param != null) {
					var dt = new Date(param);
					var options = { year: 'numeric', month: 'long', day: 'numeric' };
					return dt.toLocaleDateString("en-US", options); 	
				}
				else {
					return null;
				}
			}

			// move validation code to Complete & Close section
			//validate results only when Complete & Close button is triggered
			function isValid(param) {
				if(param.IQuestion === "") {
					alert("Question field is required");
					return false;
				}
				else if(param.IAnswerType === "") {
					alert("Question type is required");
					return false;
				}
				else if(param.IAnswer === "") {
					alert("Answer is required");
					return false;
				}
				else if(param.isActionNeeded === "Yes" && param.ActionOwner === "") {
					alert("Action Owner CNUM is required");
					return false;
				}
				else if(param.isActionNeeded === "Yes" && param.ActionDeadline === null) {
					alert("Deadline is required");
					return false;
				}
				else {
					return true;
				}
			}
		}
})();
