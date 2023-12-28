const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


const loadImage = (e) =>{
  const file = e.target.files[0]

  if (!fileIsImage(file)){
    alertError("Please select an Image !")
    return 
  }
  // alertSuccess
  form.style.display = "block"
  filename.innerText = file.name

  // get original dimentions
  const image = new Image()
  image.src = URL.createObjectURL(file)
  image.onload = function (){
    widthInput.value = this.width
    heightInput.value = this.height
  }

  outputPath.innerText = path.join(os.homedir(), 'imageresizer')

}


// Send image data to main 
function sendImage(e){
  e.preventDefault()
  const width = widthInput.value
  const height = heightInput.value
  const imgPath = img.files[0].path

  if (!img.files[0]){
    alertError("Please upload an image")
    return
  }
  if (width === '' || height === '') {
    alertError("please fill in a height and width")
    return
  }

  // send to main using IPCRenderer
  ipcRenderer.send("image:resize", {
    width,
    height,
    imgPath
  })
}

// Catch the image:done event
ipcRenderer.on("image:done", ()=>{
  alertSuccess("your image resizerd successfuly !")
})


function alertError (message) {
  Toastify.toast({
    text : message,
    duration : 5000,
    close : false,
    style : {
      background : 'red',
      color : "white",
      textAlign : "center"
    }
  })
}

function alertSuccess (message) {
  Toastify.toast({
    text : message,
    duration : 3000,
    close : false,
    style : {
      background : 'green',
      color : "white",
      textAlign : "center"
    }
  })
}


// Make sure file is image
function fileIsImage(file) {
  const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"]
  return file && acceptedImageTypes.includes(file["type"])
}


img.addEventListener('change', loadImage)
form.addEventListener("submit", sendImage)