(function() {
	angular
		.module("myApp")
		.controller("ConfigController", ConfigController);
		
		ConfigController.$inject = ["$http","$route","configData"];
		function ConfigController($http, $route, configData) {
			var vm = this;
			
			Initialize();

			vm.SaveandClose = SaveandClose;

			function SaveandClose(param) {
				if(param.hasOwnProperty("_id")) {
					//overwrite
					return $http.put("/configuration/"+ param._id, param).then(function(res) {
						var configdoc = res.data.configdoc;

						//function to detect multiple values(based on new line)
						if (((configdoc.value.match(/\n/g) || []).length) > 0) {
							var multi = configdoc.value.split('\n');
							console.log(multi);
						}
						return configdoc;					
					}, Error("fail"));
				}
				else {
					//new doc
					return $http.post("/configuration/new", param).then(function(res) {
						var configdoc = res.data;
						return configdoc;
					}, Error("fail"));
					
				}
			}

			function Initialize() {
				vm.config = configData.config;
			}
		}
})();
