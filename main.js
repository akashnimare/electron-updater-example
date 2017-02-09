// Copyright (c) The LHTML team
// See LICENSE for details.

const {app, BrowserWindow, Menu, protocol, ipcMain, dialog} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

//-------------------------------------------------------------------
// Logging
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Define the menu
//-------------------------------------------------------------------
let template = []
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}


//-------------------------------------------------------------------
// Open a window that displays the version
//-------------------------------------------------------------------
let win;
function createDefaultWindow() {
  win = new BrowserWindow();
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createDefaultWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

function sendStatus(text) {
  log.info(text);
  win.webContents.send('message', text);
}

//-------------------------------------------------------------------
// Auto updates
//-------------------------------------------------------------------
autoUpdater.on('checking-for-update', () => {
  sendStatus('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  sendStatus('Update available.');
  log.info('info', info);
})
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatus('Update not available.');
  log.info('info', info);
})
autoUpdater.on('error', (ev, err) => {
  sendStatus('Error in auto-updater.');
  log.info('err', err);
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  sendStatus('Download progress...');
  log.info('progressObj', progressObj);
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatus('Update downloaded.  Will quit and install in 5 seconds.');
  log.info('info', info);
  log.info('ReleaseNotes',info.releaseNotes);
  log.info('ReleaseName', info.releaseName);

let message = app.getName() + ' ' + info.releaseName + ' is now available. It will be installed the next time you restart the application.';
		if (info.releaseNotes) {
			const splitNotes = info.releaseNotes.split(/[^\r]\n/);
			message += '\n\nRelease notes:\n';
			splitNotes.forEach(notes => {
				message += notes + '\n\n';
			});
		}
		// Ask user to update the app
		dialog.showMessageBox({
			type: 'question',
			buttons: ['Install and Relaunch', 'Later'],
			defaultId: 0,
			message: 'A new version of ' + app.getName() + ' has been downloaded',
			detail: "It will be installed the next time you restart the application"
		}, response => {
			if (response === 0) {
				setTimeout(() => autoUpdater.quitAndInstall(), 1);
			}
		});
	}

 )
// Wait a second for the window to exist efore checking for updates.
setTimeout(function() {
  autoUpdater.checkForUpdates()
}, 9000);
