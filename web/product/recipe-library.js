// Original demo recipes. Quantities serve two. Cooked grains and canned legumes
// are explicitly named so preparation estimates do not hide an extra cooking job.
/** @typedef {[string,number,string]} Ingredient */
/** @returns {Ingredient} */
const I=(name,amount,unit='g')=>[name,amount,unit];
const oil=()=>I('Olive oil',1,'tbsp'), garlic=()=>I('Garlic',2,'cloves');
const yogurt={from:'Plain yogurt',to:'Unsweetened plant-based yogurt',amount:60,unit:'g',reason:'Use unsweetened plant-based yogurt as the finishing sauce. Check breads, sauces, and packaged ingredients to match your dietary needs.'};
const feta={from:'Feta',to:'Plant-based feta',amount:60,unit:'g',reason:'Use plant-based feta for the same salty finishing role. Check packaged ingredient labels.'};
const cheese={from:'Vegetarian hard cheese',to:'Nutritional yeast',amount:2,unit:'tbsp',reason:'Use nutritional yeast as a savory dairy-free finish. Choose egg-free pasta and dairy-free packaged ingredients.'};
const mozzarella={from:'Mozzarella',to:'Plant-based mozzarella',amount:100,unit:'g',reason:'Use plant-based mozzarella and dairy-free flatbreads. Follow the cheese package melting instructions.'};
const honey={from:'Honey',to:'Maple syrup',amount:1,unit:'tbsp',reason:'Maple syrup replaces honey in the sauce. Choose egg-free noodles and check bottled sauce ingredients.'};
const slug=s=>s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const names=items=>items.map(i=>i[0].toLowerCase()).join(', ');
const recipe=(name,category,image,cuisine,minutes,moods,items,swap,steps,subtitle)=>({id:'recipe-'+slug(name),name,category,image,cuisine,minutes,effort:minutes<=30?'Easy':'Relaxed',moods,ingredients:[...items,I(swap.from,swap===cheese?25:swap===mozzarella?100:swap===honey?1:60,swap===honey?'tbsp':'g')],swap,steps,subtitle,photoNote:'Representative category photograph'});
const recipes=[];

// TACOS & WRAPS — distinct warm fillings and fresh finishes.
/** @type {Array<[string,Ingredient[],Ingredient[],string]>} */
const tacos=[
 ['Smoky black bean tacos',[I('Canned black beans, drained',240),I('Bell pepper',180)], [I('Avocado',100)],'Smoked paprika'],
 ['Chipotle mushroom tacos',[I('Mushrooms',250),I('Canned black beans, drained',180)], [I('Red cabbage',100)],'Chipotle powder'],
 ['Cumin chickpea wraps',[I('Canned chickpeas, drained',240),I('Zucchini',180)], [I('Cucumber',100)],'Ground cumin'],
 ['Corn & pinto bean tacos',[I('Canned pinto beans, drained',240),I('Frozen sweetcorn',150)], [I('Tomatoes',120)],'Smoked paprika'],
 ['Sweet potato & bean tacos',[I('Cooked sweet potato',220),I('Canned black beans, drained',200)], [I('Avocado',100)],'Ground cumin'],
 ['Crispy tofu & pepper wraps',[I('Firm tofu',250),I('Bell pepper',180)], [I('Lettuce',60)],'Smoked paprika'],
 ['Spiced lentil tacos',[I('Cooked green lentils',250),I('Mushrooms',150)], [I('Red cabbage',100)],'Ground cumin'],
 ['Cauliflower & chickpea tacos',[I('Cauliflower',200),I('Canned chickpeas, drained',200)], [I('Tomatoes',120)],'Mild chili powder'],
 ['Zucchini & butter bean wraps',[I('Zucchini',220),I('Canned butter beans, drained',240)], [I('Arugula',40)],'Dried oregano'],
 ['Barbecue jackfruit tacos',[I('Canned young jackfruit in brine, drained',250),I('Canned black beans, drained',200),I('Barbecue sauce',40)], [I('Red cabbage',100)],'Smoked paprika']
];
for(const [name,warm,fresh,spice] of tacos)recipes.push(recipe(name,'Tacos & wraps','tacos','Americas',30,['Adventure','Lighthearted'],[I('Small flour tortillas',6,'pieces'),...warm,...fresh,oil(),I(spice,1,'tsp'),I('Lime juice',1,'tbsp')],yogurt,[['Prepare the filling',`Drain canned ingredients. Pat tofu dry if using. Slice mushrooms, peppers and zucchini; cut cauliflower into very small florets. Shred jackfruit if using. Prepare ${names(fresh)} for serving.`,0],['Cook the filling',`Heat olive oil in a wide skillet over medium heat. Add ${names(warm)} and ${spice.toLowerCase()}. Cook for 12–15 minutes, stirring, until vegetables are tender and everything is hot throughout. Add a splash of water if the pan dries out; mash some beans to bind.`,720],['Warm the tortillas','Warm tortillas following their packet directions. Stir lime juice into the filling and season to taste.',0],['Build and share',`Divide the filling among tortillas. Add ${names(fresh)} and spoon over {finish}. Serve immediately.`,0]],'Warm tortillas, a generous filling, and something fresh.'));

