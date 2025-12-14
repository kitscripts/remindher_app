import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AddTask from './pages/AddTask'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'

// Main App component
export default function App() {
    const [reminderTask, setReminderTask] = useState(null)

    // Listen for reminders globally
    useEffect(() => {
        const off = window.api.onTriggerReminder((task) => {
            setReminderTask(task)

            // Play beep sound using Web Audio API
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext
                if (AudioContext) {
                    const ctx = new AudioContext()
                    const osc = ctx.createOscillator()
                    const gain = ctx.createGain()

                    osc.connect(gain)
                    gain.connect(ctx.destination)

                    osc.type = 'sine'
                    osc.frequency.value = 880 // A5

                    // Beep pattern
                    osc.start()
                    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5)
                    osc.stop(ctx.currentTime + 0.5)
                }
            } catch (e) {
                console.error("Audio error", e)
            }
        })
        return off
    }, [])

    const closeReminder = () => {
        setReminderTask(null)
    }

    return (
        <HashRouter>
            {reminderTask && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center', backgroundColor: 'var(--card-bg)' }}>
                        <h2 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Reminder!</h2>
                        <h1 style={{ fontSize: '2rem', margin: '1rem 0' }}>{reminderTask.name}</h1>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>It's time to work on this task.</p>
                        <button onClick={closeReminder} style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}>
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="add" element={<AddTask />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}
