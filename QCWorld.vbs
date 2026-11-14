' Mo QC World - the gioi mo cua Master Dashboard (khong hien cua so CMD)
' 1) Bat Master Dashboard chay ngam (neu da chay thi bo qua)
' 2) Tat server QC World cu (neu con sot), chay server moi http://127.0.0.1:8770 (chi may nay vao duoc, khong cache code)
' 3) Cho server san sang roi mo trinh duyet
' Chay "QCWorld.vbs noopen" de chi bat server, khong mo trinh duyet.
Option Explicit
Dim fso, here, dash, sh, py, i, ok
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
dash = fso.GetAbsolutePathName(here & "\..\Master Dashboard")
Set sh = CreateObject("Wscript.Shell")
sh.CurrentDirectory = here
py = dash & "\runtime\pythonw.exe"
If Not fso.FileExists(py) Then py = "pythonw"

If fso.FileExists(dash & "\app\server.py") Then
  sh.Run """" & py & """ """ & dash & "\app\server.py"" --background", 0, False
End If

KillOldServers
sh.Run """" & py & """ """ & here & "\serve.py"" 8770", 0, False

ok = False
For i = 1 To 40
  WScript.Sleep 250
  If Alive() Then
    ok = True
    Exit For
  End If
Next
If Not ok Then
  MsgBox "Khong bat duoc server QC World (cong 8770)." & vbCrLf & "Hay chay Tat_QCWorld.bat roi mo lai QCWorld.vbs.", vbExclamation, "QC World"
  WScript.Quit 1
End If

If WScript.Arguments.Count = 0 Then
  sh.Run "msedge --app=http://127.0.0.1:8770/world.html --window-size=1400,880", 1, False
End If

' Tat moi server Python dang phuc vu QC World o cong 8770 (ban cu chay bang pythonw co the tra trang rong)
Sub KillOldServers()
  Dim wmi, p, c, n
  n = 0
  Set wmi = GetObject("winmgmts:\\.\root\cimv2")
  For Each p In wmi.ExecQuery("SELECT * FROM Win32_Process WHERE Name LIKE 'python%'")
    c = LCase("" & p.CommandLine)
    If InStr(c, "8770") > 0 And (InStr(c, "http.server") > 0 Or InStr(c, "serve.py") > 0) Then
      On Error Resume Next
      p.Terminate
      On Error GoTo 0
      n = n + 1
    End If
  Next
  If n > 0 Then WScript.Sleep 500
End Sub

' Server QC World moi da tra loi chua
Function Alive()
  Dim x
  Alive = False
  On Error Resume Next
  Set x = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  x.setTimeouts 1000, 1000, 1000, 1000
  x.open "GET", "http://127.0.0.1:8770/__qcworld", False
  x.send
  If Err.Number = 0 Then
    If x.status = 200 Then Alive = True
  End If
  On Error GoTo 0
End Function
