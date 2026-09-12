import featured from './title-metadata.json' with {type:'json'};
const aliases={'avengers':'tmdb-movie-24428','ratatouille':'tmdb-movie-2062','grand-budapest':'tmdb-movie-120467','chef':'tmdb-movie-212778','paddington':'tmdb-movie-116149','before-sunrise':'tmdb-movie-76'};
export function titleKey(value){if(!value)return '';if(typeof value==='string')return aliases[value]||value;const p=value.provider;if(p?.type==='movie')return 'tmdb-movie-'+p.id;if(p?.type==='tv'&&p.season!==undefined&&p.episode!==undefined)return `tmdb-tv-${p.id}-${p.season}-${p.episode}`;return aliases[value.id]||value.id;}
export function canonicalShow(show){if(!show)return show;const id=titleKey(show),known=aliases[show.id]&&featured.find(x=>x.id===id);return known?{...show,...known,mood:show.mood,cuisine:show.cuisine||known.cuisine,family:show.family??known.family,id}:{...show,id};}
export function distinctShows(items){const out=new Map();for(const s of items.filter(Boolean)){const next=canonicalShow(s),prior=out.get(next.id);if(!prior||s.provider||!prior.provider)out.set(next.id,next);}return [...out.values()];}
export function pairKey(mealId,show){return mealId+':'+titleKey(show);}

export function canonicalPair(value){const i=String(value).indexOf(':');return i<0?value:value.slice(0,i+1)+titleKey(value.slice(i+1));}
export function normalizeMemory(memory={}){return {...memory,watched:[...new Set((memory.watched||[]).map(titleKey))],dislikedPairs:[...new Set((memory.dislikedPairs||[]).map(canonicalPair))]};}
export function normalizeMembers(members=[]){return members.map(m=>({...m,vote:m.vote?canonicalPair(m.vote):m.vote,vetoes:(m.vetoes||[]).map(canonicalPair)}));}
export function normalizeHouse(house){return {...house,titles:distinctShows(house.titles||[]),memory:normalizeMemory(house.memory),nights:(house.nights||[]).map(n=>({...n,showId:titleKey(n.showId),show:n.show?{...n.show,id:titleKey(n.show)}:n.show,group:n.group?{...n.group,members:normalizeMembers(n.group.members)}:n.group}))};}
