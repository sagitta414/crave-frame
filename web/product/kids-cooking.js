// Kids help alongside a supervising adult; original recipe directions stay intact.
export function kidsSteps(steps,meal=null,level='Little helper'){return steps.map((step,index)=>({...step,
 helperTitle:index===0?'Get ready, kitchen teammate!':'Your helper mission',
 helperInstruction:level==='Growing cook'&&index===1&&helperTask(meal)?helperTask(meal):index===0?'Wash your hands with soap for 20 seconds. Ask your grown-up to choose your workspace.':index===steps.length-1?'Count the people eating and put out a napkin for each person. Wait for your grown-up to check that the food is ready and cool enough.':['Look at the ingredients your grown-up points to. How many colors can you name? Stay in your helper space.','Count one napkin for each person eating. Keep your helper space away from the stove.','Read the next step aloud together. Ask your grown-up what happens next.','Think of a fun name for tonight’s dinner. Tell your grown-up why you picked it.'][index%4],
 adultRequired:true,
 adultInstruction:step.instruction,
 adultNote:'Grown-up: handle knives, heat, appliances and raw ingredients. Choose any extra helper task for your child and stay with them.'
}));}

// Only ready-to-eat ingredients, away from heat, with an adult selecting the task.
function helperTask(meal){
 const tasks={
 'tomato-pasta':'Tear the washed basil leaves your grown-up gives you into a clean bowl. Let your grown-up add them to the hot pasta.',
 'roasted-pasta':'Tear washed basil leaves into a clean bowl for your grown-up to add later.',
 'pepper-pasta':'Tear washed basil leaves for the pasta. Your grown-up handles the peppers and heat.',
 'chicken-basil-pasta':'Tear washed basil in your separate helper space. Your grown-up handles all chicken and hot food.',
 'margherita':'Count the washed basil leaves in a separate bowl. Your grown-up handles the raw dough and hot pizza.',
 'flatbread':'Tear washed basil into a small bowl. Your grown-up adds it to the flatbread.',
 'pepperoni-pizza':'Count the toppings your grown-up sets aside in a clean bowl. Leave dough and the oven to them.',
 'cheeseburgers-fries':'Arrange washed lettuce leaves on a clean plate, away from the raw burgers and stove.',
 'grilled-cheese-soup':'Count two bread slices per sandwich and set them on a clean board. Your grown-up handles slicing and the pan.',
 'chicken-quesadillas':'Count the tortillas your grown-up sets aside. Keep away from chicken preparation and the hot pan.',
 'loaded-baked-potatoes':'Measure the ready-to-eat grated cheese your grown-up provides into a clean bowl. They handle the hot potatoes.',
 'mac-cheese-peas':'Measure the ready-to-eat grated cheese into a clean bowl with your grown-up. They handle the hot sauce.',
 'recipe-smoky-black-bean-tacos':'Count one tortilla at a time with your grown-up and place them on a clean plate before warming.',
 'recipe-corn-and-pinto-bean-tacos':'Count the tortillas onto a clean plate. Your grown-up handles warming and filling.',
 'chicken-pepper-tacos':'Count tortillas in your clean helper space. Your grown-up prepares all chicken and peppers.',
 'shrimp-pepper-tacos':'Count tortillas onto a clean plate away from the raw shrimp. Your grown-up cooks and fills them.',
 'turkey-pita-pockets':'Count the pita breads with your grown-up. Leave opening, cutting and the turkey filling to them.'
 };return tasks[meal?.id]?tasks[meal.id]+' Stay with your grown-up; they choose whether this task fits your skills.':null;
}
