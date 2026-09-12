export const foodPreferences=['No preference','Meat & poultry','Fish & seafood','Vegetarian','Plant-based'];
export function dietFits(meal,diet){const kind=meal.foodType||'Vegetarian';return diet==='No preference'||(diet==='Meat & poultry'?kind==='Meat & poultry':diet==='Fish & seafood'?kind==='Fish & seafood':kind==='Vegetarian');}
