export function playCue(player:any,volume=.32){
 try{
  player.volume=volume;
  Promise.resolve(player.seekTo(0)).then(()=>player.play()).catch(()=>{});
 }catch{}
}
