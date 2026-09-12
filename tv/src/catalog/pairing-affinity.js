const hash=value=>{let result=0;for(const char of String(value))result=(result*31+char.charCodeAt(0))>>>0;return result;};

const titleFavorites={
 'grand-budapest':['spaghetti-meatballs','chicken-potatoes','mac-cheese-peas'],
 'tmdb-movie-120467':['spaghetti-meatballs','chicken-potatoes','mac-cheese-peas'],
 detectorists:['loaded-baked-potatoes','grilled-cheese-soup','chicken-potatoes'],
 'only-murders':['pepperoni-pizza','spaghetti-meatballs','grilled-cheese-soup'],
 chef:['chicken-quesadillas','cheeseburgers-fries','pepperoni-pizza'],
 'tmdb-movie-212778':['chicken-quesadillas','cheeseburgers-fries','pepperoni-pizza'],
 ratatouille:['margherita','tomato-pasta','mac-cheese-peas'],
 'tmdb-movie-2062':['margherita','tomato-pasta','mac-cheese-peas'],
 paddington:['grilled-cheese-soup','mac-cheese-peas','loaded-baked-potatoes'],
 'tmdb-movie-116149':['grilled-cheese-soup','mac-cheese-peas','loaded-baked-potatoes'],
 'before-sunrise':['spaghetti-meatballs','tomato-pasta','chicken-basil-pasta'],
 'tmdb-movie-76':['spaghetti-meatballs','tomato-pasta','chicken-basil-pasta'],
 avengers:['cheeseburgers-fries','chicken-quesadillas','pepperoni-pizza'],
 'tmdb-movie-24428':['cheeseburgers-fries','chicken-quesadillas','pepperoni-pizza']
};

export function pairingAffinity(meal,show){
 const id=show.id||'',favorites=titleFavorites[id]||[],name=meal.name.toLowerCase(),category=String(meal.category||'').toLowerCase(),genre=String(show.genre||'').toLowerCase();
 let score=meal.familiar?42:0;
 const favoriteIndex=favorites.indexOf(meal.id);if(favoriteIndex>=0)score+=140-favoriteIndex*18;
 if(/action|adventure|family/.test(genre)&&/burger|pizza|taco|wrap|quesadilla/.test(name+' '+category))score+=24;
 if(/mystery|drama/.test(genre)&&/pasta|soup|potato|chicken/.test(name+' '+category))score+=22;
 if(/comedy|lighthearted/.test(genre)&&/pizza|burger|mac|taco|quesadilla/.test(name+' '+category))score+=20;
 if(/romance|romantic/.test(genre)&&/pasta|chicken|pizza/.test(name+' '+category))score+=22;
 if(/food|chef|cooking/.test(genre)&&/pasta|pizza|quesadilla/.test(name+' '+category))score+=20;
 return score+hash(id+'|'+meal.id)%17;
}
