var jenkinurl = 'http://cii6s116:8080/';

var mongojs = require('mongojs');

var argv = require('yargs').argv;

var fs = require('fs');

var rootdir = __dirname;

var async = require('async');

var outfile = rootdir + '/out/xml2json.json';

var xml2js = require('xml2js');

var parser = new xml2js.Parser();

var jobname=argv.jobname;

// Function to get the jenkins-url
async.waterfall
(
    [
        function getjuniturl( callback )
        {
            //var aw33jobs = [ 'AW33_Tc113_ORACLE_J2EE_Full','AW33_Tc1123_ORACLE_J2EE_Full', 'AW33_Tc1122_ORACLE_J2EE_Full', 'AW33_Tc1121_ORACLE_J2EE_Full','AW33_Tc1017_ORACLE_J2EE_Full', 'AW33_Tc1016_ORACLE_J2EE_Full', 'AW33_Tc1015_ORACLE_J2EE_Full'];
            //var aw32jobs = ['AW32_Tc1017_ORACLE_J2EE_Initial','AW32_Tc1123_ORACLE_J2EE_Initial'];
            var jenkinsapi = require('jenkins-api');
            var jenkins = jenkinsapi.init( jenkinurl );

            jenkins.last_build_info( jobname, function (err, data)
            {
                if (err)
                {
                    callback(err, null);
                }
                callback(null, data);
            });
        }
        ,
        function getxmldata( data, callback )
        {
            var request = require('request');

            var jobname = data.fullDisplayName.substring(0,data.fullDisplayName.indexOf(' '));
            var jobinfo = jobname.split('_');
            var releaseinfo = jobinfo[0];

            var xmlurl = jenkinurl + '/view/' + releaseinfo + '/job/' + jobname + '/ws/out/cucumber_parallel/cucumber_results.xml'            

            //var xmlurl = data.url + 'artifact/out/cucumber_parallel/cucumber_results.xml';

            request.get(xmlurl, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    parser.parseString( body, function (err, result)
                    {
                        callback( null, result, data);
                     });
                }
                else
                {
                    callback(error, null,null);
                }
            });
        }
        ,
        function getmapfrommongo( result, data, callback )
        {
            var awmap = mongojs('AWMAP');
            awmap.collection('awteam').find({}, { _id: 0 }).toArray( function ( err, resultant )
            {
                if (err)
                {
                    callback(err, null, null, null);
                }
                else if ( resultant.length > 0)
                {
                    callback(null, result, data, resultant );
                }
            });
            awmap.close();
        }
        ,

        function converttogiven( result , data , resultant , callback)
        {
            var lookup = {};
            var teamUnique = [];

            for ( index=0;index<resultant.length;index++ )
            {

                if(teamUnique.indexOf(resultant[index].Team) === -1){
                    teamUnique.push(resultant[index].Team);        
                }        
				

            }

            //console.log(teamUnique);

            var teamtest = [];
            var teamname = '';
            var tagmap = {};

            for(i = 0; i< teamUnique.length; i++)
            {    
                //console.log(teamUnique[i]);  
                
                teamname = teamUnique[i];

                var tagunique = [];
                for ( index=0;index<resultant.length;index++ )
                {
                    
                    if(resultant[index].Team == teamname )
                    {

                        tagunique.push(resultant[index].Tag);        
                    }        
                    
                }                

                tagmap[teamname] = tagunique;
            }


            console.log(tagmap);

            

            var dateFormat = require('dateformat');

            var moment = require( 'moment' );
            var x = data.duration;
            var dur = moment.duration( x, 'milliseconds' );
            var hours = Math.floor( dur.asHours() );
            var mins = Math.floor( dur.asMinutes() ) - hours * 60;
            var duration = hours + ' hrs ' + mins + ' mins';
            var yearval = new Date().getFullYear().toString().substr(2,2);
            
            var cucuresult  = data.url + 'cucumber-html-reports/team-overview.html';
            var cucusplit   = cucuresult.split('_');
            var database    = cucusplit[2];
            var baseurl     = data.url + 'cucumber-html-reports';

            var buildParam  = getValueByKey( 'parameters', data.actions );
            var browsertype = getValueByName( 'TEST_BROWSER', buildParam );
            var awrelease   = getValueByName( 'AW_RELEASE', buildParam );
            var awbuild     = getValueByName( 'AW_BASELINE', buildParam );
            var buildinfo   = getValueByName( 'BUILD_INFO', buildParam );
            var awurl       = getValueByName( 'AW_TEST_URL', buildParam );
            var serverip    = getValueByName( 'SERVER_IP', buildParam );
            var buildid     = buildinfo.split( '_' );

            var d           = new Date(data.timestamp);
            var dateval     = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();


            var dashstr     = buildid[0] + '.' + yearval + buildid[1] + '_' + buildid[2] + '_' + buildid[3];
            var tcbuild     = buildid[3].replace(/\D/g, '');
            var dashurl     = 'http://plm-dashboard/index.php?object=' + buildid[0] + '&baseline=' + dashstr + '&platform=wntx64';

            var jobname     = data.fullDisplayName.substring(0, data.fullDisplayName.indexOf(' '));

            //Teamwise results
            var processData = [];
            var reportdata = [];

            //var mapfile = rootdir + '/map/teammap.json';
            //var tagmap = JSON.parse(fs.readFileSync(mapfile));
            //console.log(tagmap);
              
            resultobj = JSON.parse(JSON.stringify(result));
            for(var testcount = 0;testcount < resultobj.testsuite.testcase.length;testcount++)
            {
                var teamvalue = '';         
                teamvalue = getKeyValue(tagmap, resultobj.testsuite.testcase[testcount].$.application);
                                                                    
                processData.push({                                  
                                    team:teamvalue,
                                    application:resultobj.testsuite.testcase[testcount].$.application, 
                                    result:resultobj.testsuite.testcase[testcount].$.scenario_result                                
                                });
                                                    
                processData = processData.sort(teamcomparator);         
            }
            
            var teamdata = getKey(tagmap);
            var totalpasscount = 0;
            var totalfailcount = 0;
            var totaltestcount = 0; 
            var totalpassper;   
            
            for (var teammcount = 0; teammcount<teamdata.length; teammcount++)
            {
                var teampasscount = 0;
                var teamfailcount = 0;
                var teamtotalcount = 0;
                var teampassper;
                
                for(k=0;k<processData.length;k++) 
                {
                    if (searchByKey('team', processData[k]) == teamdata[teammcount] && searchByKey('result', processData[k]) == 'passed')
                    {
                        teampasscount += 1;
                    }
                    else if (searchByKey('team', processData[k]) == teamdata[teammcount] && searchByKey('result', processData[k]) == 'failed')
                    {
                        teamfailcount += 1;
                    }
                }
                teamtotalcount = teampasscount + teamfailcount;                     
                teampassper = ((teampasscount / teamtotalcount) * 100).toFixed(2);      
                
                totalpasscount += teampasscount;
                totalfailcount += teamfailcount; 

                var direct ="";
                var scrum  ="";
                var own    ="";
                for ( index in resultant )
                {
                    if ( resultant[index].Team == teamdata[teammcount] )
                    {
                        direct =direct + resultant[index].Director;
                        scrum = scrum + resultant[index].ScrumMaster;
                        own   = own + resultant[index].Owner;
                       break;
                    }
                    else
                    {
                        continue;
                    }
                }
                //console.log("Index: "+index);
                
                if (teamfailcount > 0)
                {
                    reportdata.push({
                        team:teamdata[teammcount],
                        director:direct,
                        scrummaster:scrum,
                        owner:own,
                        pass:teampasscount,
                        fail:teamfailcount,
                        total:teamtotalcount,
                        passper:teampassper
                    });
                }       
            }
            
            totaltestcount = totalpasscount + totalfailcount;
            totalpassper = ((totalpasscount/totaltestcount)*100).toFixed(2);

            reportdata = reportdata.sort(resultcomparator); 
            
            reportdata.push
            ({
                team:'Total',
                pass:totalpasscount,
                fail:totalfailcount,
                total:totaltestcount,
                passper:totalpassper
            });     
            console.log(reportdata);


            // Config Part
            var config = [];
            var failed      = data.actions[8].failCount;
            var total       = data.actions[8].totalCount;
            var passed      = total - failed;
            var passpercent = ((passed / total) * 100).toFixed(2);
            
            config.push
            ({
                            "build_id":     buildinfo,
                            "date":         dateval,
                            "browser":      browsertype,
                            "awrelease":    awrelease,
                            "awbuild":      awbuild,
                            "tcrelease":    buildid[2],
                            "tcbuild":      tcbuild,
                            "duration":     duration,
                            "cucumberurl":  cucuresult,
                            "plmdash":      dashurl,
                            "totalrun":     total,
                            "totalpass":    passed,
                            "totalfail":    failed,
                            "passper":      passpercent,
                            "database":     database,
                            "appserver":    "Weblogic",
                            "serveros":     "Windows server 2008",
                            "clientos":     "wntx64"
            });
            
            // Results part
            var results = [];
            for ( var i = 0; i < result.testsuite.testcase.length; ++i )
            {
                var teamvalue = "";
                var errormsg = "";

                var apion = result.testsuite.testcase[i].$.application;
                if ( result.testsuite.testcase[i].$.scenario_result.toString().trim() == 'failed' )
                {
                    errormsg = result.testsuite.testcase[i].failure[0].$.message;
                    errormsg = errormsg.replace(/[^a-z0-9 )_:,.?!&#\n"(]/ig, '');
                }
                
                for (index in resultant)
                {
                    if ( resultant[index].Tag == apion )
                    {
                        results.push
                        ({
                            "build_id":     buildinfo,
                            "Application":  result.testsuite.testcase[i].$.application,
                            "Team":         resultant[index].Team,
                            "Director":     resultant[index].Director,
                            "ScrumMaster":  resultant[index].ScrumMaster,
                            "Owner":        resultant[index].Owner,            
                            "Feature":      result.testsuite.testcase[i].$.feature,
                            "Scenario":     result.testsuite.testcase[i].$.scenario,
                            "tags":         result.testsuite.testcase[i].$.applicationtags,
                            "result":       result.testsuite.testcase[i].$.scenario_result,
                            "testdur":      parseFloat(result.testsuite.testcase[i].$.scenario_duration).toFixed(2),
                            "errorstep":    getErrorStep(errormsg),
                            "errortype":    getErrorType(errormsg),
                            "failmsg":      errormsg,
                            "defid": "",
                            "comment": ""
                        });
                       break;
                    }
                    else
                    {
                        continue;
                    }
                }
            }
            var output = [];
            output.push
            ({
                            "config": config,
                            "Teamwise": reportdata
            });
            //"results": results
            //console.log( JSON.stringify( output ) );
            //fs.writeFileSync( outfile, JSON.stringify(output) );
            callback( null, results, output, awrelease, buildinfo);
        }
        ,

        function savebuildrestomongo( results, output, awrelease, buildinfo, callback )
        {
            var db = mongojs( 'AW_AUTOTEST_DATA' );
            if( awrelease === 'AW32' )
            {
                var awrelease = 'AW321';
            }
            
            db.collection( awrelease ).count({ "Details.config.build_id": buildinfo }, function(err, data) {
                if(!err)
                {
                    if (data < 1)
                    {
						console.log(buildinfo + ' - ' + data + ': Data do not exists, saving the data to db');
						
                        db.collection( awrelease ).save( { _id: buildinfo, 'Details': output, 'results': results }, function (err, saved)
                        {
                            if (err || !saved)
                            {
								console.log('some error occured in saving data' + err)
                                callback(err, null);
								db.close();
                                return;
                            }
                            else
                            {
								console.log('new data saved')
                                callback(null , saved);
								db.close();
								
                            }
                        });
                    }
					else
					{
						console.log(buildinfo + ' - ' + data + ': Data already exists, not saving the data to db');
						db.close();
					}
                }

            });

            //
        }

        
    ], 
    function( err, result )
    {
        console.log("Results saved to Database.");
    }
);

