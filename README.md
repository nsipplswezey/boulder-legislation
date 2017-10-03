# nyc-legislation

## Parse NYC City Council agendas

### Install and Run

```
npm install
node index.js
```

Uses [jsdom](https://github.com/tmpvar/jsdom)

Current reference schema:
```
{
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
```
