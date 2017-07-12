var jenkinurl = 'http://cii6s116:8080/';

var fs = require('fs');

var rootdir = __dirname;

var outfile1 = rootdir + '/out/jenkinsop.json';
//var jobname = 'AW33_Tc1121_ORACLE_J2EE_Full';

var jobs = ['AW33_Tc1015_ORACLE_J2EE_Full','AW33_Tc1121_ORACLE_J2EE_Full','AW33_Tc1016_ORACLE_J2EE_Full','AW33_Tc1017_ORACLE_J2EE_Full','AW33_Tc1122_ORACLE_J2EE_Full','AW33_Tc1123_ORACLE_J2EE_Full']

for (var i = 0; i < jobs.length; i++)
{
	//getjenkinsInfo(jobs[i]);
	getjuniturl(jobs[i]);
}



function getjuniturl(jobname)
{
    console.log('1');
	var jenkinsapi = require('jenkins-api');
	var jenkins = jenkinsapi.init(jenkinurl);
	var EventEmitter = require("events").EventEmitter;
	var jenkinsdata = new EventEmitter();	
	
	jenkins.last_build_info(jobname, function(err, data)
	{
	    if (err)
	    {
	        return console.log(err);
	    }
		jenkinsdata.data = data;
		jenkinsdata.emit('update');		
	});
	jenkinsdata.on('update', function ()
	{
		getxmldata(jenkinsdata.data);
	});	
	
}

function getxmldata(data)
{
	var request = require('request');
	var EventEmitter = require("events").EventEmitter;
	var xmldata = new EventEmitter();	
	var xmlurl = data.url + 'artifact/out/cucumber_parallel/cucumber_results.xml';

	request.get( xmlurl, function (error, response, body) 
	{
		if (!error && response.statusCode == 200) 
		{
			xmldata.data = body;
			xmldata.emit('update');
		}
		else
		{
			return console.log(error);
		}
	});	
	
	xmldata.on('update', function ()
	{
		getjobdata(xmldata.data, data);
	});		
}

