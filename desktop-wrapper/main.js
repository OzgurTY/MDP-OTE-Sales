const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;

const JAR_NAME = 'sales-commission-system-0.0.1-SNAPSHOT.jar';
const API_URL = 'http://localhost:8080';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
        },
        title: "MDP Sales Calculator",
        // icon: path.join(__dirname, 'icon.png') // TODO: Copy the icon later
    });

    // Load the Splash Screen or Spinner? For now just try to load URL repeatedly
    loadApp();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function loadApp() {
    // Retry connection to backend until success
    const tryConnection = () => {
        fetch(API_URL)
            .then(() => {
                mainWindow.loadURL(API_URL);
            })
            .catch((err) => {
                console.log('Backend not ready, retrying...', err.message);
                setTimeout(tryConnection, 1000);
            });
    };
    tryConnection();
}

function startBackend() {
    let jarPath = path.join(process.resourcesPath, 'app.jar');
    // In development, it might be different, but let's assume we package it as 'app.jar' in resources.

    if (!fs.existsSync(jarPath)) {
        // Dev fallback: Try to find it in relative path
        jarPath = path.join(__dirname, '../backend/target', JAR_NAME);
    }

    console.log('Starting backend from:', jarPath);

    if (fs.existsSync(jarPath)) {
        backendProcess = spawn('java', ['-jar', jarPath]);

        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend Error: ${data}`);
        });

        backendProcess.on('close', (code) => {
            console.log(`Backend exited with code ${code}`);
        });
    } else {
        console.error("Backend JAR not found!");
    }
}

app.on('ready', () => {
    startBackend();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
