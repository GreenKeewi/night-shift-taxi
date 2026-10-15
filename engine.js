(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TaxiEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const PI=Math.PI,TAU=PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const PEOPLE=['Jules','Morgan','Alex','Sam','Robin','Charlie','Kai','Taylor','Avery','Casey','Drew','Frankie'];
const PLACES=['Noodle Club','Record Shop','Central Arcade','Hotel Luna','Flower Market','Night Cinema','Bluebird Café','Jazz House','Corner Books','Union Station','Skyline Diner','The Observatory','Eastside Gallery','Grand Theater','Harbor Hotel','Late Night Bakery','West End Club','Riverside Studios','Metro Hall','Garden Apartments','Freight Depot','Bowling Alley','Palm Terrace','City Museum','Hilltop Lounge'];
const STREETS=['Harbor Street','Lantern Avenue','Market Street','Union Avenue','Garden Road'];
const AVENUES=['Ash Avenue','Cedar Avenue','Broadway','Juniper Avenue','Maple Avenue','Park Avenue'];
function makeMap(seed=8427){
 const r=rng(seed),xs=[220],ys=[220];for(let i=1;i<6;i++)xs.push(xs[i-1]+430+Math.round(r()*100));for(let i=1;i<5;i++)ys.push(ys[i-1]+420+Math.round(r()*100));
 const w=xs[5]+240,h=ys[4]+560,hy=ys[4]+320,nodes=[],buildings=[],parks=[],bays=[],parked=[],ramps=[];
 for(let j=0;j<ys.length;j++)for(let i=0;i<xs.length;i++)nodes.push({x:xs[i],y:ys[j],i,j,id:j*6+i});
 for(let j=0;j<4;j++)for(let i=0;i<5;i++){
  const x=xs[i]+95,y=ys[j]+190,bw=xs[i+1]-xs[i]-190,bh=ys[j+1]-ys[j]-295;
  if(r()<.2){parks.push({x,y,w:bw,h:bh});continue;}
  const gap=20,cols=r()<.6?2:1,rows=2;
  for(let k=0;k<cols;k++)for(let l=0;l<rows;l++)buildings.push({x:x+k*(bw+gap)/cols,y:y+l*(bh+gap)/rows,w:(bw-gap*(cols-1))/cols,h:(bh-gap)/rows,color:Math.floor(r()*5),roof:Math.floor(r()*3)});
 }
 for(let j=0;j<5;j++)for(let i=0;i<5;i++){
  const x=(xs[i]+xs[i+1])/2,y=ys[j],rev=(i+j)%3===2;
  const bay={id:bays.length,x,y:y+(rev?116:79),a:rev?-PI/2:0,type:rev?'reverse':'parallel',street:STREETS[j],place:PLACES[bays.length%PLACES.length],node:j*6+i,col:i,row:j,roadY:y};bays.push(bay);
  if(!rev)for(const offset of [-78,78])parked.push({x:x+offset,y:y+79,a:0,parked:true,color:'#647477'});
  else for(const offset of [-43,43])parked.push({x:x+offset,y:y+116,a:-PI/2,parked:true,color:'#667d84'});
 }
 // Two real slip roads join the surface grid to the divided expressway.
 for(const i of [0,5]){const x=xs[i],sg=i===0?1:-1;ramps.push([{x,y:ys[4]},{x,y:hy-180},{x:x+sg*95,y:hy-90},{x:x+sg*210,y:hy+26}]);}
 return{seed,xs,ys,w,h,hy,nodes,buildings,parks,bays,parked,ramps};
}
function segmentDistance(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-a.x-t*dx,y-a.y-t*dy);}
function isRoad(map,x,y){if(map.xs.some(v=>Math.abs(x-v)<61)&&y>120&&y<map.ys[4]+62)return true;if(map.ys.some(v=>Math.abs(y-v)<61)&&x>120&&x<map.xs[5]+100)return true;if(Math.abs(y-map.hy)<76&&x>90&&x<map.w-90)return true;for(const ramp of map.ramps)for(let i=1;i<ramp.length;i++)if(segmentDistance(x,y,ramp[i-1],ramp[i])<37)return true;for(const b of map.bays)if(Math.abs(x-b.x)<126&&y>b.roadY&&y<b.roadY+148)return true;return false;}
function signal(map,node,time){const n=typeof node==='number'?map.nodes[node]:node;const phase=(time+(n.i+n.j)*1.1)%15;return {horizontal:phase<6.3?'green':phase<7.4?'amber':'red',vertical:phase>=8&&phase<13.8?'green':phase>=13.8&&phase<14.7?'amber':'red'};}
function nearestNode(map,p){let best=0,bd=Infinity;for(const n of map.nodes){const d=dist(n,p);if(d<bd){bd=d;best=n.id;}}return best;}
function route(map,from,to){let start=nearestNode(map,from),goal=nearestNode(map,to),n=map.nodes[start],g=map.nodes[goal],ids=[start];while(n.i!==g.i){n=map.nodes[n.j*6+n.i+Math.sign(g.i-n.i)];ids.push(n.id);}while(n.j!==g.j){n=map.nodes[(n.j+Math.sign(g.j-n.j))*6+n.i];ids.push(n.id);}const points=ids.map(id=>({x:map.nodes[id].x,y:map.nodes[id].y}));points.push({x:to.x,y:to.roadY===undefined?to.y:to.roadY},{x:to.x,y:to.y});return points;}
function rushHour(time){const minute=(17*60+20+time/2.5)%1440;const peak=(center,width)=>Math.max(0,1-Math.abs(minute-center)/width);return Math.max(peak(8*60,90),peak(18*60,90),peak(23*60,45)*.7);}
function trafficLimit(time,difficulty){return Math.min(64,20+Math.floor(difficulty*2)+Math.round(rushHour(time)*26));}
function carHit(a,b){const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)>65||Math.abs(dy)>65)return false;const axes=[a.a,a.a+PI/2,b.a,b.a+PI/2];for(const q of axes){const ax=Math.cos(q),ay=Math.sin(q),d=Math.abs(dx*ax+dy*ay),ra=22*Math.abs(Math.cos(a.a-q))+11*Math.abs(Math.sin(a.a-q)),rb=22*Math.abs(Math.cos(b.a-q))+11*Math.abs(Math.sin(b.a-q));if(d>=ra+rb)return false;}return true;}
function buildingHit(car,b){const cs=Math.cos(car.a),sn=Math.sin(car.a);for(const dx of [-19,19])for(const dy of [-9,9]){const x=car.x+cs*dx-sn*dy,y=car.y+sn*dx+cs*dy;if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return true;}return false;}
class Game{
 constructor(seed=8427){this.seed=seed;this.map=makeMap(seed);this.rand=rng(seed^9384);this.reset();}
 reset(){this.time=0;this.completed=0;this.cash=0;this.health=100;this.reputation=3;this.combo=0;this.penalties=0;this.mode='title';this.events=[];this.traffic=[];this.trafficId=0;this.junctions={};this.collisionCooldown=0;this.signalCooldown={};this.parkHold=0;this.reverseMeters=0;this.lastTarget=-1;this.lastDrive='forward';this.difficulty=1;this.stats={collisions:0,redLights:0,pickups:0,deliveries:0,missed:0};const b=this.map.bays[0];this.car={x:b.x-180,y:b.roadY+25,a:0,speed:0,steer:0};this.newJob(true);while(this.traffic.length<20)this.spawnTraffic();}
 start(){this.mode='playing';this.note('DISPATCH ONLINE','First fare is just ahead. Pull into the glowing bay.','good');}
 note(title,text,tone='info'){this.events.unshift({title,text,tone,time:this.time});this.events=this.events.slice(0,5);}
 target(){return this.job.stage==='pickup'?this.job.pickup:this.job.dropoff;}
 newJob(first=false){const m=this.map;let pick=first?m.bays[0]:m.bays[Math.floor(this.rand()*m.bays.length)];if(!first&&pick.id===this.lastTarget)pick=m.bays[(pick.id+7)%m.bays.length];let choices=m.bays.filter(b=>dist(b,pick)>600);let drop=first?m.bays[2]:choices[Math.floor(this.rand()*choices.length)];this.job={stage:'pickup',pickup:pick,dropoff:drop,person:PEOPLE[Math.floor(this.rand()*PEOPLE.length)],fare:Math.round(28+dist(pick,drop)*.045),timeLeft:first?105:Math.max(55,dist(this.car,pick)/45+45-this.difficulty*1.2),total:0};this.job.total=this.job.timeLeft;this.parkHold=0;this.reverseMeters=0;this.lastTarget=pick.id;}
 spawnTraffic(){const m=this.map,r=this.rand;if(this.traffic.length>=64)return;if(this.trafficId%5===4){const dir=r()<.5?1:-1;this.traffic.push({id:this.trafficId++,kind:'highway',x:110+r()*(m.w-220),y:m.hy+(dir===1?26:-26),a:dir===1?0:PI,speed:85+r()*35,desired:100+r()*40,dir,lane:r()<.5?0:1,color:['#bd7766','#8dbbb5','#b9a7c1','#d4bd81'][Math.floor(r()*4)],merge:null});return;}
 const n=m.nodes[Math.floor(r()*m.nodes.length)],ne=this.neighbors(n),to=ne[Math.floor(r()*ne.length)],dx=to.x-n.x,dy=to.y-n.y,L=Math.hypot(dx,dy),u=95+r()*(L-190),a=Math.atan2(dy,dx),x=n.x+dx*u/L-Math.sin(a)*25,y=n.y+dy*u/L+Math.cos(a)*25;if(Math.hypot(x-this.car.x,y-this.car.y)<170||this.traffic.some(o=>Math.hypot(x-o.x,y-o.y)<68))return;
 this.traffic.push({id:this.trafficId++,kind:'street',from:n.id,to:to.id,t:u,x,y,a,speed:35+r()*20,desired:55+r()*22,color:['#b98474','#7899b3','#bdc6bd','#a799b6','#639890'][Math.floor(r()*5)],stopped:false});}
 neighbors(n){const m=this.map;return [[n.i-1,n.j],[n.i+1,n.j],[n.i,n.j-1],[n.i,n.j+1]].filter(([i,j])=>i>=0&&i<6&&j>=0&&j<5).map(([i,j])=>m.nodes[j*6+i]);}
 updateTraffic(dt){const m=this.map,rush=rushHour(this.time);for(const id in this.junctions)if(!this.traffic.some(c=>c.id===this.junctions[id]&&c.reserved===+id))delete this.junctions[id];for(const c of this.traffic){if(c.kind==='highway'){
   // Vehicles use outer and inner lanes, easing across only with a clear gap.
   if(!c.merge&&this.rand()<dt*.035){const lane=1-c.lane,targetY=m.hy+c.dir*(lane?53:26);if(!this.traffic.some(o=>o!==c&&o.kind==='highway'&&Math.abs(o.x-c.x)<120+rush*70&&Math.abs(o.y-targetY)<20)){c.lane=lane;c.merge=targetY;}}
   const want=m.hy+c.dir*(c.lane?53:26);c.y+=(want-c.y)*Math.min(1,dt*1.2);if(Math.abs(c.y-want)<1)c.merge=null;let desired=c.desired*(1+Math.min(.28,this.difficulty*.015))*(1-rush*.33);for(const o of this.traffic){const ahead=(o.x-c.x)*c.dir;if(o!==c&&Math.abs(o.y-c.y)<23&&ahead>0&&ahead<100)desired=Math.min(desired,Math.max(0,(ahead-48)*1.4));}c.speed+=(desired-c.speed)*dt*2;c.x+=c.dir*c.speed*dt;if(c.x>m.w-90)c.x=95;if(c.x<90)c.x=m.w-95;continue;}
   const n=m.nodes[c.from],to=m.nodes[c.to],dx=to.x-n.x,dy=to.y-n.y,L=Math.hypot(dx,dy),a=Math.atan2(dy,dx),left=L-c.t,s=signal(m,to,this.time),red=(Math.abs(dx)>1?s.horizontal:s.vertical)!=='green';let target=c.desired*(1+Math.min(.3,this.difficulty*.015))*(1-rush*.2);
   if(c.reserved!==undefined&&c.from===c.reserved&&c.t>88){delete this.junctions[c.reserved];c.reserved=undefined;}
   if(left<150&&left>60){const owner=this.junctions[c.to];if(owner!==undefined&&owner!==c.id)target=Math.min(target,Math.max(0,(left-83)*1.4));else if(!red&&c.reserved===undefined&&!this.traffic.some(o=>o!==c&&o.kind==='street'&&o.from===c.from&&o.to===c.to&&o.t>c.t)){this.junctions[c.to]=c.id;c.reserved=c.to;}}
   if(red&&left>60&&left<180)target=Math.min(target,Math.max(0,(left-80)*1.45));
   if(left>68&&left<150&&this.traffic.some(o=>o!==c&&o.speed<7&&Math.hypot(o.x-to.x,o.y-to.y)<57))target=Math.min(target,Math.max(0,(left-80)*1.3));
   const look=45+c.speed*.65;for(const o of this.traffic){if(o===c)continue;const rx=o.x-c.x,ry=o.y-c.y,along=rx*Math.cos(a)+ry*Math.sin(a),across=Math.abs(-rx*Math.sin(a)+ry*Math.cos(a));if(along>0&&along<look&&across<21)target=Math.min(target,Math.max(0,(along-48)*1.5));}
   const tx=this.car.x-c.x,ty=this.car.y-c.y,along=tx*Math.cos(a)+ty*Math.sin(a),across=Math.abs(-tx*Math.sin(a)+ty*Math.cos(a));if(along>0&&along<look&&across<24)target=Math.min(target,Math.max(0,(along-49)*1.5));
   c.stalled=c.speed<2?(c.stalled||0)+dt:0;if(c.stalled>25&&dist(c,this.car)>800){c.t=Math.min(L-160,120);c.speed=20;c.stalled=0;if(c.reserved!==undefined){delete this.junctions[c.reserved];c.reserved=undefined;}}
   c.speed+=clamp(target-c.speed,-95*dt,45*dt);c.stopped=c.speed<3;c.t+=c.speed*dt;
   if(c.t>=L){let options=this.neighbors(to).filter(nn=>nn.id!==n.id);if(!options.length)options=[n];const next=options[Math.floor(this.rand()*options.length)];c.from=to.id;c.to=next.id;c.t=0;}
   const f=m.nodes[c.from],t=m.nodes[c.to],aa=Math.atan2(t.y-f.y,t.x-f.x),ll=dist(f,t),px=f.x+(t.x-f.x)*c.t/ll-Math.sin(aa)*25,py=f.y+(t.y-f.y)*c.t/ll+Math.cos(aa)*25;c.x+=(px-c.x)*Math.min(1,dt*10);c.y+=(py-c.y)*Math.min(1,dt*10);c.a+=angleDiff(aa,c.a)*Math.min(1,dt*8);
  }}
 update(dt,input={}){if(this.mode!=='playing')return;dt=Math.min(dt,.05);this.time+=dt;this.difficulty=1+this.completed*.62+this.time/160;this.collisionCooldown=Math.max(0,this.collisionCooldown-dt);if(this.traffic.length<trafficLimit(this.time,this.difficulty)&&this.rand()<dt*(1.5+rushHour(this.time)*2))this.spawnTraffic();this.updateTraffic(dt);if(this.traffic.length>trafficLimit(this.time,this.difficulty)&&this.rand()<dt*.7){const k=this.traffic.findIndex(c=>dist(c,this.car)>800);if(k>=0)this.traffic.splice(k,1);}
  const c=this.car,m=this.map,ox=c.x,oy=c.y,oa=c.a,road=isRoad(m,c.x,c.y),max= Math.abs(c.y-m.hy)<77?195:125,accel=road?100:50;
  if(input.up)c.speed+=accel*dt;else if(input.down)c.speed-=(c.speed>4?225:80)*dt;else c.speed*=Math.exp(-dt*(input.brake?8:1.4));
  if(input.brake)c.speed*=Math.exp(-dt*6);c.speed=clamp(c.speed,road?-52:-30,road?max:50);
  const steer=(input.right?1:0)-(input.left?1:0);c.steer+=(steer-c.steer)*Math.min(1,dt*7);if(Math.abs(c.speed)>1)c.a+=c.steer*c.speed/(48+Math.abs(c.speed)*.4)*dt;c.a=angleDiff(c.a,0);c.x+=Math.cos(c.a)*c.speed*dt;c.y+=Math.sin(c.a)*c.speed*dt;
  let blocked=c.x<65||c.y<85||c.x>m.w-65||c.y>m.h-65,hitKind='kerb';for(const b of m.buildings)if(buildingHit(c,b)){blocked=true;hitKind='building';break;}
  if(!blocked)for(const b of m.parked)if(carHit(c,b)){blocked=true;hitKind='parked car';break;}
  if(!blocked)for(const b of this.traffic)if(carHit(c,b)){blocked=true;hitKind='traffic';break;}
  if(blocked){c.x=ox;c.y=oy;c.a=oa;const severity=Math.max(3,Math.abs(c.speed)*.12);if(this.collisionCooldown<=0&&Math.abs(c.speed)>13){this.health=Math.max(0,this.health-severity);this.cash=Math.max(0,this.cash-3);this.combo=0;this.stats.collisions++;this.note('EASY ON THE FENDERS',`${hitKind==='traffic'?'Traffic collision':'Watch that '+hitKind}. $3 repair charge.`,'bad');this.collisionCooldown=1.2;}c.speed*=-.25;}
  this.checkSignals(ox,oy);this.checkParking(dt);
  this.job.timeLeft-=dt;if(this.job.timeLeft<=0){this.reputation--;this.combo=0;this.stats.missed++;this.note('FARE MISSED','Dispatch found another cab. Keep the next rider waiting less.','bad');this.newJob();}
  if(this.health<=0||this.reputation<=0){this.mode='gameover';this.note('SHIFT OVER',this.health<=0?'The cab needs a proper repair.':'Dispatch has ended your shift.','bad');}
 }
 checkSignals(ox,oy){const c=this.car,m=this.map;if(Math.abs(c.speed)<12)return;const vx=c.x-ox,vy=c.y-oy;
  for(const n of m.nodes){if(Math.abs(c.x-n.x)>100||Math.abs(c.y-n.y)>100)continue;let axis=null,cross=false;if(Math.abs(vx)>Math.abs(vy)&&Math.abs(c.y-n.y)<55){axis='horizontal';cross=vx>0?ox<n.x-69&&c.x>=n.x-69:ox>n.x+69&&c.x<=n.x+69;}else if(Math.abs(c.x-n.x)<55){axis='vertical';cross=vy>0?oy<n.y-69&&c.y>=n.y-69:oy>n.y+69&&c.y<=n.y+69;}
   if(cross&&signal(m,n,this.time)[axis]==='red'&&(this.signalCooldown[n.id]||0)<this.time){this.signalCooldown[n.id]=this.time+4;this.cash=Math.max(0,this.cash-12);this.job.timeLeft=Math.max(1,this.job.timeLeft-5);this.combo=0;this.stats.redLights++;this.note('RED LIGHT · $12','Cross on green. That cost 5 seconds, too.','bad');}
  }}
 parkingStatus(){const c=this.car,b=this.target(),dx=c.x-b.x,dy=c.y-b.y,along=dx*Math.cos(b.a)+dy*Math.sin(b.a),across=-dx*Math.sin(b.a)+dy*Math.cos(b.a),aligned=Math.abs(angleDiff(c.a,b.a))<.23,inside=Math.abs(along)<(b.type==='parallel'?24:15)&&Math.abs(across)<12,stopped=Math.abs(c.speed)<5,reverse=b.type!=='reverse'||this.reverseMeters>10;return{near:dist(c,b)<150,inside,aligned,stopped,reverse,ready:inside&&aligned&&stopped&&reverse,progress:this.parkHold/1.25};}
 checkParking(dt){const c=this.car,b=this.target();if(dist(c,b)<78&&c.speed<-3&&Math.abs(angleDiff(c.a,b.a))<.65)this.reverseMeters+=-c.speed*dt;if(dist(c,b)<27&&Math.abs(c.speed)<11&&Math.abs(angleDiff(c.a,b.a))<.32)c.a+=angleDiff(b.a,c.a)*Math.min(1,dt*4);const p=this.parkingStatus();if(p.ready)this.parkHold+=dt;else this.parkHold=Math.max(0,this.parkHold-dt*2);if(this.parkHold<1.25)return;
  this.parkHold=0;this.reverseMeters=0;
  if(this.job.stage==='pickup'){this.stats.pickups++;this.job.stage='dropoff';this.job.timeLeft=Math.max(58,dist(this.job.pickup,this.job.dropoff)/32+48-this.difficulty*1.6);this.job.total=this.job.timeLeft;this.note('RIDER ON BOARD',`${this.job.person} is heading to ${this.job.dropoff.place}.`,'good');this.lastTarget=this.job.dropoff.id;}
  else{this.completed++;this.stats.deliveries++;this.combo++;const tip=Math.max(0,Math.round(this.job.timeLeft*.2))+Math.min(20,this.combo*3),earned=this.job.fare+tip;this.cash+=earned;this.health=Math.min(100,this.health+9);this.note(`FARE COMPLETE · +$${earned}`,`$${tip} tip. Cab serviced +9%. Next call is in.`,'good');this.newJob();}
 }
 recover(){if(this.mode!=='playing')return;const n=this.map.nodes[nearestNode(this.map,this.car)];this.car={x:n.x+(n.i===5?-110:110),y:n.y+(n.i===5?-25:25),a:n.i===5?Math.PI:0,speed:0,steer:0};for(const offset of [0,65,130,-65]){const candidate={...this.car,x:this.car.x+offset};if(isRoad(this.map,candidate.x,candidate.y)&&!this.traffic.some(o=>carHit(candidate,o))){this.car=candidate;break;}}this.reverseMeters=0;this.cash=Math.max(0,this.cash-15);this.job.timeLeft=Math.max(2,this.job.timeLeft-10);this.health=Math.max(1,this.health-5);this.parkHold=0;this.note('ROADSIDE ASSIST','$15 and 10 seconds. Back on the road.','bad');}
}
return {Game,makeMap,isRoad,signal,route,nearestNode,carHit,buildingHit,angleDiff,dist,clamp,rng,rushHour,trafficLimit};
});
