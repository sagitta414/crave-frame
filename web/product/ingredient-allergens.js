// Ingredient composition records, not brand or cross-contact certification.
// Unlisted ingredients have unknown composition and fail closed for exclusions.
export const allergyOptions=['Milk','Egg','Peanut','Tree nuts','Soy','Wheat','Fish','Shellfish','Sesame','Gluten'];
const records=new Map(),key=name=>name.trim().toLowerCase().replace(/\s+/g,' ');
function add(names,contains=[],unknown=[]){for(const name of names.split('|'))records.set(key(name),{contains,unknown});}
add('Apple|Arborio rice|Arugula|Avocado|Baby potatoes|Baking potatoes|Basil|Bell pepper|Black pepper|Broccoli|Broccoli florets|Butternut squash|Cabbage|Capers|Carrot|Cauliflower|Celery|Cherry tomatoes|Cherry tomatoes, halved|Chickpea flour|Chili flakes|Chipotle powder|Cilantro|Coconut milk|Cooked beetroot|Cooked broccoli|Cooked butternut squash|Cooked cabbage|Cooked carrots|Cooked cauliflower|Cooked chickpeas, drained|Cooked eggplant|Cooked green beans|Cooked green lentils|Cooked leeks|Cooked mushrooms|Cooked peas|Cooked potatoes|Cooked pumpkin|Cooked quinoa|Cooked red lentils|Cooked rice|Cooked roasted bell pepper|Cooked roasted fennel|Cooked roasted squash|Cooked roasted tomatoes|Cooked roasted zucchini|Cooked spinach, squeezed dry|Cooked sweet potato|Cooked white beans, drained|Cooked zucchini|Cornstarch|Cucumber|Dried apricots|Dried basil|Dried dill|Dried mint|Dried oregano|Dried parsley|Dried rosemary|Dried sage|Dried thyme|Eggplant|Fresh ginger|Frozen peas|Frozen sweetcorn|Garlic|Garlic powder|Green beans|Ground caraway|Ground coriander|Ground cumin|Ground ginger|Ground nutmeg|Honey|Kale|Large baking potatoes|Large bell peppers|Large flat mushrooms|Large lettuce leaves|Lemon juice|Lettuce|Lime juice|Maple syrup|Mushrooms|Olive oil|Onion|Orange, peeled|Parsley|Parsnip|Potatoes|Pumpkin seeds|Quick-cook polenta|Red cabbage|Red onion|Rice vinegar|Rosemary|Salad leaves|Scallions|Sliced bell peppers|Small broccoli florets|Smoked paprika|Snow peas|Spinach|Strawberries|Sweet potato|Thyme|Tomato passata|Tomato paste|Tomatoes|Water|Zucchini|Zucchini, diced small|Buckwheat');
add('Canned black beans, drained|Canned butter beans, drained|Canned chickpeas, drained|Canned chopped tomatoes|Canned kidney beans, drained|Canned pinto beans, drained|Canned sweetcorn, drained|Canned white beans, drained|Canned young jackfruit in brine, drained|Pitted olives|Ready-cooked rice');
add('Baking powder|Balsamic glaze|Garam masala|Jarred artichoke hearts, drained|Jarred roasted peppers, drained|Jarred salsa|Ketchup|Mild chili powder|Mild curry powder|Nutritional yeast|Tomato pizza sauce|Tomato sauce');
add('Barbecue sauce|Chili garlic sauce',[],['Soy','Wheat','Gluten']);
add('Canned tomato soup',[],['Milk','Wheat','Gluten']);
add('Frozen oven fries',[],['Milk','Wheat','Gluten']);
add('Harissa paste',[],['Sesame']);
add('Hoisin sauce',['Soy'],['Wheat','Gluten','Sesame']);
add('Jarred tomato pasta sauce',[],['Milk']);
add('Vegetable broth',[],['Soy','Wheat','Gluten']);
add('Milk|Butter|Ghee|Cheddar cheese|Feta|Mozzarella|Parmesan|Plain yogurt|Sour cream|Vegetarian hard cheese',['Milk']);
add('Almonds|Walnuts',['Tree nuts']);add('Smooth peanut butter|Peanut butter',['Peanut']);add('Sesame oil|Sesame seeds|Tahini',['Sesame']);
add('Firm tofu|Ready-to-eat firm tofu, cubed|Frozen shelled edamame|White miso',['Soy']);add('Soy sauce',['Soy','Wheat','Gluten']);
add('Cooked bulgur|Cooked couscous|Dry couscous|Plain flour',['Wheat','Gluten']);add('Cooked pearl barley|Barley',['Gluten']);add('Rolled oats',[],['Gluten']);
add('Cooked egg-free pasta|Egg-free pasta|Egg-free noodles|Egg-free potato gnocchi',['Wheat','Gluten']);
add('Pasta|Dry pasta|Dry spaghetti|Dry macaroni|Dry orzo|Cooked small pasta',['Wheat','Gluten'],['Egg']);add('Egg noodles',['Wheat','Gluten','Egg']);
add('Bread|Burger buns|Crusty bread|Flatbreads|Flour tortillas|Pita breads|Pizza dough|Ready-made pizza crust|Sliced sandwich bread|Small flour tortillas|Sourdough|Toasted breadcrumbs|Tortillas',['Wheat','Gluten'],['Milk','Egg','Soy','Sesame']);
add('Dairy-free breadcrumbs|Dairy-free burger buns|Dairy-free flatbreads|Dairy-free flour tortillas|Dairy-free pita breads|Dairy-free puff pastry|Dairy-free sandwich bread',['Wheat','Gluten'],['Egg','Soy','Sesame']);
add('Sesame-free bread',['Wheat','Gluten'],['Milk','Egg','Soy']);
add('Canned tuna, drained|Ready-cooked boneless salmon',['Fish']);add('Ready-cooked peeled shrimp|Prawns',['Shellfish']);
add('Ready-cooked chicken strips|Ready-cooked chicken pieces|Ready-cooked turkey strips|Ready-cooked beef strips|Fully cooked beef burger patties|Fully cooked beef meatballs|Pepperoni slices',[],['Milk','Egg','Soy','Wheat','Gluten','Sesame']);
add('Dairy-free cheese|Dairy-free butter|Dairy-free mozzarella|Dairy-free parmesan|Plant-based feta|Plant-based grated cheese|Plant-based mozzarella|Unsweetened plant yogurt|Unsweetened plant-based yogurt',[],['Soy','Tree nuts']);
add('Dairy-free basil pesto',[],['Tree nuts','Soy']);add('Pesto',[],['Milk','Tree nuts']);add('Mayonnaise',['Egg']);
export function ingredientAssessment(name){return records.get(key(name))||{contains:[],unknown:[...allergyOptions]};}
export function ingredientBlocked(name,memory={}){
 if((memory.dislikedIngredients||[]).some(x=>key(name).includes(key(x))))return true;
 const record=ingredientAssessment(name);return (memory.allergies||[]).some(a=>record.contains.includes(a)||record.unknown.includes(a));
}
