// Commit new access only after both creation and durable storage succeed.
export async function createRecoveredHousehold(create, persist){
 const household=await create();
 if(!household?.key)throw Error('Could not create a household. Try again.');
 await persist(household.key);
 return household;
}
