    var myApp = angular.module('myApp', []);
    myApp.controller('LoginCtrl', ['$scope', '$http', '$location', '$window', function ($scope, $http, $location, $window)
    {
        console.log("In LoginCtrl");

        $scope.show_menu = false;
        $scope.signIn = function () 
        {
           $scope.usernameRequired = '';
            $scope.passwordRequired = '';
            var proceed = true;

            if (!$scope.username) {
                $scope.usernameRequired = 'User Name Required';
                proceed = false;

            }
            if (!$scope.password) {
                $scope.passwordRequired = 'Password Required';
                proceed = false;
            }

            if(proceed)
            {
                $http.get('/adminUsers/' + $scope.username).success(function (response)
                {
                    console.log("database password : " + response.password);
                    if(response.password === $scope.password)
                    {   
                        console.log("Sign in successful.");
                        $window.sessionStorage.setItem('user',$scope.username);
                        var path = "/configure.html";
                        console.log(path);
                        window.location.href = path;
                    }
                    else
                    {
                        $scope.status = "Invalid Username or Password !!!"
                    }
                });
            }
        };

        $scope.LoadLoginPage = function () 
        {
            var username = sessionStorage.getItem('user');
            if (username != null)
            {
                console.log("User already Signed in.");
                $scope.status = "Welcome " + username + " !!!";
                var path = "/configure.html";
                console.log(path);
                window.location.href = path;
            }
        };

    }]);
