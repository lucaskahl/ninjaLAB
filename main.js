// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, Tray} = require('electron')
const path = require('path')
const Store = require('electron-store');

const { network } = require('./index.js');
const assetsDirectory = path.join(__dirname, 'assets')

const store = new Store();
let tray = null
var newWindow = null

app.dock.setIcon(path.join(assetsDirectory, 'logo.png'));
app.dock.hide();

const createMenu = () => {
  network.getDevices();
  const template = [];
  
  if (store.get('dns') && store.get('devices') && Array.isArray(store.get('devices')) && Array.isArray(store.get('dns'))) {
    store.get('devices').forEach(item => {
      if (item) {
        
        if(template && Array.isArray(template)) {
          if(template.some(t => t.label === item) === true) return
        }

        template.push(
          {
            label: item,
            submenu: [
            ]
          } 
        )

      }
    });
  }

  if(store.get('dns')) {
    store.get('dns').forEach(item => {
      template.forEach(dns => {
        dns.submenu.push(
          {
            label: item.name,
            submenu: [
              {
                label: 'Enable DNS',
                click: () => {
                  network.enableDNS(dns.label, item.ip)
                }
              },
              {
                label: 'Disable DNS',
                click: () => {
                  network.disableDNS(dns.label)
                }
              }
            ]
          }
        )
      });
    })
  }

  template.push({ type: 'separator' },{
    label: 'Preferences',
    click: () => {
      openAboutWindow()
    }
  },{
    label: 'Quit ninjaLAB',
    click: () => {
      app.exit(0)
    }
  })
  
  return template
  
}

const openAboutWindow = () => {
  if (newWindow) {
    newWindow.show()
    newWindow.focus()
    return
  }

  newWindow = new BrowserWindow({
    width: 600,
    height: 500,
    title: 'Preferences',
    icon: path.join(assetsDirectory, 'logo.png'),
    resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: 
    {
      nodeIntegration: true
    }
  })

  newWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  newWindow.on('minimize',function(event){
    event.preventDefault();
    newWindow.hide();
  });

  newWindow.on('close', function (event) {
    event.preventDefault();
    newWindow.hide();
  });

  // newWindow.webContents.openDevTools()
}

app.on('ready', () => {  
  tray = new Tray(path.join(assetsDirectory, 'logosmall.png'))

  const template = createMenu();
  const menu = Menu.buildFromTemplate(template);

  tray.setToolTip('NinjaLAB - DNS Managment');
  tray.setContextMenu(menu);
})

ipcMain.on('dns-created', (event) => {
  tray.setContextMenu(null);

  const newT = createMenu();
  const menu = Menu.buildFromTemplate(newT);
  tray.setContextMenu(menu);
});

ipcMain.on('dns-removed', (event) => {
  tray.setContextMenu(null);

  const newTemplate = createMenu();
  const menu = Menu.buildFromTemplate(newTemplate);
  tray.setContextMenu(menu);
});

