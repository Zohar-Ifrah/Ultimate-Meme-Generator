const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']
let gIsDraged = false
let gStartPos

var gElCanvas
var gCtx
var gCurrPage = 'Gallery'
var gSwitchDir = '-'
var gIsDownloading = false

function onInit() {
    gElCanvas = document.getElementById('canvas')
    gCtx = gElCanvas.getContext('2d')

    renderGallery()
    renderMyMemes()
    addListeners()
}


// render the gallery imgs from service gImgs 
function renderGallery(filter = null) {
    const imgs = getImgs()
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

// render imgs saved in storage
// + toggle hide / show msg if there isnt saved memes
function renderMyMemes() {
    const myMemes = getMyMemes()
    elMsg = document.querySelector('.empty-gallery-msg').classList
    elMsg.add('hide')
    if (myMemes.length === 0) { // no saved memes
        elMsg.remove('hide')
        return
    }

    const imgs = getImgs()
    const myImgs = []
    myMemes.forEach(meme => {
        const matchImg = imgs.find(img => img.id === meme.selectedImgId)
        if (matchImg) myImgs.push(matchImg)
    })

    var strHTML = ''
    strHTML += myImgs.map((img, idx) => `
    <img src="${img.url}" alt="Click to open" onclick="onSelectMyMeme('${myMemes[idx].id}')">`
    ).join('')

    document.querySelector('.memes-gallery-container').innerHTML = strHTML
}

function renderMeme() {
    const imgs = getImgs()
    const currMeme = getMeme()
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

        // rect drawing:
        if (gCtx.measureText(CurrLinesSelected.txt).width === 0 || gIsDownloading) return // if there is no txt 
        gCtx.strokeStyle = 'black'
        gCtx.lineWidth = 2

        let masure = 6
        if (CurrLinesSelected.align === 'drag-center') masure = gCtx.measureText(CurrLinesSelected.txt).width / 2
        else if (CurrLinesSelected.align === 'drag-right') masure = gCtx.measureText(CurrLinesSelected.txt).width
        else if (CurrLinesSelected.align === 'drag-left') masure = 6

        gCtx.strokeRect(
            CurrLinesSelected.pos.x - masure,
            CurrLinesSelected.pos.y - CurrLinesSelected.size / 1.3,
            CurrLinesSelected.pos.w + 10,
            CurrLinesSelected.pos.h + 10)

        //saving rect area
        const rectStartX = CurrLinesSelected.pos.x - 10
        const rectStartY = CurrLinesSelected.pos.y - CurrLinesSelected.size + 10
        const rectEndX = CurrLinesSelected.pos.x - 10 + CurrLinesSelected.pos.w + 10
        const rectEndY = CurrLinesSelected.pos.y - CurrLinesSelected.size + 10 + CurrLinesSelected.pos.h + 10

        CurrLinesSelected.rectArea = { xStart: rectStartX, yStart: rectStartY, xEnd: rectEndX, yEnd: rectEndY }
    }
}

// live render img and txt while typing
function onTyping(val) { // gets: value (text from input)
    const currMeme = getMeme()
    currMeme.lines[currMeme.selectedLineIdx].txt = val

    setMeme(currMeme)
    renderMeme()
}

// when clicked on img from gallery: reset lines to 1
// sets the img id to the curr img id from gImgs
function onImgSelect(img) {  // gets: this (element)
    resetLines()
    addMemeLine()

    const imgs = getImgs()
    const currMeme = getMeme()
    const imgIdx = imgs.findIndex(memeImg => memeImg.url === img.getAttribute('src'))

    currMeme.selectedImgId = imgIdx + 1

    setMeme(currMeme)
    renderMeme()
    onTogglePages('Editor')
}

// to re edit meme that saved already
function onSelectMyMeme(memeId) { // gets meme id as 'str' that can be find on myMemes
    resetLines()

    const myMemes = getMyMemes()
    const memeSelected = myMemes.find(meme => meme.id === memeId)
    console.log(memeSelected)
    setMeme(memeSelected)
    renderMeme()
    onTogglePages('Editor')
}

// add a default line from services
// sets the selectedLineIdx (focus) on last text
function onAddLine() {
    addMemeLine()
    renderMeme()
}

// delete txt lines and sets selectedLineIdx (focus)
// if all lines deleted disable input and update placeholder
function onDeleteLine() {
    deleteLine()
    handelHTML('meme-text-input', '')
    renderMeme()
}

// switch txt lines focus using gSwitchDir ('+' or '-')
// when gets to last laine gSwitchDir = '-' when first line = '+'
function onSwitchLine() {
    const currMeme = getMeme()
    const linesCount = currMeme.lines.length

    if (linesCount < 2) return // if there are no lines

    if (currMeme.selectedLineIdx >= linesCount - 1) gSwitchDir = '-'
    else if (currMeme.selectedLineIdx <= 0) gSwitchDir = '+'

    if (gSwitchDir === '+' && currMeme.selectedLineIdx < linesCount - 1) currMeme.selectedLineIdx++
    else if (gSwitchDir === '-' && currMeme.selectedLineIdx > 0) currMeme.selectedLineIdx--

    setMeme(currMeme)
    renderMeme()
}

// sets the fill and stroke color of the text
function onChageColor(colorType, val) { // id (color: fill/stroke), value (color)
    const currMeme = getMeme()
    const memeLines = currMeme.lines[currMeme.selectedLineIdx]

    colorType === 'fill-color' ?
        memeLines.fillColor = val : memeLines.strokeColor = val

    setMeme(currMeme)
    renderMeme()
}

