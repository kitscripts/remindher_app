import { useState, useEffect } from 'react'

export default function Home() {
    const [tasks, setTasks] = useState([])
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [editValue, setEditValue] = useState('')

    const fetchTasks = async () => {
        const allTasks = await window.api.getTasks() || []
        setTasks(allTasks)
    }

    useEffect(() => {
        fetchTasks()
        const unsubscribe = window.api.onTasksUpdated((newTasks) => {
            setTasks(newTasks)
        })
        return () => unsubscribe()
    }, [])

    const toggleComplete = async (task) => {
        const newTasks = tasks.map(t => {
            if (t.id === task.id) {
                const isCompleting = !t.completed
                let newReminder = t.nextReminder

                // If marking as complete and date is in future, snap to NOW
                // This prevents "tomorrow's" auto-moved task from showing as completed "tomorrow"
                if (isCompleting && new Date(newReminder) > new Date()) {
                    newReminder = new Date().toISOString()
                }

                return { ...t, completed: !t.completed, nextReminder: newReminder }
            }
            return t
        })
        await window.api.saveTasks(newTasks)
        setTasks(newTasks)
    }

    const startEditing = (task) => {
        setEditingTaskId(task.id)
        // Format for datetime-local input: YYYY-MM-DDThh:mm
        const date = new Date(task.nextReminder)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        setEditValue(`${year}-${month}-${day}T${hours}:${minutes}`)
    }

    const saveReminder = async (taskId) => {
        if (!editValue) return

        const newTasks = tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, nextReminder: new Date(editValue).toISOString() }
            }
            return t
        })

        await window.api.saveTasks(newTasks)
        setTasks(newTasks)
        setEditingTaskId(null)
    }

    const cancelEditing = () => {
        setEditingTaskId(null)
        setEditValue('')
    }

    // Filter tasks due today or earlier for stats
    const now = new Date()
    const allTodayTasks = tasks.filter(t => {
        // Simple check: due before end of today
        // Or basically all active tasks that haven't been rescheduled far into future
        // For simplicity and "Today's Tasks", we consider anything "due" <= now + rest of day
        // But "tasks" only has one instance. 
        // If completed, it stays completed. 
        // Let's count everything that is <= end of today.
        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)
        return new Date(t.nextReminder) <= endOfToday
    })

    const totalStats = allTodayTasks.length
    const completedStats = allTodayTasks.filter(t => t.completed).length
    const percent = totalStats === 0 ? 0 : Math.round((completedStats / totalStats) * 100)

    const completedTasks = tasks.filter(t => t.completed)
    const pendingTasks = tasks.filter(t => !t.completed)

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Today's Tasks</h1>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {percent}% ({completedStats}/{totalStats})
                </span>
            </div>
            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <p className="empty-state">No tasks for today. Add some!</p>
            ) : (
                <div className="task-list">
                    {pendingTasks.length === 0 && completedTasks.length > 0 && (
                        <p className="empty-state">All active tasks completed! Great job!</p>
                    )}

                    {pendingTasks.map(task => (
                        <div key={task.id} className="card task-card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleComplete(task)}
                                style={{ width: '20px', height: '20px', marginRight: '1rem', marginBottom: 0 }}
                            />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{task.name}</h3>

                                {editingTaskId === task.id ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="datetime-local"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            style={{ padding: '0.25rem' }}
                                        />
                                        <button onClick={() => saveReminder(task.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</button>
                                        <button onClick={cancelEditing} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--text-color)' }}>Cancel</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <small style={{ color: 'var(--text-muted)' }}>
                                            Next reminder: {new Date(task.nextReminder).toLocaleString()}
                                        </small>
                                        <button
                                            onClick={() => startEditing(task)}
                                            style={{
                                                padding: '0.1rem 0.5rem',
                                                fontSize: '0.8rem',
                                                background: 'transparent',
                                                border: '1px solid var(--primary-color)',
                                                color: 'var(--primary-color)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {completedTasks.length > 0 && (
                        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <h3 style={{ color: 'var(--text-muted)' }}>Completed Tasks</h3>
                            {completedTasks.map(task => (
                                <div key={task.id} className="card task-card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleComplete(task)}
                                        style={{ width: '20px', height: '20px', marginRight: '1rem', marginBottom: 0 }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{task.name}</h3>
                                        <small style={{ color: 'var(--text-muted)' }}>
                                            Done
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
