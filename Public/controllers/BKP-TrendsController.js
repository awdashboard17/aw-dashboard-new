  var myApp = angular.module('myApp', ['ui.router','googlechart','xeditable']);
  myApp.controller('TrendsCtrl',['$scope', '$http','$location', function( $scope, $http, $location )
  {
      console.log("In trends control");
      $scope.GotoBackPage = function()
      {
        window.history.back();
      }

      $scope.clients = [];
/*
      [
          { 
                choice: "AW33"
          },
          { 
                choice: "AW32"
          }
      ];

      $scope.selectedRequest = {};
      $scope.selectedRequest.trendrelease = $scope.clients[0];

      $scope.updateTrend = function( soption )
      {
          console.log("The selected option: "+ soption);
          if( soption === 'AW32')
          {
              $scope.TrendsDataObject = $scope.AW32data;
          }
          else
          {
              $scope.TrendsDataObject = $scope.AW33data;
          }
      };
*/

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

      $scope.showtrends = function()
      {
          console.log("In the show Trends");

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

                $scope.clients.trendreleases = [];
                $scope.clients.trendreleases = response[0].preference;
                $scope.selectedRequest.trendrelease = $scope.clients.trendreleases[0];
                console.log($scope.selectedRequest.trendrelease);

                var rele = $scope.selectedRequest.trendrelease;
                $http.get('/gettrendsdata/'+ rele).success(function (response)
                {
                    //console.log("Success Message: "+ response);
                    for(index in response)
                    {
                      console.log(response[index]);
                    }
                    response.sort(function (a, b) 
                    {
                      a = (a._id).split('/');
                      b = (b._id).split('/');
                      return a[2] - b[2] || a[1] - b[1] || a[0] - b[0];
                    });
                    response.reverse();
                    for(index in response)
                    {
                      console.log(response[index]);
                    }
                    var rows=[];
                    
                    for(index in response)
                    {
                      var Tc1123per = null;
                      var Tc1122per = null;
                      var Tc1121per = null;
                      var Tc1017per = null;
                      var Tc1016per = null;
                      var Tc1015per = null;
                      //console.log("INDEX: "+ index);
                      //console.log("Lenght:"+ response[index].LineChart.length );
                      for( var i=0; i< response[index].LineChart.length; ++i )
                      {
                          //console.log("In loop");
                          //console.log("PLATFORM: "+ response[index].LineChart[i].platform);
                          if( response[index].LineChart[i].platform === "Tc1123")
                          {
                            //console.log("It's Tc1123");
                            Tc1123per = parseFloat(response[index].LineChart[i].passper);
                            continue;
                          }
                          else if( response[index].LineChart[i].platform === "Tc1122")
                          {
                            //console.log("It's Tc1122");
                            Tc1122per = parseFloat(response[index].LineChart[i].passper);
                            continue;
                          }
                          else if( response[index].LineChart[i].platform === "Tc1121")
                          {
                            //console.log("It's Tc1121");
                            Tc1121per = parseFloat(response[index].LineChart[i].passper);
                            continue;
                          }
                          else if( response[index].LineChart[i].platform === "Tc1017")
                          {
                            //console.log("It's Tc1017");
                            Tc1017per = parseFloat(response[index].LineChart[i].passper);
                            continue;
                          }
                          else if( response[index].LineChart[i].platform === "Tc1016")
                          {
                            //console.log("It's Tc1016");
                            Tc1016per = parseFloat(response[index].LineChart[i].passper);
                            continue;
                          }
                          else if( response[index].LineChart[i].platform === "Tc1015")
                          {
                          // console.log("It's Tc1015");
                            Tc1015per = parseFloat(response[index].LineChart[i].passper);
                            continue;
                          }
                      }
                          rows.push
                          (
                            {
                              c:
                                [
                                  { v: response[index].LineChart[0].id},
                                  { v: Tc1123per},
                                  { v: Tc1122per},
                                  { v: Tc1121per},
                                  { v: Tc1017per},
                                  { v: Tc1016per},
                                  { v: Tc1015per},
                                ]
                            }
                          );
                    }
                    console.log(rows);
                    var trendsdata33 = {};
                
                    trendsdata33.type = "LineChart";

                    trendsdata33.data = 
                    {
                        "cols": 
                        [
                            {id: "ID", label: "Build_Id", type: "string"},
                            {id: "a", label: "AW33+Tc1123", type: "number" },
                            {id: "b", label: "AW33+Tc1122", type: "number"},
                            {id: "c", label: "AW33+Tc1121", type: "number"},
                            {id: "d", label: "AW33+Tc1017", type: "number"},
                            {id: "e", label: "AW33+Tc1016", type: "number"},
                            {id: "f", label:  "AW33+Tc1015", type: "number"}
                        ], 
                        "rows": rows
                    };
                    trendsdata33.options = 
                    {
                        isStacked: true,
                        //legend: 'none',

                        chartArea: 
                        {
                          left: 120,
                          top: 100,
                          width: 1600,
                          height: 600
                        },
                        explorer: 
                        { 
                          actions: ['dragToZoom','rightClickToReset'],
                          axis: 'horizontal',
                          keepInBounds: true,
                          maxZoomIn: 4.0
                        },
                        focusTarget: 'category',
                        "displayExactValues": true,
                        'title': "AW33_TRENDS",
                        'interpolateNulls': true,
                    };
                    $scope.TrendsDataObject = trendsdata33;
                    $scope.AW33data = trendsdata33;
                });

              //==================================================
              //==================================================
              //-=-=-=-=--=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=

          var rele = 'AW32';
          $http.get('/gettrendsdata/'+ rele).success(function (response)
          {
              //console.log("Success Message: "+ response);
              for(index in response)
              {
                //console.log(response[index]);
              }
              response.sort(function (a, b) 
              {
                a = (a._id).split('/');
                b = (b._id).split('/');
                return a[2] - b[2] || a[1] - b[1] || a[0] - b[0];
              });
              response.reverse();
              for(index in response)
              {
                console.log(response[index]);
              }
              var rows=[];
              
              for(index in response)
              {
                var Tc1123per = null;
                var Tc1122per = null;
                var Tc1121per = null;
                var Tc1017per = null;
                var Tc1016per = null;
                var Tc1015per = null;
                //console.log("INDEX: "+ index);
                //console.log("Lenght:"+ response[index].LineChart.length );
                for( var i=0; i< response[index].LineChart.length; ++i )
                {
                    //console.log("In loop");
                    //console.log("PLATFORM: "+ response[index].LineChart[i].platform);
                    if( response[index].LineChart[i].platform === "Tc1123")
                    {
                      console.log("It's Tc1123");
                      Tc1123per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1122")
                    {
                      console.log("It's Tc1122");
                      Tc1122per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1121")
                    {
                      console.log("It's Tc1121");
                      Tc1121per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1017")
                    {
                      console.log("It's Tc1017");
                      Tc1017per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1016")
                    {
                      console.log("It's Tc1016");
                      Tc1016per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1015")
                    {
                      console.log("It's Tc1015");
                      Tc1015per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                }
                    rows.push
                    (
                      {
                        c:
                          [
                            { v: response[index].LineChart[0].id},
                            { v: Tc1123per},
                            { v: Tc1122per},
                            { v: Tc1121per},
                            { v: Tc1017per},
                            { v: Tc1016per},
                            { v: Tc1015per},
                          ]
                      }
                    );
              }
              console.log(rows);
              var trendsdata32 = {};
          
              trendsdata32.type = "LineChart";

              trendsdata32.data = 
              {
                  "cols": 
                  [
                      {id: "ID", label: "Build_Id", type: "string"},
                      {id: "a", label: "AW32+Tc1123", type: "number" },
                      {id: "b", label: "AW32+Tc1122", type: "number"},
                      {id: "c", label: "AW32+Tc1121", type: "number"},
                      {id: "d", label: "AW32+Tc1017", type: "number"},
                      {id: "e", label: "AW32+Tc1016", type: "number"},
                      {id: "f", label: "AW32+Tc1015", type: "number"}
                  ], 
                  "rows": rows
              };
              trendsdata32.options = 
              {
                  isStacked: true,
                  //legend: 'none',
                  explorer: 
                  { 
                    actions: ['dragToZoom', 'rightClickToReset'],
                    axis: 'horizontal',
                    keepInBounds: true,
                    maxZoomIn: 4.0
                  },
                  chartArea: 
                  {
                    left: 120,
                    top: 100,
                    width: 1600,
                    height: 600
                  },
                  focusTarget: 'category',
                  "displayExactValues": true,
                  'title': "AW32_TRENDS",
                  'interpolateNulls': true,
              };
              $scope.AW32data = trendsdata32;









/*  
          var rele = 'AW33';
          $http.get('/gettrendsdata/'+ $scope.selectedRequest.trendrelease).success(function (response)
          {
              //console.log("Success Message: "+ response);
              for(index in response)
              {
                //console.log(response[index]);
              }
              response.sort(function (a, b) 
              {
                a = (a._id).split('/');
                b = (b._id).split('/');
                return a[2] - b[2] || a[1] - b[1] || a[0] - b[0];
              });
              response.reverse();
              for(index in response)
              {
                console.log(response[index]);
              }
              var rows=[];
              
              for(index in response)
              {
                var Tc1123per = null;
                var Tc1122per = null;
                var Tc1121per = null;
                var Tc1017per = null;
                var Tc1016per = null;
                var Tc1015per = null;
                //console.log("INDEX: "+ index);
                //console.log("Lenght:"+ response[index].LineChart.length );
                for( var i=0; i< response[index].LineChart.length; ++i )
                {
                    //console.log("In loop");
                    //console.log("PLATFORM: "+ response[index].LineChart[i].platform);
                    if( response[index].LineChart[i].platform === "Tc1123")
                    {
                      //console.log("It's Tc1123");
                      Tc1123per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1122")
                    {
                      //console.log("It's Tc1122");
                      Tc1122per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1121")
                    {
                      //console.log("It's Tc1121");
                      Tc1121per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1017")
                    {
                      //console.log("It's Tc1017");
                      Tc1017per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1016")
                    {
                      //console.log("It's Tc1016");
                      Tc1016per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1015")
                    {
                    // console.log("It's Tc1015");
                      Tc1015per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                }
                    rows.push
                    (
                      {
                        c:
                          [
                            { v: response[index].LineChart[0].id},
                            { v: Tc1123per},
                            { v: Tc1122per},
                            { v: Tc1121per},
                            { v: Tc1017per},
                            { v: Tc1016per},
                            { v: Tc1015per},
                          ]
                      }
                    );
              }
              console.log(rows);
              var trendsdata33 = {};
          
              trendsdata33.type = "LineChart";

              trendsdata33.data = 
              {
                  "cols": 
                  [
                      {id: "ID", label: "Build_Id", type: "string"},
                      {id: "a", label: "AW33+Tc1123", type: "number" },
                      {id: "b", label: "AW33+Tc1122", type: "number"},
                      {id: "c", label: "AW33+Tc1121", type: "number"},
                      {id: "d", label: "AW33+Tc1017", type: "number"},
                      {id: "e", label: "AW33+Tc1016", type: "number"},
                      {id: "f", label:  "AW33+Tc1015", type: "number"}
                  ], 
                  "rows": rows
              };
              trendsdata33.options = 
              {
                  isStacked: true,
                  //legend: 'none',

                  chartArea: 
                  {
                    left: 120,
                    top: 100,
                    width: 1600,
                    height: 600
                  },
                  explorer: 
                  { 
                    actions: ['dragToZoom','rightClickToReset'],
                    axis: 'horizontal',
                    keepInBounds: true,
                    maxZoomIn: 4.0
                  },
                  focusTarget: 'category',
                  "displayExactValues": true,
                  'title': "AW33_TRENDS",
                  'interpolateNulls': true,
              };
              $scope.TrendsDataObject = trendsdata33;
              $scope.AW33data = trendsdata33;
          });

              //==================================================
              //==================================================
              //-=-=-=-=--=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=

          var rele = 'AW32';
          $http.get('/gettrendsdata/'+ rele).success(function (response)
          {
              //console.log("Success Message: "+ response);
              for(index in response)
              {
                //console.log(response[index]);
              }
              response.sort(function (a, b) 
              {
                a = (a._id).split('/');
                b = (b._id).split('/');
                return a[2] - b[2] || a[1] - b[1] || a[0] - b[0];
              });
              response.reverse();
              for(index in response)
              {
                console.log(response[index]);
              }
              var rows=[];
              
              for(index in response)
              {
                var Tc1123per = null;
                var Tc1122per = null;
                var Tc1121per = null;
                var Tc1017per = null;
                var Tc1016per = null;
                var Tc1015per = null;
                //console.log("INDEX: "+ index);
                //console.log("Lenght:"+ response[index].LineChart.length );
                for( var i=0; i< response[index].LineChart.length; ++i )
                {
                    //console.log("In loop");
                    //console.log("PLATFORM: "+ response[index].LineChart[i].platform);
                    if( response[index].LineChart[i].platform === "Tc1123")
                    {
                      console.log("It's Tc1123");
                      Tc1123per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1122")
                    {
                      console.log("It's Tc1122");
                      Tc1122per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1121")
                    {
                      console.log("It's Tc1121");
                      Tc1121per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1017")
                    {
                      console.log("It's Tc1017");
                      Tc1017per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1016")
                    {
                      console.log("It's Tc1016");
                      Tc1016per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                    else if( response[index].LineChart[i].platform === "Tc1015")
                    {
                      console.log("It's Tc1015");
                      Tc1015per = parseFloat(response[index].LineChart[i].passper);
                      continue;
                    }
                }
                    rows.push
                    (
                      {
                        c:
                          [
                            { v: response[index].LineChart[0].id},
                            { v: Tc1123per},
                            { v: Tc1122per},
                            { v: Tc1121per},
                            { v: Tc1017per},
                            { v: Tc1016per},
                            { v: Tc1015per},
                          ]
                      }
                    );
              }
              console.log(rows);
              var trendsdata32 = {};
          
              trendsdata32.type = "LineChart";

              trendsdata32.data = 
              {
                  "cols": 
                  [
                      {id: "ID", label: "Build_Id", type: "string"},
                      {id: "a", label: "AW32+Tc1123", type: "number" },
                      {id: "b", label: "AW32+Tc1122", type: "number"},
                      {id: "c", label: "AW32+Tc1121", type: "number"},
                      {id: "d", label: "AW32+Tc1017", type: "number"},
                      {id: "e", label: "AW32+Tc1016", type: "number"},
                      {id: "f", label: "AW32+Tc1015", type: "number"}
                  ], 
                  "rows": rows
              };
              trendsdata32.options = 
              {
                  isStacked: true,
                  //legend: 'none',
                  explorer: 
                  { 
                    actions: ['dragToZoom', 'rightClickToReset'],
                    axis: 'horizontal',
                    keepInBounds: true,
                    maxZoomIn: 4.0
                  },
                  chartArea: 
                  {
                    left: 120,
                    top: 100,
                    width: 1600,
                    height: 600
                  },
                  focusTarget: 'category',
                  "displayExactValues": true,
                  'title': "AW32_TRENDS",
                  'interpolateNulls': true,
              };
              $scope.AW32data = trendsdata32;
*/
});
              });
          });
      
      };

  }]);