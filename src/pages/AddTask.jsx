import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'

export default function AddTask() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [freqValue, setFreqValue] = useState(1)
    const [freqType, setFreqType] = useState('hours')

    const handleSubmit = async (e) => {
        e.preventDefault()

        const now = new Date()
        let nextReminder = new Date(now)

        // Calculate initial reminder
        // Assuming immediate reminder is not desired, but "every X". 
        // Usually starts from now + interval.

        if (freqType === 'hours') {
            nextReminder.setHours(nextReminder.getHours() + parseInt(freqValue))
        } else if (freqType === 'days') {
            nextReminder.setDate(nextReminder.getDate() + parseInt(freqValue))
        } else if (freqType === 'weeks') {
            nextReminder.setDate(nextReminder.getDate() + (parseInt(freqValue) * 7))
        }

        const newTask = {
            id: uuidv4(),
            name,
            frequencyValue: parseInt(freqValue),
            frequencyType: freqType,
            nextReminder: nextReminder.toISOString(),
            completed: false,
            createdAt: now.toISOString()
        }

        const existing = await window.api.getTasks() || []
        await window.api.saveTasks([...existing, newTask])

        navigate('/')
    }

    return (
        <div>
            <h1>Add New Task</h1>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <label>Task Name</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., Drink Water"
                        required
                        autoFocus
                    />

                    <label>Remind me every...</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="number"
                            min="1"
                            value={freqValue}
                            onChange={e => setFreqValue(e.target.value)}
                            required
                            style={{ flex: 1 }}
                        />
                        <select
                            value={freqType}
                            onChange={e => setFreqType(e.target.value)}
                            style={{ flex: 1 }}
                        >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                        </select>
                    </div>

                    <button type="submit" className="btn" style={{ marginTop: '1rem', width: '100%' }}>
                        Save Task
                    </button>
                </form>
            </div>
        </div>
    )
}
