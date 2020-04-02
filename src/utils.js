function filename(p) {
    return p.replace(/.*\//g, '')
}

module.exports = {
    filename
}