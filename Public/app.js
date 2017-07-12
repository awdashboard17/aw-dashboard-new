
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

myApp.controller('ReportsCtrl',['$scope', '$http','$location', function( $scope, $http, $location )
{
    console.log("In reports control");
    $scope.updateTeams = function()
    {
       $scope.UpdateTeamMappings();
    };
    
    $scope.GotoBackPage = function()
    {
       window.history.back();
    };

    $scope.showReports = function()
    {
        console.log("In showReports() : ");
        
        $http.get('/getreportsdata/'+ 'AW32').success(function (response)
        {
           console.log("Success Message: "+ response);
           var res = JSON.stringify(response.get());
           console.log("In getreportsdata : success " + res);
           $scope.reportData = response.get();
        });
    };

    $scope.updateReport = function()
    {
        console.log("In Updated report : ");
        $scope.updateReportObject = $scope.reportData;
    };

}]);


myApp.controller('TrendsCtrl',['$scope', '$http','$location', function( $scope, $http, $location )
{
    console.log("In trends control");
    $scope.GotoBackPage = function()
    {
       window.history.back();
    }

    $scope.clients = 
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


    $scope.showtrends = function()
    {
        console.log("In the show Trends");
        var rele = 'AW33';
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
        });
    };
}]);


myApp.controller('BuildCtrl', ['$scope', '$http','$location', function( $scope, $http, $location )
{
    console.log("In the Buildwise Controller");

    //$scope.sortType     = 'tags'; // set the default sort type
    //$scope.sortReverse  = false;  // set the default sort order
    
     $scope.GotoBackPage = function()
    {
       window.history.back();
    }

   $scope.exportData = function () {
        $scope.export_table_to_excel('exportable', 'xlsx');

    };

    $scope.s2ab = function (s) {
        if (typeof ArrayBuffer !== 'undefined') {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        } else {
            var buf = new Array(s.length);
            for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }
    }

    $scope.export_table_to_excel = function (id, type, fn) {

        // XLSX comes from the js file; loaded in the directorwise.html page
        // TODO: 1. As a temporary measure add the same functionality to the team page
        //       2. Make the function a part of a directive or a service, for increasing modularity 
        var wb = XLSX.utils.table_to_book(document.getElementById(id), { sheet: "Sheet JS" });
        var wbout = XLSX.write(wb, { bookType: type, bookSST: true, type: 'binary' });
        var fname = fn || 'Results.' + type;
        try {
            saveAs(new Blob([$scope.s2ab(wbout)], { type: "application/octet-stream" }), fname);
        } catch (e) { if (typeof console != 'undefined') console.log(e, wbout); }
        return wbout;
    }

    $scope.updateUser = function( data, build, tags, scenario )
    {
		debugger;
        console.log("Comment:"+ data);
        console.log("Build: "+ build );
        console.log("tag: "+ tags );
        console.log("Scenario: "+ scenario);
        var all = data+"^^^"+build+"^^^"+tags+"^^^"+scenario;
        console.log(all);

        $http.put('/UpdateCommentForFailed/'+ all ).success(function (response)
        {
            console.log("Success Message: "+ response);
        });
    };

    $scope.updatedef = function( data, build, tags, scenario )
    {
        console.log("Comment:"+ data);
        console.log("Build: "+ build );
        console.log("tag: "+ tags );
        console.log("Scenario: "+ scenario);
        var all = data+"^^^"+build+"^^^"+tags+"^^^"+scenario;
        console.log(all);

        $http.put('/UpdateDefIdForFailed/'+ all ).success(function (response)
        {
            console.log("Success Message: "+ response);
        });
    };

    $scope.showbuildwise = function()
    {
        console.log("ng-init is called");
        debugger;
        var buildurl = $location.url();
        var parts=buildurl.split("&");
        var build =(parts[0]).split("_");
        console.log(build[1]);
        var teampart =parts[1].replace( /%20|_/g,' '); 
        var team=teampart.split("=");
        console.log(team[1]);
        release = build[0].replace(/[^\/\d]/g,'');
        release = release.replace('/','');
        release = release.replace('/','');
        release =  'AW'+release;
        console.log( release );
        var rnb = release+"_"+build[1]; //only build[1]
        $http.get('/TeamResultsForAllBuilds/'+ rnb).success( function( response )
        {
            var rows=[];
            
            for(index in response)
            {
              console.log("Is this a team! "+ team[1]);
              //var arr = response[index].Details[0].results;
              for(var i=0; i< response[index].Details[0].Teamwise.length-1; i++)
              {
                if(team[1] == response[index].Details[0].Teamwise[i].team )
                {
                  console.log(team[1]);
                  console.log(response[index].Details[0].Teamwise[i].team);
                  rows.push
                  (
                    {
                      c:
                        [
                          { v: response[index]._id},
                          { v: response[index].Details[0].Teamwise[i].pass},
                          { v: response[index].Details[0].Teamwise[i].fail},
                        ]
                    }
                  );
                  break;
                }

              }
              
            }
            //console.log(rows);
            $scope.BuildwisechartObject = {};
        
            $scope.BuildwisechartObject.type = "ColumnChart";

            $scope.BuildwisechartObject.data = 
            {
                "cols": 
                [
                    {id: "t", label: "Build", type: "string"},
                    {id: "s", label: "Passed", type: "number" },
                    {id: "d", label: "Failed", type: "number"}
                ], 
                "rows": rows
            };

            $scope.BuildwisechartObject.options = 
			{
				hAxis : { 
					textStyle : {
						fontName: 'Calibri',
						fontSize: 14, // or the number you want
						bold: true
					}

				},
				vAxis : { 
					textStyle : {
						fontName: 'Calibri',
						fontSize: 14, // or the number you want
						bold: true
					}

				},		
				//'width':800,
				//'height':300,
                isStacked: true,
                legend: 'none',
                "displayExactValues": true,
                colors: ['green','red'],
				titleTextStyle: {
						color: '#262626',    // any HTML string color ('red', '#cc00cc')						
						fontSize: 20, // 12, 18 whatever you want (don't specify px)
						bold: true,    // true or false
						//italic: <boolean>   // true of false
				},
                'title': "Team : "+ team[1]
            };
        });

        var resultsarray=[];
        var rbt = rnb+"_"+team[1].replace( /%20|_/g,' ');

        $http.get('/GetFailedForTeamOnAllBuilds/'+ rbt).success( function( response )
        {
            for( index in response )
            {
              console.log( response[index]);
              var arr = response[index].results;
              resultsarray = resultsarray.concat(arr);
            }
            console.log( resultsarray );
            $scope.results1 = resultsarray;
        });

    };

}]);


