const fs = require("fs")

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const options = {};
JSDOM.fromURL("http://legistar.council.nyc.gov/MeetingDetail.aspx?ID=563540&GUID=26A3BD82-86F3-47FE-A13E-AAC05219B54E",options)

.then(dom => {

  //console.log(dom.serialize());

  let item = dom.window.document.querySelector("#ctl00_ContentPlaceHolder1_gridMain_ctl00_ctl14_hypFile");
  let bill = {}

  console.log(item.text)
  console.log(item.href)


  bill.title = item.text;
  bill.source_doc = item.href

  fs.writeFileSync("./agenda.json", JSON.stringify(bill,null,2));
  

});
