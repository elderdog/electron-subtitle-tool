import fs from 'node:fs'
import path from 'node:path'
import { clipboard, dialog, globalShortcut, ipcMain } from 'electron'

const SUBTITLE_EXTS = ['.srt', '.ass']

// 格式化内容，返回字幕块数据
function formatContentToBlocks(content: string) {
  const lines = content.split(/\n+/).filter(line => line.length > 0)
  const blocks = []
  for (let i = 0; i < lines.length; i += 3) {
    blocks.push({
      id: lines[i],
      time: lines[i + 1],
      text: lines[i + 2]
    })
  }
  return blocks
}

// 格式化内容，返回字幕行数据
function formatContentToLines(content: string) {
  return content.split(/\n+/).filter(line => line.length > 0)
}

// 获取指定目录下的字幕文件列表
function getSubtitleFileList(folderPath: string) {
  const files = fs.readdirSync(folderPath, { withFileTypes: true })
  return files
    .filter(item => item.isFile() && SUBTITLE_EXTS.includes(path.extname(item.name).toLowerCase()))
    .map(file => {
      const filepath = path.join(folderPath, file.name)
      return {
        name: file.name,
        path: filepath
      }
    })
}

// 选择目录
function chooseFolder() {
  return dialog.showOpenDialogSync({ properties: ['openDirectory'] })
}

// 选择文件并返回格式化后的字幕行数据
function chooseFile() {
  const files = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{ name: 'Subtitle', extensions: ['srt', 'ass'] }]
  })
  if (!files)
    return []
  const content = fs.readFileSync(files[0], 'utf-8')
  return formatContentToLines(content)
}

// 拷贝指定文件的文本内容
function copyContentFromFile(filepath: string) {
  const content = fs.readFileSync(filepath, 'utf-8')
  clipboard.writeText(content)
}

function getContentBlocks(filepath: string) {
  const content = fs.readFileSync(filepath, 'utf-8')
  return formatContentToBlocks(content)
}

function saveClipboardContentToFile() {
  const content = clipboard.readText()
  const destPath = dialog.showSaveDialogSync({
    message: 'Save subtitle file',
    properties: ['showOverwriteConfirmation'],
    filters: [{ name: 'unknown', extensions: ['srt', 'ass'] }]
  })
  if (!destPath)
    return
  const data = formatContentToBlocks(content).map(block => {
    return `${block.id}\n${block.time}\n${block.text}`
  }).join('\n\n')
  fs.writeFileSync(destPath, data)
  dialog.showMessageBox({
    type: 'info',
    message: `😃 ${path.basename(destPath)} saved success`
  })
}

export function registerHandler() {
  const key = 'CommandOrControl+Shift+J'
  globalShortcut.register(key, saveClipboardContentToFile)

  ipcMain.on('file:get_subtitle_file_list', (event: Electron.IpcMainEvent, folderPath: string) => {
    event.returnValue = getSubtitleFileList(folderPath)
  })

  ipcMain.on('file:copy_content', (event: Electron.IpcMainEvent, filepath: string) => {
    event.returnValue = copyContentFromFile(filepath)
  })

  ipcMain.on('file:get_content_blocks', (event: Electron.IpcMainEvent, filepath: string) => {
    event.returnValue = getContentBlocks(filepath)
  })

  ipcMain.on('dialog:choose_folder', (event: Electron.IpcMainEvent) => {
    event.returnValue = chooseFolder()
  })

  ipcMain.on('dialog:choose_file', (event: Electron.IpcMainEvent) => {
    event.returnValue = chooseFile()
  })
}
