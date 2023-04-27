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

var gTxtsOneLine = ['MEOW', 'i\'m not tired', 'i\'ll do my best']

var gTxtsTwoLines = [
    ['you can\'t get fired', 'if you don\'t have a job'],
    ['him: calm down', 'me: I\'m calm down'],
    ['HAPPY BIRTHDAY', 'you don\'t look a day over 50!']
]

var gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    font: 'px Impact',
    lines: [{
        txt: '',
        size: 35,
        align: 'center',
        fillColor: '#2522E2',
        strokeColor: '#100F0F'
    }]
}

function getgImgs() {
    return gImgs
}

function setgImgs() {
    console.log('edit me')
}

function getgMeme() {
    return gMeme
}

function setgMeme(editedMeme) {
    gMeme = editedMeme
}

function addMemeLine() {
    gMeme.lines.push(
        {
            txt: '',
            size: 40,
            align: 'center',
            fillColor: '#2522E2',
            strokeColor: '#100F0F'
        })
    gMeme.selectedLineIdx = gMeme.lines.length - 1
}

function deleteLine() {
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)
    if (gMeme.lines.length !== 0) { // if not empty
        gMeme.selectedLineIdx === 0 ? gMeme.selectedLineIdx++ : gMeme.selectedLineIdx--
        if (gMeme.lines.length === 1) gMeme.selectedLineIdx = 0 //in case of only 1 line left
    }
    else gMeme.selectedLineIdx = -1 // empty
}

function resetLines() {
    gMeme.lines = []
}

function getgTxtsOneLine() {
    return gTxtsOneLine
}

function getgTxtsTwoLines() {
    return gTxtsTwoLines
}

function changeTxtSide(side) {
    gMeme.lines.forEach(line => line.align = side)
}

function changeFont(font) {
    gMeme.font = `px ${font}`
}