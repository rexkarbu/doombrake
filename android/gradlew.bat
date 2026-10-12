@rem
@rem Gradle wrapper start-up script for Windows.
@rem
@rem IMPORTANT: This script downloads Gradle automatically on first run.
@rem Requires JDK 17 or newer.
@rem

@if "%DEBUG%"=="" @echo off

set APP_HOME=%~dp0
set CLASSPATH=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

@rem Determine the Java command to use
if defined JAVA_HOME (
    set "JAVACMD=%JAVA_HOME%\bin\java.exe"
    if not exist "%JAVACMD%" (
        echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
        echo Please set the JAVA_HOME variable to a JDK 17+ installation.
        exit /b 1
    )
) else (
    set "JAVACMD=java.exe"
    where java >nul 2>nul
    if errorlevel 1 (
        echo ERROR: JAVA_HOME is not set and 'java' was not found in PATH.
        echo Please set JAVA_HOME to a JDK 17+ installation.
        exit /b 1
    )
)

@rem Check if wrapper jar exists
if not exist "%CLASSPATH%" (
    echo ERROR: gradle-wrapper.jar not found at %CLASSPATH%
    echo.
    echo Please download it manually:
    echo   1. Go to https://services.gradle.org/distributions/gradle-8.9-bin.zip
    echo   2. Extract and copy gradle/wrapper/gradle-wrapper.jar
    echo   3. Place it at: %CLASSPATH%
    echo.
    echo Or run: gradlew on Linux/macOS which auto-downloads it.
    exit /b 1
)

"%JAVACMD%" %JAVA_OPTS% -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
