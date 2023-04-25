var gElCanvas
var gCtx
var currPage = 'Meme'
var imgCount = 18

function onInit() {
    gElCanvas = document.getElementById('canvas')
    gCtx = gElCanvas.getContext('2d')
    // resizeCanvas()
    renderGallery()
    renderImg()
}

// Render the gallery imgs from service with gImgs 
function renderGallery() {
    const imgs = getgImgs()

    var strHTML = ''
    strHTML += imgs.map((img) => `
    <img src="${img.url}" alt="" onclick="clickImg(this)">`
    ).join('')

    document.querySelector('.imgs-gallery-container').innerHTML = strHTML
}

function renderImg() {
    currImg = getgMeme()
    const img = getImg(currImg.selectedImgId)

    const elImg = new Image()
    elImg.src = img.url
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
    }
}

// function resizeCanvas() {
//     const elContainer = document.querySelector('.canvas-container')
//     gElCanvas.width = elContainer.offsetWidth
//     gElCanvas.height = elContainer.offsetHeight
// }

function onTyping(val) {
    drawImg(val, gElCanvas.width / 2, gElCanvas.height / 5)
}

function drawImg(text, x, y) {
    currImg = getgMeme()
    const img = getImg(currImg.selectedImgId)


    const elImg = new Image()
    elImg.src = img.url
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
        gCtx.lineWidth = 2
        gCtx.strokeStyle = 'brown'
        gCtx.fillStyle = 'black'
        gCtx.font = '40px Arial'
        gCtx.textAlign = 'center'
        gCtx.textBaseline = 'middle'

        gCtx.fillText(text, x, y) // Draws (fills) a given text at the given (x, y) position.
        gCtx.strokeText(text, x, y) // Draws (strokes) a given text at the given (x, y) position.
    }
}

// When clicked on img: 
function clickImg(img) {
    setgMeme(img.getAttribute("src"))
    const elImg = new Image()
    elImg.src = img.getAttribute("src")
    elImg.onload = () => {
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
        togglePages('Meme')
    }
}

// Switching between pages (only toggle display none)
function togglePages(pageStr) {
    if (pageStr === currPage) return // if same page clicked

    document.querySelector('.' + currPage.toLowerCase() + '-page').classList.add('hide')
    currPage = pageStr
    document.querySelector('.' + currPage.toLowerCase() + '-page').classList.remove('hide')
}
