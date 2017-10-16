const fs = require("fs")


let seedPath = "../nyc-api/config/seed.json"
let seed = JSON.parse(fs.readFileSync(seedPath,{encoding:"utf8"}));
console.log("Production seed length before wipe", seed.production.Bill.length)
seed.production.Bill = []; 
fs.writeFileSync(seedPath, JSON.stringify(seed,null,2));
seed = JSON.parse(fs.readFileSync(seedPath,{encoding:"utf8"}));
console.log("Production seed length after wipe", seed.production.Bill.length)