// CURRIES — use canned pulses and small vegetable pieces.
/** @type {Array<[string,Ingredient[],string]>} */
const curries=[
 ['Coconut chickpea & spinach curry',[I('Canned chickpeas, drained',240),I('Spinach',100)],'Mild curry powder'],
 ['Cauliflower & pea curry',[I('Cauliflower',200),I('Frozen peas',150)],'Garam masala'],
 ['Ginger tofu & broccoli curry',[I('Firm tofu',250),I('Broccoli',180),I('Fresh ginger',15)],'Mild curry powder'],
 ['Sweet potato & lentil curry',[I('Cooked sweet potato',200),I('Cooked green lentils',240)],'Garam masala'],
 ['Mushroom & butter bean curry',[I('Mushrooms',200),I('Canned butter beans, drained',240)],'Mild curry powder'],
 ['Tomato & kidney bean curry',[I('Canned kidney beans, drained',240),I('Canned chopped tomatoes',200)],'Garam masala'],
 ['Green bean & chickpea curry',[I('Green beans',200),I('Canned chickpeas, drained',240)],'Mild curry powder'],
 ['Peanut tofu curry',[I('Firm tofu',250),I('Bell pepper',180),I('Smooth peanut butter',30)],'Mild curry powder'],
 ['Pumpkin & white bean curry',[I('Cooked pumpkin',220),I('Canned white beans, drained',240)],'Ground cumin'],
 ['Eggplant & chickpea curry',[I('Eggplant',220),I('Canned chickpeas, drained',240)],'Garam masala']
];
for(const [name,items,spice] of curries)recipes.push(recipe(name,'Curries','curry','Asian',40,['Cozy','Adventure'],[...items,I('Onion',100),garlic(),oil(),I(spice,2,'tsp'),I('Coconut milk',200,'ml'),I('Vegetable broth',150,'ml'),I('Cooked rice',250)],yogurt,[['Prepare','Drain canned beans. Dice onion and mince garlic. Cut firm vegetables into 1 cm pieces; trim green beans and cut broccoli or cauliflower into small florets. Cube tofu if using.',0],['Start the base',`Warm olive oil over medium heat. Cook onion for 5 minutes, then add garlic and ${spice.toLowerCase()} for 30 seconds. Finely grate ginger if listed and stir it in.`,300],['Simmer',`Add ${names(items.filter(i=>i[0]!=='Spinach'&&i[0]!=='Fresh ginger'))}, coconut milk and broth. Simmer gently for 18–20 minutes, stirring, until vegetables are tender and pulses or tofu are hot throughout. Stir in spinach for the last 2 minutes if listed.`,1080],['Serve','Heat the cooked rice according to its packaging or until steaming hot throughout. Season the curry, spoon over rice, and finish with {finish}.',0]],'A gently spiced curry using cooked pulses or tofu.'));

