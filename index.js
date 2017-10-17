/*
Reference schema
        "billid": "M 0545-2017",                                                                                                                                                                  
        "item_number": 1,
        "title": "Zoning, Establishing a Special Harlem River Waterfront District, Bronx (C170311ZMX, C170314PPX and 170315ZSX)",
        "sponsors": ["Greenfield"],
        "text": "By the Chair of the Land Use Committee Council Member Greenfield: Pursuant to Rule 11.20(c) of the Council Rules and Section 197-d(b)(3) of the New York City Charter, the Council hereby resolves that the actions of the City Planning Commission on Uniform Land Use Review Procedure application nos. C 170314 PPX and C 170315 ZSX shall be subject to Council review. These items are related to application nos. C 170311 ZMX and N 170314 PPX which are subject to Council review pursuant to Section 197-d(b)(1) of the New York City Charter",
        "fiscal_impact": "None",
        "status_log": [{
            "date": "9/7/2017",
            "status": "Approved, by Council"
        }],
        "question": "A motion was made that this Land Use Call-Up be Approved, by Council approved by consent Roll Call.",
        "date": "2017-09-07",
        "source_doc": "http://legistar.council.nyc.gov/LegislationDetail.aspx?ID=3147881&GUID=76BCCFBB-77F8-4E6D-9743-492CBBE48107",
        "uid": "2017-09-07-M 0545-2017"
      }



*/
const fs = require("fs")
const _ = require("lodash")

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const options = {};

const oakOptions = {
  agendaUrls : [
    "https://oakland.legistar.com/MeetingDetail.aspx?ID=568477&GUID=28B72F66-522E-4C39-B005-599E0D41DDB3",
    "https://oakland.legistar.com/MeetingDetail.aspx?ID=564804&GUID=5B718CAF-E7C8-4B65-AAEB-D11850B8EBB9" ],
  agendaDataSelectors : {
    date : "#ctl00_ContentPlaceHolder1_lblDate",
    table : "#ctl00_ContentPlaceHolder1_gridMain_ctl00 > tbody"
  },
  billDataSelectors : {
    bill_id: "#ctl00_ContentPlaceHolder1_lblFile2",
    item_number:"",
	  title:"#ctl00_ContentPlaceHolder1_lblName2",
	  text: "#ctl00_ContentPlaceHolder1_lblTitle2",
	  sponsors:"#ctl00_ContentPlaceHolder1_lblSponsors2",
	  fiscal_impact: "",
	  status_log: "",
	  question: "",
    date:  "#ctl00_ContentPlaceHolder1_lblDate",
	  source_doc: "",
	  uid: "", 
  },
  billDataPlaceholders : {
    bill_id: "",
    item_number:"id",
  	title:"",
  	text: "",
	  sponsors:"",
	  fiscal_impact: "None",
	  status_log: [{}],
  	question: "Shall this resolution be adopted?",
    date:  "",
	  source_doc: null,
	  uid: "billId", 
  },
  outputPaths : {
    seed : "../oak-api/config/seed.json",
    local :  "./agenda.json"
  }		
}

const agendaUrl = oakOptions.agendaUrls[1]

JSDOM.fromURL(agendaUrl,options)

.then(dom => {
  
  console.log("requesting agenda at", agendaUrl)
  //get agenda date
  let dateSelector = oakOptions.agendaDataSelectors.date 
  let dateElement = dom.window.document.querySelector(dateSelector);
  let agendaDate = dateElement.textContent

  //select all times
  let tableSelector = oakOptions.agendaDataSelectors.table  
  let table = dom.window.document.querySelector(tableSelector)
  //iterate through all rows

  let rows = Array.from(table.children);

  let billData = rows 
    .map((element) => {
	  let atag = element.children[0].children[0]
	  let billid = atag.text;
	  let source_doc = atag.href;

	  let bill = {
	    billid:billid, 
		source_doc:source_doc,
		date:agendaDate
		};

	  return bill; 
  })
    .filter((bill) => bill.source_doc )
  
  console.log("billData length", billData.length)
  return billData; 
})

