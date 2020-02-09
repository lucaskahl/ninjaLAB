const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const $ = require('jquery');
const mask = require('jquery-mask-plugin');

const store = new Store();

(function() {
  const nameservers = store.get('dns') || [];
  const dnsList = document.querySelector('.content-list');

  mountDnsList = () => {
    if(store.get('dns') && Array.isArray(store.get('dns'))) {
      store.get('dns').forEach(ns => {
        dnsList.insertAdjacentHTML('afterbegin', `
          <li>
            <div class="wrapper">
              <div class="details">
                <div>
                  <p>👉 ${ns.name} | <span>${ns.ip}</span></p>
                </div>
                <div class="remove" id=${ns.name} onclick="removeItem(this)">
                  ❌
                </div>
              </div>
            </div>
          </li>
        `);
      })
    }
  };

  createDnsItem = () => {
    if(store.get('dns') && Array.isArray(store.get('dns'))) {    
      const item = store.get('dns')[store.get('dns').length - 1];

      dnsList.insertAdjacentHTML('afterbegin', `
        <li>
          <div class="wrapper">
            <div class="details">
              <div>
                <p>👉 ${item.name} | <span>${item.ip}</span></p>
              </div>
              <div class="remove" id=${item.name} onclick="removeItem(this)">
                ❌
              </div>
            </div>
          </div>
        </li>
      `)
    }
  };

  createDns = (e) => {
    e.preventDefault();
    const name = document.querySelector('.form #name').value;
    const ip = document.querySelector('.form #ip').value;  
      
    store.set('dns', [...store.get('dns') || '', {name: name, ip: ip}])
    createDnsItem();

    ipcRenderer.send('dns-created');
  };

  removeItem = (el) => {
    const newItems = store.get('dns').filter(nameserver => {
      return nameserver.name !== el.id
    });

    document.querySelector(`#${el.id}`).parentNode.parentNode.parentNode.remove();
    
    store.set('dns', newItems);
    ipcRenderer.send('dns-removed');
  };

  document.querySelector('.form').addEventListener('submit', createDns)

  $('#ip').mask('0ZZ.0ZZ.0ZZ.0ZZ', {
    translation: {
      'Z': {
        pattern: /[0-9]/, optional: true
      }
    }
  });

  mountDnsList();
})()