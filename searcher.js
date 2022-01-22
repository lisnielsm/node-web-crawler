const fs = require('fs');
const extractor = require('unfluff');

// cheerio library don't get the title and the text of the html like unfluff, but it extract better the links than unfluff 
exports.getData = (html, query) => {
    // using lazy loading for better performance
    const data = extractor.lazy(html, 'en');

    // returns the object only the search term of the query matches the page
    // for now return the object always

    return {
        title: data.title(),
        text: data.text()
    }
}