// SOUPS — each uses a ready-cooked pulse or grain.
/** @type {Array<[string,Ingredient[],string]>} */
const soups=[
 ['Tomato & red lentil soup',[I('Cooked red lentils',250),I('Canned chopped tomatoes',250),I('Carrot',100)],'Ground cumin'],
 ['White bean & rosemary soup',[I('Canned white beans, drained',240),I('Carrot',150),I('Celery',100)],'Dried rosemary'],
 ['Mushroom & barley soup',[I('Mushrooms',250),I('Cooked pearl barley',200)],'Dried thyme'],
 ['Sweetcorn & potato chowder',[I('Frozen sweetcorn',200),I('Cooked potatoes',250)],'Smoked paprika'],
 ['Chickpea & kale soup',[I('Canned chickpeas, drained',240),I('Kale',100),I('Canned chopped tomatoes',200)],'Ground cumin'],
 ['Broccoli & white bean soup',[I('Broccoli',250),I('Canned white beans, drained',240)],'Dried thyme'],
 ['Carrot & ginger lentil soup',[I('Carrot',250),I('Cooked red lentils',240),I('Fresh ginger',15)],'Ground coriander'],
 ['Black bean & tomato soup',[I('Canned black beans, drained',240),I('Canned chopped tomatoes',250),I('Bell pepper',120)],'Smoked paprika'],
 ['Pumpkin & chickpea soup',[I('Cooked pumpkin',300),I('Canned chickpeas, drained',240)],'Ground cumin'],
 ['Garden minestrone',[I('Canned kidney beans, drained',180),I('Cooked small pasta',150),I('Zucchini',150),I('Canned chopped tomatoes',200)],'Dried oregano']
];
for(const [name,items,spice] of soups)recipes.push(recipe(name,'Soups','soup','European',35,['Cozy','Romantic'],[...items,I('Onion',100),garlic(),oil(),I('Vegetable broth',600,'ml'),I(spice,1,'tsp'),I('Bread',2,'slices')],yogurt,[['Prepare','Drain canned beans. Finely dice onion, carrots, celery and peppers when listed. Slice mushrooms, cut broccoli into small florets, shred kale and grate ginger if using.',0],['Soften the base',`Heat olive oil in a saucepan. Cook onion and any raw firm vegetables or mushrooms for 6 minutes over medium heat. Add garlic and ${spice.toLowerCase()}, stirring for 30 seconds.`,360],['Simmer',`Add broth and remaining soup ingredients: ${names(items)}. Do not add any ingredient twice. Hold back cooked pasta and kale until the last 5 minutes. Simmer 15–20 minutes until vegetables are tender and everything is hot throughout. Mash some beans or potato against the pot for a thicker soup.`,900],['Finish','Season to taste. Ladle into two bowls, swirl in {finish}, and serve with the bread.',0]],'A generous bowl with cooked pulses, grains, or vegetables.'));

// BOWLS — cooked grains make these achievable on a weeknight.
/** @type {Array<[string,string,Ingredient[],Ingredient[],string,string]>} */
const bowls=[
 ['Lemon chickpea quinoa bowls','Cooked quinoa',[I('Canned chickpeas, drained',240),I('Zucchini',180)],[I('Cucumber',100)],'Dried oregano','Mediterranean'],
 ['Smoky black bean rice bowls','Cooked rice',[I('Canned black beans, drained',240),I('Bell pepper',180)],[I('Avocado',100)],'Smoked paprika','Americas'],
 ['Cumin lentil couscous bowls','Cooked couscous',[I('Cooked green lentils',240),I('Carrot',180)],[I('Parsley',10)],'Ground cumin','Mediterranean'],
 ['Mushroom barley bowls','Cooked pearl barley',[I('Mushrooms',250),I('Canned white beans, drained',180)],[I('Arugula',40)],'Dried thyme','European'],
 ['Broccoli tofu rice bowls','Cooked rice',[I('Firm tofu',250),I('Broccoli',180)],[I('Scallions',20)],'Ground ginger','Asian'],
 ['Harissa chickpea grain bowls','Cooked bulgur',[I('Canned chickpeas, drained',240),I('Zucchini',180),I('Harissa paste',15)],[I('Cucumber',100)],'Ground cumin','Mediterranean'],
 ['Corn & pinto bean bowls','Cooked rice',[I('Canned pinto beans, drained',240),I('Frozen sweetcorn',150)],[I('Tomatoes',120)],'Smoked paprika','Americas'],
 ['Sweet potato lentil bowls','Cooked quinoa',[I('Cooked sweet potato',220),I('Cooked green lentils',200)],[I('Spinach',50)],'Ground cumin','European'],
 ['Pepper & butter bean bowls','Cooked couscous',[I('Bell pepper',220),I('Canned butter beans, drained',240)],[I('Parsley',10)],'Dried oregano','Mediterranean'],
 ['Pea & mushroom rice bowls','Cooked rice',[I('Frozen peas',150),I('Mushrooms',220)],[I('Scallions',20)],'Dried thyme','European']
];
for(const [name,grain,warm,fresh,spice,cuisine] of bowls)recipes.push(recipe(name,'Bowls','bowl',cuisine,30,['Lighthearted','Adventure'],[I(grain,250),...warm,...fresh,oil(),I(spice,1,'tsp'),I('Lemon juice',1,'tbsp')],yogurt,[['Get ready',`Prepare ${names(fresh)} and set aside. Drain canned beans. Cut raw vegetables small, thinly slice carrot, and cube tofu when used.`,0],['Cook the topping',`Warm olive oil in a skillet. Add ${names(warm)} and ${spice.toLowerCase()}. Cook over medium heat for 12–15 minutes until tender and hot throughout, stirring and adding a splash of water if needed.`,720],['Heat the grain',`Heat ${grain.toLowerCase()} following the package directions or until steaming hot throughout. Stir lemon juice into the warm topping.`,0],['Build your bowls',`Divide the grain between two bowls, add the warm topping and ${names(fresh)}. Spoon over {finish} and season to taste.`,0]],'A complete bowl built around ready-cooked grains.'));

