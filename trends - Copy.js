var jenkinurl = 'http://cii6s116:8080/';
var EventEmitter = require("events").EventEmitter;
var jenkinsapi = require('jenkins-api');
var jenkins = jenkinsapi.init(jenkinurl);
var mongojs = require('mongojs');
var argv = require('yargs').argv;
var async = require('async');



async.waterfall
(
	[
		var jobname=argv.jobname;
		//var jobname = 'AW32_Tc1015_ORACLE_J2EE_Initial';
		//var jobname = 'AW33_Tc1123_ORACLE_J2EE_Full';
		var processData = [];

		var db =mongojs('AW_TRENDS_DATA');
		getlastbuildid(jobname);

		console.log("Out of everything");
		function getlastbuildid(jobname, cb)
		{
			var jenkinsapi = require('jenkins-api');
			var jenkins = jenkinsapi.init(jenkinurl);
			
			var jenkinsdata = new EventEmitter();	
			
			jenkins.last_build_info(jobname, function(err, data)
			{
				if (err)
					{ 
						cb(err, null);
					}
					cb(null, jobname, data.id)
			});
			
			console.log("Out of everything");
		}

		function gettrenddata(jobname, maxjobcount, cb)
		{	
			for(var jobcount = 0; jobcount<maxjobcount; jobcount++)
			{
				getbuilddata(jobname, jobcount+1);
			}
		}

		function getbuilddata(jobname, buildid, cb)
		{
			
				var jenkinsdata = new EventEmitter();	
				
				jenkins.build_info(jobname, buildid, function(err, data)
				{
					if (err){ return console.log(err); }			
					jenkinsdata.data = data;
					jenkinsdata.emit('update');		
				});	
				
				jenkinsdata.on('update', function () {			
			
					var buildparam = getValueByKey('parameters',jenkinsdata.data.actions);
					var total = getValueByKey('totalCount',jenkinsdata.data.actions);			
					if (total > 0)
					{	
						var d = new Date(jenkinsdata.data.timestamp);
						getjsondata(jenkinsdata.data);
					}			
				});			
		}

		function getjsondata(data, cb)
		{
			var fs = require('fs');
			var totalduration = getduration(data);
			var buildparams = getValueByKey('parameters',data.actions);
			var total = getValueByKey('totalCount',data.actions);
			var fail = getValueByKey('failCount',data.actions);
			var pass = total - fail;
			var passpercentage = (((total - fail)/total)*100).toFixed(2);	
			var buildid = getValueByName('BUILD_INFO',buildparams);
			var d = new Date(data.timestamp);
			var dateval = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
			
			var jobname = data.fullDisplayName.substring(0,data.fullDisplayName.indexOf(' '));
			var outfile = __dirname + '/out/'+jobname+'.json';
			
			var build = (buildid).split("_");
			var id1 = build[1];
			var platform1 = build[2];
			if( passpercentage != 0)
			{
				processData.push({		
					jobid:data.id,
					id:id1,
					platform:platform1,
					awbuild:buildid,
					date:dateval,		
					timestamp:data.timestamp,
					testduration:totalduration,
					totaltest:total,
					passtest:pass,
					failtest:fail,
					passper:passpercentage
					
				});
			}
			
			
			processData= processData.sort(timecomparator);
			fs.writeFileSync(outfile, JSON.stringify(processData, null, 2) , 'utf-8'); 
			
			var jobinfo = jobname.split('_');
			var releaseinfo = jobinfo[0];
			
			var colname = '';
			
			if (releaseinfo == 'AW33')
			{
				colname = 'AW33_TRENDS_DATA';
			}
			else
			{
				colname = 'AW32_TRENDS_DATA';
			}

			db.collection(colname).save({_id:jobname, 'Details':processData});
			console.log('Done');
			db.close();
		}	
	], 
    function( err, result )
    {
        console.log("Results saved to Database.");
    }	
)


function timecomparator(a, b) 
{
   if (a.timestamp > b.timestamp) return -1;
   if (a.timestamp < b.timestamp) return 1;
   return 0;
}

function getduration(data)
{
	var moment = require('moment');	
	var x = data.duration;
	var d = moment.duration(x, 'milliseconds');
	var hours = Math.floor(d.asHours());
	var mins = Math.floor(d.asMinutes()) - hours * 60;	
	var duration = hours + 'hrs ' + mins + 'mins';
	return duration;
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
    	if (data[i].name == key){
    		return data[i].value;		
    	}
    }
    
    return -1;
}


