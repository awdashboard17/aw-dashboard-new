
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

                  //table += '<td>' + (reslength);
                  
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


      $scope.updateNEWDD =function( release )
      {
            $http.get('/getBuildsOf/' + release).success( function ( response )
            {
                console.log("response : " + response);
                $scope.clients.awbuild = [];
                $scope.clients.awbuild = response;
                
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
        else if (release === 'AW33')
        {
          console.log("This is 33");
          $http.get('/filldropdownAW33').success( function ( response )
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
                    awbuild: response
                  },				  
                  { 
                    awrelease: "AW321", 
                    awbuild: [{ defaultLabel: ''}] 
                  }			  
            ];

            $scope.selectedRequest = {};
            $scope.selectedRequest.release = $scope.clients[2];   			
			
			});
		}
        else if (release === 'AW331')
        {
          console.log("This is 331");
          $http.get('/filldropdownAW331').success( function ( response )
          {
            $scope.clients = 
            [
                  { 
                    awrelease: "AW34", 
                    awbuild: [{ defaultLabel: ''}]
                  },
                  { 
                    awrelease: "AW331", 
                    awbuild: response 
                  },				  
                  { 
                    awrelease: "AW33", 
                    awbuild: [{ defaultLabel: ''}] 
                  },				  
                  { 
                    awrelease: "AW321", 
                    awbuild: [{ defaultLabel: ''}] 
                  }		
				  
            ];

            $scope.selectedRequest = {};
            $scope.selectedRequest.release = $scope.clients[1];   			
			
			});
		}		
        else if (release === 'AW34')
        {
          console.log("This is 34");
          $http.get('/filldropdownAW34').success( function ( response )
          {
            $scope.clients = 
            [        
                  { 
                    awrelease: "AW34", 
                    awbuild: response
                  },
                  { 
                    awrelease: "AW331", 
                    awbuild: response 
                  },				  
                  { 
                    awrelease: "AW33", 
                    awbuild: [{ defaultLabel: ''}] 
                  },				  
                  { 
                    awrelease: "AW321", 
                    awbuild: [{ defaultLabel: ''}] 
                  }	
            ];

            $scope.selectedRequest = {};
            $scope.selectedRequest.release = $scope.clients[0];         
        });
      }	  
	  
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
        $scope.clients = [];

        $http.get('/getPrefReleases').success( function ( response )
        {
            console.log("BringBackReleases successful");
            console.log("response : " + response);

            $scope.clients.awrelease = [];
            $scope.clients.awrelease = response;

            $scope.selectedRequest = {};
            $scope.selectedRequest.release = $scope.clients.awrelease[0];

            console.log($scope.selectedRequest.release);

            $http.get('/getBuildsOf/' + $scope.selectedRequest.release).success( function ( response )
            {
                console.log("response : " + response);
                $scope.clients.awbuild = [];
                $scope.clients.awbuild = response;

                $http.get('/getthemall/' + $scope.selectedRequest.release).success(function (response1)
                {
                    console.log("/getthemall successfull ============= ");
                    console.log(response1);
                    
                    console.log(response1.length);

                    for(iter=0; iter < response1.length; ++iter)
                    {
                        input = response1[iter]._id;
                        console.log("input : " + input);

                        //var chart;
                        //var myChart;
                        //var chartbuild;
                        
                        //myChart = "myChart" + iter;
                        //chartbuild = "chart" + iter + "build";
                        //chart = "chart" + iter;
                        
                        //console.log("chart : " + chart);

                        $http.get('/awteam1/'+ input).success(function (response)
                        {
                            console.log(response);
                                        //console.log("chart : " + chart);
                                        //console.log("myChart : " + myChart);
                                        //console.log("chartbuild : " + chartbuild);

                                        var passfail= response.split(',');
                                        console.log( passfail[0]);
                                        var chart = {};
                                        chart.type = "PieChart";
                                        chart.displayed = false;
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
                                        $scope.myChart1 = chart;
                                        $scope.chartbuild = input;
                                        //eval("$scope.myChart"+(iter+1)+" = "+"chart");
                                        //eval("$scope.chart"+(iter+1)+"build = response["+iter+"]._id ");

                                    });
                                    
                    }

                });

            });
           
        });




    };








      //function for loading charts
      $scope.BringBack = function ()
      {
        console.log("ng-init is called for landing page");

          $http.get('/filldropdownAW34').success( function ( response )
          {
            $scope.clients = 
            [
                  { 
                    awrelease: "AW34", 
                    awbuild: response
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
                    awbuild: [{ defaultLabel: ''}]
                  }
            ];

            console.log($scope.clients[0]);

            $scope.selectedRequest = {};
            $scope.selectedRequest.release = $scope.clients[0];
          });


          $http.get('/getthemall').success(function (response1)
          {
              $http.get('/awteam1/'+ response1[0]._id).success(function (response)
              {
                  console.log("Chart_1");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[0]._id,
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
                  $scope.myChart1 = chart1;
                  $scope.chart1build = response1[0]._id;
                  });

              $http.get('/awteam1/'+ response1[1]._id).success(function (response)
              {
                  console.log("Chart_2");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[1]._id,
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
                  $scope.myChart2 = chart1;
                  $scope.chart2build = response1[1]._id;
              });

              $http.get('/awteam1/'+ response1[2]._id).success(function (response)
              {
                  console.log("Chart_3");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[2]._id,
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
                  $scope.myChart3 = chart1;
                  $scope.chart3build = response1[2]._id;
              });
              

              $http.get('/awteam1/'+response1[3]._id).success( function (response)
              {
                  console.log("Chart_4");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[3]._id,
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
                  $scope.myChart4 = chart1;
                  $scope.chart4build = response1[3]._id;
              });

              $http.get('/awteam1/'+response1[4]._id).success(function (response)
              {
                  console.log("Chart_5");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[4]._id,
					titleTextStyle:{
									fontSize: '16',
									fontName: 'calibri',
									bold: true
								},						
                    legend: 'none',
                    is3D: true,
                    pieSliceText: 'value-and-percentage',					
                    slices: {
                              0: { color: 'green' },
                              1: { color: 'red' }
                            }
                  };
                  $scope.myChart5 = chart1;
                  $scope.chart5build = response1[4]._id;
              });

              $http.get('/awteam1/'+response1[5]._id).success(function (response)
              {
                  console.log("Chart_6");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[5]._id,
					titleTextStyle:{
									fontSize: '16',
									fontName: 'calibri',
									bold: true
								},					
                    legend: 'none',                    
                    is3D: true,
                    pieSliceText: 'value-and-percentage',					
                    slices: {
                              0: { color: 'green' },
                              1: { color: 'red' }
                            }
                  };
                  $scope.myChart6 = chart1;
                  $scope.chart6build = response1[5]._id;
              });


              $http.get('/awteam1/'+response1[6]._id).success(function (response)
              {
                  console.log("Chart_7");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[6]._id,
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
                  $scope.myChart7 = chart1;
                  $scope.chart7build = response1[6]._id;
                });
				
              $http.get('/awteam1/'+response1[7]._id).success(function (response)
              {
                  console.log("Chart_8");
                  var passfail= response.split(',');
                  console.log( passfail[0]);
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

                  chart1.options = 
                  {
                    title: response1[7]._id,
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
                  $scope.myChart8 = chart1;
                  $scope.chart8build = response1[7]._id;
                });
            });
      };
}]);
