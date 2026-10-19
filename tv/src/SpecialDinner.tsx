import React,{useState} from 'react';
import {View} from 'react-native';
import {Text} from './TVText';
import {TVButton as Button} from './TVButton';
import {threeActMeal} from './catalog/three-act';
import {mealById} from './catalog/catalog';
import {ingredients} from './catalog/engine';
import {ingredientBlocked} from './catalog/food-restrictions';
const menus:any={
 'tomato-pasta':{starter:'cucumber',dessert:'strawberries',name:'A fresh pasta evening'},
 'pepper-pasta':{starter:'carrot',dessert:'orange',name:'A colorful night in'},
 'chicken-basil-pasta':{starter:'cucumber',dessert:'strawberries',name:'Basil pasta and a sweet finish'},
 'margherita':{starter:'carrot',dessert:'orange',name:'Pizza night, with a little extra'}
};
export function SpecialDinner({pair,prefs,memory,adapted,onChange}:any){
 const [open,setOpen]=useState(false),main=pair.meal.courses?mealById(pair.meal.mainMealId):pair.meal,menu=menus[main.id];
 if(!menu||pair.show.kind!=='Movie'||main.twoAppetites)return null;
 const dinner=threeActMeal(main,menu.starter,menu.dessert),fits=dinner.minutes<=prefs.cookTime&&(!prefs.eveningMinutes||dinner.minutes+25+pair.show.minutes<=prefs.eveningMinutes)&&!ingredients(dinner,prefs.people,adapted).some((i:any)=>ingredientBlocked(i.name,memory));
 return <View style={{gap:16,marginVertical:16}}><Button quiet onPress={()=>setOpen(!open)}>{open?'Hide special dinner':'Make it special · optional'}</Button>{open&&<><Text style={{fontSize:28,color:'#FFF6EE'}}>{menu.name}</Text><Text style={{fontSize:23,lineHeight:33,color:'#D5DFED'}}>{dinner.courses.map((c:any)=>c.name).join(' → ')}</Text><Text style={{fontSize:21,lineHeight:31,color:'#D5DFED'}}>Adds 10 minutes of preparation. Prepare and chill dessert before the movie. This is an untested menu suggestion, not a claim about food shown on screen.</Text>{pair.meal.courses?<Button onPress={()=>onChange(main)}>Keep just the main course</Button>:fits?<Button onPress={()=>onChange(dinner)}>Review this three-course dinner</Button>:<Text style={{fontSize:22,lineHeight:32,color:'#FFD1AA'}}>This menu does not fit your current food or time limits. Your original dinner stays selected.</Text>}</>}</View>;
}
