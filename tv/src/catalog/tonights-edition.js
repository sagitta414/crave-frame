export function editionReady(night){return [1,2].every(p=>night.edition?.responses?.[p]);}
export function editionNotes(night){if(!editionReady(night))throw Error('Both partners must answer or skip before saving.');return [1,2].map(p=>{const r=night.edition.responses[p];return r.skipped?null:'Partner '+p+': '+r.text;}).filter(Boolean).join('\n\n');}
export function respondToEdition(night,value){
 if(night.prefs.people!==2||!night.watchStarted||!['ready','complete'].includes(night.status))throw Error('Tonight’s Edition opens after dinner and viewing have begun.');
 if(!value||![1,2].includes(value.person)||typeof value.skip!=='boolean'||(!value.skip&&(typeof value.text!=='string'||!value.text.trim()||value.text.trim().length>280)))throw Error('Write a moment in 280 characters or fewer, or skip.');
 night.edition={...night.edition,responses:{...night.edition?.responses,[value.person]:value.skip?{skipped:true}:{skipped:false,text:value.text.trim()}}};
}
