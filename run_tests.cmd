@ECHO OFF
set PLAT=wntx64

@REM Update the base directoy path
set ROOT=%CD%
set TOOLBOX_HOME=%ROOT%/toolbox

::@REM Set JAVA_HOME (required)
set JAVA_HOME=C:\PROGRA~1\Java\jdk1.8.0_121

::@REM Set server information (required)
::set AW_SERVER_VERSION=aw31_101x.663
::set TC_SERVER_VERSION=V10000.1.0.60_20160209.00

::@REM Set USER (required)
set USER=test

::@REM Set DEV_UNIT (optional, defaults to PV_TEST)
::set DEV_UNIT=PV_TEST

@REM Where to upload results to
::set CUCUMBER_RESULTS_SERVER=http://awc/cucumberHistory

@REM Open results automatically - only opens when 'true'
::set CUCUMBER_AUTO_OPEN=true

:: Apply Parameters
::set AW_BASELINE=aw3.0.2015091522
::set AW_VERSION=AW30
::set AW_BUILD=AW30(0917a)
::set TC_BUILD=TcUA1121(0902)
::set BROWSER_VER=Chrome 44.0.2403.130
::set SRV_OS=Windows 2008 R2 Std
::set CLIENT_OS=Windows 7 Ent SP1
::set DB_TYPE=Oracle 11G R2
::set APP_SRV=Weblogic 12c

::Kill existing open browser
::TASKKILL /f /fi "IMAGENAME eq iexplorer.exe"
::TASKKILL /f /fi "IMAGENAME eq firefox.exe"
::TASKKILL /f /fi "IMAGENAME eq chrome.exe"
::TASKKILL /f /fi "IMAGENAME eq chromedriver.exe"

:: Enable it only when trying to run SCP test cases
::set PERFORMANCE_LOG=1

:: Setting up the envirnoment variables
set NODEJS_HOME=%TOOLBOX_HOME%/wntx64/nodejs/4.2.0
set GWT_HOME=%TOOLBOX_HOME%/gwt/2.7.0
set HAMCREST_HOME=%TOOLBOX_HOME%/hamcrest_core/1.3
::set FINDBUGS_HOME=%TOOLBOX_HOME%/findbugs/findbugs-2.0.3
set CHROME_DRIVER=%ROOT%/drivers/chromedriver.exe
set IE_DRIVER=%ROOT%/drivers/IEDriverServer.exe
set PATH=%PATH%;%ROOT%/src/build/tools;%NODEJS_HOME%;%JAVA_HOME%/bin;%HAMCREST_HOME%;%CHROME_DRIVER%;%IE_DRIVER%;
cd /d %ROOT%

set ERROR_LEVEL=0
if "%USER%"=="" (
    echo USER variable is not set!
    set ERROR_LEVEL=1
)

if "%JAVA_HOME%"=="" (
    echo JAVA_HOME variable is not set!
    set ERROR_LEVEL=1
)

if %ERROR_LEVEL%==1 (
    exit /B 1
)

@ECHO ON
::Here are following examples

@REM Update the AW test URL
::set CUCUMBER_TEST_URL=http://awc/33/wd1123/aw

@REM Update the browser you need to run, valid values are firefox, chrome, ie
::set CUCUMBER_TEST_BROWSER=chrome

:: To run CI tests
::cucumber -Dcucumber.options="%ROOT%\src\test\acceptance\cucumbertests\featureFiles --tags @ci"
::cucumber -Dcucumber.options="%ROOT%\src\test\acceptance\cucumbertests\featureFiles --tags @docmgmt,@socialcollab,@servicemanager" 

:: To run SCP test cases with 3 processes
::cucumber -Dcucumber.options="%ROOT%/src/test/acceptance/cucumbertests/featureFiles --tags @scp" -Dproc=3

:: To run test cases applicable to a specfic version on release
::cucumber -Dcucumber.options="%ROOT%/src/test/acceptance/cucumbertests/featureFiles --tags @cfx --tags ~@tc9 --tags ~@tc11"

:: To run test cases from mutiple features
::cucumber -Dcucumber.options="%ROOT%/src/test/acceptance/cucumbertests/featureFiles --tags @cfx,@ace --tags ~@tc9 --tags ~@tc11"

:: To run all test cases
::cucumber -Dcucumber.options="%ROOT%/src/test/acceptance/cucumbertests/featureFiles"