// NOODLES — all use egg-free noodles; sauce components are explicit.
/** @type {Array<[string,Ingredient[],Ingredient[]]>} */
const noodleVariants=[
 ['Sesame broccoli noodles',[I('Broccoli',200)], [I('Sesame seeds',1,'tbsp')]],
 ['Peanut carrot noodles',[I('Carrot',180)], [I('Smooth peanut butter',35)]],
 ['Miso mushroom noodles',[I('Mushrooms',220)], [I('White miso',20)]],
 ['Chili pepper noodles',[I('Bell pepper',200)], [I('Chili garlic sauce',15)]],
 ['Lime cabbage noodles',[I('Cabbage',200)], [I('Lime juice',1,'tbsp')]],
 ['Hoisin green bean noodles',[I('Green beans',200)], [I('Hoisin sauce',30)]],
 ['Ginger spinach noodles',[I('Spinach',150)], [I('Fresh ginger',20)]],
 ['Coconut curry noodles',[I('Bell pepper',150)], [I('Coconut milk',100,'ml'),I('Mild curry powder',1,'tsp')]],
 ['Edamame sesame noodles',[I('Frozen shelled edamame',180)], [I('Sesame seeds',1,'tbsp')]],
 ['Sweetcorn & snow pea noodles',[I('Frozen sweetcorn',100),I('Snow peas',120)], [I('Rice vinegar',1,'tbsp')]]
];
for(const [name,veg,sauce] of noodleVariants)recipes.push(recipe(name,'Noodles','noodles','Asian',30,['Adventure','Lighthearted'],[I('Egg-free noodles',180),I('Firm tofu',200),...veg,...sauce,I('Soy sauce',1,'tbsp'),I('Sesame oil',1,'tbsp'),garlic()],honey,[['Prepare','Pat tofu dry and cut into small cubes. Mince garlic, thinly slice carrots or peppers, shred cabbage, slice mushrooms and trim green beans when listed. Cut broccoli into small florets.',0],['Mix the sauce',`Mix soy sauce with ${names(sauce)}, {finish}, and 3 tablespoons water. Finely grate fresh ginger if listed. Whisk peanut butter or miso until smooth if used.`,0],['Cook noodles','Cook egg-free noodles following their package directions; drain and set aside. Cook frozen edamame according to its package instructions if listed.',0],['Stir-fry',`Heat sesame oil over medium heat. Cook tofu and ${names(veg)} for 8–12 minutes until vegetables are tender and tofu is hot throughout. Add spinach only in the last 2 minutes if listed. Stir in garlic for the final 30 seconds. Add noodles and sauce and toss for 2 minutes; loosen with water if needed.`,600]],'Noodles, tofu, vegetables, and a sauce mixed from scratch.'));

