import {cookingProfile} from './cooking-profile.js';
export const energyLevels=['Any','Exhausted','Up for cooking','Make it special'];
export const viewingStyles=['Any','Couch friendly','Quiet bites'];
// Descriptive serving suggestions, not a measured noise or spill guarantee.
export function snackability(meal){
 const text=(meal.name+' '+meal.category).toLowerCase();
 if(/soup|chowder|stew|curry/.test(text))return {label:'Bowl + spoon',detail:'Best at the table or on a stable tray. Hot liquids need a steady surface.',couch:false,quiet:true};
 if(/pizza|flatbread|sandwich|toast|pita|quesadilla/.test(text))return {label:'Handheld bites',detail:'Cut into small portions and serve on a plate. Keep a napkin nearby.',couch:true,quiet:!/toast|crisp|crunch/.test(text)};
 if(/taco|wrap/.test(text))return {label:'Handheld · keep a plate',detail:'Go lightly on fillings and sauce; these can spill. A plate catches the drips.',couch:true,quiet:!/crisp|crunch|hard.shell/.test(text)};
 if(/rice|grain|bowl|pasta|noodle|salad/.test(text))return {label:'Fork-friendly bowl',detail:'Use a deep bowl and a stable tray so you can settle in comfortably.',couch:true,quiet:!/crisp|crunch/.test(text)};
 return {label:'Table first',detail:'Enjoy dinner at the table, then settle in for the story.',couch:false,quiet:false};
}
export function tonightScore(meal,prefs={}){
 const profile=cookingProfile(meal),snack=snackability(meal);
 const energy=prefs.energy==='Exhausted'?-profile.effortIndex*4:prefs.energy==='Up for cooking'?-profile.effortIndex*.3:prefs.energy==='Make it special'?(meal.courses?55:0)+Math.min(profile.steps,8)*2:0;
 return energy+(prefs.viewingStyle==='Couch friendly'&&snack.couch?45:prefs.viewingStyle==='Quiet bites'&&snack.quiet?45:0);
}
export function energyReason(meal,prefs={}){
 const p=cookingProfile(meal);
 if(prefs.energy==='Exhausted')return `Favoring less work: ${p.steps} steps${p.equipment.length?', '+p.equipment.join(' + ').toLowerCase():''}. Workload is estimated from the recipe, including prep and equipment.`;
 if(prefs.energy==='Make it special')return 'A little more occasion, within your existing food and time limits. Add an optional finishing touch below.';
 return `${p.steps} cooking steps${p.equipment.length?' · '+p.equipment.join(' + '):''}. Workload estimates include prep and named equipment; active minutes are not measured.`;
}
export function specialTouch(meal,show){
 const mood=show?.mood;
 if(mood==='Romantic')return {title:'A question before the credits',detail:'Before pressing play, each name one place you would love to explore together. Compare answers after the story.',symbol:'✦'};
 if(mood==='Adventure')return {title:'Your opening-night prediction',detail:'Each make one spoiler-free prediction from the title or poster. Revisit it after the credits—no searching ahead.',symbol:'◇'};
 if(mood==='Lighthearted')return {title:'Give tonight a name',detail:'Each invent a playful name for this dinner-and-movie double feature. Pick your favorite before the opening scene.',symbol:'✧'};
 return {title:'Set a cozy scene',detail:'Finish cooking, bring your plates to a stable table or tray, and soften the room lighting. Keep enough light to eat comfortably.',symbol:'☾'};
}
