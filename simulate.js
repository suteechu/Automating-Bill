import { getQtyRules } from './src/utils.js';
import { initialCategories } from './src/constants.js';

const projectInfo = {
  area: 198,
  slabOnGroundArea: 70,
  slabOnGroundThickness: 0.10,
  slabConcreteStrength: 240,
  bedrooms: 3,
  bathrooms: 3,
  bedroomArea: 78.5,
  bathroomArea: 13.5,
  kitchenArea: 17.5,
  roofArea: 162,
  ridgeLength: 71,
  fasciaLength: 30,
  aseLength: 290,
  rafterLength: 170,
  purlinLength: 500,
  beamLength: 180,
  avgBeamWidth: 0.25,
  avgBeamHeight: 0.45,
  columnLength: 86,
  avgColumnWidth: 0.25,
  avgColumnHeight: 0.25,
  columnRebarCount: 6,
  foundationCount: 15,
  pilesPerFoundation: 1,
  intWallArea: 60,
  extWallArea: 70,
  bathroomWallArea: 20.5,
  kitchenWallArea: 15,
  plasterThickness: 0.0125,
  totalWallVolume: 9,
  perimeter: 24
};

const rules = getQtyRules(projectInfo);
let grandTotal = 0;

console.log('--- SIMULATING 150 SQM HOUSE ---');

initialCategories.forEach(cat => {
  let catTotal = 0;
  console.log(`\n=== ${cat.name} ===`);
  cat.items.forEach(item => {
    let matchedQty = 0;
    
    // Find matching rule
    for (const rule of rules) {
      const matchKey = rule.keywords.some(k => item.name.toLowerCase().includes(k.toLowerCase()));
      const matchUnit = rule.unitKeywords ? rule.unitKeywords.some(u => item.unit.toLowerCase().includes(u.toLowerCase())) : true;
      const notExcluded = rule.exclude ? !rule.exclude.some(ex => item.name.toLowerCase().includes(ex.toLowerCase())) : true;
      
      if (matchKey && matchUnit && notExcluded) {
        matchedQty = rule.calculation();
        break;
      }
    }
    
    if (matchedQty > 0) {
      const totalItemCost = (parseFloat(item.matPrice) + parseFloat(item.laborPrice)) * matchedQty;
      catTotal += totalItemCost;
      console.log(`- ${item.name.substring(0, 40)}... | Qty: ${matchedQty} ${item.unit} | Cost: ${totalItemCost.toLocaleString()}`);
    }
  });
  
  if (catTotal > 0) {
    console.log(`>> Category Total: ${catTotal.toLocaleString()}`);
    grandTotal += catTotal;
  }
});

console.log(`\n======================================`);
console.log(`GRAND TOTAL: ${grandTotal.toLocaleString()} Baht`);
console.log(`Cost per Sqm: ${(grandTotal / 150).toLocaleString()} Baht/Sqm`);
