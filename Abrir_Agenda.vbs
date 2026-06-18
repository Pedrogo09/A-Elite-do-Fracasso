Set WshShell = CreateObject("WScript.Shell")
strPath = WScript.ScriptFullName
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objFile = objFSO.GetFile(strPath)
strFolder = objFSO.GetParentFolderName(objFile)

WshShell.CurrentDirectory = strFolder

' Usa o Python global (que tem o pywebview instalado) para o orquestrador
' O orchestrator.py vai ativar o venv internamente para o backend
Dim pythonGlobal
pythonGlobal = "C:\Users\11PI12\AppData\Local\Programs\Python\Python314\pythonw.exe"

WshShell.Run Chr(34) & pythonGlobal & Chr(34) & " orchestrator.py", 0, False
