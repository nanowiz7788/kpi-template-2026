/* Lightweight Canvas scenery + DOM controls; all scores are game-only virtual km. */
(function(){'use strict';
if(!window.__J3_GATE_PASS)return;
const G=window.KongJump,$=s=>document.querySelector(s),canvas=$('#scene'),ctx=canvas.getContext('2d'),W=390,H=640,ground=480;
let game=G.create(),paused=false,last=0,acc=0,best=0,ready=false,runBest=0,bestLevel=0;
let storage;try{storage=window.localStorage}catch(e){storage=null}best=G.readBest(storage);bestLevel=G.readBestLevel(storage);
const sprites={},reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const pretty=n=>Math.floor(n).toLocaleString('ko-KR');
function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function cloud(x,y,s){ctx.fillStyle='#ffffffb0';ctx.beginPath();ctx.ellipse(x,y,29*s,10*s,0,0,7);ctx.ellipse(x-12*s,y-6*s,15*s,12*s,0,0,7);ctx.ellipse(x+9*s,y-9*s,19*s,16*s,0,0,7);ctx.fill()}
function hills(offset,y,color,height){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-100,H);for(let x=-100;x<=W+100;x+=4){let v=y+Math.sin((x+offset)*.012)*height+Math.sin((x+offset)*.025)*height*.25;ctx.lineTo(x,v)}ctx.lineTo(W+100,H);ctx.closePath();ctx.fill()}
function tree(x,y,size){ctx.strokeStyle='#72987b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-size);ctx.stroke();ctx.fillStyle='#8fb698';ctx.beginPath();ctx.ellipse(x,y-size,11,18,0,0,7);ctx.fill()}
function draw(){let d=game.distance*25,par=reduce?0:d;
 ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.clearRect(0,0,W,H);
 let sky=ctx.createLinearGradient(0,0,0,440);sky.addColorStop(0,'#b8dcdf');sky.addColorStop(.68,'#edf0d6');sky.addColorStop(1,'#fbefd1');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#f8d687';ctx.beginPath();ctx.arc(309,85,35,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff4cd';ctx.lineWidth=2;ctx.beginPath();ctx.arc(309,85,43,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<4;i++){let x=((i*143-par*.08)%620+620)%620-100;cloud(x,90+(i%2)*53,.7+i*.15)}
 hills(par*.12,280,'#a5c7bc',40);hills(par*.24,340,'#86b3a1',30);
 // Distant elevated railway: train, bridge, and piers move at different depths.
 ctx.fillStyle='#dbe3cc';ctx.fillRect(0,315,390,8);for(let i=-1;i<8;i++){let x=i*70-(par*.16%70);rounded(x,320,9,47,2,'#b5c9b6')}
 let tx=((270-par*.2)%650+650)%650-180;rounded(tx,287,154,25,10,'#fffbeb','#6f998c');rounded(tx+7,292,118,5,2,'#4c867e');for(let i=0;i<6;i++)rounded(tx+13+i*20,300,12,6,2,'#8eb7b4');ctx.fillStyle='#d4aa62';ctx.fillRect(tx+7,309,137,3);
 hills(par*.44,378,'#bed3a8',22);
 for(let i=0;i<5;i++){let x=((i*110-par*.35)%560+560)%560-40;tree(x,410,27+(i%2)*10)}
 // Rail-side walkway, separated from the lower track by a golden verge.
 ctx.fillStyle='#e4d9ab';ctx.fillRect(0,457,W,32);ctx.fillStyle='#f3e6ba';ctx.fillRect(0,458,W,8);ctx.fillStyle='#cfb77e';ctx.fillRect(0,480,W,4);
 for(let i=0;i<11;i++){let x=i*43-(par%43);ctx.fillStyle='#dbce9d';ctx.fillRect(x,472,16,2)}
 ctx.fillStyle='#aab8a0';ctx.fillRect(0,499,W,68);for(let i=0;i<16;i++){let x=i*31-(par*1.4%31);rounded(x,509,15,42,2,'#a38e73')}
 ctx.strokeStyle='#7c8e85';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,516);ctx.lineTo(W,516);ctx.moveTo(0,544);ctx.lineTo(W,544);ctx.stroke();ctx.strokeStyle='#d2ddd1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,513);ctx.lineTo(W,513);ctx.moveTo(0,541);ctx.lineTo(W,541);ctx.stroke();
 hills(par*.8,593,'#9cbb8c',12);for(let i=0;i<9;i++){let x=i*64-(par*.85%64);ctx.fillStyle=i%2?'#c4d5a5':'#8dae80';ctx.beginPath();ctx.ellipse(x,608,32,19,0,0,7);ctx.fill()}
 // Distance sign and wind streaks.
 let sx=((550-par*.7)%780+780)%780-70;if(sx>145){ctx.fillStyle='#74917d';ctx.fillRect(sx+15,409,3,48);rounded(sx,404,55,24,5,'#fff8df','#9eae8b');ctx.fillStyle='#51725f';ctx.font='bold 10px system-ui';ctx.fillText('콩콩역 →',sx+6,420)}
 game.obstacles.forEach(o=>{ctx.save();if(o.hit)ctx.globalAlpha=.5;if(o.kind==='case'){rounded(o.x,ground-o.h,o.w,o.h,6,'#b88c71','#816d60');rounded(o.x+8,ground-o.h-6,15,8,3,null,'#816d60');ctx.fillStyle='#dfc5a5';ctx.fillRect(o.x+o.w/2-2,ground-o.h+2,4,o.h-4)}else{ctx.fillStyle='#d58d64';ctx.beginPath();ctx.moveTo(o.x+o.w/2,ground-o.h);ctx.lineTo(o.x+o.w-2,ground-4);ctx.lineTo(o.x+2,ground-4);ctx.closePath();ctx.fill();ctx.fillStyle='#fff3ce';ctx.fillRect(o.x+7,ground-21,o.w-14,6);rounded(o.x-3,ground-5,o.w+6,6,2,'#9c7b5a')}ctx.restore()});
 let bob=game.mode==='running'&&!paused&&game.y===0&&!reduce?Math.sin(game.time*19)*1.7:0;
 ctx.fillStyle='#31554322';ctx.beginPath();ctx.ellipse(92,ground-2,25-Math.min(11,game.y/12),5,0,0,7);ctx.fill();
 let face=(game.mode==='levelclear'||game.mode==='complete')?'high':game.mode==='over'?(game.reason==='allclear'?'high':'low'):(game.invulnerable>0?'low':game.y>25?'high':'mid');
 if(ready){ctx.save();if(game.invulnerable>0&&Math.floor(game.time*12)%2)ctx.globalAlpha=.5;ctx.drawImage(sprites[face],37,ground-106-game.y+bob,112,112);ctx.restore()}
 if(game.y>5){ctx.fillStyle='#fff8db';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(60-i*11,ground-15-game.y*.24+i*6,3-i*.6,0,7);ctx.fill()}}
 if(game.mode==='running'&&game.levelTime<3){ctx.fillStyle='#42685e';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText('레벨 '+game.level+' · 속도 '+Math.round(game.speed)+' · 화면을 톡!',195,220);ctx.textAlign='left'}
}
function updateHud(){ $('#distance').innerHTML=pretty(game.distance)+' <em>㎞</em>';$('#best').innerHTML=pretty(best)+' <em>㎞</em>';$('#hearts').textContent='♥ '.repeat(game.hp)+'♡ '.repeat(3-game.hp);$('#hearts').setAttribute('aria-label','남은 기회 '+game.hp+'번');$('#level').textContent=String(game.level).padStart(2,'0');$('#best-level').textContent='최고 Lv.'+bestLevel;
 const remaining=Math.max(0,Math.ceil(G.LEVEL_SECONDS-game.levelTime));$('#time').textContent=game.mode==='over'?'종료':remaining+'초';$('#time').classList.toggle('urgent',remaining<=5&&game.mode==='running');$('#progress').style.width=(game.levelTime/G.LEVEL_SECONDS*100)+'%';$('#arena').dataset.mode=paused?'paused':game.mode;canvas.dataset.height=game.y.toFixed(1);canvas.dataset.speed=String(game.speed);canvas.dataset.level=String(game.level);canvas.dataset.obstacle=game.obstacles.length?game.obstacles[0].x.toFixed(1):'';
 document.querySelectorAll('#level-path span').forEach((el,i)=>{el.classList.toggle('done',i+1<game.level||((game.mode==='levelclear'||game.mode==='complete')&&i+1===game.level));el.classList.toggle('current',i+1===game.level&&game.mode!=='levelclear'&&game.mode!=='complete')});
}
function finish(){const cleared=game.mode==='levelclear',complete=game.mode==='complete';runBest=best;best=G.saveBest(storage,game.distance);bestLevel=G.saveBestLevel(storage,game.level);$('#overlay').hidden=false;
 $('#eyebrow').textContent=complete?'레벨 1–10 · 모든 여행을 마쳤어요!':cleared?'30초 완주! 다음 역으로 출발할까요?':'잠깐 쉬어 가도 괜찮아요';
 $('#panel-title').textContent=complete?'전 레벨 클리어!':cleared?'레벨 '+game.level+' 클리어!':'다음 역에서 또!';
 $('#panel-art').src='../content/mascot/kpi_mascot_'+(cleared||complete?'high':'low')+'.png';$('#panel-art').alt=cleared||complete?'기뻐하는 냥콩':'잠깐 쉬어 가는 냥콩';
 $('#panel-copy').innerHTML=complete?'냥콩과 열 번째 역까지 도착했어요.<br>멋진 여행이었어요!':cleared?'다음 레벨은 더 빠르고, 장애물도 많아요.<br>기회 3번을 다시 채워 드려요!':('레벨 '+game.level+'까지 달렸어요. '+(best>runBest?'새 최고 기록이에요!':'한 번 더 도전해 볼까요?'));
 $('#result').hidden=false;$('#result').innerHTML='<div><small>누적 운행</small><b>'+pretty(game.distance)+'㎞</b></div><div><small>최고 도달</small><b>Lv.'+bestLevel+'</b></div>';
 $('#action').innerHTML=cleared?'레벨 '+(game.level+1)+' 시작 <span>→</span>':'처음부터 다시 <span>↻</span>';$('#panel-note').textContent=cleared?'버튼을 누를 때까지 시간과 거리는 멈춰 있어요':'최고 거리와 도달 레벨은 이 기기에만 저장돼요';$('#pause').disabled=true;$('#announce').textContent=$('#panel-title').textContent+' 누적 '+pretty(game.distance)+'킬로미터.';updateHud()
}
function start(){G.start(game);runUI()}
function runUI(){paused=false;acc=0;last=0;bestLevel=G.saveBestLevel(storage,game.level);$('#overlay').hidden=true;$('#pause').disabled=false;$('#pause').textContent='Ⅱ';$('#pause').setAttribute('aria-label','일시정지');$('#tap-hint').textContent='화면 어디든 톡! 점프';canvas.focus({preventScroll:true});updateHud()}
function pause(){if(game.mode!=='running'||paused)return;paused=true;$('#overlay').hidden=false;$('#eyebrow').textContent='잠깐, 숨 고르기';$('#panel-title').textContent='쉬어 가요';$('#panel-art').src='../content/mascot/kpi_mascot_mid.png';$('#panel-copy').textContent='준비되면 냥콩과 이어 달려요.';$('#result').hidden=true;$('#action').innerHTML='계속하기 <span>→</span>';$('#panel-note').textContent='멈춘 동안 거리와 시간은 그대로예요';$('#pause').textContent='▶';$('#pause').setAttribute('aria-label','계속하기');updateHud()}
function resume(){paused=false;last=0;acc=0;$('#overlay').hidden=true;$('#pause').textContent='Ⅱ';$('#pause').setAttribute('aria-label','일시정지');canvas.focus({preventScroll:true});updateHud()}
$('#action').addEventListener('click',()=>{if(!ready)return;if(paused)resume();else if(game.mode==='levelclear'){G.nextLevel(game);runUI()}else start()});$('#pause').addEventListener('click',()=>paused?resume():pause());
$('#arena').addEventListener('pointerdown',e=>{if(e.target.closest('button')||!$('#overlay').hidden||paused)return;e.preventDefault();G.jump(game)});
document.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='ArrowUp')&&!e.repeat&&$('#overlay').hidden&&!paused){e.preventDefault();G.jump(game)}if(e.code==='Escape')paused?resume():pause()});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)pause()});
function resize(){const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr));draw()}new ResizeObserver(resize).observe(canvas);
function frame(now){let delta=last?Math.min((now-last)/1000,.08):0;last=now;if(game.mode==='running'&&!paused){acc+=delta;while(acc>=1/120){G.step(game,1/120);acc-=1/120;if(game.mode!=='running'){finish();break}}updateHud()}draw();requestAnimationFrame(frame)}
$('#action').disabled=true;$('#action').textContent='냥콩 준비 중…';
Promise.all(['low','mid','high'].map(face=>new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>{sprites[face]=im;resolve()};im.onerror=reject;im.src='../content/mascot/kpi_mascot_'+face+'.png'}))).then(()=>{ready=true;$('#action').disabled=false;$('#action').innerHTML='여행 시작 <span>→</span>';resize()}).catch(()=>{$('#panel-copy').textContent='냥콩 이미지를 불러오지 못했어요. 새로고침해 주세요.'});
$('#level-path').innerHTML=Array.from({length:10},(_,i)=>'<span title="레벨 '+(i+1)+'"></span>').join('');
updateHud();resize();requestAnimationFrame(frame);
})();
