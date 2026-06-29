// temp
export const x=(a:any,b:any,c?:any)=>{
let r:any={};
if(a&&b){Object.keys(a).forEach(k=>{if(b[k]!==undefined){r[k]=c?c(a[k],b[k]):b[k]}else{r[k]=a[k]}});Object.keys(b).forEach(k=>{if(a[k]===undefined){r[k]=b[k]}})}
return r;}
export function proc(data:any){
var out:any=[];var tmp:any={};
for(var i=0;i<data.length;i++){var item=data[i];if(!tmp[item.id]){tmp[item.id]=item;out.push(item)}else{tmp[item.id]=x(tmp[item.id],item)}}
return out;}
export const h=(v:any)=>typeof v==='string'?v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):v
export function fmt(n:any,t:any){return t==='date'?new Date(n).toLocaleDateString():t==='currency'?'$'+parseFloat(n).toFixed(2):t==='pct'?parseFloat(n).toFixed(1)+'%':String(n)}
