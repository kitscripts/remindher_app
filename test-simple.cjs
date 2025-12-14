try {
    console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);
    const electron = require('electron');
    console.log('Type of electron export:', typeof electron);
    console.log('Value:', electron);
    console.log('Resolved path:', require.resolve('electron'));
    console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);
} catch (e) {
    console.error(e);
}
