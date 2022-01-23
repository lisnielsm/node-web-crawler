#! /usr/bin/env node

const fs = require('fs');
const axios = require('axios');
const searcher = require('./searcher');
const cheerio = require('cheerio');

// set the options help when the user type --help
const argv = require("yargs/yargs")(process.argv.slice(2))
    .option("url", {
        alias: "u",
        describe: "The url of website to fetch"
    })
    .option("maxdist", {
        alias: "m",
        describe: "The maximum distance from the initial website"
    })
    .option("db", {
        alias: "d",
        describe: "The name of the database"
    })
    .demandOption(["url"], "Please specify the url of the website")
    .demandOption(["maxdist"], "Please specify the max distance from main page")
    .demandOption(["db"], "Please specify the database name")
    .help().argv;

// get the url from arguments
const url = argv.url;

// get the links max distance from main page from arguments
const maxdist = argv.maxdist;

// get the database file name from arguments
const db = argv.db;

let count = 0;

// if the file exists, it is deleted first before creating a new one
if (fs.existsSync(db)) {
    fs.unlink(db, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    });
}

// Get the main page and the child links attached to it
const extractLinks = async (currentUrl, maxDistance) => {

    // Links beyond the maximum allowed are not processed
    if (maxdist === maxDistance) {
        return false;
    }

    try {
        // Fetching HTML
        if (isValidHttpUrl(currentUrl)) {
            const response = await axios.get(currentUrl);

            if (response && response.status === 200 && response.data) {
                const html = response.data;

                count++;

                // Using cheerio to extract <a> tags
                const $ = cheerio.load(html);

                const linkObjects = $('a');

                // Collect the "href" and "title" of each link and add them to an array
                const links = [];
                linkObjects.each((index, element) => {
                    links.push({
                        text: $(element).text(), // get the text
                        href: $(element).attr('href'), // get the href attribute
                    });
                });

                maxDistance++;

                console.log("Count", count);

                // get the title and the text from html
                let data = searcher.getData(html);

                // set the links to data object
                data.links = links;

                // save data object in file database
                saveDataToFile(data, currentUrl, db);

                for (let link of links) {

                    let strLink = link.href;

                    // if links are valid, ex: http://books.toscrape.com/
                    if (isValidHttpUrl(strLink)) {

                        // use recursive function to get all the child links associated to each link
                        if (extractLinks(strLink, maxDistance) === false) {
                            continue;
                        }
                    }
                    else {

                        // if links are not valid, like local link, ex: "../books/philosophy/index.html"
                        let backCounter = 0;

                        // build the correct link from local link
                        while (strLink.substring(0, 3) === "../") {
                            strLink = strLink.substring(3);
                            backCounter++;
                        }

                        let str = currentUrl;

                        if (backCounter !== 0) {
                            for (let i = 0; i <= backCounter; i++) {
                                str = str.substring(0, str.lastIndexOf("/"));
                            }
                        }

                        if (str.slice(-1) !== "/") {
                            strLink = str + "/" + strLink;
                        }
                        else {
                            strLink = str + strLink;
                        }

                        if (isValidHttpUrl(strLink)) {
                            // use recursive function to get all the child links associated to each link
                            if (extractLinks(strLink, maxDistance) === false) {
                                continue;
                            }
                        }
                        else {
                            console.log("Link not valid", strLink);
                        }
                    }
                }
            }
        }
    } catch (error) {
        //console.log(error.response);
    }

    return true;
};

// function to save the data into file
const saveDataToFile = (data, url, dbName) => {
    // open the file in append mode
    fs.open(dbName, "a", (err, fd) => {
        if (err) {
            console.log(err.message);
        } else {
            fs.write(fd, JSON.stringify({ title: data.title, url: url, text: data.text, links: data.links }) + '\r\n', (err, bytes) => {
                if (err) {
                    console.log(err.message);
                } else {
                    //console.log(bytes + ' bytes written');
                }
            })
        }
    })
}

const isValidHttpUrl = string => {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

// maxDistance = 0 means main page so it has to start from -1
extractLinks(url, -1).then(response => {
    console.log("Count:", count);
});