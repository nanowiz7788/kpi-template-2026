/* Standalone level game physics. Never reads or writes KPI state. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KongJump=factory()})(typeof window!=='undefined'?window:this,function(){'use strict';
var KEY='kongkong-jump:best:v1',LEVEL_KEY='kongkong-jump:best-level:v1',LEVEL_SECONDS=30,MAX_LEVEL=10;
function difficulty(level){var n=Math.max(1,Math.min(10,Math.floor(level)||1));return {speed:190+(n-1)*22,interval:2.8-(n-1)*.15,firstSpawn:3.2-(n-1)*.16}}
function create(){return {mode:'ready',level:1,levelTime:0,time:0,distance:0,y:0,vy:0,hp:3,speed:190,spawnIn:3.2,obstacles:[],invulnerable:0,passed:0,serial:0,reason:null}}
function start(s){Object.assign(s,create());s.mode='running'}
function nextLevel(s){if(s.mode!=='levelclear'||s.level>=MAX_LEVEL)return false;s.level++;s.levelTime=0;s.y=0;s.vy=0;s.hp=3;s.obstacles=[];s.invulnerable=0;s.serial=0;s.reason=null;s.speed=difficulty(s.level).speed;s.spawnIn=difficulty(s.level).firstSpawn;s.mode='running';return true}
function jump(s){if(s.mode!=='running'||s.y>0||s.vy>0)return false;s.vy=660;s.y=.01;return true}
function step(s,dt){if(s.mode!=='running'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,1/30,LEVEL_SECONDS-s.levelTime);s.levelTime+=dt;s.time+=dt;s.speed=difficulty(s.level).speed;s.distance+=s.speed*dt/25;s.invulnerable=Math.max(0,s.invulnerable-dt);
 s.vy-=1800*dt;s.y=Math.max(0,s.y+s.vy*dt);if(s.y===0)s.vy=0;
 s.spawnIn-=dt;if(s.spawnIn<=0){s.obstacles.push({x:425,w:s.serial%3===2?33:26,h:s.serial%3===2?40:36,kind:s.serial%3===2?'case':'cone',hit:false,passed:false});s.serial++;s.spawnIn=difficulty(s.level).interval}
 s.obstacles.forEach(function(o){o.x-=s.speed*dt;if(!o.hit&&s.invulnerable===0&&o.x<112&&o.x+o.w>75&&s.y<o.h-8){o.hit=true;s.hp--;s.invulnerable=1.4;if(s.hp<=0){s.mode='over';s.reason='collision'}}if(!o.passed&&o.x+o.w<72){o.passed=true;if(!o.hit)s.passed++}});
 s.obstacles=s.obstacles.filter(function(o){return o.x>-60});
 if(s.mode==='running'&&s.levelTime>=LEVEL_SECONDS-1e-9){s.levelTime=LEVEL_SECONDS;s.mode=s.level===MAX_LEVEL?'complete':'levelclear';s.reason=s.level===MAX_LEVEL?'allclear':'levelclear'}
}
function readNumber(store,key,max){try{var n=Number(store.getItem(key));return Number.isFinite(n)&&n>=0?Math.min(max,Math.floor(n)):0}catch(e){return 0}}
function readBest(store){return readNumber(store,KEY,Number.MAX_SAFE_INTEGER)}
function readBestLevel(store){return readNumber(store,LEVEL_KEY,MAX_LEVEL)}
function saveNumber(store,key,value,max){var best=Math.max(readNumber(store,key,max),Number.isFinite(value)&&value>0?Math.min(max,Math.floor(value)):0);try{store.setItem(key,String(best))}catch(e){}return best}
function saveBest(store,value){return saveNumber(store,KEY,value,Number.MAX_SAFE_INTEGER)}
function saveBestLevel(store,value){return saveNumber(store,LEVEL_KEY,value,MAX_LEVEL)}
return {KEY:KEY,LEVEL_KEY:LEVEL_KEY,LEVEL_SECONDS:LEVEL_SECONDS,MAX_LEVEL:MAX_LEVEL,difficulty:difficulty,create:create,start:start,nextLevel:nextLevel,jump:jump,step:step,readBest:readBest,saveBest:saveBest,readBestLevel:readBestLevel,saveBestLevel:saveBestLevel};
});
