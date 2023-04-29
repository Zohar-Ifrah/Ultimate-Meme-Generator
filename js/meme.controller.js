const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

var gElCanvas
var gCtx
var gCurrPage = 'Gallery'
var gSwitchDir = '-'
var isDownload = false

function onInit() {
    gElCanvas = document.getElementById('canvas')
    gCtx = gElCanvas.getContext('2d')
    renderGallery()
    renderMyMemes()

    // addListeners()
}


// render the gallery imgs from service gImgs 
function renderGallery(filter = null) {
    const imgs = getgImgs()
    let filteredImgs = imgs

    if (filter !== null) {
        filteredImgs = filterKeys(imgs, filter)
    }
    var strHTML = ''
    strHTML += filteredImgs.map((img) => `
    <img src="${img.url}" alt="" onclick="onImgSelect(this)">`
    ).join('')

    document.querySelector('.imgs-gallery-container').innerHTML = strHTML
}

function renderMyMemes() {
    const imgs = getgSavedImgs()

    var strHTML = ''
    strHTML += imgs.map((img) => `
    <img src="${img.url}" onclick="onMyMemeSelect(this)">`
    ).join('')

    document.querySelector('.memes-gallery-container').innerHTML = strHTML
}

function renderImg() {
    const imgs = getgImgs()
    const currMeme = getgMeme()
    const elImg = new Image()
    const CurrLinesSelected = currMeme.lines[currMeme.selectedLineIdx]

    elImg.src = imgs[currMeme.selectedImgId - 1].url
    // if (!img) elImg.src =img
    elImg.onload = () => { // redering:
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height) // draw Image

        if (currMeme.lines.length === 0) return // if there are no lines

        currMeme.lines.forEach((line) => {

            //setting coords according to the aling value

            if (line.align === 'center') line.pos.x = gElCanvas.width / 2
            else if (line.align === 'right') line.pos.x = gElCanvas.width - 10
            else if (line.align === 'left') line.pos.x = 10

            gCtx.strokeStyle = line.strokeColor
            gCtx.fillStyle = line.fillColor
            gCtx.font = line.size + currMeme.font
            gCtx.textAlign = line.align
            gCtx.textBaseline = 'middle'

            const words = line.txt.split(' ')
            const lineHeight = line.size * 1.2
            let lineText = ''
            let y = line.pos.y

            words.forEach(word => {
                const textWidth = gCtx.measureText(lineText + word + ' ').width
                if (textWidth > gElCanvas.width) {
                    gCtx.strokeText(lineText.trim(), line.pos.x, y)
                    gCtx.fillText(lineText.trim(), line.pos.x, y)
                    lineText = word + ' '
                    y += lineHeight
                } else {
                    lineText += word + ' '
                }
            })

            gCtx.strokeText(lineText.trim(), line.pos.x, y)
            gCtx.fillText(lineText.trim(), line.pos.x, y)

            line.pos.h = y - line.pos.y + lineHeight
            if (line.pos.h > lineHeight) {  // for 2 rows
                line.pos.w = gElCanvas.width - 15
                line.pos.x = 10
            } else {
                line.pos.w = gCtx.measureText(line.txt).width
                if (line.align === 'center') line.pos.x -= gCtx.measureText(line.txt).width / 2
                else if (line.align === 'right') line.pos.x -= gCtx.measureText(line.txt).width
            }
        })
        // handeling HTML view for curr line selected
        handelHTML('meme-text-input', CurrLinesSelected.txt)
        handelHTML('fill-color', CurrLinesSelected.fillColor)
        handelHTML('stroke-color', CurrLinesSelected.strokeColor)
        if (gCtx.measureText(CurrLinesSelected.txt).width === 0 || isDownload) return // if there is no txt 
        gCtx.strokeStyle = 'black'
        gCtx.lineWidth = 2
        gCtx.strokeRect(
            CurrLinesSelected.pos.x - 10,
            CurrLinesSelected.pos.y - CurrLinesSelected.size + 10,
            CurrLinesSelected.pos.w + 10,
            CurrLinesSelected.pos.h + 10)
    }
}

// live render img and txt while typing
function onTyping(val) { // gets: value (text from input)
    const currMeme = getgMeme()
    currMeme.lines[currMeme.selectedLineIdx].txt = val

    setgMeme(currMeme)
    renderImg()
}

