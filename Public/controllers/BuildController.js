var myApp = angular.module('myApp', []);
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