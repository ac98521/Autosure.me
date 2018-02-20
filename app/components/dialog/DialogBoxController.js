(function() {
	angular
		.module("myApp")
		.controller("DialogBoxController", DialogBoxController)

		DialogBoxController.$inject = ["$scope", "title", "content", "close"];
		function DialogBoxController ($scope, title, content, close) {

			//generic modal variables
			$scope.title					= title;
			$scope.content					= content;

			//initialize variables for revise dialog
			$scope.revise_deadline 		= null;
			$scope.revise_reason 		= null;

			//initialize variables for report builder. Deafult required fields to "All"
			$scope.report_meetingType		= "All";
			$scope.report_status			= "All";
			$scope.report_date 				= "All";

			$scope.report_author			= null;
			$scope.report_executive			= null;
			$scope.report_delegate			= null;
			$scope.report_interviewee		= null;
			$scope.report_department		= null;

			//modify this controller js so that all alerts would use this instead

			//This close function doesnt need jQuery or bootstrap because it uses data-dismiss attribute
			$scope.revise_close = function() {
				//on close, return whatever is on the form
				close({
					revise_deadline		: $scope.revise_deadline,
					revise_reason		: $scope.revise_reason
				}, 500); //allow 500ms for bootstrap animation to end
				
				//if($scope.revise_reason != null && $scope.revise_deadline != null) {
				//}
			};

			$scope.report_close = function() {
				//on close, return all fields on the form;
				close({
					report_meetingType		: $scope.report_meetingType,
					report_status			: $scope.report_status,
					report_date 			: $scope.report_date,
					report_author			: $scope.report_author,
					report_executive		: $scope.report_executive,
					report_delegate			: $scope.report_delegate,
					report_interviewee		: $scope.report_interviewee,
					report_department		: $scope.report_department
				}, 500);
			};

			$scope.confirm_yes = function() {
				close("yes", 500);
			};

			$scope.cancel = function () {

				//for manually hiding the modal using $element
				//$element.modal("hide");

				//close modal then return scope variables
				close(null, 500); //allow 500ms for bootstrap animation to end
			};
		}
})();