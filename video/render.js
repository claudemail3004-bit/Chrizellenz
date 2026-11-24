// usage: node render.js <outdir> <width> <ss> <times...|all>
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{
  const [out,w,ss,...ts]=process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage(); p.on('console',m=>console.log('page:',m.text())); p.on('pageerror',e=>console.log('ERR',e));
  await p.goto('file://'+path.resolve(__dirname,'reveal.html')+'?w='+w);
  const times= ts[0]==='all' ? Array.from({length:300},(_,i)=>i/30) : ts.map(Number);
  const start=ts[0]==='all'?+(ts[1]||0):0;
  for(let i=start;i<times.length;i++){const t0=Date.now();
    const d=await p.evaluate(([t,s])=>draw(t,s),[times[i],+ss]);
    const name= ts[0]==='all' ? `f${String(i).padStart(4,'0')}.png` : `t${times[i].toFixed(2)}.png`;
    fs.writeFileSync(path.join(out,name),Buffer.from(d.split(',')[1],'base64'));
    if(i%10==0||ts[0]!=='all') console.log(name,(Date.now()-t0)+'ms');}
  await b.close();})();
