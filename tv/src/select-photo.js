export function convertPhoto(file,{document,Image,URL}){
 return new Promise((resolve,reject)=>{
  let url;const finish=(error,value)=>{if(url)URL.revokeObjectURL(url);error?reject(error):resolve(value);};
  try {
   if(file.size>15000000)throw Error('Choose a photo smaller than 15 MB.');
   url=URL.createObjectURL(file);const image=new Image();
   image.onerror=()=>finish(Error('This photo could not be opened. Try JPEG or PNG.'));
   image.onload=()=>{try{
    if(!image.width||!image.height)throw Error('This image has no usable dimensions.');
    const canvas=document.createElement('canvas'),scale=Math.min(1,1200/Math.max(image.width,image.height));
    canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
    const context=canvas.getContext('2d');if(!context)throw Error('Photo conversion is unavailable. Try another browser.');
    context.drawImage(image,0,0,canvas.width,canvas.height);
    const jpeg=canvas.toDataURL('image/jpeg',.78);if(!jpeg.startsWith('data:image/jpeg;base64,'))throw Error('Photo conversion failed. Try JPEG or PNG.');
    finish(null,jpeg);
   }catch(error){finish(error);}};
   image.src=url;
  }catch(error){finish(error);}
 });
}
export function selectPhoto(){
 if(typeof document==='undefined')return Promise.reject(Error('Add a photo from the browser edition of your collection.'));
 return new Promise((resolve,reject)=>{
  const input=document.createElement('input');input.type='file';input.accept='image/*';
  input.oncancel=()=>reject(Error('Photo selection cancelled.'));
  input.onchange=()=>{const file=input.files?.[0];if(!file)return reject(Error('No photo selected.'));convertPhoto(file,{document,Image:window.Image,URL}).then(resolve,reject);};
  input.click();
 });
}