// when clicked on img from gallery: reset lines to 1
// sets the img id to the curr img id from gImgs
function onImgSelect(img) {  // gets: this (element)
    resetLines()
    addMemeLine()

    const imgs = getgImgs()
    const currMeme = getgMeme()
    const imgIdx = imgs.findIndex(memeImg => memeImg.url === img.getAttribute('src'))

    currMeme.selectedImgId = imgIdx + 1

    setgMeme(currMeme)
    renderImg()
    togglePages('Editor')
}

function onMyMemeSelect(img) {
    resetLines()

    const imgs = getgSavedImgs()
    const memes = getgSavedMemes()

    const imgIdx = imgs.findIndex(memeImg => memeImg.url === img.getAttribute('src')) //get img IDX
    const memeIdx = memes.findIndex(meme => meme.selectedImgId === imgs[imgIdx].id)

    setgMeme(memes[memeIdx])
    // renderImg(true)    // to fix and adjust
    togglePages('Editor')
}

// add a default line from services
// sets the selectedLineIdx (focus) on last text
function onAddLine() {
    addMemeLine()
    renderImg()
}

// delete txt lines and sets selectedLineIdx (focus)
// if all lines deleted disable input and update placeholder
function onDeleteLine() {
    deleteLine()
    handelHTML('meme-text-input', '')
    renderImg()
}

// switch txt lines focus using gSwitchDir ('+' or '-')
// when gets to last laine gSwitchDir = '-' when first line = '+'
function onSwitchLine() {
    const currMeme = getgMeme()
    const linesCount = currMeme.lines.length

    if (linesCount < 2) return // if there are no lines

    if (currMeme.selectedLineIdx >= linesCount - 1) gSwitchDir = '-'
    else if (currMeme.selectedLineIdx <= 0) gSwitchDir = '+'

    if (gSwitchDir === '+' && currMeme.selectedLineIdx < linesCount - 1) currMeme.selectedLineIdx++
    else if (gSwitchDir === '-' && currMeme.selectedLineIdx > 0) currMeme.selectedLineIdx--

    setgMeme(currMeme)
    renderImg()
}

// sets the fill and stroke color of the text
function onChageColor(colorType, val) { // id (color: fill/stroke), value (color)
    const currMeme = getgMeme()
    const memeLines = currMeme.lines[currMeme.selectedLineIdx]

    colorType === 'fill-color' ?
        memeLines.fillColor = val : memeLines.strokeColor = val

    setgMeme(currMeme)
    renderImg()
}

// Switching between pages using gCurrPage (only toggle display none)
function togglePages(pageStr) {// gets: 'Gallery', 'Meme', 'About
    if (pageStr === gCurrPage.toLowerCase()) return // if same page clicked

    document.querySelector('.' + gCurrPage.toLowerCase() + '-page').classList.add('hide')
    gCurrPage = pageStr
    document.querySelector('.' + gCurrPage.toLowerCase() + '-page').classList.remove('hide')
}

// fits the text or color to the current appearance
// if there are no lines disable intups and sets new placeholder
function handelHTML(toHandel, val) { // toHandel: class name (str), val: value to update (str)
    const elCurrDoc = document.getElementById(toHandel)
    elCurrDoc.value = val
    if (toHandel === 'meme-text-input') {
        const currMeme = getgMeme()
        if (currMeme.lines.length === 0) { // if empty
            elCurrDoc.disabled = true
            elCurrDoc.placeholder = 'to edit meme please add a line (plus button)'
            handelBtns(true)
            // elCurrDoc.placeholder.style.color ='red'
        }
        else {
            elCurrDoc.disabled = false
            // document.getElementById(toHandel).placeholder.style.color ='black'

            elCurrDoc.placeholder = 'type your meme here'
            handelBtns(false)
        }
    }
}

// gets: '+' or '-' for increase / decrease font size
function onChageFontSize(symbol) {
    const currMeme = getgMeme()
    symbol === '+' ? currMeme.lines[currMeme.selectedLineIdx].size += 1
        : currMeme.lines[currMeme.selectedLineIdx].size -= 1

    setgMeme(currMeme)
    renderImg()
}