function getKeyValue( data, keyVal )
{
    var key = "";

    for (key in data)
    {
        if (data.hasOwnProperty(key))
        {
            var tagValues = data[key].toString();

            if (tagValues.indexOf(",") > 0)
            {
                var arr = tagValues.split(",");

                for (var i = 0; i < arr.length; i++)
                {
                    if (keyVal == arr[i].toString())
                    {
                        return key;
                    }
                }
            }
            else
            {
                if (keyVal == tagValues)
                {
                    return key;
                }
            }
        }
    }
}

function getValueByName(key, data)
{
    var i, len = data.length;

    for ( i = 0; i < len; i++ )
    {
        if ( data[i].name == key )
        {
            return data[i].value;
        }
    }

    return -1;
}

function getValueByKey( key, data )
{
    var i, len = data.length;

    for (i = 0; i < len; i++)
    {
        if ( data[i] && data[i].hasOwnProperty( key ) )
        {
            return data[i][key];
        }
    }

    return -1;
}

function teamcomparator(a, b) 
{
   if (a.team < b.team) return -1;
   if (a.team > b.team) return 1;
   return 0;
}

function resultcomparator(a, b) 
{
   if (a.total > b.total) return -1;
   if (a.total < b.total) return 1;
   return 0;
}

function getKey(data)
{
    var key = "";
    var awTeams = [];

    for (key in data) 
    {
        awTeams.push(key);
    }
    
    return awTeams;
}

