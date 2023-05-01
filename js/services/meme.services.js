
const MEME_STORAGE_KEY = 'memesDB'

var gMyMemes = []
var gKeywordSearchCountMap = { 'funny': 12, 'cat': 16, 'baby': 2, 'evil': 3, 'cute': 7, 'old': 4, 'movie': 5 }

var gImgs = [
    { id: 1, url: 'meme-imgs/1.jpg', keywords: ['funny', 'president', 'evil', 'old'] },
    { id: 2, url: 'meme-imgs/2.jpg', keywords: ['cute', 'dog'] },
    { id: 3, url: 'meme-imgs/3.jpg', keywords: ['baby', 'cute', 'dog'] },
    { id: 4, url: 'meme-imgs/4.jpg', keywords: ['cat', 'cute'] },
    { id: 5, url: 'meme-imgs/5.jpg', keywords: ['baby'] },
    { id: 6, url: 'meme-imgs/6.jpg', keywords: ['funny', ''] },
    { id: 7, url: 'meme-imgs/7.jpg', keywords: ['funny', 'baby'] },
    { id: 8, url: 'meme-imgs/8.jpg', keywords: ['funny', ''] },
    { id: 9, url: 'meme-imgs/9.jpg', keywords: ['funny', 'evil', 'baby'] },
    { id: 10, url: 'meme-imgs/10.jpg', keywords: ['funny', 'president', 'old'] },
    { id: 11, url: 'meme-imgs/11.jpg', keywords: ['funny', ''] },
    { id: 12, url: 'meme-imgs/12.jpg', keywords: ['funny', 'old'] },
    { id: 13, url: 'meme-imgs/13.jpg', keywords: ['funny'] },
    { id: 14, url: 'meme-imgs/14.jpg', keywords: ['old', 'movie'] },
    { id: 15, url: 'meme-imgs/15.jpg', keywords: ['funny'] },
    { id: 16, url: 'meme-imgs/16.jpg', keywords: ['funny', 'old'] },
    { id: 17, url: 'meme-imgs/17.jpg', keywords: ['old', 'president', 'evil'] },
    { id: 18, url: 'meme-imgs/18.jpg', keywords: ['movie'] },
]

// texts with 1 line for flex meme 
var gTxtsOneLine = ['MEOW', 'i\'m not tired', 'i\'ll do my best']

// texts with 2 lines for flex meme 
var gTxtsTwoLines = [
    ['you can\'t get fired', 'if you don\'t have a job'],
    ['him: calm down', 'me: I\'m calm down'],
    ['HAPPY BIRTHDAY', 'you don\'t look a day over 50!']
]

var gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    font: 'px Impact',
    lines: []
}
// first load of dl data, if none creates empty array
_loadMemes()

function getImgs() {
    return gImgs
}

function getMeme() {
    return gMeme
}

function setMeme(meme) {
    gMeme = meme
}

// add a line and set defualt: size, align, colors, and pos
// set text position on - 1st: top, 2nd: bot, 3rd: mid. 4th and rest on mid
function addMemeLine() {
    let pos = { x: 0, y: 0, w: 0, h: 0 }

    if (gMeme.lines.length === 0) pos = { x: 10, y: gElCanvas.height / 6, w: 40, h: 40 } // 1st text initial spot
    else if (gMeme.lines.length === 1) pos = { x: 10, y: gElCanvas.height / 1.1, w: 40, h: 40 } // 2nd text initial spot
    else if (gMeme.lines.length >= 2) pos = { x: 10, y: gElCanvas.height / 2, w: 40, h: 40 } // 3rd (or more) text initial spot

    gMeme.lines.push(
        {
            txt: '',
            size: 40,
            align: 'left',
            fillColor: '#2522E2',
            strokeColor: '#100F0F',
            pos: pos,
            rectArea: {}
        })

    gMeme.selectedLineIdx = gMeme.lines.length - 1 // sets the focus for new text
}

// delete the selected line focused on curr meme
// if its the last line (no more lines) selectedLineIdx = -1
function deleteLine() {
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
    if (gMeme.lines.length !== 0) { // if not empty
        gMeme.selectedLineIdx === 0 ? gMeme.selectedLineIdx++ : gMeme.selectedLineIdx--
        if (gMeme.lines.length === 1) gMeme.selectedLineIdx = 0 //in case of only 1 line left
    }
    else gMeme.selectedLineIdx = -1 // empty
}

// resets gMeme lines for a new meme
function resetLines() {
    gMeme.lines = []
}

// return texts with 1 line for flex meme 
function getTxtsOneLine() {
    return gTxtsOneLine
}

// return texts with 2 lines for flex meme 
function getTxtsTwoLines() {
    return gTxtsTwoLines
}

// sets align - 'left' 'right' 'center'
function changeTxtSide(side) {
    gMeme.lines.forEach(line => line.align = side)
}

function changeFont(font) {
    gMeme.font = `px ${font}`
}

function saveMeme() {
    const meme = { ...gMeme }

    meme.id = makeId()
    gMyMemes.push(meme)

    saveToStorage(MEME_STORAGE_KEY, gMyMemes)
}

function _loadMemes() {
    let memes = loadFromStorage(MEME_STORAGE_KEY)

    // If nothing in storage - creates an empty array
    if (!memes || !memes.length) memes = []

    gMyMemes = memes
    saveToStorage(MEME_STORAGE_KEY, gMyMemes)
}

function getMyMemes() {
    return gMyMemes
}

function getKeywordSearchCountMap() {
    return gKeywordSearchCountMap
}

function setKeywordSearchCountMap() {
    return gKeywordSearchCountMap
}

function saveToStorage(key, val) {
    localStorage.setItem(key, JSON.stringify(val))
}

function loadFromStorage(key) {
    var val = localStorage.getItem(key)
    return JSON.parse(val)
}