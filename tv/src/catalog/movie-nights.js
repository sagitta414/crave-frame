import {expandedRecipes} from './expanded-recipes.js';
/** @type {Array<[string,string,string,string]>} */
const films=[
 ['The Avengers','2012','Assemble & Share','Adventure'],
 ['The Lord of the Rings: The Fellowship of the Ring','2001','A Cozy Shire Supper','Cozy'],
 ['Ratatouille','2007','A Taste of Paris','Lighthearted'],
 ['Paddington','2014','A Warm Welcome','Lighthearted'],
 ['The Grand Budapest Hotel','2014','The Grand Supper','Cozy'],
 ['Chef','2014','Dinner on the Move','Lighthearted'],
 ['Before Sunrise','1995','Supper Before Sunrise','Romantic'],
 ["Harry Potter and the Philosopher's Stone",'2001','A Little Supper Magic','Adventure'],
 ['Jurassic Park','1993','An Epic Night In','Adventure'],
 ['Star Wars','1977','A Galaxy at the Table','Adventure'],
 ['The Incredibles','2004','An Incredible Family Supper','Adventure'],
 ['Moana','2016','An Ocean of Possibilities','Adventure'],
 ['Coco','2017','A Table of Memories','Lighthearted'],
 ["Kiki's Delivery Service",'1989','A Little Everyday Magic','Cozy'],
 ['Spirited Away','2001','An Unexpected Supper','Adventure'],
 ['Knives Out','2019','Dinner with a Twist','Cozy'],
 ['The Princess Bride','1987','As You Dish','Romantic'],
 ['Finding Nemo','2003','Just Keep Sharing','Adventure'],
 ['Back to the Future','1985','Back for Seconds','Adventure'],
 ['Raiders of the Lost Ark','1981','An Adventure at the Table','Adventure']
];
const methods=[0,2,5,7,12];
export const movieNights=films.flatMap(([movie,year,heading,mood],index)=>methods.map((method,variant)=>{
 const meal=expandedRecipes[method*20+(index+variant*3)%20];
 return {id:'movie-night-'+index+'-'+variant,movie,year,mood,heading:heading+' · '+meal.category.toLowerCase(),mealId:meal.id,mealName:meal.name,image:meal.image,minutes:meal.minutes,category:meal.category,description:'An independent movie-night pairing built around a '+mood.toLowerCase()+' evening and '+meal.category.toLowerCase()+'. Inspired by the title; not a recipe from the film or an official collaboration.'};
}));
export const movieNightById=id=>movieNights.find(n=>n.id===id);
