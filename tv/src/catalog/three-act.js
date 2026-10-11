// Versioned, catalog-owned course plans. Amounts are for two people, like main recipes.
export const openingBites=[
 {id:'cucumber',name:'Lemon cucumber bites',minutes:5,ingredients:[['Cucumber',160,'g'],['Lemon juice',1,'tsp'],['Olive oil',1,'tsp'],['Dried mint',0.25,'tsp']],instruction:'Wash the cucumber and cut into bite-sized pieces. Toss with the measured lemon juice, olive oil and dried mint. Cover and refrigerate until serving.'},
 {id:'carrot',name:'Lemon carrot ribbons',minutes:5,ingredients:[['Carrot',160,'g'],['Lemon juice',1,'tsp'],['Olive oil',1,'tsp']],instruction:'Wash and peel the carrot. Use a vegetable peeler to make thin ribbons. Toss with the measured lemon juice and olive oil. Cover and refrigerate until serving.'}
];
export const creditsTreats=[
 {id:'strawberries',name:'Maple strawberries',minutes:5,ingredients:[['Strawberries',240,'g'],['Maple syrup',1,'tsp']],instruction:'Wash and hull the strawberries, then cut into small pieces. Toss with the measured maple syrup. Divide into dessert bowls, cover and refrigerate until the credits.'},
 {id:'orange',name:'Maple orange cups',minutes:5,ingredients:[['Orange, peeled',240,'g'],['Maple syrup',1,'tsp']],instruction:'Peel the oranges, remove any seeds and cut the flesh into small pieces. Toss with the measured maple syrup. Divide into dessert bowls, cover and refrigerate until the credits.'}
];
export function threeActMeal(main,starterId,dessertId){
 const starter=openingBites.find(x=>x.id===starterId),dessert=creditsTreats.find(x=>x.id===dessertId);
 if(!main||main.courses||!starter||!dessert)return undefined;
 const quantities=new Map();
 for(const item of [...starter.ingredients,...main.ingredients,...dessert.ingredients]){const key=item[0]+'|'+item[2],old=quantities.get(key);quantities.set(key,[item[0],(old?.[1]||0)+item[1],item[2]]);}

 return {...main,id:['three-act-v1',main.id,starter.id,dessert.id].join('~'),mainMealId:main.id,starterId,dessertId,
  name:'Three-act dinner · '+main.name,minutes:main.minutes+starter.minutes+dessert.minutes,proteinBase:undefined,
  subtitle:'Opening bite, main course and credits dessert. Combined preparation estimate; viewing and eating are separate.',
  ingredients:[...quantities.values()],
  courses:[{act:'I',name:starter.name,minutes:starter.minutes,serve:'Before the main course',ingredients:starter.ingredients},{act:'II',name:main.name,minutes:main.minutes,serve:'Before pressing play',ingredients:main.ingredients},{act:'III',name:dessert.name,minutes:dessert.minutes,serve:'At the credits; keep refrigerated until then',ingredients:dessert.ingredients}],
  stepCourses:[0,2,...main.steps.map(()=>1),null],
  steps:[['Act I · Prepare the opening bite',starter.instruction,0],['Act III · Prepare and chill dessert',dessert.instruction,0],...main.steps.map(([title,instruction,seconds])=>['Act II · '+title,instruction,seconds]),['Serve your three acts','Serve the prepared opening bite, then enjoy the main course before starting the movie. Keep dessert refrigerated during the movie and bring it out when the credits begin. This is a serving plan; the app does not detect movie playback or credits.',0]]};
}
export function resolveThreeAct(id,findMain){
 if(typeof id!=='string'||!id.startsWith('three-act-v1~'))return undefined;
 const parts=id.split('~');if(parts.length!==4)return undefined;
 return threeActMeal(findMain(parts[1]),parts[2],parts[3]);
}
