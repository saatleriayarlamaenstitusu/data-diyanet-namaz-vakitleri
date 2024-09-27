//const fetch = require("node-fetch");

async function fetchAsync (url, type) {
    const init = {
        headers: {
            "content-type": "text/html;charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0"
        }
    }
    
    const response = await fetch(url,init);
    if (type=="json"){
        return await response.json();
    }

    else{
        return await response.text();
    }
}

const fetchRetry = async (url, options, attempt) => {
if (typeof global !== 'undefined') {
  var self = global.self;
}

            try {
                const response = await fetch(url, options);

                if(!response.ok) {
                console.log("deneme " + attempt + " başarısız " + (new Date()).toString() )
                    throw new Error("Invalid response.");
                }
                console.log("deneme " + attempt + " başarılı " + (new Date()).toString() )
                return await response;

            } catch (error) {
                if (attempt <= 1) {
                console.log("Tüm denemeler başarısız " + (new Date()).toString() )
                    throw error;
                }
                await sleep(1500);
                return await fetchRetry(url, options, attempt - 1);
            }
        };
	
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
	
module.exports = {fetchAsync, fetchRetry}
