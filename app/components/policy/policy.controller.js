(function() {
	angular
		.module("myApp")
		.controller("PolicyController", PolicyController)
		.run(run);

	run.$inject = ["$location", "shareService"];
		function run($location, shareService) {
				
				//To ensure that Get Quote button was used to get here
				if(shareService.setQuote() != "1") {
					if($location.path().toLowerCase() === "/policy") {
						$location.path("/");
					}
				}
				
		}
	
	PolicyController.$inject = ["AuthenticationService", "$location", "$http", "$scope", "shareService"];
	function PolicyController(AuthenticationService, $location, $http, $scope,shareService) {
		var vm 		= this;
	
		//isLoggedin();
		//vm.Login 		= Login;
		//vm.Register		= Register;

		vm.CPTLPrice	= 625.00;
		
		$http.get("https://autosure.mybluemix.net/api/policies/ctpl")  
	            .success(function(data){
	                $scope.coverageCPTL = data.coverage;
	            });

	    vm.dataValue;

		$http.get("https://autosure.mybluemix.net/api/models?filter={%22where%22:{%22car_model%22:%22"+ shareService.getModel() + "%22}}")  
	            .success(function(data1){  
	            	console.log(data1[0].value);
	            	$http.get("https://autosure.mybluemix.net/api/compute?data={%22year%22:"+shareService.getYear()+",%22value%22:"+data1[0].value+"}")  
			            .success(function(data2){  

			            	console.log("Comphrehensive Max coverage = "+data2.value);
			                
			                $http.get("https://autosure.mybluemix.net/api/cost?data={%22value%22:"+data2.value+"}")
			                	.success(function(data3){  
			                		vm.CompPrice = data3.cost;
			                		vm.FullPrice = data3.cost + 3000;

			                	});
			            });
	            });

	    $http.get("https://autosure.mybluemix.net/api/policies/comprehensive")  
	            .success(function(data){  
	                $scope.coverageComp = data.coverage;
	            });

	    $http.get("https://autosure.mybluemix.net/api/policies/full")  
	            .success(function(data){  
	                $scope.coverageFull = data.coverage;
	            });
		
		vm.addons	= [
			{name:"Uber Assitance", price:"200.00"},
			{name:"Roadside Assitance", price:"200.00"},
			{name:"Hotel Assitance", price:"200.00"}
		];

		vm.user 	= {
	        SelectedAddOns: [],
	        SelectedAddOnsComp: [],
	        SelectedAddOnsFull: []
	    };

		vm.updateCPTL = function updateCPTL (addon)
			{
				var idx = vm.user.SelectedAddOns.indexOf(addon);
	    		// is currently selected
		        if (idx > -1) {
		            vm.CPTLPrice += 200;
		        }

		        // is newly selected
		        else {
		            vm.CPTLPrice -= 200;
		        }

			}

		vm.SendQuote1 = function SendQuote1 ()
			{
				alert("Congratulations!\nYou have successfully applied for a CPTL insurance!");
			}

		vm.updateComp = function updateComp (addon)
			{
				var idx = vm.user.SelectedAddOnsComp.indexOf(addon);

	    		// is currently selected
		        if (idx > -1) {
		            vm.CompPrice += 200;
		        }

		        // is newly selected
		        else {
		            vm.CompPrice -= 200;
		        }

			}

		vm.SendQuote2 = function SendQuote1 ()
			{
				alert("Congratulations!\nYou have successfully applied for a Comprehensive insurance!");
			}

		vm.updateFull = function updateFull (addon)
			{
				var idx = vm.user.SelectedAddOnsFull.indexOf(addon);

	    		// is currently selected
		        if (idx > -1) {
		            vm.FullPrice += 200;
		        }

		        // is newly selected
		        else {
		            vm.FullPrice -= 200;
		        }

			}

		vm.SendQuote3 = function SendQuote1 ()
			{
				alert("Congratulations!\nYou have successfully applied for a Full Protection insurance!");
			}

	
	};
})();