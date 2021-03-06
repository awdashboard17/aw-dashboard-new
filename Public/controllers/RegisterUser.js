
    var myApp = angular.module('myApp', []);

    myApp.controller('RegisterCtrl', ['$scope', '$http', '$window',  function ($scope, $http, $window)
    {
            console.log("In RegisterUser");
            $scope.formInfo = {};

            var refresh = function ()
            {
                $http.get('/adminUsers').success(function (response)
                {
                    console.log(" Received from database");
                    $scope.AdmUsers = response;
                    $scope.user = "";
                });
            };

            refresh();

            //function to save all form elements
            $scope.saveUser = function ()
            {
                console.log("in saveUser function : RegisterUserjs");
                console.log($scope.formInfo);

                $scope.firstNameRequired = '';
                $scope.lastNameRequired = '';
                $scope.userNameRequired = '';
                $scope.emailRequired = '';
                $scope.passwordRequired = '';

                var proceed = false;

                if (!$scope.formInfo.firstname) {
                    $scope.firstNameRequired = 'First Name Required';
                }
                if (!$scope.formInfo.lastname) {
                    $scope.lastNameRequired = 'Last Name Required';
                }
                if (!$scope.formInfo.username) {
                    $scope.userNameRequired = 'User Name Required';
                }
                if (!$scope.formInfo.email) {
                    $scope.emailRequired = 'Email Required';
                }
                if (!$scope.formInfo.password) {
                    $scope.passwordRequired = 'Password Required';
                }

                $http.get('/adminUsers/' + $scope.formInfo.username).success(function (response2)
                {
                    //$scope.formInfo = response;

                    console.log("resp value : " + response2);

                    if(response2 === 'null')
                    {
                        console.log("Making proceed true : ");
                        proceed = true;
                        console.log("proceed value : " + proceed);
                        if(proceed)
                        {
                            console.log("In Proceed");
                            var userData = $scope.formInfo.firstname+"^^^"+$scope.formInfo.lastname+"^^^"+$scope.formInfo.username+"^^^"+$scope.formInfo.email+"^^^"+$scope.formInfo.password;
                            console.log(userData);

                            $http.post('/adminUsers', $scope.formInfo).success(function (response)
                            {
                                console.log("Success Message: " + response);
                                refresh();
                                $scope.userStatus = 'User added successfully !!!';
                                $scope.formInfo = "";
                            });
                        }
                    }                
                    else //if(response2 != 'null') 
                    {
                        // user already exists. Dont proceed to add again.
                        console.log("keeping proceed false : ");
                        $scope.userStatus = 'User already exists !!!';
                        return;
                    }

                });
   
            };

        $scope.remove = function (username)
        {
            console.log(username);
            if(username != 'admin')
            {
                var deleteUser = $window.confirm('Are you sure to remove the user?');
                if(deleteUser)
                {
                    $http.delete('/adminUsers/' + username).success(function (response)
                    {
                        refresh();
                        $scope.formInfo = "";
                        $scope.userStatus = "User removed successfully !!!";
                        $scope.formInfo = "";
                        $scope.userStatus = "";
                        document.getElementById("userName").readOnly = false;
                    });
                }
            }
            else
            {
                $scope.userStatus = "You cannot remove \'admin\' user !!!";
            }
        };

        $scope.edit = function (username)
        {
        console.log('username to edit ' + username);
        document.getElementById("userName").readOnly = true;
        $http.get('/adminUsers/' + username).success(function (response)
        {
            $scope.formInfo = response;
        });
        };  

        $scope.update = function ()
        {
        console.log("in update function : RegisterUserjs");
        $http.put('/adminUsers/' + $scope.formInfo.username, $scope.formInfo).success(function (response)
        {
            refresh();
            $scope.formInfo = "";
            $scope.userStatus = "User updated successfully !!!";
            document.getElementById("userName").readOnly = true;
        })
        };

        $scope.clear = function ()
        {
            $scope.formInfo = "";
            $scope.userStatus = "";
            document.getElementById("userName").readOnly = false;
        }
    
        $scope.logout = function(){
            console.log("destroying session object for user admin");
            $window.sessionStorage.removeItem('user');
            var path = "/login.html";
            console.log(path);
            window.location.href = path;
        };
        
    }]);
