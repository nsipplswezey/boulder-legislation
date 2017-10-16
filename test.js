const fs = require('fs');


let seedPath = "../nyc-api/config/seed.json"
let seed = JSON.parse(fs.readFileSync(seedPath,{encoding:"utf8"}));

console.log(seed.production.Bill.length);
