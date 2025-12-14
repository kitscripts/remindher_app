# RemindHer 🌸

**RemindHer** is a desktop reminder application designed to empower and assist. It combines smart task management with daily motivation, all wrapped in a beautiful, user-friendly interface.

## Features ✨

- **Smart Reminders**: Set one-time or recurring reminders (hourly, daily, weekly).
- **Work-Life Balance**: Automatically adjusts reminder times to fit your defined working hours. No more pings at midnight!
- **Empowerment**: Features a daily rotating "Empowering Quote" to brighten your day.
- **Visual Progress**: Track your daily achievements with completion statistics on both the Home dashboard and Calendar view.
- **Calendar View**: Interactive calendar to view and manage tasks for any specific day.
- **Focus Mode**: Input fields are optimized for quick entry without distractions.

## building for macOS 🍎

This project includes a **GitHub Actions** workflow to automatically build the macOS installer (`.dmg`), even if you don't own a Mac.

1. **Push** this code to GitHub.
2. Go to the **Actions** tab.
3. Click on the **Build Mac App** workflow run.
4. Download the `RemindHer-Mac-Installer` artifact.
5. Unzip and run!

## Development

This app is built with:
- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)

### Running Locally

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for Windows
npm run build:win
```

## License

MIT
