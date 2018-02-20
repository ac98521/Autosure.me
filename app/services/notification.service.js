// notif.service.js

(function() {
	
	angular
		.module("myApp")
		.service("NotificationService", NotificationService);
	
	NotificationService.$inject = ["$http", "ModalService"];
	function NotificationService($http, ModalService) {
		var service = {};
		
		service.Alert		= Alert;
		service.OpenNotif 	= OpenNotif;
		service.SendEmail 	= SendEmail;
		service.Submit		= Submit;
		
		
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

		function OpenNotif(id) {
			return $http.post("/notification/" +id)
				.then(function(res) {
					var notifData = {
						hide	:"true"
					};
					
					if(!angular.isUndefined(res.data.result) && res.data.result.length > 0) {
						var result = res.data.result[0];
						
						notifData = {
							hide				: "false",
							id					: result._id,
							F_ExecDisplay 		: result.F_ExecDisplay,
							IQuestion			: result.IQuestion,
							IAnswerType			: result.IAnswerType,
							IAnswer				: result.IAnswer,
							PrevActionSolution	: result.PrevActionSolution,
							ActionSolution		: result.ActionSolution,
							showRevise			: result.showRevise,
							F_Comments			: result.F_Comments
						}
					}
					return notifData;
				}, function() {
					return ({status: "fail"});
				});
		}
		
		function SendEmail(subject, sendTo, body, token) {
			var params = {
				subject		: subject,
				to			: sendTo,
				html		: '<p>An item requires your action. Click <a href="http://localhost:3000/notification/' + token + '"> here <a/> to view the item</p>'
			};
			
			return $http.post("/sendEmail",params)
				.then(function() {
					return ({status: "success"});
				}, function() {
					return ({status: "fail"});
				});
		}
		
		function Submit(param) {
			return $http.put("/notification/update/" + param.id, param)
					.then(function(res) {
						return ({status: "success"});
					}, function() {
						return ({status: "fail"});
					});
		}
		
		return service;
	};
})();