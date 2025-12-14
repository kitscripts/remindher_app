import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// Initialize Store
const store = new Store({
  // @ts-ignore
  projectName: 'k-reminder-app',
  defaults: {
    tasks: [],
    settings: {
      workStart: '09:00',
      workEnd: '17:00'
    }
  }
})

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Helper to adjust time to working hours
function adjustTime(dateStr: string, settings: any): string {
  const date = new Date(dateStr)
  const [startH, startM] = settings.workStart.split(':').map(Number)
  const [endH, endM] = settings.workEnd.split(':').map(Number)

  const workStart = new Date(date)
  workStart.setHours(startH, startM, 0, 0)

  const workEnd = new Date(date)
  workEnd.setHours(endH, endM, 0, 0)

  // If before start, move to start of same day
  if (date < workStart) {
    return workStart.toISOString()
  }

  // If after end, move to start of next day
  if (date > workEnd) {
    const nextDay = new Date(workStart)
    nextDay.setDate(nextDay.getDate() + 1)
    return nextDay.toISOString()
  }

  return date.toISOString()
}

// IPC Handlers
ipcMain.handle('get-tasks', () => {
  return store.get('tasks')
})

ipcMain.handle('save-tasks', (_event, tasks) => {
  const settings = store.get('settings') as any
  // Adjust all task times to be within working hours
  const adjustedTasks = tasks.map((t: any) => {
    if (t.nextReminder && !t.completed) {
      return { ...t, nextReminder: adjustTime(t.nextReminder, settings) }
    }
    return t
  })
  store.set('tasks', adjustedTasks)
  return true
})

ipcMain.handle('get-settings', () => {
  return store.get('settings')
})

ipcMain.handle('save-settings', (_event, settings) => {
  store.set('settings', settings)
  return true
})

// Scheduler logic
setInterval(() => {
  if (!win) return

  const tasks = store.get('tasks', []) as any[]
  const settings = store.get('settings') as any
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes() // minutes from midnight

  // Parse working hours
  const [startH, startM] = settings.workStart.split(':').map(Number)
  const [endH, endM] = settings.workEnd.split(':').map(Number)
  const startTime = startH * 60 + startM
  const endTime = endH * 60 + endM

  // Check if within working hours
  if (currentTime < startTime || currentTime > endTime) {
    return // Out of working hours, do not remind
  }

  // Check tasks
  let updated = false
  const newTasks = tasks.map(t => {
    if (t.completed) return t

    if (t.nextReminder && new Date(t.nextReminder) <= now) {
      // Trigger Reminder
      // Trigger Reminder
      if (win) {
        if (win.isMinimized()) win.restore()
        win.show()
        win.setAlwaysOnTop(true)
        win.focus()
        // Reset always on top so it doesn't get stuck there
        setTimeout(() => {
          if (win) win.setAlwaysOnTop(false)
        }, 5000) // Keep on top for 5 seconds
        win.webContents.send('trigger-reminder', t)
      }

      // Calculate next reminder
      const nextDate = new Date(now)
      if (t.frequencyType === 'hours') {
        nextDate.setHours(nextDate.getHours() + t.frequencyValue)
      } else if (t.frequencyType === 'days') {
        nextDate.setDate(nextDate.getDate() + t.frequencyValue)
      } else if (t.frequencyType === 'weeks') {
        nextDate.setDate(nextDate.getDate() + (t.frequencyValue * 7))
      }

      const NextReminderAdjusted = adjustTime(nextDate.toISOString(), settings)

      updated = true
      return { ...t, nextReminder: NextReminderAdjusted }
    }
    return t
  })

  if (updated) {
    store.set('tasks', newTasks)
    win.webContents.send('tasks-updated', newTasks) // Notify renderer to refresh
  }

}, 1000) // Every 1 second

app.whenReady().then(createWindow)
