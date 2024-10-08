const BASE = `../../`
const { DIYANET_BASE_URL, CITIES } = require(`${BASE}urls.js`);

const fs = require("fs");
const entities = require("entities");
const { parse } = require('node-html-parser');
const { fetchAsync,fetchRetry } = require(`${BASE}utils.js`);

async function start() {
    var logs = "";
    logs += new Date().toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: "numeric", hour: "numeric", minute: "numeric", hour12: false, timeZone: 'Asia/Istanbul' })
    var data = {}
    var months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    for (const il in CITIES) {

        var plate = il;
        var diyanetId = CITIES[il].diyanetId;
        var name = CITIES[il].name;
        var url = DIYANET_BASE_URL + diyanetId + "/" + CITIES[il].slug + "-icin-namaz-vakti"
        //console.log("Fetching... " + name);
        //entities.decodeXML("")

        try {
            var fullRawHTML = await fetchRetry(url,{},3);
            
        } catch (error) {
            console.log(`HATA:il: url: ${url}   \n${error}`);
            continue;
        }


        const fullDOM = parse(fullRawHTML);
    
        var aylikHTMLrows = fullDOM.querySelectorAll("#vakit-bottom-wrapper #tab-1 tbody tr")
        for (const gun of aylikHTMLrows) {
            var gunHTMLrows = gun.querySelectorAll("td");
            var gunTextParts = entities.decodeXML(gunHTMLrows[0].innerText).split(" ");
            var gunText = `${gunTextParts[2]}-${(months.indexOf(gunTextParts[1]) + 1).toString().padStart(2, '0')}-${gunTextParts[0]}`
            console.log(plate, gunText)

            var gunData =
            {
                "imsak": gunHTMLrows[2].innerText,
                "gunes": gunHTMLrows[3].innerText,
                "ogle": gunHTMLrows[4].innerText,
                "ikindi": gunHTMLrows[5].innerText,
                "aksam": gunHTMLrows[6].innerText,
                "yatsi": gunHTMLrows[7].innerText
            }

            if (typeof data[plate] == "object") {
                data[plate][gunText] = gunData;
            }

            else {
                data[plate] = {};
                data[plate][gunText] = gunData;
            }
        }
    }


    for (const plate in data) {
        writeFile(data[plate], plate, `data/namaz/`, "json");
    }
    writeFile(logs, "logs", `data/namaz/`, "txt");
}

function writeFile(data, name, dir, ext) {
    var data = (ext == "json") ? JSON.stringify(data) : data;
    fs.writeFile(dir + name + "." + ext, data, () => {
        //console.log(dir+name+"."+ext," yazıldı")
    });
}


module.exports = { start }
