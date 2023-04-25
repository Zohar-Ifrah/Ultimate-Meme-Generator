var gKeywordSearchCountMap = { 'funny': 12, 'cat': 16, 'baby': 2, 'evil': 3, 'cute': 7, 'old': 4, 'movie': 5 }

var gImgs = [
    { id: 1, url: 'meme-imgs/1.jpg', keywords: ['funny', 'president', 'evil', 'old'] },
    { id: 2, url: 'meme-imgs/2.jpg', keywords: ['cute'] },
    { id: 3, url: 'meme-imgs/3.jpg', keywords: ['baby', 'cute'] },
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
var gMeme = {
    selectedImgId: 5,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'I sometimes eat Falafel',
            size: 20,
            align: 'left',
            color: 'red'
        }
    ]
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

function setgMeme(url) {
    const img = getImg(0, url)
    gMeme.selectedImgId = img.id
}

function getImg(imgID = 0, url = 0) {  // edit later // edit later // edit later
    let img
    imgID ? img = gImgs.find(img => img.id === imgID) 
    : img = gImgs.find(img => img.url === url)  
    return img
}