function searchByKey(key, data) 
{

    for(var myKey in data)
    {
        if (key == myKey)
        {           
            return data[myKey];
        }
        
    }

  return false;
}
function getErrorStep(errorStack)
{
    var step = '';

    if (errorStack.indexOf(".Then") > 0)
    {
        step = errorStack.substring(errorStack.indexOf(".Then ")+1, errorStack.indexOf('.feature')+8);
        step = step.substr(0,step.indexOf('('));        
        return step;                
    }

    else if (errorStack.indexOf(".When") > 0)
    {
        step = errorStack.substring(errorStack.indexOf(".When ")+1, errorStack.indexOf('.feature')+8);  
        step = step.substr(0,step.indexOf('('));        
        return step;
    }

    else if (errorStack.indexOf(".Given") > 0)
    {
        step = errorStack.substring(errorStack.indexOf(".Given ")+1, errorStack.indexOf('.feature')+8);
        step = step.substr(0,step.indexOf('('));        
        return step;
    }       

    else if (errorStack.indexOf(".And") > 0)
    {
        step = errorStack.substring(errorStack.indexOf(".And ")+1, errorStack.indexOf('.feature')+8);           
        step = step.substr(0,step.indexOf('('));        
        return step;
    }
    else 
    {
        return step;
    }
}

function getErrorType(errorStack)
{
    var step = '';
    var col = errorStack.indexOf(":");
    var brack = errorStack.indexOf("(");
    
    if (col > brack)
    {
        step = errorStack.substring(0,brack);
        return step;
    }
    else 
    {
        step = errorStack.substring(0,col);
        return step;
    }
}

function getTeamfromTag(tag,data)
{
	for ( var index=0;index<data.length;index++ )
	{
		if (tag == data[index].Tag)
		{
			return data[index].Team;
		}
		console.log('resultant - '+ data[index].Tag + ' - '  + data[index].Team);
	}
}