// authentication.service.js

(function() {
	
	angular
		.module("myApp")
		.service("AuthenticationService", AuthenticationService);
	
	AuthenticationService.$inject = ["$http", "UserService", "$cookies", "$q", "$location", "$route", "ModalService"];
	function AuthenticationService($http, UserService, $cookies, $q, $location, $route, ModalService) {
		var service = {};
		
		service.url					= "";
		service.currentUser 		= {
			preferredfirstname 		: "",
			mail					: "",
			notesemail				: "",
			ibmserialnumber			: ""
		};
		
		

		service.GetCurrentUser 		= GetCurrentUser;
		service.isLoggedIn			= isLoggedIn;
		service.Login 				= Login;
		service.Logout				= Logout;
		service.redirectTo			= redirectTo;
		service.Register			= Register;
		service.saveUrl				= saveUrl;
		service.SetCurrentUser 		= SetCurrentUser;
		
		return service;
		
		function GetCurrentUser() {
			if (!angular.isUndefined($cookies.getObject("currentUser"))) {
				service.currentUser = $cookies.getObject("currentUser");
			}
			return service.currentUser;
		}
		
		function isLoggedIn() {
			//return true if service.currentUser is not empty
			if (GetCurrentUser().preferredfirstname != "") {
				return true;
			}
			else {
				return false;
			}
		}
		
		function Login(user) {
			return $http.post("/login", user).then(function(result) {
				//check if user is registered
				if(result.data.status === "success") {
					return $http.post("/fetchBp", result.data.users[0])
						.then(function(res) {
						var data = res.data.search;
						
						if(data.return.count > 0) {
								var array = data.entry[0].attribute;
								var user = {
									preferredfirstname 		: array[Index(array, "preferredfirstname")].value[0],
									mail					: array[Index(array, "mail")].value[0],
									notesemail				: array[Index(array, "notesemail")].value[0],
									ibmserialnumber			: array[Index(array, "ibmserialnumber")].value[0]
								}
								
								SetCurrentUser(user)
									.then(function() {
										//resume link request
										redirectTo();
									}, function() {
										alert("Login failed");
									});
							}
							else {
								Alert("Incorrect Serial number and/or password");
							}
					});
				}
				else {
					Alert("User doesn't exist. Please try again.");
					$route.reload();
				}
			});
		}

		function Logout() {
			$cookies.remove("currentUser");
			service.currentUser = {
				preferredfirstname 		: "",
				mail					: "",
				notesemail				: "",
				ibmserialnumber			: ""
			};
			service.url= "/";
			return ({status: "success"});
		}

		function redirectTo() {
			$location.path(service.url);
		}
		
		function Register(param) {
			return $http.post("/register", param).then(function(res) {
				//redirect to login once registered or auto login?
				if(res.data.status === "success") {
					Alert("Successfully registered! You can proceed to login");
					$route.reload();
				}
				else{
					Alert("Serial number is already registered. Please check with your administrator");
				}
			}, Error);
		}

		function saveUrl() {
			if($location.path().toLowerCase() != "/login") {
				service.url = $location.path();
			}
			else {
				service.url = "/";
			}
			//console.log("savedUrl: " + service.url);
		}
		
		function SetCurrentUser(user) {
			//update index.html to reflect current logged in user
			
			var defer = $q.defer();
			
			if(user) {
				$cookies.putObject("currentUser", user);
				service.currentUser = $cookies.getObject("currentUser"); // set response user to service.currentUser
				defer.resolve({status: "success"});
			}
			else {
				defer.resolve({status: "fail"});
			}
			
			return defer.promise;		
		}
		
		function Index(array, name) {
			var index = array.map(function(i) {
				return i.name;
			}).indexOf(name);
			
			return index;
		}
		
		function Success(res) {
			return res.data
		}
		
		function Error() {
			return ({status: "fail"});
		}

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
	};
})();