// PASTA — vegetable sauces with a vegetarian cheese finish.
/** @type {Array<[string,Ingredient[]]>} */
const pastas=[
 ['Zucchini & lemon pasta',[I('Zucchini',250),I('Lemon juice',1,'tbsp')]],
 ['Mushroom & thyme pasta',[I('Mushrooms',250),I('Dried thyme',1,'tsp')]],
 ['Pea & spinach pasta',[I('Frozen peas',180),I('Spinach',100)]],
 ['Broccoli & garlic pasta',[I('Broccoli',250),I('Chili flakes',0.25,'tsp')]],
 ['Roasted pepper & olive pasta',[I('Jarred roasted peppers, drained',220),I('Pitted olives',50)]],
 ['White bean & rosemary pasta',[I('Canned white beans, drained',240),I('Dried rosemary',1,'tsp')]],
 ['Tomato & caper pasta',[I('Cherry tomatoes',250),I('Capers',20)]],
 ['Eggplant & tomato pasta',[I('Eggplant',220),I('Canned chopped tomatoes',200)]],
 ['Sweetcorn & basil pasta',[I('Frozen sweetcorn',200),I('Basil',10,'leaves')]],
 ['Lentil & tomato pasta',[I('Cooked green lentils',240),I('Canned chopped tomatoes',200)]]
];
for(const [name,items] of pastas)recipes.push(recipe(name,'Pasta','pasta','Mediterranean',30,['Romantic','Cozy'],[I('Egg-free pasta',180),...items,garlic(),oil()],cheese,[['Start the pasta','Bring a pot of water to a boil. Cook pasta following its packet instructions. Reserve a mug of pasta water before draining.',0],['Prepare the sauce','Mince garlic. Slice mushrooms or zucchini; dice eggplant into 1 cm pieces, halve cherry tomatoes and cut broccoli into small florets if using. Drain jarred or canned ingredients.',0],['Cook the vegetables',`Warm olive oil over medium heat. Add ${names(items)} except any lemon juice, basil or spinach. Cook 12–15 minutes until vegetables are tender, adding a splash of pasta water as needed. Stir in garlic for the last minute, and spinach for the last 2 minutes if listed.`,720],['Toss and serve','Toss drained pasta with the sauce and enough reserved pasta water to coat. Add any listed basil or lemon juice now. Top with {finish} and season to taste.',0]],'A vegetable-forward pasta with a simple pan sauce.'));

// SALADS — no-cook assembly using already cooked grains and pulses.
/** @type {Array<[string,Ingredient[],string]>} */
const salads=[
 ['Greek-inspired chickpea salad',[I('Canned chickpeas, drained',240),I('Cucumber',150),I('Tomatoes',150),I('Pitted olives',40)],'Dried oregano'],
 ['Lentil & beet salad',[I('Cooked green lentils',250),I('Cooked beetroot',200),I('Walnuts',30)],'Dried thyme'],
 ['Quinoa & avocado salad',[I('Cooked quinoa',250),I('Avocado',120),I('Cucumber',150)],'Ground cumin'],
 ['White bean & roasted pepper salad',[I('Canned white beans, drained',240),I('Jarred roasted peppers, drained',200)],'Dried oregano'],
 ['Couscous & apricot salad',[I('Cooked couscous',250),I('Dried apricots',50),I('Canned chickpeas, drained',180)],'Ground cumin'],
 ['Apple & walnut lentil salad',[I('Cooked green lentils',250),I('Apple',150),I('Walnuts',30)],'Dried thyme'],
 ['Corn & black bean salad',[I('Canned black beans, drained',240),I('Canned sweetcorn, drained',150),I('Tomatoes',120)],'Ground cumin'],
 ['Orange & butter bean salad',[I('Canned butter beans, drained',240),I('Orange, peeled',180),I('Cucumber',120)],'Dried oregano'],
 ['Strawberry & quinoa salad',[I('Cooked quinoa',250),I('Strawberries',180),I('Almonds',30)],'Dried basil'],
 ['Mediterranean pasta salad',[I('Cooked egg-free pasta',250),I('Cherry tomatoes',180),I('Canned chickpeas, drained',180)],'Dried oregano']
];
for(const [name,items,herb] of salads)recipes.push(recipe(name,'Salads','salad','Mediterranean',15,['Lighthearted','Romantic'],[...items,I('Salad leaves',60),I('Olive oil',1.5,'tbsp'),I('Lemon juice',1.5,'tbsp'),I(herb,0.5,'tsp')],feta,[['Prepare',`Wash and dry salad leaves. Drain canned ingredients. Cut fruit and vegetables into bite-size pieces; roughly chop nuts and dried fruit when listed. Use chilled, ready-cooked grains, pasta or lentils for this recipe.`,0],['Make the dressing',`Whisk olive oil, lemon juice and ${herb.toLowerCase()} in a large bowl. Season to taste.`,0],['Combine',`Add ${names(items)} and toss gently with the dressing. Fold through salad leaves just before serving.`,0],['Finish','Divide between two bowls and crumble {finish} over the top. Serve immediately.',0]],'An easy supper salad using ready-cooked ingredients.'));

