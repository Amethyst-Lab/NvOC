const { app, BrowserWindow, ipcMain, electron, Notification, Menu, Tray} = require('electron');
const path = require('node:path');
const fs = require('fs');
const { exec } = require('child_process');
const electronDialog = require('electron').dialog;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 490,
    height: 300,
    icon: (__dirname, '/assets/icons/NVOClogo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  mainWindow.setMenuBarVisibility(false)
  mainWindow.setResizable(false);



  console.log("Amethyst Lab")
  console.log("NvOC By MiMillie")

// Should be used for later functions
  function executeCommand(command, callback) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur lors de l'exécution de la commande: ${error}`);
            callback(error, null);
            return;
        }
        if (stderr) {
            console.error(`Erreur dans la commande: ${stderr}`);
            callback(stderr, null);
            return;
        }
        console.log(`Résultat de la commande: ${stdout}`);
        callback(null, stdout);
    });
}




function readNvocConfigFile(callback) {
  fs.readFile("/opt/NvOC/nvocenv/nvoc_config.py", 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error('File does not exist');


          electronDialog.showMessageBox(mainWindow, {
              'type': 'question',
              'title': '\nWarning\n',
              'message': "This software will allow you to Overclock your Nvidia GPU.\nPlease be careful.\nI'm not responsable of any damages to your system.",
              'buttons': [
                  'Yes',
                  'No'
              ]
          })
              .then((result) => {
                  if (result.response !== 0) { app.quit() }
      
                  if (result.response === 0) {
                      console.log('The "Yes" button was pressed (main process)');
let serviceFile = `
[Unit]
Description=NvOC service
After=network-online.target multi-user.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/bash -c 'source /opt/NvOC/nvocenv/bin/activate && python3 /opt/NvOC/nvocenv/nvoc_config.py'
Type=simple
Restart=on-failure

[Install]
WantedBy=multi-user.target
`;

let fileContent = `
from pynvml import *
nvmlInit()
myGPU = nvmlDeviceGetHandleByIndex(0)
nvmlDeviceSetGpcClkVfOffset(myGPU, 0)
nvmlDeviceSetMemClkVfOffset(myGPU, 0)
`;

let scriptContent = `
#!/usr/bin/env bash

cat <<EOF1 > /etc/systemd/system/nvoc.service
${serviceFile}
EOF1

mkdir -p /opt/NvOC/nvocenv/
cd /opt/NvOC/nvocenv/
python3 -m venv ./
source ./bin/activate
pip install nvidia-ml-py pynvml

cat <<EOF2 > /opt/NvOC/nvocenv/nvoc_config.py
${fileContent}
EOF2

systemctl enable --now nvoc.service
`;
                      
                      require('fs').writeFileSync('/tmp/setup_nvoc.sh', scriptContent);
                      require('child_process').exec(`pkexec bash /tmp/setup_nvoc.sh`, (err, output) => {
                          if (err) {
                              console.error('Erreur:', err);
                          } else {
                              console.log('Sortie:', output);
                          }
                      });

                  }
      
                  // Reply to the render process
                  window.webContents.send('dialogResponse', result.response);
              })
    
      } else {
        console.error('Error reading the file:', err);
      }
      callback(err, null);
      return;
    }

    const regex = /\b\d+\b/g;
    const numbers = data.match(regex);

    if (numbers) {
      const numArray = numbers.map(Number);
      callback(null, numArray);
    } else {
      callback(null, []);
    }
  });
}


ipcMain.on("ready", (event, args) => {

readNvocConfigFile((err, numbers) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(numbers)
    mainWindow.webContents.send("fromMain", numbers);
  }
});

})




  function createNvocConfigFile(gpcClkOffset, memClkOffset, powerLimit) {
let fileContent = "";
if (powerLimit === "NotEnabled") {
    fileContent = `
from pynvml import *
nvmlInit()
myGPU = nvmlDeviceGetHandleByIndex(0)
nvmlDeviceSetGpcClkVfOffset(myGPU, ${gpcClkOffset})
nvmlDeviceSetMemClkVfOffset(myGPU, ${memClkOffset})
`;
} else {
    fileContent = `
from pynvml import *
nvmlInit()
myGPU = nvmlDeviceGetHandleByIndex(0)
nvmlDeviceSetGpcClkVfOffset(myGPU, ${gpcClkOffset})
nvmlDeviceSetMemClkVfOffset(myGPU, ${memClkOffset})
nvmlDeviceSetPowerManagementLimit(myGPU, ${powerLimit})
`;
}

let scriptContent = `
#!/usr/bin/env bash

echo "Creating nvoc_config.py file..."
# Créer le fichier de configuration
cat <<EOF > /opt/NvOC/nvocenv/nvoc_config.py
${fileContent}
EOF

if [ $? -eq 0 ]; then
    echo "nvoc_config.py file created successfully."
else
    echo "Failed to create nvoc_config.py file." >&2
    exit 1
fi

echo "Restarting nvoc.service..."
# Redémarrer le service
systemctl restart nvoc.service

if [ $? -eq 0 ]; then
    echo "nvoc.service restarted successfully."
else
    echo "Failed to restart nvoc.service." >&2
    exit 1
fi
`;
    
    require('fs').writeFileSync('/tmp/setup_nvoc_config.sh', scriptContent);
    require('child_process').exec(`pkexec bash /tmp/setup_nvoc_config.sh`, (err, output) => {
        if (err) {
            console.error('Erreur:', err);
        } else {
            console.log('Sortie:', output);
        }
    });
    
    

  }
  
  ipcMain.on("toMain", (event, args) => {
    createNvocConfigFile(args[0], args[1], args[2]);
  })











  //Revieve IPC exemple
  //ipcMain.on("toMain", (event, args) => {
    //console.log(args)
  //})

// IPC send exemple
  //mainWindow.webContents.send("fromMain", "UwU");

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
