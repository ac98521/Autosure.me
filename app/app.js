(function() {

	angular
		.module("myApp", ["ngRoute", "ngCookies", "720kb.datepicker", "angularModalService", "angular.filter","checklist-model"])
		.controller("MainController", MainController)
		.config(config)
		//.run(run);
		//.run(['$route', angular.noop]);
		
		MainController.$inject = ["$scope","$rootScope","$route","$templateCache", "$location", "DocumentService", "AuthenticationService", "$http", "ModalService", "shareService"];
		function MainController($scope, $rootScope, $route, $templateCache, $location, DocumentService, AuthenticationService, $http, ModalService, shareService) {
			//Initialize global user variable
			//$scope.user = AuthenticationService.GetCurrentUser();
			
			var vm 		= this;
			
			vm.Quote	= Quote;
			vm.Logout	= Logout;
			vm.View		= View;
			vm.Reports  = Reports;
			
			var NewDate = new Date();
    		var YearToday = NewDate.getFullYear();
    		var YearFrom = parseInt(YearToday) - 10;
       		var YearTo = parseInt(YearToday) + 10;

			$scope.YearSelection = [];
			for (var i = YearFrom; i <= YearTo; i++)
	        {
	            $scope.YearSelection.push(i);
	        }

			$http.get("https://autosure.mybluemix.net/api/makes")  
	            .success(function(data){  
	                $scope.Maker = data;
	            });

	        $scope.updateModel =function(selectedMaker)
				{
					
					$http.get("https://autosure.mybluemix.net/api/models?filter={%22where%22:{%22car_make%22:%22"+selectedMaker.car_make+"%22}}")
	        //$http.get("https://autosure.mybluemix.net/api/models?filter={%22where%22:{%22car_make%22:%22Toyota%22}}")
			            .success(function(data){  
			                $scope.Model = data;  
			            });
				}


	       	function Quote(selectedModel) {
	       		
	       		shareService.setMaker($scope.selectedModel.car_make);
				shareService.setModel($scope.selectedModel.car_model);
				shareService.setYear($scope.selectedYear);
	       		if($location.path() != "/login"){
	       			$location.path("/login");
	       			console.log($location.path());
	       		}
	       		else{
	       			console.log(shareService.getModel());	
	       			$route.reload();
	       		}
				
				
			}

			function Logout() {
				AuthenticationService.Logout();
					$rootScope.user.preferredfirstname = "";
					$location.path("/login");
			}
			
			function Reports() {
				ModalService.showModal({
					templateUrl	: "../app/components/dialog/dialogReportTemplate.html",
					controller  : "DialogBoxController",
					preClose	:(modal) => {modal.element.modal("hide")},
					inputs	: {
						title		: "Report Builder",
						content		: null
					}
				}).then(function(modal) {
					modal.element.modal();
					modal.close.then(function(res) {
						//user canceled the prompt
						console.log(res);
						if(res != null) {
							$http.post("/ReportBuilder", res).then(function(results) {
								ModalService.showModal({
									templateUrl	: "../app/components/dialog/dialogGenericTemplate.html",
									controller 	: "DialogBoxController",
									preClise	: (modal) => {modal.element.modal("hide")},
									inputs		: {
										title		: "Report Builder Summary",
										content		: "Report generated. " + results.data.records + " record(s) exported."
									}
								}).then(function(modal) {
									modal.element.modal();
									modal.close.then(function(res) {});
								});
							});
						}
					});
				});
			}

			function View(param) {
				//query document collection based on param
				$location.path("/home/" + param);
			}
			
			return vm;
		};
		
		//When logged out, all GET requests should route to login page
		//When logged in, route properly
		
		config.$inject = ["$routeProvider", "$locationProvider"];
		function config($routeProvider, $locationProvider) {
			$routeProvider		
				.when("/home/:view", {
					templateUrl		: "app/components/home/home.html",
					controller		: "HomeController",
					controllerAs	: "vm",
					resolve			: {
						data : function(DocumentService, $route) {
							return DocumentService.View($route.current.params.view);
						}
					}
				})
				
				.when("/meet/:id", {
					templateUrl		: "app/components/meet/meet.html",
					controller		: "MeetController",
					controllerAs	: "vm",
					resolve			: {
						docData: function(DocumentService, SFQService, $route, $q) {
							var meet 	= DocumentService.OpenDoc($route.current.params.id);
							var result 	= SFQService.GetAllResults($route.current.params.id);
							
							return $q.all([meet, result]).then(function(results) {
								return {
									meet 	: results[0],
									result 	: results[1]
								}
							});
						}
					}
				})
				
				.when("/meet/new/:type", {
					templateUrl		: "app/components/meet/meet.html",
					controller		: "MeetController",
					controllerAs	: "vm",
					resolve			: {
						docData: function(DocumentService, SFQService, $route, $q) {
							var meet 	= DocumentService.New($route.current.params.type);
							var result 	= {"status":"fail","results":[]};
							
							return $q.all([meet, result]).then(function(results) {
								return {
									meet 	: results[0],
									result 	: results[1]
								}
							});
						}
					}
				})
				
				.when("/result/:id", {
					templateUrl		: "app/components/result/result.html",
					controller		: "ResultController",
					controllerAs	: "vm",
					resolve			: {
						sfqData: function(SFQService, $route) {
							var result 	= SFQService.OpenDoc($route.current.params.id);
							
							return result;
						}
					}
				})
				
				.when("/result/new/:id", {
					templateUrl		: "app/components/result/result.html",
					controller		: "ResultController",
					controllerAs	: "vm",
					resolve			: {
						sfqData: function(DocumentService, SFQService, $route) {
							return DocumentService.OpenDoc($route.current.params.id).
									then(function(res) {
										return SFQService.New($route.current.params.id,res.F_IDExecMeeting);
									});
								
						}
					}
				})
				
				.when("/notification/:id", {
					templateUrl		: "app/components/notification/notification.html",
					controller		: "NotificationController",
					controllerAs	: "vm",
					resolve			: {
						notifData : function(NotificationService, $route, $q) {
							var notif = NotificationService.OpenNotif($route.current.params.id);
							
							return $q.all([notif]).then(function(results) {
								return {
									notif 	: results[0]
								}
							});
						}
					}
					
				})

				.when("/configuration/:id", {
					templateUrl		: "app/components/configdoc/configdoc.html",
					controller		: "ConfigController",
					controllerAs	: "vm",
					resolve			: {
						configData : function(CountService, $route, $q) {
							console.log($route.current.params.id);
							var config = CountService.OpenConfig($route.current.params.id);

							return $q.all([config]).then(function(res) {
								return {
									config : res[0]
								}
							});
						}
					}
				})
				
				.when("/login", {
					templateUrl		: "app/components/login/login.html",
					controller		: "LoginController",
					controllerAs	: "vm",
					
					//noAuth			: true
				})

				.when("/Homepage", {
					templateUrl: "app/Homepage.html"
				})

				.when("/HowToUse", {
					templateUrl: "app/HowToUse.html"
				})
				
				.otherwise ("/");
			
			$locationProvider.html5Mode(true);
		}
		
		/*
		run.$inject = ["$location", "AuthenticationService", "$rootScope"];
		function run($location, AuthenticationService, $rootScope) {
			$rootScope.$on("$routeChangeStart", function(event, next) {
				$rootScope.user = AuthenticationService.GetCurrentUser();
				
				//Use roles to control page requests?
				//Regular user(i.e the ones who see the notification) should not be able to view other pages except the notification page

				//Logged out
					//1.User shouldn't be able to request any page except login page
					//2.All requests to other pages are redirected to login page
					//3.After logging in, redirect user to originally requested page
					
				//Logged in
					//1.User is able to view pages requested normally
					//2.Requesting login page redirects to 'home/All'
				
				//Logged in
				if(AuthenticationService.isLoggedIn()) {
					if($location.path().toLowerCase() === "/login") {
						//redirect to 'home/All'
						$location.path("/home/All");
					}
				}
				//Logged out
				else {
					if($location.path().toLowerCase() != "/login") {
						AuthenticationService.saveUrl();
					}
					$location.path("/");
				}
				
			});
		}*/
})();