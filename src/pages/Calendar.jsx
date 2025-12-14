import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addMonths, subMonths } from 'date-fns'

export default function Calendar() {
    const [tasks, setTasks] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [editValue, setEditValue] = useState('')

    useEffect(() => {
        const loadTasks = async () => {
            const t = await window.api.getTasks() || []
            setTasks(t)
        }
        loadTasks()

        const unsubscribe = window.api.onTasksUpdated((newTasks) => {
            setTasks(newTasks)
        })
        return () => unsubscribe()
    }, [])

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const getDayStatus = (day) => {
        const tasksForDay = tasks.filter(t => isSameDay(new Date(t.nextReminder), day))
        if (tasksForDay.length === 0) return 'transparent'
        const allDone = tasksForDay.every(t => t.completed)
        return allDone ? 'var(--cal-done)' : 'var(--cal-pending)'
    }

    // --- Task Logic (Reused/Adapted) ---
    const toggleComplete = async (task) => {
        const newTasks = tasks.map(t => {
            if (t.id === task.id) {
                const isCompleting = !t.completed
                let newReminder = t.nextReminder

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

    // Filter tasks for selected date
    const selectedDateTasks = selectedDate
        ? tasks.filter(t => isSameDay(new Date(t.nextReminder), selectedDate))
        : []

    return (
        <div>
            {selectedDate && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onClick={() => setSelectedDate(null)}>
                    <div className="card" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Tasks for {format(selectedDate, 'MMM d, yyyy')}</h2>
                            <button onClick={() => setSelectedDate(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {selectedDateTasks.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No tasks for this day.</p>
                        ) : (
                            <div className="task-list">
                                {selectedDateTasks.map(task => (
                                    <div key={task.id} className="card task-card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', padding: '0.8rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => toggleComplete(task)}
                                            style={{ width: '20px', height: '20px', marginRight: '1rem' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{task.name}</h3>

                                            {editingTaskId === task.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <input
                                                        type="datetime-local"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        style={{ padding: '0.25rem' }}
                                                    />
                                                    <button onClick={() => saveReminder(task.id)} style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                                                    <button onClick={cancelEditing} style={{ padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid currentColor' }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <small style={{ color: 'var(--text-muted)' }}>
                                                        {new Date(task.nextReminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setCurrentDate(d => subMonths(d, 1))}> Prev </button>
                <h2>{format(monthStart, 'MMMM yyyy')}</h2>
                <button className="btn btn-secondary" onClick={() => setCurrentDate(d => addMonths(d, 1))}> Next </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)' }}>{d}</div>
                ))}

                {calendarDays.map(day => {
                    const bg = getDayStatus(day)
                    const dayTasks = tasks.filter(t => isSameDay(new Date(t.nextReminder), day))

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            style={{
                                background: bg,
                                borderRadius: '8px',
                                minHeight: '80px',
                                padding: '5px',
                                border: isSameDay(day, new Date()) ? '2px solid var(--primary)' : '1px solid #eee',
                                cursor: 'pointer',
                                transition: 'transform 0.1s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
                                    {dayTasks.length > 0 &&
                                        `${Math.round((dayTasks.filter(t => t.completed).length / dayTasks.length) * 100)}% (${dayTasks.filter(t => t.completed).length}/${dayTasks.length})`
                                    }
                                </span>
                                <span>{format(day, 'd')}</span>
                            </div>
                            {dayTasks.map(t => (
                                <div key={t.id} style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(255,255,255,0.7)',
                                    borderRadius: '4px',
                                    padding: '2px 4px',
                                    marginBottom: '2px',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    textDecoration: t.completed ? 'line-through' : 'none',
                                    opacity: t.completed ? 0.6 : 1
                                }}>
                                    {t.name}
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
