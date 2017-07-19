# aw-dashboard-new

aw-dashboard
<ul>
<li>Install Nodejs, Mongodb, and Robomongo</li>
<li>once the repo has been cloned on your machine, open the directory in command prompt and run 'npm install'</li>
<li>After npm install completes, navigate to Public directory inside command prompt, and run 'bower install'</li>
<li>Get the database dump from the server, and restore it on your local machine To restore, use mongorestore. (Open the command prompt, navigate to the directory containing the dump directory, and run the mongorestore command)</li>
<li>In the directory with code, naviaget to the config folder. Here, change the connection strings to represent the authentication mechanism and username/password. If there is no authentication mechanism, just use the following string: module.exports={ testDbUrl:'mongodb://localhost:27017/AW_AUTOTEST_DATA', trendsDbUrl:'mongodb://localhost:27017/AW_TRENDS_DATA', mapDbUrl:'mongodb://localhost:27017/AWMAP' }</li>
</ul>
In case you have secured your mongodb with a username password combo, ue something like this:

module.exports={ testDbUrl:'mongodb://username:password@localhost:27017/AW_AUTOTEST_DATA?authMechanism=SCRAM-SHA-1', trendsDbUrl:'mongodb://username:password@localhost:27017/AW_TRENDS_DATA?authMechanism=SCRAM-SHA-1', mapDbUrl:'mongodb://username:password@localhost:27017/AWMAP?authMechanism=SCRAM-SHA-1' }

To start the application, use the following command: node server.js / nodemon server.js
