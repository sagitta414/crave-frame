import {meals} from './catalog.js';
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
export const movieNightById=id=>[...movieNights,...curatedMovieNights].find(n=>n.id===id);

const editorialMeals=['chicken-quesadillas','loaded-baked-potatoes','story-ratatouille','grilled-cheese-soup','mushroom-toast','chicken-pepper-tacos','tomato-pasta','chicken-potatoes','cheeseburgers-fries','recipe-smoky-black-bean-tacos','pepperoni-pizza','recipe-coconut-chickpea-and-spinach-curry','recipe-corn-and-pinto-bean-tacos','flatbread','recipe-sesame-broccoli-noodles','roasted-pasta','margherita','recipe-lemon-chickpea-quinoa-bowls','mac-cheese-peas','turkey-pita-pockets'];
const editorialReasons=[
 'Shareable quesadilla wedges for an ensemble adventure; a practical match, not a dish from the film.',
 'A warm baked-potato supper evokes the comfort of a Shire table without claiming an on-screen recipe.',
 'A rustic vegetable stew inspired by the film’s love of cooking; not Remy’s layered confit byaldi.',
 'Grilled cheese and tomato soup bring a familiar welcome to Paddington’s new home; a comfort pairing.',
 'Mushroom toast makes a small, carefully plated supper for a story about hospitality.',
 'Handheld chicken tacos echo the casual energy of food-truck cooking; not the film’s signature sandwich.',
 'An uncomplicated pasta dinner leaves time for conversation before this walking-and-talking romance.',
 'Chicken and potatoes offer a homestyle feast mood; this is not an official Hogwarts recipe.',
 'Burgers and fries make an easy adventure-night supper; a practical rather than a story-food connection.',
 'Black bean tacos make a shareable starting point for a space adventure; no fictional cuisine claimed.',
 'Pizza slices make a familiar family dinner before a superhero family story.',
 'Coconut chickpea curry is an independent flavor-inspired pairing, not a representation of Polynesian cooking.',
 'Corn and bean tacos bring a shared-table format to a story centered on family and memory.',
 'Simple flatbreads offer a small baking project before Kiki’s story; not a recreation of the bakery’s food.',
 'A noodle bowl offers a warm supper before the film; this recipe is not claimed as an on-screen dish.',
 'Roasted tomato pasta can be served before settling into the mystery, keeping the viewing uninterrupted.',
 'A pizza to divide between two makes a relaxed meal before this playful romance.',
 'Lemon chickpea bowls are a bright, seafood-free family option; a practical match.',
 'Mac and cheese offers familiar comfort before a nostalgic adventure.',
 'Filled pitas are easy to portion before an action-filled evening; no historical food claim.'
];
export const curatedMovieNights=films.map(([movie,year,heading,mood],index)=>{const meal=meals.find(m=>m.id===editorialMeals[index]);if(!meal)throw Error('Missing editorial dinner '+editorialMeals[index]);return {id:'editorial-night-'+index,movie,year,heading,mood,mealId:meal.id,mealName:meal.name,image:meal.image,minutes:meal.minutes,category:meal.category,description:editorialReasons[index]};});
