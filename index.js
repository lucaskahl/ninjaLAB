const { Notification } = require('electron');
const { exec } = require('child_process');
const path = require('path')
const Store = require('electron-store');

const store = new Store();

const network = (function() {
  const module = {};
  module.devices = [];  

  module._networkNotification = (title, body) => {
    let iconAddress = path.join(__dirname, 'assets/logo.png');
    const notif = {
      title: title,
      body: body,
      icon: iconAddress
    };

    new Notification(notif).show();
  }

  module.getDevices = () => {
    exec('networksetup -listallnetworkservices', (err, stdout, stderr) => {
      if (err) {
        console.log(err)
      } else {
        stdout.split(/\r?\n/).forEach(item => {
          if (item.length > 0 && item !== 'An asterisk (*) denotes that a network service is disabled.') {
            module.devices.push(item);
          }
        });
        store.set('devices', module.devices);
      }
    })
  };

  module.getActiveDNS = (item) => {
    exec(`networksetup -getdnsservers ${item}`, (err, stdout, stderr) => {
      if (err) {
        console.log(err)
      } else {
        console.log(stdout);
      }
    })
  };

  module.enableDNS = (item, dns) => {
    exec(`networksetup -setdnsservers ${item} ${dns}`, (err, stdout, stderr) => {
      if (err) {
        module._networkNotification('ninjaLAB', 'Error on adding your DNS');
      } else {
        module._networkNotification('ninjaLAB', 'DNS added successfully');
      }
    });
  }

  module.disableDNS = (item) => {
    exec(`networksetup -setdnsservers ${item} empty`, (err, stdout, stderr) => {
      if (err) {
        module._networkNotification('ninjaLAB', 'Error on removing your DNS');
      } else {
        module._networkNotification('ninjaLAB', 'DNS removed successfully');
      }
    });
  }
  
  return {
    getDevices: module.getDevices,
    getActiveDNS: module.getActiveDNS,
    enableDNS: module.enableDNS,
    disableDNS: module.disableDNS,
  };
})();

module.exports = {
  network: network
}