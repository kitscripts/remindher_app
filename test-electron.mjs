import electron from 'electron';
const { app } = electron;

console.log('Default export:', electron);
console.log('Named export app:', app);

if (app) {
    console.log('Success: electron (ESM) resolved correctly');
    app.quit();
} else {
    console.log('Failure: app is undefined');
}
