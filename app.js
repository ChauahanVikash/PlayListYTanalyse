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
        return element.textContent.trim() ;
    } , totalVidsSpanElem);

    await page.waitForSelector("yt-formatted-string[class='style-scope ytd-playlist-sidebar-primary-info-renderer']");
    //double dollar $$ returns an array of all elements targeted by selector
    let totalViewsStrArr = await page.$$("yt-formatted-string[class='style-scope ytd-playlist-sidebar-primary-info-renderer']");
    // console.log((await totalViewsStrArr).length)
    let totalViews = await page.evaluate(function fn(element){
        return element.textContent ;
    }, totalViewsStrArr[2]);

    
    
    console.log(totalViews , totalVideos , playlistName);
    let loopcount = Math.floor(totalVideos/100)
    for(let i = 0 ; i < loopcount ; ++i){
        await page.click(".circle.style-scope.tp-yt-paper-spinner");
        await waitTillHTMLRendered(page , 5000);
        console.log("Got 100 videos")
    }

    
    let timeNtilteArray = [];
    let namesAnchorArr = await page.$$("a[id='video-title']");
    let lastVideoElem = namesAnchorArr[namesAnchorArr.length -1];
    await page.evaluate(function(element){
        element.scrollIntoView();
    }, lastVideoElem);
    let timesElemArr = await page.$$("span[class = 'style-scope ytd-thumbnail-overlay-time-status-renderer']");
    console.log(timesElemArr.length , namesAnchorArr.length)
    for(let i = 0 ; i < namesAnchorArr.length && i <timesElemArr.length ; ++i){
        let videoNameNtime = await page.evaluate(function fn(elementName , elementTime){
            return { 
                name :elementName.textContent.trim() ,
                duration : elementTime.textContent.trim() 
            };
        },namesAnchorArr[i],timesElemArr[i]);
        
        timeNtilteArray.push(videoNameNtime);
    }
    
    // for(let i = 0 ; i < timesElemArr.length ; ++i){
    //     let time = await page.evaluate(function fn(element){
    //         return element.textContent ;
    //     },timeNtilteArray[i]);
    //     timeNtilteArray.push({"time" :time.trim() });
    // }
    //console.log(timeNtilteArray);

    
    

    console.table(timeNtilteArray);
}
catch(err){
    console.log(err)
}
    
})();

const waitTillHTMLRendered = async (page, timeout = 30000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
  
    while(checkCounts++ <= maxChecks){
      let html = await page.content();
      let currentHTMLSize = html.length; 
  
      let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
  
      console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
  
      if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
        countStableSizeIterations++;
      else 
        countStableSizeIterations = 0; //reset the counter
  
      if(countStableSizeIterations >= minStableSizeIterations) {
        console.log("Page rendered fully..");
        break;
      }
  
      lastHTMLSize = currentHTMLSize;
      await page.waitForTimeout(checkDurationMsecs);
    }  
  };