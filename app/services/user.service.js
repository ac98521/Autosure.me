//user.service.js
/*
	for CRUD operations on DB
*/
(function(){
	
	angular
		.module("myApp")
		.factory("UserService", UserService);
		
	UserService.$inject = ["$http"];
	function UserService($http){
		var service = {};
		
		service.Create 	= Create;
		service.Delete 	= Delete;
		service.Read 	= Read;
		service.Update 	= Update;
		
		return service;
		
		function Create(user){
			return $http.post("/register", user).then(Success, Error);
		}
		
		function Delete(user){
			return $http.post("/register/delete", user).then(Success, Error);
		}
		
		function Read(user) {
			return $http.get("/login/" + user._id).then(Success, Error);
		}
		
		function Update(user){
			return $http.post("/register/update", user).then(Success, Error);
		}
		
		function Success(){
			//return res.data;
			return ({status: "success"});
		}
		
		function Error(){
			return ({status: "fail"});
		}
	}
})();