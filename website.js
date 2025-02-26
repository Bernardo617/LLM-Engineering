const cheerio = require('cheerio');

class Website {
    constructor(url) {
        this.url = url;
        this.title = null;
        this.content = null;
    }
    
    static async fromUrl(url) {
        const response = await fetch(url);
        const text = await response.text();
        const $ = cheerio.load(text);
        const title = $('title').text();
        
        // Remove irrelevant content
        $('script, style, img, input, noscript, iframe').remove();
        
        // Extract the main content
        const content = $('body').text().trim();
        
        const website = new Website(url);
        website.title = title;
        website.content = content;
        website.response = text;
        
        return website;
    }
}

module.exports = Website;