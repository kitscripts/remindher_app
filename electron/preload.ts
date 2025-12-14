import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  saveTasks: (tasks: any) => ipcRenderer.invoke('save-tasks', tasks),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  onTriggerReminder: (callback: (task: any) => void) => {
    const subscription = (_event: any, task: any) => callback(task)
    ipcRenderer.on('trigger-reminder', subscription)
    return () => ipcRenderer.removeListener('trigger-reminder', subscription)
  },
  onTasksUpdated: (callback: (tasks: any[]) => void) => {
    const subscription = (_event: any, tasks: any[]) => callback(tasks)
    ipcRenderer.on('tasks-updated', subscription)
    return () => ipcRenderer.removeListener('tasks-updated', subscription)
  }
})
