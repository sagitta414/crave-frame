import {titleKey} from './identity.js';
// Editorial interpretations, never claims that a dish appears on screen.
export const signatureEvenings=[
 {show:'paddington',meal:'grilled-cheese-soup',title:'A little comfort',kind:'Mood',line:'Paddington’s warmth, with grilled cheese and tomato soup for a comforting night in.'},
 {show:'chef',meal:'chicken-quesadillas',title:'Make something together',kind:'Mood',line:'Chef’s joy of cooking, with easy chicken quesadillas to make together—not the film’s Cuban sandwich.'},
 {show:'ratatouille',meal:'story-ratatouille',title:'Cook along with the story',kind:'On-screen food',line:'Ratatouille celebrates the humble vegetable dish; make our rustic version, inspired by the story.'},
 {show:'before-sunrise',meal:'tomato-pasta',title:'Let dinner linger',kind:'Mood',line:'Before Sunrise makes room for conversation; simple tomato pasta leaves you time to talk.'},
 {show:'grand-budapest',meal:'mushroom-toast',title:'A small occasion',kind:'Mood',line:'The Grand Budapest Hotel makes little details feel special; plate mushroom toast for your own small occasion.'}
];
export function signatureFor(meal,show){return signatureEvenings.find(s=>s.meal===meal?.id&&titleKey(s.show)===titleKey(show));}
