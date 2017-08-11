  var myApp = angular.module('myApp', ['ui.router','googlechart','xeditable']);
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