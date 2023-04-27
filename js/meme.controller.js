var gElCanvas
var gCtx
var gCurrPage = 'Gallery'
var gSwitchDir = '-'

function onInit() {
    gElCanvas = document.getElementById('canvas')
    gCtx = gElCanvas.getContext('2d')
    renderGallery()
    // resizeCanvas()

    //temp:
    // addMemeLine()
    // renderImg()
}

// render the gallery imgs from service gImgs 
function renderGallery() {
    const imgs = getgImgs()

    var strHTML = ''
    strHTML += imgs.map((img) => `
    <img src="${img.url}" alt="" onclick="onImgSelect(this)">`
    ).join('')

    document.querySelector('.imgs-gallery-container').innerHTML = strHTML
}

function renderImg() {
    const imgs = getgImgs()
    const currMeme = getgMeme()
    const elImg = new Image()
    elImg.src = imgs[currMeme.selectedImgId - 1].url

    elImg.onload = () => { // redering:
        gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)

        if (currMeme.lines.length > 0) { // if there are no lines

            const coords = [
                { x: 0, y: gElCanvas.height / 6 },
                { x: 0, y: gElCanvas.height / 1.1 },
                { x: 0, y: gElCanvas.height / 2 },]

            currMeme.lines.forEach((line, idx) => {

                if (idx > 2) idx = 2 // for more then 3 texts - pos: mid

                //setting coords according to the aling value
                if (line.align === 'center') coords[idx].x = gElCanvas.width / 2
                else if (line.align === 'right') coords[idx].x = gElCanvas.width
                else if (line.align === 'left') coords[idx].x = 0

                gCtx.strokeStyle = line.strokeColor
                gCtx.fillStyle = line.fillColor
                gCtx.font = line.size + currMeme.font
                gCtx.textAlign = line.align
                gCtx.textBaseline = 'middle'
                

                // if out of the canvas width split text
                const words = line.txt.split(' ')
                const lineHeight = line.size * 1.2
                let lineText = ''
                let y = coords[idx].y

                words.forEach(word => {
                    const textWidth = gCtx.measureText(lineText + word + ' ').width
                    if (textWidth > gElCanvas.width) {
                        gCtx.strokeText(lineText.trim(), coords[idx].x, y)
                        gCtx.fillText(lineText.trim(), coords[idx].x, y)
                        lineText = word + ' '
                        y += lineHeight
                    } else {
                        lineText += word + ' '
                    }
                })
                gCtx.strokeText(lineText.trim(), coords[idx].x, y)
                gCtx.fillText(lineText.trim(), coords[idx].x, y)
            })
            // handeling HTML view for curr line selected
            const memeLines = currMeme.lines[currMeme.selectedLineIdx]
            handelHTML('meme-text-input', memeLines.txt)
            handelHTML('fill-color', memeLines.fillColor)
            handelHTML('stroke-color', memeLines.strokeColor)
        }
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
    togglePages('Meme')
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
    if (pageStr === gCurrPage) return // if same page clicked

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
            elCurrDoc.placeholder = 'please add a line'
            handelBtns(true)
        }
        else {
            elCurrDoc.disabled = false
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
    togglePages('Meme')
}

// disabled or avtive the btns if there are no lines 
function handelBtns(isDisable) {
    btns = ['increase-btn', 'decrease-btn', 'align-left-btn', 'align-center-btn', 'align-right-btn']
    btns.forEach(btn => document.querySelector('.' + btn).disabled = isDisable)
    document.getElementById('fill-color').disabled = isDisable
    document.getElementById('stroke-color').disabled = isDisable
}





// function resizeCanvas() {
//     const elContainer = document.querySelector('.canvas-container')
//     gElCanvas.width = elContainer.offsetWidth
//     gElCanvas.height = elContainer.offsetHeight
// }