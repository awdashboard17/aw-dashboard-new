
var myApp = angular.module('myApp', []);
myApp.controller('LoginCtrl', ['$scope', '$http', function ($scope, $http)
  {
        console.log("In LoginCtrl");

        $scope.show_menu = false;
        $scope.signIn = function () 
        {
            $http.get('/adminUsers/' + $scope.username).success(function (response)
            {
                console.log("database password : " + response.password);
                if(response.password === $scope.password)
                {   console.log("Sign in successful.");
                    //document.getElementById("myAdminMenu").style.display = "block";
                    //$scope.show_menu = true;
                    $scope.status = "Welcome " + $scope.username + " !!!";
                    sessionStorage.setItem('display', 'block');
                    console.log("session diplay value : " + sessionStorage.getItem('display'));
                }
                else
                {
                    $scope.status = "Ooops!!! Invalid Username or Password. Please try again."
                    //document.getElementById("myAdminMenu").style.display = "none";
                    //$scope.show_menu = false;
                    sessionStorage.setItem('display', 'none');
                }
            });

        };

}]);
