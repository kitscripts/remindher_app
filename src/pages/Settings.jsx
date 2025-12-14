import { useState, useEffect } from 'react'

export default function Settings() {
    const [start, setStart] = useState('09:00')
    const [end, setEnd] = useState('17:00')
    const [status, setStatus] = useState('')

    useEffect(() => {
        const load = async () => {
            const s = await window.api.getSettings()
            if (s) {
                setStart(s.workStart)
                setEnd(s.workEnd)
            }
        }
        load()
    }, [])

    const handleSave = async () => {
        await window.api.saveSettings({ workStart: start, workEnd: end })
        setStatus('Settings Saved!')
        setTimeout(() => setStatus(''), 2000)
    }

    return (
        <div>
            <h1>Settings</h1>
            <div className="card">
                <h3>Working Hours</h3>
                <p>Reminders will only be shown during these hours.</p>

                <label>Start Time</label>
                <input type="time" value={start} onChange={e => setStart(e.target.value)} />

                <label>End Time</label>
                <input type="time" value={end} onChange={e => setEnd(e.target.value)} />

                <button className="btn" onClick={handleSave}>Save Settings</button>
                {status && <p style={{ color: 'var(--success)', marginTop: '0.5rem', fontWeight: 'bold' }}>{status}</p>}
            </div>
        </div>
    )
}
