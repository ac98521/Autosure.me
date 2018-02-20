(function() {
	angular
		.module("myApp")
		.controller("NotificationController", NotificationController);
		
		NotificationController.$inject = ["$http","$route","NotificationService","notifData"];
		function NotificationController($http, $route, NotificationService, notifData) {
			var vm = this;
			vm.result = notifData.notif;
			
			console.log(vm.result);
			
			vm.Submit = Submit;
			
			function Submit(param) {
				//update SFQ document
				//make sure action solution field is not empty

				//if(param.showRevise === "Y") {
					if(param.ActionSolution != "") {
						NotificationService.Submit(param)
							.then(function() {
								//alert("Successfully submitted! You may close this window");
								//reload page to prevent resending?
								NotificationService.Alert("Successfully submitted! You may close this window");
								$route.reload();
						})
					}
					else {
						NotificationService.Alert("An action solution is required to close this item.");
						//alert("An action solution is required to close this item.");
					}
				//}
			}
		}
})();
