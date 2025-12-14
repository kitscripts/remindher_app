const { app } = require('electron');
console.log('App is:', app);
if (app) {
    console.log('Success: electron module resolved correctly');
    app.quit();
} else {
    console.log('Failure: app is undefined');
    console.log('Resolved electron:', require.resolve('electron'));
}
