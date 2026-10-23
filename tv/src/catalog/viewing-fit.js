// Explain genre-based choices without inventing scenes, cuisine or food references.
export function viewingFit(meal,show){
 const genre=String(show.genre||'').toLowerCase(),dish=String(meal.name||'').toLowerCase();
 const handheld=/pizza|flatbread|sandwich|taco|wrap|quesadilla|burger/.test(dish),bowl=/pasta|rice|soup|chili|chowder/.test(dish);
 if(/mystery|thriller|crime/.test(genre))return {score:handheld?10:bowl?8:0,line:handheld?`Portion ${meal.name} before ${show.name}, so you can follow the mystery without serving interruptions.`:`Finish ${meal.name} before ${show.name}, then clear the table and give the suspense your attention.`};
 if(/romance|romantic/.test(genre))return {score:bowl?30:handheld?15:0,line:`Share ${meal.name} at the table before ${show.name}. Leave a little space between dinner and the romance for your own conversation.`};
 if(/comedy|animation|family/.test(genre))return {score:handheld?10:bowl?8:0,line:handheld?`${meal.name} is easy to divide into portions for ${show.name}: a relaxed, shareable dinner before a lighter watch.`:`Serve ${meal.name} before ${show.name} for a simple supper and a lighter watch.`};
 if(/action|adventure/.test(genre))return {score:handheld?30:0,line:`Prepare and serve ${meal.name} before ${show.name}; keep the cooking off your hands once the adventure begins.`};
 if(/drama|documentary/.test(genre))return {score:meal.minutes<=30?20:0,line:`Give ${show.name} room to breathe: ${meal.name} takes about ${meal.minutes} minutes, leaving the viewing portion of your evening free of cooking.`};
 return null;
}
