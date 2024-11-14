let showdown = require('showdown')
const converter = new showdown.Converter()

const markdownToHTML = (text) => {
    const html = converter.makeHtml(text)
    return html
}

module.exports = markdownToHTML