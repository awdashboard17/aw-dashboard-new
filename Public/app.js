
    var myApp = angular.module('myApp', ['ui.router','googlechart','xeditable']);

    myApp.run( function( editableOptions ) 
    {
    editableOptions.theme = 'bs3'; // bs3, default
    });

    myApp.config( function( $stateProvider, $urlRouterProvider ) 
    {    
        $stateProvider
            .state('second', 
            {
                url: '/Buildwise/:id',
                templateUrl: 'Buildwise.html'
            })
    });

    myApp.controller('myController', ['$scope', '$http','$location','$state', function ($scope, $http, $location, $state)
    {
        var arrayy = ['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen'];

        $scope.clients = [];
        $scope.clients.awproducts = [];
        $scope.clients.awrelease = [];

        $scope.GotoBackPage = function()
        {
            window.history.back();
        }

        $scope.GotoReports = function()
        {
            console.log("In GotoReports button");
            var path = "/reports.html";
            console.log(path);
            window.location.href = path;
        };

        $scope.GotoTrends = function()
        {
            console.log("In GotoTrends button");
            var path = "/trends.html";
            console.log(path);
            window.location.href = path;
        };

        $scope.GotoUpload = function()
        {
            console.log("In Upload button");
            var path = "/html/fileupload.html";
            console.log(path);
            window.location.href = path;
        };      

        $scope.refreshgraph = function( release, build )
        {
            console.log("In the refreshgraph.");

            console.log("AWRELEASE: "+ release);
            console.log("AWBUILD: "+build);
            var rnb = release+"_"+build;
            $http.get('/TeamResultsForAllBuilds/'+rnb).success(function ( response)
            {
                console.log("Response for refreshgraph"+ response);
                for(index in response)
                {
                console.log(response[index]);
                }
                var reslength = response.length;
                //window.alert("Response size: "+reslength);

                for(var x = reslength; x < 8; ++x)
                {
                    var dyn = x;
                    console.log("graph id: "+ (dyn+1));
                    eval("$scope.gg"+(arrayy[dyn])+" = "+"true;");
                }

                console.log("Value of x:"+ x);
                for(var y=0; y< reslength; ++y)
                {
                    var guile = y;
                    console.log("graph id: "+ (guile+1));
                    eval("$scope.gg"+(arrayy[guile])+" = "+"false;");
                }
                console.log("Value of y:"+ y);
                
                for( var i=0; i < reslength; ++i)
                {

                    console.log(i);
                    console.log(response[i]._id);
                    console.log(response[i].Details[0].config[0].totalpass);
                    console.log(response[i].Details[0].config[0].totalfail);
                    var chart1 = {};
                    chart1.type = "PieChart";
                    chart1.displayed = false;
                    chart1.data = {
                                    "cols": [
                                                {
                                                    label: "Status",
                                                    type: "string"
                                                }, 
                                                {
                                                    label: "Count",
                                                    type: "number"
                                                }
                                            ],
                                    "rows": [
                                                {
                                                    c: [
                                                        {
                                                            v: "Passed"
                                                        }, 
                                                        {
                                                            v: response[i].Details[0].config[0].totalpass
                                                        }
                                                        ]
                                                }, 
                                                {
                                                    c: [
                                                        {
                                                            v: "Failed"
                                                        }, 
                                                        {
                                                            v: response[i].Details[0].config[0].totalfail
                                                        }
                                                        ]
                                                }
                                            ]
                                };

                    chart1.options = 
                    {
                        title: response[i]._id,
                        titleTextStyle:{
                                        fontSize: '16',
                                        fontName: 'calibri',
                                        bold: true
                                    },					
                        legend: 'none',
                        is3D: true,
                        pieSliceText: 'value-and-percentage',
                        pieStartAngle: 100,
                        slices: {
                                0: { color: 'green' },
                                1: { color: 'red' }
                                }
                    };
                    
                    console.log("$scope.chart"+(i+1)+"build = response["+i+"]._id ");
                    eval("$scope.myChart"+(i+1)+" = "+"chart1");
                    eval("$scope.chart"+(i+1)+"build = response["+i+"]._id ");

                }
                
            });
        };

        $scope.getProductVersionsOf = function( product )
            {
                $http.get('/getPreferenceOfProduct/' + product).success( function ( response )
                {
                    console.log("getPrefReleasesOfProduct successful");
                    console.log("response : " + response[0].preference);
                    $scope.clients.awrelease = response[0].preference;
                    $scope.selectedRequest.release = $scope.clients.awrelease[0];
                });
            };

        $scope.getNewBuilds =function( release )
        {
                $http.get('/getBuildsOf/' + release).success( function ( response )
                {
                    console.log("response : " + response);
                    $scope.clients.awbuild = [];
                    $scope.clients.awbuild = response;
                    $scope.selectedRequest.build =  $scope.clients.awbuild[0];
                });
        };

        $scope.hideSeries = function( build )
        {
            console.log("Clicked chart 1 with build : "+build);
            var path = "/Teamwise.html#"+build;
            window.location.href = path;
        };

        $scope.BringBackReleases = function ()
        {
            console.log("In BringBackReleases");

            $http.get('/getAllProducts').success(function (response)
            {
                console.log(" Received from database : getAllProducts : ");
                console.log("response : " + response);

                $scope.clients.awproducts = response;
                $scope.selectedRequest = {};
                console.log("$scope.clients.awproducts[0] : " + $scope.clients.awproducts[0]);
                $scope.selectedRequest.awproduct = $scope.clients.awproducts[0];

                $http.get('/getPreferenceOfProduct/' + $scope.selectedRequest.awproduct).success( function ( response )
                {
                    console.log("BringBackReleases successful");
                    console.log("response : " + response[0].preference);

                    $scope.clients.awrelease = [];
                    $scope.clients.awrelease = response[0].preference;
                    $scope.selectedRequest.release = $scope.clients.awrelease[0];
                    console.log($scope.selectedRequest.release);

                    $http.get('/getBuildsOf/' + $scope.selectedRequest.release).success( function ( response )
                    {
                        console.log("response : " + response);
                        $scope.clients.awbuild = [];
                        $scope.clients.awbuild = response;
                        $scope.selectedRequest.build = $scope.clients.awbuild[0];

                        $http.get('/getthemall/' + $scope.selectedRequest.release).success(function (response1)
                        {
                            console.log("/getthemall successfull ============= ");
                            console.log("response 1 : " + response1);
                            
                            console.log("response length : " + response1.length);
                            var chart= {};
                            chart.type = "PieChart";
                            chart.displayed = false;

                            for(iter=0; iter < response1.length; ++iter)
                            {
                                input = response1[iter]._id;
                                console.log("input : " + input);

                                $http.get('/awteam1/'+ input).success(function (response2)
                                {
                                    console.log("response 2 : " + response2);

                                                var passfail= response2.split(',');
                                                console.log( passfail[0]);

                                                chart.data = {
                                                                "cols": [
                                                                            {
                                                                                label: "Status",
                                                                                type: "string"
                                                                            }, 
                                                                            {
                                                                                label: "Count",
                                                                                type: "number"
                                                                            }
                                                                        ],
                                                                "rows": [
                                                                            {
                                                                                c: [
                                                                                    {
                                                                                        v: "Passed"
                                                                                    }, 
                                                                                    {
                                                                                        v: parseInt(passfail[0])
                                                                                    }
                                                                                    ]
                                                                            }, 
                                                                            {
                                                                                c: [
                                                                                    {
                                                                                        v: "Failed"
                                                                                    }, 
                                                                                    {
                                                                                        v: parseInt(passfail[1])
                                                                                    }
                                                                                    ]
                                                                            }
                                                                        ]
                                                            };

                                                chart.options = 
                                                {
                                                    title: input,
                                                    titleTextStyle:{
                                                                    fontSize: '16',
                                                                    fontName: 'calibri',
                                                                    bold: true
                                                                },						
                                                    legend: 'none',
                                                    is3D: true,
                                                    pieSliceText: 'value-and-percentage',
                                                    pieStartAngle: 100,
                                                    slices: {
                                                            0: { color: 'green' },
                                                            1: { color: 'red' }
                                                            }
                                                };

                                });

                            console.log("$scope.myChart"+(iter+1)+" = "+"chart");
                            console.log("$scope.chart"+(iter+1)+"build = response1["+iter+"]._id ");
                            eval("$scope.myChart"+(iter+1)+" = "+"chart");
                            eval("$scope.chart"+(iter+1)+"build = response1["+iter+"]._id ");
                                            
                            }

                        });

                    });
                
                });

            });

        };

    }]);