.then(bills => {
  console.log("requesting bill data for",bills.length,"bills")
  //now that we have item URLs, we navigate to them
  //then we can generate a bunch of promises?
  //and chain process them
  
  let origDate = bills[0].date.split('/')
  let year = origDate[2];
  let month = origDate[0].length === 1 ? '0' + origDate[0] : origDate[0];
  let day = origDate[1].length === 1 ? '0' + origDate[1] : origDate[1];
  let agendaDate = [year,month,day].join('-');

  //generate an array of promises wrapping up the DOMs of the legislation
  let options = {};
  //let billDetailPages = bills.slice(0,3).map(bill => JSDOM.fromURL(bill.source_doc,options)) 
  let billDetailPages = bills.map(bill => JSDOM.fromURL(bill.source_doc,options)) 


  //process that array of promises with appropriate selectors
  Promise.all(billDetailPages)
  	.then((pages) => {

	  let scrapedBills = pages.map((page,index) => {

      let billIdSpan = page.window.document.querySelector(oakOptions.billDataSelectors.bill_id);
      let billIdText = billIdSpan.textContent;
      let billId = billIdText.split(" ").join("-");

	    let titleSpan = page.window.document.querySelector(oakOptions.billDataSelectors.title);
	    let titleText = titleSpan.textContent

		  let billTextSpan = page.window.document.querySelector(oakOptions.billDataSelectors.text);
      let billText = billTextSpan.textContent

      let sponsorSpan = page.window.document.querySelector(oakOptions.billDataSelectors.sponsors);
		  let billSponsors = sponsorSpan ? Array.from(sponsorSpan.children).map(sponsorTag => sponsorTag.text) : null;

      let bill = {
        id: billId,
		    item_number:index,
		    title:titleText,
		    text: billText,
		    sponsors:billSponsors,
		    fiscal_impact: oakOptions.billDataPlaceholders.fiscal_impact,
		    status_log: [{}],
		    question: oakOptions.billDataPlaceholders.question,
        date: agendaDate,
		    source_doc: null,
		    uid: `${agendaDate}-${billId}`
		  }

		  console.log(`Scraping ${bill.uid}`)
		  return bill;
      });

      //console.log(fullBills);

      //new approach, read the seed, merge with the scrape, write
	    //next refactor, write all the json to a directory
	    //split the scraping and JSON writing script
	    //from the merging and seeding script

      let seedPath = "../oak-api/config/seed.json"
	    let seed = JSON.parse(fs.readFileSync(seedPath,{encoding:"utf8"}));
	  
	    //check if empty
      seed.production.Bill = seed.production.Bill ? seed.production.Bill : []; 
	 
	    console.log("Current production seed bill count", seed.production.Bill.length);
      console.log("Bill count from current scrape", scrapedBills.length)

      //merge
	    let mergedBills = [...seed.production.Bill,...scrapedBills]
      console.log(_.sortBy(mergedBills, 'uid').map(bill => bill.uid))    


      //Requires some more investigation
	  //remove duplicates based on uid
	  //let uniqueNewBills = _.uniqBy(mergedBills,"uid");
	  //console.log("Merged bills count", mergedBills.length)
	  //console.log("Unique merged bills countt", uniqueNewBills.length)

      //Set as production.Bill property
	  //seed.production.Bill = uniqueNewBills;
	  
	  seed.production.Bill = mergedBills;

	  console.log("Merged production seed bill count", seed.production.Bill.length)
	  //fs.writeFileSync(seedPath, JSON.stringify(seed,null,2));
      
	  //write to both the local
	  //and for now, write to the API server seed
	  //Likely best broken into separate scripts
	  let agendaPath = "./agenda.json";
	  let agenda = JSON.parse(fs.readFileSync(agendaPath,{encoding:"utf8"}));
	  agenda = Object.assign(agenda,scrapedBills);
    fs.writeFileSync("./agenda.json", JSON.stringify(agenda,null,2));

	  console.log("Completed");
	  console.log("Seed Bill length before scrape",seed.production.Bill.length);
	  console.log("Scrape Bill length",scrapedBills.length);
	  console.log("Seed Bill length after scrape", JSON.parse(fs.readFileSync(seedPath,{encoding:"utf8"})).production.Bill.length);
	  
	})

})


.catch(error => {
  console.log(error)
})