// TRAY BAKES — dense vegetables are cut small and checked for tenderness.
/** @type {Array<[string,Ingredient[],string,string]>} */
const trays=[
 ['Paprika potato & chickpea tray',[I('Potatoes',300),I('Bell pepper',150)],'Canned chickpeas, drained','Smoked paprika'],
 ['Lemon cauliflower & white bean tray',[I('Cauliflower',300),I('Carrot',150)],'Canned white beans, drained','Dried oregano'],
 ['Cumin carrot & butter bean tray',[I('Carrot',300),I('Red onion',150)],'Canned butter beans, drained','Ground cumin'],
 ['Sweet potato & black bean tray',[I('Sweet potato',300),I('Bell pepper',150)],'Canned black beans, drained','Smoked paprika'],
 ['Rosemary squash & chickpea tray',[I('Butternut squash',300),I('Red onion',150)],'Canned chickpeas, drained','Dried rosemary'],
 ['Zucchini & tomato bean tray',[I('Zucchini',250),I('Cherry tomatoes',200)],'Canned white beans, drained','Dried oregano'],
 ['Mushroom & potato bean tray',[I('Potatoes',250),I('Mushrooms',200)],'Canned butter beans, drained','Dried thyme'],
 ['Harissa cauliflower chickpea tray',[I('Cauliflower',300),I('Red onion',150),I('Harissa paste',20)],'Canned chickpeas, drained','Ground cumin'],
 ['Eggplant & pepper bean tray',[I('Eggplant',250),I('Bell pepper',200)],'Canned kidney beans, drained','Smoked paprika'],
 ['Parsnip & carrot lentil tray',[I('Parsnip',250),I('Carrot',200)],'Cooked green lentils','Dried thyme']
];
for(const [name,veg,pulse,spice] of trays)recipes.push(recipe(name,'Tray bakes','bowl','European',50,['Cozy','Adventure'],[...veg,I(pulse,240),I('Olive oil',2,'tbsp'),I(spice,1,'tsp'),I('Lemon juice',1,'tbsp')],yogurt,[['Heat and prepare','Heat oven to 220°C / 425°F. Cut potatoes, squash, parsnips, carrots and sweet potatoes into 1 cm pieces when listed. Cut other vegetables into 2 cm pieces or small florets. Drain pulses.',0],['Roast',`Toss ${names(veg)} with olive oil and ${spice.toLowerCase()}. Spread on a large tray in one layer. Roast for 25 minutes, turning halfway.`,1500],['Add the pulses',`Stir ${pulse.toLowerCase()} into the tray. Roast for 10 more minutes until hot throughout and vegetables are tender. Check dense vegetables with a fork and give them longer if needed.`,600],['Finish','Drizzle with lemon juice and season to taste. Divide between plates and spoon over {finish}.',0]],'Roasted vegetables and pulses with a cool finishing sauce.'));