myApp.controller('secondCtrl', ['$scope', '$http','$location', function( $scope, $http, $location )
{
    console.log( $location.url());

    $scope.set_color = function (team11) 
    {
      if (team11.passper >= 95.00) 
      {
        return { 'background-color' : "#80ffaa" };
      }
      else if(team11.passper >= 85.00 && team11.passper < 95.00)
      {
        return { 'background-color' : "#ffffb3" }; 
      }
      else if(team11.passper < 85.00 )
      {
        return { 'background-color' : "#ff8080" };
      }
  }

     $scope.GotoBackPage = function()
    {
       window.history.back();
    }
      
    $scope.clients = 
    [
        { 
              choice: "Team"
        },
        { 
              choice: "Director"
        }
    ];

    $scope.selectedRequest = {};
    $scope.selectedRequest.TAD = $scope.clients[0];

    $scope.updategraph = function( soption )
    {
        console.log("The selected option: "+ soption);
        if( soption === 'Director')
        {
            $scope.myChartObject = $scope.directordatabind;
        }
        else
        {
            $scope.myChartObject = $scope.teamdatabind;
        }
    };

    $scope.columnway = function(id)
    {
        console.log("In direct button ----" + id.row);
        debugger;
        var path;
        var buildsplit = ($location.url()).split("_");
        if ($scope.selectedRequest.TAD.choice != "Director")
        { path = "/Buildwise.html#awbuild="+buildsplit[0]+"_"+buildsplit[1]+"&Team="+$scope.myChartObject.data.rows[id.row].c[0].v;}
        else path = "/Directorwise.html#awbuild="+buildsplit[0]+"_"+buildsplit[1]+"&Director="+$scope.myChartObject.data.rows[id.row].c[0].v;
        console.log(path);
        window.location.href = path;   
    };


    $scope.TeamWiseResults = function()
    {

      $http.get('/getcucandplm/'+$location.url().replace('/','')).success(function(response)
      {
        console.log(response);
        var conf = response[0].Details[0].config[0];
        console.log("Config rec: "+conf.plmdash);

        $scope.build_id11 = conf.build_id;
        $scope.passper11  = conf.passper+" %";
        $scope.duration11 = conf.duration;
        $scope.cucurl11   = conf.cucumberurl;
        $scope.plmdash11  = conf.plmdash;
        $scope.database11 = conf.database;
        $scope.browser11  = conf.browser;
        $scope.results11  = response[0].Details[0].Teamwise;

        console.log("SAmir Teamwise: "+ response[0].Details[0].Teamwise[0]);
      });



      $http.get('/getdirectorwiseresultsforbuild/'+$location.url().replace('/','')).success(function(response)
      {
            console.log("In the getdirectorwiseresultsforbuild");
            response.sort(function(a, b)
            {
                var x = (a.Passed + a.Failed);
                var y = (b.Passed + b.Failed);
                if (x > y) 
                  {return -1;}
                if (x < y) 
                  {return 1;}
                return 0;
            });

            var rows=[];
            for(var j=0; j< response.length ; ++j)
            {
              if( response[j]._id == null)
              {
                continue;
              }
              var Director2 = response[j]._id;
              var Passed2 = response[j].Passed;
              var Failed2 = response[j].Failed;
              console.log(Director2+"|"+Passed2+"|"+Failed2);
              rows.push
                (
                  {
                    c:
                      [
                        { v: Director2},
                        { v: Passed2, f:'Passed : '+Passed2+ ", Total: "+(Passed2+Failed2)},
                        { v: Failed2, f:'Failed : '+Failed2+ ", Total: "+(Passed2+Failed2)},
                      ]
                  }
                );
            }
            var directordata = {};
        
              directordata.type = "ColumnChart";

              directordata.data = 
              {
                  "cols": 
                  [
                      {id: "t", label: "Director", type: "string"},
                      {id: "s", label: "", type: "number" },
                      {id: "d", label: "", type: "number"}
                  ], 
                  "rows": rows
              };

              directordata.options = 
              {
				hAxis : { 
					textStyle : {
						fontName: 'Calibri',
						fontSize: 14, // or the number you want
						bold: true
					}

				},	
				vAxis : { 
					textStyle : {
						fontName: 'Calibri',
						fontSize: 14, // or the number you want
						bold: true
					}

				},				
                isStacked: true,
                legend: 'none',
                "displayExactValues": true,
                colors: ['green','red'],
                'title': $location.url().replace('/',''),
				tooltip: {textStyle:  {fontName: 'Calibri',fontSize: 12,bold: true}}
				
              };
              $scope.directordatabind = directordata;
      });


      $http.get('/awteam2/' + $location.url().replace('/','')).success(function (response)
      {
              var rows=[];
              for(var i=0; i< response.length -1;i++)
              {
                var Team1= response[i].team;
				console.log('Team1 - ' + Team1);
                var Passed1= response[i].pass;
                var Failed1= response[i].fail;
                rows.push
                (
                  {
                    c:
                      [
                        { v: Team1},
                        { v: Passed1, f:'Pass: '+Passed1+ ", Total: "+(Passed1+Failed1) + ", Pass% : " + (Passed1 / ((Passed1+Failed1))*100).toFixed(2)},
                        { v: Failed1, f:'Fail: '+Failed1+ ", Total: "+(Passed1+Failed1) + ", Fail% : " + (Failed1 / ((Passed1+Failed1))*100).toFixed(2)},
                      ]
                  }
                );
              }
              //console.log(rows);
              var teamdata = {};
        
              teamdata.type = "ColumnChart";

              teamdata.data = 
              {
                  "cols": 
                  [
                      {id: "t", label: "Team", type: "string"},
                      {id: "s", label: "", type: "number" },
                      {id: "d", label: "", type: "number"}
                  ], 
                  "rows": rows
              };
			  			  
              teamdata.options = 
              {
				hAxis : { 
					textStyle : {
						fontName: 'Calibri',
						fontSize: 14, // or the number you want
						bold: true
					}

				},	
				vAxis : { 
					textStyle : {
						fontName: 'Calibri',
						fontSize: 14, // or the number you want
						bold: true
					}

				},				
                isStacked: true,
                legend: 'none',
                "displayExactValues": true,
                colors: ['green','red'],
                'title': $location.url().replace('/',''),
				tooltip: {textStyle:  {fontName: 'Calibri',fontSize: 12,bold: true}}
              };
              $scope.myChartObject = teamdata;
              $scope.teamdatabind = teamdata;
      });  
    };
}]);


myApp.controller('myController', ['$scope', '$http','$location','$state', function ($scope, $http, $location, $state)
  {
      var arrayy = ['one','two','three','four','five','six','seven','eight'];

      $scope.GotoBackPage = function()
      {
         window.history.back();
      }

      $scope.UpdateTeamMappings = function()
      {
        var username = window.prompt("Enter your username","");
        var password = window.prompt("Enter your password","");
        if ( username == "vikrant" && password == "vikrant")
        {
            alert ("Login successfully");
            var path = "/TeamMapping.html";
        }
        else
        {
            alert("Invalid username or password");
            var path = "/showTeamMappings.html";
        }

       window.location.href = path;   
       
      };

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
            console.log("Response size: "+reslength);

            for(var x= reslength; x < 8; ++x)
            {
                  var dyn =x;
                  console.log("graph id: "+ (dyn+1));
                  eval("$scope.gg"+(arrayy[dyn])+" = "+"true;");
            }
            console.log("Value of x:"+ x);
            for(var y=0; y< reslength; ++y)
            {
                  var guile =y;
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
