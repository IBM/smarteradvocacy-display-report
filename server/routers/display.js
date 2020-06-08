const express = require('express');
var request = require('request');


module.exports = function (app) {
  const router = express.Router();

  router.get('/', async function (req, res, next) {

    //// START getting endpoint parms and setting vars ////////
    var runMode = req.query.runMode; //console.log(runMode);
    var campaign = req.query.campaign; console.log(campaign);
    var reportType = req.query.reportType; console.log(reportType);
    var TwitterScreenName = req.query.TwitterScreenName; console.log(TwitterScreenName);
    var sortBy = req.query.sortBy; console.log(sortBy);
    var reportId = campaign+"--Report--"+reportType

    //// START set up credentials ////////////
    if ( process.env.CouchDbUsername && process.env.CouchDbPassword ) { // test and use environment var if it exists (production case)
      var username=process.env.CouchDbUsername; console.log("--- couch username secret = "+username);
      var password=process.env.CouchDbPassword; console.log("--- couch password secret = "+password);
    } else if ( req.query.CouchDbUsername && req.query.CouchDbPassword ) { // test and use request parameter var if it exists (local dev case)
      var username = req.query.CouchDbUsername; console.log("--- couch username request parameter = "+username);
      var password = req.query.CouchDbPassword; console.log("--- couch password request parameter = "+password);
    } else { // error case
      console.log("ERROR - CouchDb access crendentials were not set");
      res.send("ERROR - CouchDb access crendentials were not set");
    }
    //// ENDED set up credentials ////////////



    function getAllDocsIndex() { 
      return new Promise(resolve => {
        console.log("START: getAllDocsIndex")
        var url = 'http://' + username + ':' + password + '@datastore-default.apps.riffled.os.fyre.ibm.com/advocacy/_all_docs';
        request({
          method: "GET",
          url: url, 
          Accept: "application/json",
          json: true,
          }, function (error, response, getDocsIndex) { 
            resolve(getDocsIndex);
            console.log("ENDED: getAllDocsIndex")
          });
      });
    }

    function getLatestReportDocId(docsIndex) { 
      return new Promise(resolve => {
        console.log("START: getLatestReportDocId")
        var latestReportDocId="";
        for (var rowid in docsIndex.rows) {
          //console.log(rowid)
          if ( docsIndex.rows[rowid].id.includes(reportId)) {
            if (docsIndex.rows[rowid].id > latestReportDocId ) {
              latestReportDocId=docsIndex.rows[rowid].id
            }
          }
        }
        console.log("-- latestReportDocId = "+latestReportDocId)
        resolve(latestReportDocId)
        console.log("ENDED: getLatestReportDocId")
      });
    }

    function getLatestReport(latestReportDocId) { 
      return new Promise(resolve => {
        console.log("START: getLatestReport")

        // get the latest report
        var url = 'http://' + username + ':' + password + '@datastore-default.apps.riffled.os.fyre.ibm.com/advocacy/'+latestReportDocId;
        console.log("-- url to get = "+url)
        request({
          method: "GET",
          url: url, 
          Accept: "application/json",
          json: true,
          }, function (error, response, latestReport) { 
            //console.log(latestReport)
            resolve(latestReport)
            console.log("ENDED: getLatestReport")
          });
      });
    }


    async function run() {
      console.log("-- START: run")
      var docsIndex = await getAllDocsIndex(); // the function is paused here until the promise is fulfilled
      //console.log(docsIndex);
      var latestReportDocId = await getLatestReportDocId(docsIndex); // the function is paused here until the promise is fulfilled
      console.log("latest Report Doc ID = "+latestReportDocId);
      if ( latestReportDocId === "" ) {
      } else {
        var latestReport = await getLatestReport(latestReportDocId); // the function is paused here until the promise is fulfilled
        //console.log(latestReport)
      }
      //res.json(latestReport)
      console.log("---DEBUG -- **************************")
      console.log("---DEBUG -- start of report in console")
      console.log("---DEBUG -- **************************")
      console.log(latestReport.data.monthlyMetrics[0].total);
      console.log("---DEBUG -- **************************")
      console.log("---DEBUG -- ENDED of report in console")
      console.log("---DEBUG -- **************************")

      var htmlOut = "<html><font face=\"verdana\"><h1>Smarter Advocacy</h1><br/>"
      htmlOut=htmlOut+"<img src=\"./SmartAdvInstalls.png\"><br/>"
      htmlOut=htmlOut+"<small><a href=\"./\">..display report home</a></small>"


      if ( reportType == "YouTubeChannel" ) {
        htmlOut=htmlOut+"<h2>"+reportId+": <a href=\"https://www.youtube.com/channel/UCnKCVK6RFDyHFqUmXlAhCHQ/videos\">(click to channel)</a></h2>"
        htmlOut=htmlOut+"<table><tr><td valign=\"top\">"
          htmlOut=htmlOut+"<table border=\"1\" cellpadding=\"10\">"
          htmlOut=htmlOut+"<tr><td colspan=\"2\"><b>Total scores ever:</b></td><td align=\"center\">views</td><td align=\"center\">likes</td><td align=\"center\">dislikes</td></tr>"
          htmlOut=htmlOut+"<tr><td colspan=\"2\"></td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.views+"</td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.likes+"</td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.dislikes+"</td>"
          htmlOut=htmlOut+"</tr><tr><td colspan=\"8\"></td></tr>"
          htmlOut=htmlOut+"<tr><td colspan=\"8\"><b>Recent monthly scores:</b></td></tr>"
          var totalNumberOfMonthlyMetrics=latestReport.data.monthlyMetrics.length;
        // htmlOut=htmlOut+totalNumberOfMonthlyMetrics
          for ( monthlyMetric in latestReport.data.monthlyMetrics) {
            var docMonthNumString = latestReport.data.monthlyMetrics[monthlyMetric].dateTimeKey.toString(); //console.log("-- docMonthNumString = "+docMonthNumString)
            var docMonthNum = docMonthNumString.substring(4,6); //console.log("-- docMonthNum = "+docMonthNum)
            var docYear = docMonthNumString.substring(0,4);
            if ( docMonthNum === "01" ) { var docMonth="Jan"} else if ( docMonthNum === "02" ) { var docMonth="Feb"} else if ( docMonthNum === "03" ) { var docMonth="Mar"} else if ( docMonthNum === "04" ) { var docMonth="Apr"} else if ( docMonthNum === "05" ) { var docMonth="May"} else if ( docMonthNum === "06" ) { var docMonth="Jun"} else if ( docMonthNum === "07" ) { var docMonth="Jul"} else if ( docMonthNum === "08" ) { var docMonth="Aug"} else if ( docMonthNum === "09" ) { var docMonth="Sep"} else if ( docMonthNum === "10" ) { var docMonth="Oct"} else if ( docMonthNum === "11" ) { var docMonth="Nov"} else if ( docMonthNum === "12" ) { var docMonth="Dec"} else { var docMonth="-"}
            htmlOut=htmlOut+"<tr>"
            htmlOut=htmlOut+"<td>"+docYear+" "+docMonth+"</td><td></td>"
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.views
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.views != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.views+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.likes
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.likes != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.likes+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.dislikes
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.dislikes != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.dislikes+")"}
          }
          htmlOut=htmlOut+"</td></tr><tr><td colspan=\"8\"></td></tr>"
          htmlOut=htmlOut+"<tr><td colspan=\"8\"><b>Daily scores:</b></td></tr>"
          var totalNumberOfDailyMetrics=latestReport.data.dailyMetrics.length;
          //htmlOut=htmlOut+totalNumberOfDailyMetrics
          for ( dailyMetric in latestReport.data.dailyMetrics) {
            htmlOut=htmlOut+"<tr>"
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].dateTimeKey+"</td><td></td>"
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.views
            if (latestReport.data.dailyMetrics[dailyMetric].delta.views != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.views+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.likes
            if (latestReport.data.dailyMetrics[dailyMetric].delta.likes != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.likes+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.dislikes
            if (latestReport.data.dailyMetrics[dailyMetric].delta.dislikes != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.dislikes+")"}
            htmlOut=htmlOut+"</td></tr>"
          }
          htmlOut=htmlOut+"</table>"
        htmlOut=htmlOut+"</td><td width=\"100\"></td><td valign=\"top\">"
        htmlOut=htmlOut+"<table border=\"1\" cellpadding=\"10\">"
        // start SORT videos
        var tempVideos=[];
        for (var video in latestReport.data.videos) {
          var tempVideo=[];
          tempVideo.push(latestReport.data.videos[video])
          tempVideos.push(tempVideo)
        }
        if ( sortBy ) {
          if( sortBy == "views" ) {
            function sortNodes(a, b) {
              return b[0].views - a[0].views;
            } 
          } else if ( sortBy == "datePublished" ) {
            function sortNodes(a, b) {
              return b[0].datePublished - a[0].datePublished;
            }
          }
          else if ( sortBy == "likes" ) {
            function sortNodes(a, b) {
              return b[0].likes - a[0].likes;
            }
          }
          var newTempVideos=tempVideos.slice(0).sort(sortNodes)
          latestReport.data.videos=newTempVideos
        } else {
          latestReport.data.videos=tempVideos
        }
        //console.log(newTempVideos)
        //latestReport.data.videos=newTempVideos
        // end SORT videos
        htmlOut=htmlOut+"<tr><td>(click to video)</td>"
        htmlOut=htmlOut+"<td><b>YouTube Videos</b></td>"
        htmlOut=htmlOut+"<td><a href=\"./display?campaign="+campaign+"&reportType=YouTubeChannel\">Date Published</td>"
        htmlOut=htmlOut+"<td><a href=\"./display?campaign="+campaign+"&reportType=YouTubeChannel&sortBy=views\">Views</td>"
        htmlOut=htmlOut+"<td><a href=\"./display?campaign="+campaign+"&reportType=YouTubeChannel&sortBy=likes\">Likes</td>"
        htmlOut=htmlOut+"<td><a href=\"./display?campaign="+campaign+"&reportType=YouTubeChannel&sortBy=dislikes\">Dislikes</td></tr>"
        for (var video in latestReport.data.videos) {           
          htmlOut=htmlOut+"<tr><td><small><a href=\""+latestReport.data.videos[video][0].uri+"\">"+latestReport.data.videos[video][0].videoCode+"</a></small></td><td>"+
          "<b><small>"+latestReport.data.videos[video][0].title+"</small></b></td><td>"+
          "<small>"+latestReport.data.videos[video][0].datePublished+"</small></td><td>"+
          latestReport.data.videos[video][0].views+"</td><td>"+
          latestReport.data.videos[video][0].likes+"</td><td>"+
          latestReport.data.videos[video][0].dislikes+"</td></tr>"
        }
        htmlOut=htmlOut+"</table>"
        htmlOut=htmlOut+"</td></tr></table>"
      }

      if ( reportType == "TwitterUserData" ) {
        //var htmlOut = "<html><font face=\"verdana\"><h1>Smarter Advocacy</h1><br/>"
        //htmlOut=htmlOut+"<img src=\"./SmartAdvInstalls.png\"><br/>"
        htmlOut=htmlOut+"<h2>"+reportId+": <a href=\"https://twitter.com/EclipseCodewind\">(go to twitter)</a></h2>"
        htmlOut=htmlOut+"<table><tr><td valign=\"top\">"
          htmlOut=htmlOut+"<table border=\"1\" cellpadding=\"10\">"
          htmlOut=htmlOut+"<tr><td colspan=\"2\"><b>Total scores ever:</b></td><td align=\"center\">followers</td><td align=\"center\">friends</td><td align=\"center\">we liked</td><td align=\"center\">tweets</td><td align=\"center\">tweets retweeted</td><td align=\"center\">tweets liked</td></tr>"
          htmlOut=htmlOut+"<tr><td colspan=\"2\"></td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.followers+"</td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.friends+"</td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.usersFavorites+"</td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.tweets+"</td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.retweets+"</td>"
          htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[0].total.tweetFavorites+"</td>"
          htmlOut=htmlOut+"</tr><tr><td colspan=\"8\"></td></tr>"
          htmlOut=htmlOut+"<tr><td colspan=\"8\"><b>Recent monthly scores:</b></td></tr>"
          var totalNumberOfMonthlyMetrics=latestReport.data.monthlyMetrics.length;
        // htmlOut=htmlOut+totalNumberOfMonthlyMetrics
          for ( monthlyMetric in latestReport.data.monthlyMetrics) {
            var docMonthNumString = latestReport.data.monthlyMetrics[monthlyMetric].dateTimeKey.toString(); //console.log("-- docMonthNumString = "+docMonthNumString)
            var docMonthNum = docMonthNumString.substring(4,6); //console.log("-- docMonthNum = "+docMonthNum)
            var docYear = docMonthNumString.substring(0,4);
            if ( docMonthNum === "01" ) { var docMonth="Jan"} else if ( docMonthNum === "02" ) { var docMonth="Feb"} else if ( docMonthNum === "03" ) { var docMonth="Mar"} else if ( docMonthNum === "04" ) { var docMonth="Apr"} else if ( docMonthNum === "05" ) { var docMonth="May"} else if ( docMonthNum === "06" ) { var docMonth="Jun"} else if ( docMonthNum === "07" ) { var docMonth="Jul"} else if ( docMonthNum === "08" ) { var docMonth="Aug"} else if ( docMonthNum === "09" ) { var docMonth="Sep"} else if ( docMonthNum === "10" ) { var docMonth="Oct"} else if ( docMonthNum === "11" ) { var docMonth="Nov"} else if ( docMonthNum === "12" ) { var docMonth="Dec"} else { var docMonth="-"}
            htmlOut=htmlOut+"<tr>"
            htmlOut=htmlOut+"<td>"+docYear+" "+docMonth+"</td><td></td>"
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.followers
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.followers != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.followers+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.friends
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.friends != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.friends+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.usersFavorites
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.usersFavorites != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.usersFavorites+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.tweets
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.tweets != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.tweets+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.retweets
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.retweets != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.retweets+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.monthlyMetrics[monthlyMetric].total.tweetFavorites
            if (latestReport.data.monthlyMetrics[monthlyMetric].delta.tweetFavorites != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.monthlyMetrics[monthlyMetric].delta.tweetFavorites+")"}

          }
          htmlOut=htmlOut+"</td></tr><tr><td colspan=\"8\"></td></tr>"
          htmlOut=htmlOut+"<tr><td colspan=\"8\"><b>Daily scores:</b></td></tr>"
          var totalNumberOfDailyMetrics=latestReport.data.dailyMetrics.length;
          //htmlOut=htmlOut+totalNumberOfDailyMetrics
          for ( dailyMetric in latestReport.data.dailyMetrics) {
            htmlOut=htmlOut+"<tr>"
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].dateTimeKey+"</td><td></td>"
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.followers
            if (latestReport.data.dailyMetrics[dailyMetric].delta.followers != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.followers+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.friends
            if (latestReport.data.dailyMetrics[dailyMetric].delta.friends != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.friends+")"}
            htmlOut=htmlOut+"</td><td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.usersFavorites
            if (latestReport.data.dailyMetrics[dailyMetric].delta.usersFavorites != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.usersFavorites+")"}
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.tweets
            if (latestReport.data.dailyMetrics[dailyMetric].delta.tweets != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.tweets+")"}
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.retweets
            if (latestReport.data.dailyMetrics[dailyMetric].delta.retweets != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.retweets+")"}
            htmlOut=htmlOut+"<td align=\"center\">"+latestReport.data.dailyMetrics[dailyMetric].total.tweetFavorites
            if (latestReport.data.dailyMetrics[dailyMetric].delta.tweetFavorites != 0 ){htmlOut=htmlOut+" (+"+latestReport.data.dailyMetrics[dailyMetric].delta.tweetFavorites+")"}
            htmlOut=htmlOut+"</td></tr>"
          }
          htmlOut=htmlOut+"</table>"
        htmlOut=htmlOut+"</td><td width=\"100\"></td><td valign=\"top\">"
        htmlOut=htmlOut+"<table border=\"1\" cellpadding=\"10\">"
        // start SORT videos
        var tempArtifacts=[];
        for (var artifact in latestReport.data.twitterUserTimeline) {
          var tempArtifact=[];
          tempArtifact.push(latestReport.data.twitterUserTimeline[artifact])
          tempArtifacts.push(tempArtifact)
        }
        if ( sortBy ) {
          if( sortBy == "tweets" ) {
            function sortNodes(a, b) {
              return b[0].tweets - a[0].tweets;
            } 
          } else if ( sortBy == "retweets" ) {
            function sortNodes(a, b) {
              return b[0].retweets - a[0].retweets;
            }
          }
          else if ( sortBy == "likes" ) {
            function sortNodes(a, b) {
              return b[0].likes - a[0].likes;
            }
          }
          var newTempArtifacts=tempArtifacts.slice(0).sort(sortNodes)
          latestReport.data.twitterUserTimeline=newTempArtifacts
        } else {
          latestReport.data.twitterUserTimeline=tempArtifacts
        }
        //console.log(newTempVideos)
        //latestReport.data.videos=newTempVideos
        // end SORT videos
        htmlOut=htmlOut+"<tr><td>(see tweet)</td>"
        htmlOut=htmlOut+"<td><b>Tweets</b></td>"
        htmlOut=htmlOut+"<td><a href=\"./display?campaign="+campaign+"&reportType=TwitterUserData&TwitterScreenName="+TwitterScreenName+"\">created_at</td>"
        htmlOut=htmlOut+"<td><a href=\"./display?campaign="+campaign+"&reportType=TwitterUserData&TwitterScreenName="+TwitterScreenName+"&sortBy=retweets\">Retweets</td>"
        htmlOut=htmlOut+"<td><a href=\"./display?campaign="+campaign+"&reportType=TwitterUserData&TwitterScreenName="+TwitterScreenName+"&sortBy=likes\">Likes</td></tr>"
        for (var artifact in latestReport.data.twitterUserTimeline) { 
          var artifactUrl="https://twitter.com/"+TwitterScreenName+"/status/"+latestReport.data.twitterUserTimeline[artifact][0].id_str
          http://display-report-default.apps.riffled.os.fyre.ibm.com/display?campaign=Codewind&reportType=TwitterUserData        
          htmlOut=htmlOut+"<tr><td><small><a href=\""+artifactUrl+"\">"+latestReport.data.twitterUserTimeline[artifact][0].id_str+"</a></small></td><td>"+
          "<b><small>"+latestReport.data.twitterUserTimeline[artifact][0].text+"</small></b></td><td>"+
          "<small>"+latestReport.data.twitterUserTimeline[artifact][0].created_at+"</small></td><td>"+
          latestReport.data.twitterUserTimeline[artifact][0].retweet_count+"</td><td>"+
          latestReport.data.twitterUserTimeline[artifact][0].favorite_count+"</td></tr>"
        }
        htmlOut=htmlOut+"</table>"
        htmlOut=htmlOut+"</td></tr></table>"
      }




      // htmlOut=htmlOut+"<b>Daily scores (vs key Events):</b></br></br><small>"
      // htmlOut=htmlOut+"<table border=\"1\" cellpadding=\"4\"><tr align=\"center\"><td rowspan=\"2\">events</td><td rowspan=\"2\">date</td><td rowspan=\"2\">total<br/>installs</td><td rowspan=\"2\"></td><td colspan=\"5\">by IDE plugin</td><td rowspan=\"2\">sub<br/>features ></td><td rowspan=\"2\">date</td><td colspan=\"3\">by VS Code plugin</td></tr>"
      // htmlOut=htmlOut+"<tr><td><a href=\""+vsCodeMarketPlaceCodewindUrl+"\">VS Code</a></td><td></td><td><a href=\""+eclipseMarketPlaceCodewindUrl+"\">Eclipse</a></td><td></td><td><a href=\""+jetBrainsMarketPlaceUrl+"\">jetBrains</a></td></td><td><a href=\""+vsCodeMarketPlaceCodewindNodeProfilerUrl+"\">node-profiler</a></td><td><a href=\""+vsCodeMarketPlaceCodewindJavaProfilerUrl+"\">java-profiler</a></td><td><a href=\""+vsCodeMarketPlaceCodewindOpenApiToolsUrl+"\">openapi-tools</a></td></tr><tr>"
      // var lastDate="";
      // for ( doc in latestReport.docs) {
      //   if ( doc > 0 ) { //ignore the first doc, it's just noise          
      //     var docDate = latestReport.docs[doc].dateTimeKey.substring(0,8);
      //     if (lastDate != docDate ) {
      //       htmlOut=htmlOut+"<tr align=\"center\">"
      //       var docMonthNum = latestReport.docs[doc].dateTimeKey.substring(4,6);
      //       if ( docMonthNum === "01" ) { var docMonth="Jan"} else if ( docMonthNum === "02" ) { var docMonth="Feb"} else if ( docMonthNum === "03" ) { var docMonth="Mar"} else if ( docMonthNum === "04" ) { var docMonth="Apr"} else if ( docMonthNum === "05" ) { var docMonth="May"} else if ( docMonthNum === "06" ) { var docMonth="Jun"} else if ( docMonthNum === "07" ) { var docMonth="Jul"} else if ( docMonthNum === "08" ) { var docMonth="Aug"} else if ( docMonthNum === "09" ) { var docMonth="Sep"} else if ( docMonthNum === "10" ) { var docMonth="Oct"} else if ( docMonthNum === "11" ) { var docMonth="Nov"} else if ( docMonthNum === "12" ) { var docMonth="Dec"} else { var docMonth="-"}
      //       var docDay = latestReport.docs[doc].dateTimeKey.substring(6,8);
      //       if ( docDate === "20200218" ) {
      //         htmlOut=htmlOut+"<td>0.9.0 release<br/></td>"
      //       } else if (docDate === "20200207") {
      //         htmlOut=htmlOut+"<td>0.8.1 release</td>"
      //       } else if (docDate === "20200223") {
      //         htmlOut=htmlOut+"<td>total/vscode installs</br/>bumped up 3213, due to<br/>loss of vscode data</td>"
      //       } else if (docDate === "20200226") {
      //         htmlOut=htmlOut+"<td>JetBrains plugin release</td>"
      //       } else if (docDate === "20200228") {
      //         htmlOut=htmlOut+"<td>start collecting<br/>vscode fetaures data</td>"
      //       } else {
      //         htmlOut=htmlOut+"<td>-</td>"
      //       }
      //       htmlOut=htmlOut+"<td>"+docMonth+" "+docDay+"</td>"
      //       //var docDateInt = parseInt(docDate)
      //       htmlOut=htmlOut+"<td>"+latestReport.docs[doc].totalInstallsEver+"</td>"
      //       htmlOut=htmlOut+"<td>=</td>"
      //       htmlOut=htmlOut+"<td>"+latestReport.docs[doc].vscodeInstalls+"</td>"
      //       htmlOut=htmlOut+"<td>+</td>"
      //       htmlOut=htmlOut+"<td>"+latestReport.docs[doc].eclipseTotalInstalls+"</td>"
      //       htmlOut=htmlOut+"<td>+</td>"
      //       htmlOut=htmlOut+"<td>"+latestReport.docs[doc].jetBrainsInstalls+"</td>"
      //       htmlOut=htmlOut+"<td><font color=\"LightGray\">.........</font></td>"
      //       htmlOut=htmlOut+"<td>"+docMonth+" "+docDay+"</td>"
      //       htmlOut=htmlOut+"<td>"+latestReport.docs[doc].vscodeInstallsCodewindNodeProfiler+"</td>"
      //       htmlOut=htmlOut+"<td>"+latestReport.docs[doc].vscodeInstallsCodewindJavaProfiler+"</td>"
      //       htmlOut=htmlOut+"<td>"+latestReport.docs[doc].vscodeInstallsCodewindOpenApiTools+"</td>"
      //       // if ( latestReport.docs[doc].jetBrainsInstalls) {
      //       //   htmlOut=htmlOut+"<td>"+latestReport.docs[doc].jetBrainsInstalls+"</td>"
      //       // } else {
      //       //   htmlOut=htmlOut+"<td>-</td>"
      //       // }
      //       htmlOut=htmlOut+"</tr>"
      //     }
      //   }
      //   lastDate = docDate;
      // }

      htmlOut= htmlOut+"</small></font</html>"
      res.send(htmlOut)
      console.log("-- ENDED: run")
    }

    run();

    //const stringToReturn = "DONE"
    //res.status(200).send(stringToReturn);

  });

  app.use('/display', router);
}