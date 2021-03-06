const electron = require('electron')
const spawn = require('child_process').spawn;
const ps = require('process');
const http = require('http');
// Module to control application life.
const app = electron.app;
const protocol = electron.protocol;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const pids = [];

function createWindow () {
  // Create the browser window.

  if (!mainWindow) {
    mainWindow = new BrowserWindow({width: 800, height: 600, title: "SampleDB" })
  }
  
  mainWindow.loadURL(url.format({
    pathname: 'index.html',
    protocol: 'file',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // createWindow = () => {};
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

  env = Object.create(process.env);
  let serverPath;
  env.CONFIG = 'Production';
  
  if (ps.platform==='win32') {
    serverPath = __dirname.split("\\");
    serverPath = serverPath.slice(0, serverPath.length - 1);
    serverPath = serverPath.join("\\");
  } else {
    serverPath = __dirname.split("/");
    serverPath = serverPath.slice(0, serverPath.length - 1);
    serverPath = serverPath.join("/");
  }
  
  sampledb = spawn(path.join(serverPath, 'app.asar.unpacked', 'db-server', ps.platform, 'run', 'run'), options={
      env: env
  });
  console.log(sampledb.pid);
  pids.push(sampledb.pid);

  // Make electron sever local files called from the app.
  protocol.interceptFileProtocol('file', (request, callback) => {
    const item_url = request.url.substr(7);
    callback({ path: path.normalize(`${__dirname}/db-app/${item_url}`)})
  }, (err) => {
    if (err) console.error('Failed to register protocol');
  });

  
  let p = setInterval(() => {
      http.get('http://localhost:17327/status', (response) => {
        response.on('data', (chunk) => {
          clearInterval(p);
          createWindow();
        });
      }).on('error', () => {
        console.log("Failed");
      });
    }, 1000)
  // createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // sampledb.kill();
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('quit', function() {
  pids.forEach(function(pid) {
    ps.kill(pid);
  });
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
