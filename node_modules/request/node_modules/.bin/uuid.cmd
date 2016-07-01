@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\node-uuid\bin\uuid" %*
) ELSE (
  node  "%~dp0\..\node-uuid\bin\uuid" %*
)