function getjobdata(xmldata, jobdata)
{
	var fs = require('fs');
	xml2js = require('xml2js');
	var parser = new xml2js.Parser();	
	var dateFormat = require('dateformat');
	
	
	var rootdir = __dirname;
	var mapfile = rootdir + '/map/teammap.json';
	var tagmap = JSON.parse(fs.readFileSync(mapfile));
	
	var processData = [];
	var reportdata = [];
	
	var moment = require('moment');
	var x = jobdata.duration;
	var dur = moment.duration(x, 'milliseconds');
	var hours = Math.floor(dur.asHours());
	var mins = Math.floor(dur.asMinutes()) - hours * 60;	
	var duration = hours + ' hrs ' + mins + ' mins';
	
	var cucuresult = jobdata.url + 'cucumber-html-reports/team-overview.html';
	var baseurl = jobdata.url + 'cucumber-html-reports';
			

	var buildParam = getValueByKey('parameters', jobdata.actions);
	console.log(JSON.stringify(jobdata));
	fs.writeFileSync( outfile1, JSON.stringify(jobdata));
	var browsertype = getValueByName('TEST_BROWSER',buildParam);
	var buildinfo = getValueByName('BUILD_INFO', buildParam);
	//console.log( buildinfo );
	var awurl = getValueByName('AW_TEST_URL',buildParam);
	var serverip = getValueByName('SERVER_IP',buildParam);
	var buildid = buildinfo.split('_');
	
	var dashstr = buildid[0] + '.' + buildid[1] + '_' + buildid[2] + '_' + buildid[3];
	var dashurl = 'http://plm-dashboard/index.php?object=' + buildid[0] + '&baseline=' + dashstr + '&platform=wntx64';
	
	var jobname = jobdata.fullDisplayName.substring(0,jobdata.fullDisplayName.indexOf(' '));
		
	parser.parseString(xmldata.substring(0, xmldata.length), function (err, result) 
	{				
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
		
	});	
	
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
		
		if (teamfailcount > 0)
		{
			reportdata.push({
				team:teamdata[teammcount],
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
	
	reportdata.push({
		team:'Total',
		pass:totalpasscount,
		fail:totalfailcount,
		total:totaltestcount,
		passper:totalpassper
	});		
	
	
	var outfile = rootdir + '/out/'+jobname+'.html';
	
	fs.writeFileSync(outfile, '<html><head><style>table {table-layout: fixed; border-collapse: collapse; width: 100%;}td {border: 1px solid #000;}.wide {width: 150px;}</style></head><body><table style="font-family:calibri;width:100%">'); 
	fs.appendFileSync(outfile, '<tr bgcolor="#A8D9E2"><td colspan="8"><b>SUMMARY</b></td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">BUILD ID</td><td colspan="4">'+buildinfo+'</td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">PASS PERCENTAGE</td><td colspan="4">'+totalpassper+'%</td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">DURATION</td><td colspan="4">'+duration+'</td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">SERVER IP</td><td colspan="4">'+serverip+'</td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">AW URL</td><td colspan="4"><a href="'+ awurl +'">AW ENV URL</a></td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">CUCUMBER REPORT</td><td colspan="4"><a href="'+ cucuresult +'">CUCUMBER REPORT</a></td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">PLM DASHBOARD</td><td colspan="4"><a href="'+ dashurl +'">DASHBOARD REPORT</a></td></tr>'); 
	fs.appendFileSync(outfile, '<tr><td colspan="4">BROWSER</td><td colspan="4">'+browsertype+'</td></tr>'); 
	fs.appendFileSync(outfile, '<tr bgcolor="#A8D9E2"><td colspan="8"><b>DETAILS</b></td></tr>'); 
	fs.appendFileSync(outfile, '<tr bgcolor="#A8D9E2"><td colspan="4"><b>TEAM</b></td><td colspan="1"><b>PASS</b></td><td colspan="1"><b>FAIL</b></td><td colspan="1"><b>TOTAL</b></td><td colspan="1"><b>PASS %</b></td></tr>');
	
	for( k=0; k<reportdata.length; k++) 
	{
		var test = searchByKey('passper', reportdata[k]);
		var colornum = '';
		if (test > 95)
		{
			colornum = '#CAF5A5';
		}
		else if(test > 85 && test < 95)
		{
			colornum = '#F9FCA8';
		}
		else if (test < 85)
		{
			colornum = '#F99377';
		}
		
		fs.appendFileSync(outfile, '<tr ><td colspan="4"><a href="'+ baseurl + '/' + searchByKey('team', reportdata[k])+'.html">'+searchByKey('team', reportdata[k])+'</td>'+
								   '<td colspan="1">'+searchByKey('pass', reportdata[k])+'</td>'+
								   '<td colspan="1">'+searchByKey('fail', reportdata[k])+'</td>'+
								   '<td colspan="1">'+searchByKey('total', reportdata[k])+'</td>'+
								   '<td colspan="1" bgcolor="'+colornum+'">'+searchByKey('passper', reportdata[k])+' %</td></tr>');
	}
	
	fs.appendFileSync(outfile, '</body><html>'); 
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

/*
Get Key value
*/
function getKeyValue(data,keyVal)
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

  				for(var i=0;i<arr.length;i++) 
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

function getValueByKey(key, data) {
    var i, len = data.length;
    
    for (i = 0; i < len; i++) {
        if (data[i] && data[i].hasOwnProperty(key)) {
            return data[i][key];
        }
    }    

    return -1;
}

function getValueByName(key, data) {
    var i, len = data.length;
    
    for (i = 0; i < len; i++) 
    {		
    	if (data[i].name == key)
    	{
    		return data[i].value;		
    	}
    }
    
    return -1;
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