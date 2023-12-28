const os = require("os")
const fs = require("fs")
const resizeImg = require("resize-img")
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('node:path')
// import {app, BrowserWindow} from "electron"

// const createWindow = () => {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//         preload: path.join(__dirname, 'preload.js')
//       }
//   })

//   win.loadFile('index.html')
// }


const isDev = process.env.NODE_ENV !== "production"
const isMac = process.platform === 'darwin'
// create the main window
function createMainWindow () {
    const mainWindow = new BrowserWindow({
        title : 'Image Resizer',
        width : isDev ? 1000 : 500,
        height : 600,
        webPreferences : {
            contextIsolation : true,
            nodeIntegration : true,
            preload : path.join(__dirname, 'preload.js')
        }
    })



    // Open dev tools if in dev env
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
    return mainWindow
}


// create about window
function createAboutWindow () {
    const aboutWindow = new BrowserWindow({
        title : 'About',
        width : 300,
        height : 300
    })

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}
// when app is ready:
app.whenReady().then(() => {
    // ipcMain.handle('ping', () => 'pong')
    const mainWindow = createMainWindow()


    // Implement Menu
    const mainMenu = Menu.buildFromTemplate(createMenuTemplate(mainWindow))
    Menu.setApplicationMenu(mainMenu)


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})


// Menu Template
function createMenuTemplate(window) {
const menu = [
    ...(isMac ? [{
        label : app.name,
        submenu : [
            {
                label : "About",
                click : createAboutWindow
            }
        ]
    }] : []),
    {
        role : 'fileMenu'
    },
    ...(!isMac ? [{
        label : "Help",
        submenu : [
            {
                label : "About",
                click : createAboutWindow
            }
        ]
    }] : []),
    {
        label : "DevTools",
        click : () =>window.webContents.openDevTools()
    }
]
    return menu
}

// Respond to ipcRenderer
ipcMain.on("image:resize", (e, options)=>{
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options)
})

// Resize the image
async function resizeImage({width, height, imgPath, dest}){
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width : +width,
            height : +height
        })
        // create filename
        const filename = path.basename(imgPath)

        // create file dest if not exists
        if (fs.existsSync(dest)){
            fs.mkdirSync(dest)
        }

        // write file to dest
        fs.writeFileSync(path.join(dest, filename), newPath)

        // Send Success to render
        
        // Open dest folder
        shell.openPath(dest)

    } catch (error) {
        console.log(error)
    }
}


app.on("window-all-closed", ()=>{
    if (!isMac){
        app.quit()
    }
})


