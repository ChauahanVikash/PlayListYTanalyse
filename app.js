const puppeteer = require("puppeteer");

let page ;
let playlistName = "" ;
let totalVideos = 0 ;
let totalViews = "" ;

(async function(){
    try{
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport : null ,
        args : ["--start-maximized" ,"--disable-notifications"]
    })

    page = await browser.newPage();

    await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");
    let nameDiv = await page.waitForSelector("#title .yt-simple-endpoint.style-scope.yt-formatted-string");
    let playlistName = await nameDiv.evaluate(el => el.textContent);


    //This $ returns the first element that is result of  css selector 
    // let element = await page.$("#title .yt-simple-endpoint.style-scope.yt-formatted-string")
    // let playlistName = await page.evaluate(function cb(el){
    //     return el.textContent ;
    // } , element)
    //console.log(playlistName);
    
    await page.waitForSelector("span[class='style-scope yt-formatted-string']" );
    let totalVidsSpanElem = await page.$("span[class='style-scope yt-formatted-string']"); 
    
    //evaluate takes two arguments a function and an element if you need to pass it to that function 
    // it runs this on the console of browser
    let totalVideos = await page.evaluate(function fn(element){
        return element.textContent ;
    } , totalVidsSpanElem);

    await page.waitForSelector("yt-formatted-string[class='style-scope ytd-playlist-sidebar-primary-info-renderer']");
    //double dollar $$ returns an array of all elements targeted by selector
    let totalViewsStrArr = await page.$$("yt-formatted-string[class='style-scope ytd-playlist-sidebar-primary-info-renderer']");
    // console.log((await totalViewsStrArr).length)
    let totalViews = await page.evaluate(function fn(element){
        return element.textContent ;
    }, totalViewsStrArr[2]);

    console.log(totalViews , totalVideos , playlistName);

    let timesArray = [];
    let timesElemArr = await page.$$("span[class = 'style-scope ytd-thumbnail-overlay-time-status-renderer']");
    for(let i = 0 ; i < timesElemArr.length ; ++i){
        let time = await page.evaluate(function fn(element){
            return element.textContent ;
        },timesElemArr[i]);
        timesArray.push({"time" :time.split("\n")[1] });
    }
    //console.log(timesArray);

    
    let namesAnchorArr = await page.$$("a#video-title");
    for(let i = 0 ; i < namesAnchorArr.length ; ++i){
        let videoName = await page.evaluate(function fn(element){
            return element.textContent ;
        },namesAnchorArr[i]);
        timesArray[i]["name"] = videoName;
    }

    console.table(timesArray);
}
catch(err){
    console.log(err)
}
    
})();