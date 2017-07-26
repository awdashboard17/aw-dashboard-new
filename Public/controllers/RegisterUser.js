
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

            var proceed = true;

            if (!$scope.formInfo.firstname) {
                $scope.firstNameRequired = 'First Name Required';
                proceed = false;
            }
            if (!$scope.formInfo.lastname) {
                $scope.lastNameRequired = 'Last Name Required';
                proceed = false;
            }
            if (!$scope.formInfo.username) {
                $scope.userNameRequired = 'User Name Required';
                proceed = false;
            }
            if (!$scope.formInfo.email) {
                $scope.emailRequired = 'Email Required';
                proceed = false;
            }
            if (!$scope.formInfo.password) {
                $scope.passwordRequired = 'Password Required';
                proceed = false;
            }

            var createUser = true;
            $http.get('/checkIfUserExists' + $scope.formInfo.username).success(function (response)
            {
                if(response == true) 
                {
                    // user already exists. Dont proceed to add again.
                    createUser = false;
                    console.log("Making proceed false as user already exists");
                }
                $scope.userStatus = 'User already exists';
            });

            console.log("proceed value : " + proceed);
            console.log("createUser value : " + createUser);

            if(proceed && createUser)
            {
                console.log("In Proceed");
                var userData = $scope.formInfo.firstname+"^^^"+$scope.formInfo.lastname+"^^^"+$scope.formInfo.username+"^^^"+$scope.formInfo.email+"^^^"+$scope.formInfo.password;
                console.log(userData);

                $http.post('/adminUsers', $scope.formInfo).success(function (response)
                {
                    console.log("Success Message: " + response);
                    refresh();
                    $scope.userStatus = 'User added successfully';
                    $scope.formInfo = "";
                });
            }
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

}]);