// ONE-POT — cooked bases keep the method and timing dependable.
/** @type {Array<[string,Ingredient[],string]>} */
const skillets=[
 ['Three-bean chili',[I('Canned kidney beans, drained',160),I('Canned black beans, drained',160),I('Canned pinto beans, drained',160),I('Bell pepper',150)],'Smoked paprika'],
 ['Smoky lentil & potato skillet',[I('Cooked green lentils',240),I('Cooked potatoes',250)],'Smoked paprika'],
 ['Chickpea & spinach tomato pot',[I('Canned chickpeas, drained',240),I('Spinach',120)],'Ground cumin'],
 ['Butter bean & mushroom stew',[I('Canned butter beans, drained',240),I('Mushrooms',220)],'Dried thyme'],
 ['Mexican-inspired rice skillet',[I('Cooked rice',250),I('Canned black beans, drained',200),I('Frozen sweetcorn',100)],'Ground cumin'],
 ['White bean & zucchini pot',[I('Canned white beans, drained',240),I('Zucchini',220)],'Dried oregano'],
 ['Pepper & lentil couscous skillet',[I('Cooked couscous',200),I('Cooked green lentils',200),I('Bell pepper',180)],'Ground cumin'],
 ['Kidney bean & pumpkin stew',[I('Canned kidney beans, drained',240),I('Cooked pumpkin',250)],'Smoked paprika'],
 ['Pea & potato tomato skillet',[I('Frozen peas',180),I('Cooked potatoes',250)],'Dried thyme'],
 ['Eggplant & white bean stew',[I('Eggplant',220),I('Canned white beans, drained',240)],'Dried oregano']
];
for(const [name,items,spice] of skillets)recipes.push(recipe(name,'One-pot','soup','Americas',35,['Cozy','Adventure'],[...items,I('Canned chopped tomatoes',250),I('Onion',100),garlic(),oil(),I(spice,1,'tsp'),I('Vegetable broth',150,'ml')],yogurt,[['Prepare','Drain canned beans. Dice onion, peppers or zucchini if listed. Slice mushrooms and dice eggplant into 1 cm pieces. Use already cooked potatoes, grains and lentils.',0],['Start the base',`Heat olive oil in a deep skillet. Cook onion and any raw mushrooms, peppers, zucchini or eggplant for 7 minutes, stirring. Add garlic and ${spice.toLowerCase()} for the last 30 seconds.`,420],['Simmer',`Add tomatoes, broth, and remaining ingredients from ${names(items)} without adding anything twice. Hold spinach back until the final 2 minutes. Simmer for 15–20 minutes, stirring, until vegetables are tender and everything is piping hot. Add a splash of water if too thick.`,900],['Finish','Season to taste, divide into two generous servings, and top with {finish}.',0]],'A hearty one-pan dinner using ready-cooked pulses or grains.'));

// FLATBREADS — vegetables are cooked before topping for consistent short bakes.
/** @type {Array<[string,Ingredient[],string]>} */
const flatbreads=[
 ['Roasted pepper & olive flatbreads',[I('Jarred roasted peppers, drained',150),I('Pitted olives',40)],'Basil'],
 ['Artichoke & spinach flatbreads',[I('Jarred artichoke hearts, drained',150),I('Cooked spinach, squeezed dry',80)],'Parsley'],
 ['Sweetcorn & black bean flatbreads',[I('Canned sweetcorn, drained',100),I('Canned black beans, drained',150)],'Cilantro'],
 ['Roasted zucchini flatbreads',[I('Cooked roasted zucchini',200)],'Basil'],
 ['Pesto tomato flatbreads',[I('Cherry tomatoes',150),I('Dairy-free basil pesto',30)],'Basil'],
 ['Harissa chickpea flatbreads',[I('Canned chickpeas, drained',180),I('Harissa paste',15)],'Parsley'],
 ['Balsamic mushroom flatbreads',[I('Cooked mushrooms',180),I('Balsamic glaze',10)],'Parsley'],
 ['Roasted squash flatbreads',[I('Cooked roasted squash',200),I('Pumpkin seeds',15)],'Parsley'],
 ['White bean & olive flatbreads',[I('Canned white beans, drained',180),I('Pitted olives',40)],'Basil'],
 ['Broccoli & roasted pepper flatbreads',[I('Cooked broccoli',130),I('Jarred roasted peppers, drained',100)],'Parsley']
];
for(const [name,items,herb] of flatbreads)recipes.push(recipe(name,'Flatbreads','pizza','Mediterranean',20,['Lighthearted','Adventure'],[I('Dairy-free flatbreads',2,'pieces'),I('Tomato sauce',80),...items,I(herb,10)],mozzarella,[['Heat the oven','Heat oven to 220°C / 425°F. Put flatbreads on a baking tray. Use already cooked vegetables where specified, and drain canned or jarred ingredients well.',0],['Prepare toppings',`Chop ${names(items)} into small pieces as needed. Halve cherry tomatoes if listed. Chop ${herb.toLowerCase()} and reserve for serving.`,0],['Assemble and bake',`Spread tomato sauce on the flatbreads and distribute the toppings, holding any balsamic glaze back until after baking. Add {finish}. Bake 10–12 minutes until toppings are hot throughout and edges are crisp; follow flatbread packaging if directions differ.`,600],['Serve',`Scatter ${herb.toLowerCase()} over the top and drizzle any listed balsamic glaze. Cool briefly, slice, and share.`,0]],'Quick flatbreads using cooked or ready-to-use toppings.'));

export const recipeLibrary=recipes;
