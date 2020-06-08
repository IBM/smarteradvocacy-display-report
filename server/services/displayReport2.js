const express = require('express');
const request = require('request');

async function getReportData() {
  var username = 'nikadmin';
  var password = 'nikadmin';
  var url = 'http://' + username + ':' + password + '@datastore-default.apps.riffled.os.fyre.ibm.com/advocacy/ReportCodewindInstalls';
  request({
    method: "GET",
    url: url, 
    Accept: "application/json",
    json: true,
    }, function (error, response, doc) { 
      console.log(doc)
      return doc
  });
}

async function buildReportHtml(reportJson) {
  console.log(reportJson)
  // var reportHtml="<font face=\"verdana\"><b>Welcome to Smarter Analytics</b></br></br>";
  // var reportName = reportJson.docName
  // reportHtml=reportHtml+reportName+"</br></br>"
  // var reportData="<table border=1><tr><td>yyyy mm dd</td><td>total Installs</td><td>Eclipse installs</td><td>VS Code Installs</td></tr>";
  // for (var docInstance in reportJson.docs){
  //   //if (reportJson.docs[docInstance].totalInstallsEver) {
  //   var docInstanceHour = reportJson.docs[docInstance].dateTimeKey.slice(-2);
  //   var docInstanceDate = reportJson.docs[docInstance].dateTimeKey.substring(0, 8);
  //   if ( docInstanceHour == "01" ) {
  //     reportData=reportData+"<tr>"
  //     //reportData=reportData+"<td>"+reportJson.docs[docInstance].dateTimeKey+"</td>"
  //     reportData=reportData+"<td>"+docInstanceDate+"</td>"
  //     reportData=reportData+"<td>"+reportJson.docs[docInstance].totalInstallsEver+"</td>"
  //     reportData=reportData+"<td>"+reportJson.docs[docInstance].eclipseTotalInstalls+"</td>"
  //     reportData=reportData+"<td>"+reportJson.docs[docInstance].vscodeInstalls+"</td>"
  //     reportData=reportData+"</tr>"
  //   }
  // } 
  // reportHtml=reportHtml+reportData;
  // reportHtml=reportHtml+"</table></font>";
  return reportHtml;
}

async function displayReport() {
  // var reportJson = await getReportData();
  // console.log("reportJson: "+reportJson)
  // var reportHtml = await buildReportHtml(reportJson);
  //console.log("reportHtml: "+reportHtml);
  var html="DONE IT!";
  return html;
}

exports.displayReport = async (req, res) => {
  console.log("DONE")
  res.send("Hi");
}