// gets: 'left', 'right', 'center' and change txt side
function onChageTxtSide(side) {
    changeTxtSide(side)
    renderImg()
}

// gets a prepared font as str to put on canvas
function onChangeFont(font) {
    changeFont(font)
    renderImg()
}

// flexible render random img and random ready text (or 2) from a prepared array
function onFlexibleSelect() {
    const imgs = getgImgs()
    const randMeme = getgMeme()
    const randOneLineTxts = getgTxtsOneLine()
    const randTwoLineTxts = getgTxtsTwoLines()
    let linesIdxCount = getRandomIntInclusive(0, 1)
    const randNum = getRandomIntInclusive(0, randOneLineTxts.length - 1)
    resetLines()

    addMemeLine()
    if (linesIdxCount === 1) addMemeLine() // for 2 lines
    randMeme.selectedImgId = getRandomIntInclusive(1, imgs.length)
    randMeme.selectedLineIdx = 0

    for (let i = 0; i <= linesIdxCount; i++) {
        linesIdxCount === 0 ?
            randMeme.lines[i].txt = randOneLineTxts[randNum] :
            randMeme.lines[i].txt = randTwoLineTxts[randNum][i]
        randMeme.lines[i].size = getRandomIntInclusive(20, 45)
        randMeme.lines[i].fillColor = getRandomColor()
        randMeme.lines[i].strokeColor = getRandomColor()
    }

    setgMeme(randMeme)
    renderImg()
    togglePages('Editor')
}

// disabled or avtive the btns if there are no lines 
function handelBtns(isDisable) {
    btns = ['increase-btn', 'decrease-btn', 'align-left-btn', 'align-center-btn', 'align-right-btn']
    btns.forEach(btn => document.querySelector('.' + btn).disabled = isDisable)
    document.getElementById('fill-color').disabled = isDisable
    document.getElementById('stroke-color').disabled = isDisable
}

// download img to user's pc
function downloadImg(elLink) { //to fix: (avoid rekt before save)
    isDownload = true
    renderImg()

    const imgContent = gElCanvas.toDataURL('image/jpeg') // image/jpeg the default format
    elLink.href = imgContent
    isDownload = false
}

// saving meme details and img in services
// can retrive data and edit again
function onSavingMeme() {
    const imgContent = gElCanvas.toDataURL('image/jpeg')
    doUploadImg(imgContent, url => saveMeme(url))
    renderMyMemes()
}

function onToggleMenu() {
    document.body.classList.toggle('menu-open');
}

function onImgInput() {
    resetLines()
    addMemeLine()

    const imgs = getgImgs()
    const currMeme = getgMeme()
    const imgIdx = imgs.findIndex(memeImg => memeImg.url === img.getAttribute('src'))

    currMeme.selectedImgId = imgIdx + 1

    setgMeme(currMeme)
    renderImg()
    togglePages('Editor')
}

function onSearchInput(elSearch) {
    const keyWord = elSearch.value
    // const keyWords = getgKeywordSearchCountMap() //to add value
    renderGallery(keyWord)
}

function filterKeys(imgs, filter) {
    let filteredImgs = []
    filteredImgs = imgs.filter(img =>
        img.keywords.some(keyword => keyword.includes(filter)))
    console.log(filteredImgs)
    console.log(imgs)

    return filteredImgs
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()

}

function addMouseListeners() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}

function onDown(ev) {
    const pos = getEvPos(ev)
    console.log('pos:', pos)
}

function onMove(ev) {
    console.log('Move')
}

function onUp() {
    console.log('Up')
    // document.body.style.cursor = 'grab'
}

function getEvPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }
    // console.log('pos:', pos)
    // Check if its a touch ev
    if (TOUCH_EVS.includes(ev.type)) {
        //soo we will not trigger the mouse ev
        ev.preventDefault()
        //Gets the first touch point
        ev = ev.changedTouches[0]
        //Calc the right pos according to the touch screen
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
}

function updatePos(x, y) {
    console.log(x)
    console.log(y)
    const currMeme = getgMeme()
    const lines = currMeme.lines
    const pos = { x, y }

    lines.align = 'drag'
    lines.pos = pos
    console.log(currMeme)
    setgMeme(currMeme)
}

// to fix:
// choose file btn
// avoid rekt before save

// memes on storage
// on save: to render imgs after save


