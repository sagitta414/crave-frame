import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {meals} from '../web/product/catalog.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),photos=new Map();
for(const name of ['generatedMealPhotos.ts','mealPhotos.ts']){
 const source=readFileSync(resolve(root,'tv/src',name),'utf8');
 for(const match of source.matchAll(/"([^"]+)"\s*:\s*require\('([^']+)'\)/g))photos.set(match[1],match[2]);
}
const review=meals.map(meal=>{
 const path=photos.get(meal.id),present=!!path&&existsSync(resolve(root,'tv/src',path));
 return {id:meal.id,name:meal.name,tier:meal.catalogTier,featured:!!meal.featuredRecipe,image:present?path.includes('/food/')?'category illustration':'recipe illustration':'missing',kitchenTested:false};
});
const report={scope:'Source asset coverage only. Image contents and cooking quality require human verification.',recipes:review.length,core:review.filter(r=>r.tier==='core').length,variations:review.filter(r=>r.tier==='variation').length,withImage:review.filter(r=>r.image!=='missing').length,missingImages:review.filter(r=>r.image==='missing').length,categoryImages:review.filter(r=>r.image==='category illustration'),featuredMissing:review.filter(r=>r.featured&&r.image==='missing'),coreMissing:review.filter(r=>r.tier==='core'&&r.image==='missing')};
writeFileSync(resolve(root,'docs/recipe-content-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({recipes:report.recipes,core:report.core,variations:report.variations,withImage:report.withImage,missingImages:report.missingImages,categoryImages:report.categoryImages.length,featuredMissing:report.featuredMissing.length}));
