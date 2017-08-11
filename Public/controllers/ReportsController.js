
    var myApp = angular.module('myApp', []);

    myApp.controller('ReportsCtrl', ['$scope', '$http', function ($scope, $http)
    {
        //function to get all collections
        $scope.BringBackBaseLines = function ()
        {
            console.log("In BringBackBaseLines");

            $http.get('/getPrefReleases').success( function ( response )
            {
                console.log("BringBackBaseLines successful");
                console.log(response);
                $scope.awreleases = [];
                $scope.awreleases = response;

                $scope.selectedRequest = {};
                $scope.selectedRequest.release = $scope.awreleases[0];
            });

        };

            $scope.updateDD =function( release )
            {
                if( release === 'AW321')
                {
                console.log("This is 321");
                $http.get('/filldropdownAW321').success( function ( response )
                {
                    $scope.clients = 
                    [
                        { 
                            awrelease: "AW34", 
                            awbuild: [{ defaultLabel: ''}]
                        },
                        { 
                            awrelease: "AW331", 
                            awbuild: [{ defaultLabel: ''}] 
                        },				  
                        { 
                            awrelease: "AW33", 
                            awbuild: [{ defaultLabel: ''}] 
                        },				  
                        { 
                            awrelease: "AW321", 
                            awbuild: response 
                        }			  
                    ];

                    $scope.selectedRequest = {};
                    $scope.selectedRequest.release = $scope.clients[3];

                });
                }
            }
    }]);