// Switching between pages using gCurrPage (only toggle display none)
// handels hamburger closing when its on
function onTogglePages(pageStr) {// gets: 'Gallery', 'Meme', 'About
    if (pageStr === gCurrPage.toLowerCase()) return // if same page clicked

    document.querySelector('.' + gCurrPage.toLowerCase() + '-page').classList.add('hide')
    gCurrPage = pageStr
    document.querySelector('.' + gCurrPage.toLowerCase() + '-page').classList.remove('hide')
    // handels hamburger closing
    const elBody = document.body
    if (elBody.classList.contains('menu-open')) elBody.classList.remove('menu-open')
    // hadnels search placeholder
    if (gCurrPage.toLowerCase() === 'gallery') {
        document.querySelector('.search-input').value = ''
        renderGallery()
    }
}

// fits the text or color to the current appearance
// if there are no lines disable intups and sets new placeholder
function handelHTML(toHandel, val) { // toHandel: class name (str), val: value to update (str)
    const elCurrDoc = document.getElementById(toHandel)
    elCurrDoc.value = val
    if (toHandel === 'meme-text-input') {
        const currMeme = getMeme()
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
    const currMeme = getMeme()
    symbol === '+' ? currMeme.lines[currMeme.selectedLineIdx].size += 1
        : currMeme.lines[currMeme.selectedLineIdx].size -= 1

    setMeme(currMeme)
    renderMeme()
}

// gets: 'left', 'right', 'center' and change txt side
function onChageTxtSide(side) {
    changeTxtSide(side)
    renderMeme()
}

// gets a prepared font as str to put on canvas
function onChangeFont(font) {
    changeFont(font)
    renderMeme()
}

// flexible render random img and random ready text (or 2) from a prepared array
function onFlexibleSelect() {
    const imgs = getImgs()
    const randMeme = getMeme()
    const randOneLineTxts = getTxtsOneLine()
    const randTwoLineTxts = getTxtsTwoLines()
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

    setMeme(randMeme)
    renderMeme()
    onTogglePages('Editor')
}

// disabled or avtive the btns if there are no lines 
function handelBtns(isDisable) {
    btns = ['increase-btn', 'decrease-btn', 'align-left-btn', 'align-center-btn', 'align-right-btn']
    btns.forEach(btn => document.querySelector('.' + btn).disabled = isDisable)
    document.getElementById('fill-color').disabled = isDisable
    document.getElementById('stroke-color').disabled = isDisable
}

// download img to user's pc
function onDownloadImg() {
    gIsDownloading = true // when true >> rect is off
    renderMeme()
    var imgContent = gElCanvas.toDataURL('image/jpeg') // image/jpeg the default format
    var link = document.querySelector('.dl-btn')
    link.download = 'my-meme.jpg'
    link.href = imgContent
    // link.click()
    gIsDownloading = false
}

// saving meme details and img in services
// can retrive data and edit again
function onSavingMeme() {
    saveMeme()

    renderMyMemes()
    onTogglePages('meme')
}

// for smaller screens >> handels hamburger
function onToggleMenu() {
    document.body.classList.toggle('menu-open')
}

// sorts by Keywords >> render the gallery
function onSearchInput(elSearch) {
    const keyWord = elSearch.value
    renderGallery(keyWord)
}

function filterKeys(imgs, filter) {
    let filteredImgs = []
    filteredImgs = imgs.filter(img =>
        img.keywords.some(keyword => keyword.includes(filter)))
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
    const pos = getEvPos(ev)  //gets pos pressed on
    const currMeme = getMeme()
    const rectArea = currMeme.lines[currMeme.selectedLineIdx].rectArea

    //if inside the rect
    if (pos.x >= rectArea.xStart && pos.x <= rectArea.xEnd
        && pos.y >= rectArea.yStart && pos.y <= rectArea.yEnd) {
        gIsDraged = true
        gStartPos = pos
    }
}

function onMove(ev) {
    const pos = getEvPos(ev) // gets the spot pressing on (every sec)
    const currMeme = getMeme()
    const rectArea = currMeme.lines[currMeme.selectedLineIdx].rectArea
    if (pos.x >= rectArea.xStart && pos.x <= rectArea.xEnd
        && pos.y >= rectArea.yStart && pos.y <= rectArea.yEnd) {
        document.body.style.cursor = 'grab'
    } else document.body.style.cursor = 'default'

    if (!gIsDraged) return

    document.body.style.cursor = 'grabbing'
    const currLine = currMeme.lines[currMeme.selectedLineIdx]

    // Calc the delta, the diff moved
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y

    currLine.pos.x += dx
    currLine.pos.y += dy

    if (currLine.align === 'center') currLine.align = 'drag-center'
    if (currLine.align === 'right') currLine.align = 'drag-right'
    if (currLine.align === 'left') currLine.align = 'drag-left'
    // currLine.align = 'drag'
    gStartPos = pos // update last pos
    setMeme(currMeme)
    renderMeme()
}

function onUp() {
    gIsDraged = false
    document.body.style.cursor = 'default'
}

function getEvPos(ev) {
    // Gets the offset pos , the default pos
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }

    // Check if its a touch ev
    if (TOUCH_EVS.includes(ev.type)) {

        ev.preventDefault()
        //Gets the first touch point
        ev = ev.changedTouches[0]
        //Calc the right pos according to the touch screen
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

// function onImgInput() {
//     resetLines()
//     addMemeLine()

//     const imgs = getImgs()
//     const currMeme = getMeme()
//     const imgIdx = imgs.findIndex(memeImg => memeImg.url === img.getAttribute('src'))

//     currMeme.selectedImgId = imgIdx + 1

//     setMeme(currMeme)
//     renderMeme()
//     onTogglePages('Editor')
// }
