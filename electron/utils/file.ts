import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { clipboard, dialog, globalShortcut, ipcMain } from 'electron'

const SUBTITLE_EXTS = ['.srt', '.ass']
const ID_REG = /^\d+\s*$/
const TIME_REG = /^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\s*/

// 格式化内容，返回字幕块数据
function formatContentToBlocks(content: string) {
  const lines = formatContentToLines(content)
  const blocks = []
  for (let i = 0; i < lines.length;) {
    const current = lines[i]
    const next = lines[i + 1]
    if (current && next && ID_REG.test(current) && TIME_REG.test(next)) {
      let text = ''
      if (lines[i + 3] && TIME_REG.test(lines[i + 3])) {
        i += 2
      } else {
        text = lines[i + 2]
        i += 3
      }
      blocks.push({
        id: current,
        time: next,
        text
      })
    } else {
      i++
    }
  }
  return blocks
}

// 格式化内容，返回字幕行数据
function formatContentToLines(content: string) {
  return content.replace(/\r\n/g, '\n').split(/\n+/).filter(line => line.length > 0)
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
    return null
  const content = fs.readFileSync(files[0], 'utf-8')
  return {
    path: files[0],
    blocks: formatContentToBlocks(content)
  }
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
    return `${block.id}\n${block.time}\n${block.text || ''}`
  }).join('\n\n')
  fs.writeFileSync(destPath, data)
  dialog.showMessageBox({
    type: 'info',
    message: `😃 ${path.basename(destPath)} saved success`
  })
}

function openFileViaSublime(filepath: string) {
  const sublimeExecutable = '/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl'
  if (!fs.existsSync(sublimeExecutable)) {
    dialog.showMessageBox({
      type: 'error',
      message: '🚫 Sublime Text not found'
    })
    return
  }

  const args = ['--new-window', filepath]
  try {
    const child = spawn(sublimeExecutable, args)
    child.on('error', err => {
      dialog.showMessageBox({
        type: 'error',
        message: `🚫 Open Sublime Text failed\n\n${err.message}`
      })
    })
  } catch (err) {
    dialog.showMessageBox({
      type: 'error',
      message: `🚫 Open Sublime Text failed\n\n${(err as any).message}`
    })
  }
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

  ipcMain.on('file:open_via_sublime', (event: Electron.IpcMainEvent, filepath: string) => {
    event.returnValue = openFileViaSublime(filepath)
  })

  ipcMain.on('dialog:choose_folder', (event: Electron.IpcMainEvent) => {
    event.returnValue = chooseFolder()
  })

  ipcMain.on('dialog:choose_file', (event: Electron.IpcMainEvent) => {
    event.returnValue = chooseFile()
  })
}
