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

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const options = {};
JSDOM.fromURL("http://legistar.council.nyc.gov/MeetingDetail.aspx?ID=563540&GUID=26A3BD82-86F3-47FE-A13E-AAC05219B54E",options)

.then(dom => {


  //get agenda date
  let dateSelector = "#ctl00_ContentPlaceHolder1_lblDate"
  let dateElement = dom.window.document.querySelector(dateSelector);
  let agendaDate = dateElement.textContent

  //select all times
  let tableSelector = "#ctl00_ContentPlaceHolder1_gridMain_ctl00 > tbody"  
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
  
  return billData 
})

.then(bills => {

  //now that we have item URLs, we navigate to them
  //then we can generate a bunch of promises?
  //and chain process them

  let agendaDate = bills[0].date;

  //generate an array of promises wrapping up the DOMs of the legislation
  let options = {};
  //let billDetailPages = bills.slice(0,3).map(bill => JSDOM.fromURL(bill.source_doc,options)) 
  let billDetailPages = bills.map(bill => JSDOM.fromURL(bill.source_doc,options)) 


  //process that array of promises with appropriate selectors
  Promise.all(billDetailPages)
  	.then((pages) => {

	  let fullBills = pages.map((page,id) => {

        let billIdSpan = page.window.document.querySelector("#ctl00_ContentPlaceHolder1_lblFile2");
        let billIdText = billIdSpan.textContent;

	    let titleSpan = page.window.document.querySelector("#ctl00_ContentPlaceHolder1_lblName2");
	    let titleText = titleSpan.textContent

		let billTextSpan = page.window.document.querySelector("#ctl00_ContentPlaceHolder1_lblTitle2");
        let billText = billTextSpan.textContent

        let sponsorSpan = page.window.document.querySelector("#ctl00_ContentPlaceHolder1_lblSponsors2");
		let billSponsors = sponsorSpan ? Array.from(sponsorSpan.children).map(sponsorTag => sponsorTag.text) : null;

    
        let bill = {
          billid: billIdText,
		  item_number:id,
		  title:titleText,
		  text: billText,
		  sponsors:billSponsors,
		  fiscal_impact: "None",
		  status_log: [{}],
		  question: "A motion was made that this Introduction be Approved by Council approved by Roll Call",
          date: agendaDate,
		  source_doc: null,
		  uid: agendaDate + billIdText
		}

	    console.log(bill);
		return bill;
      });

      console.log(fullBills);

      fs.writeFileSync("./agenda.json", JSON.stringify(fullBills,null,2));
	  
	})

})

.catch(error => {
  console.log(error)
})



