(function(){'use strict';
if(!window.__J3_GATE_PASS)return;
var SEED=window.KPI_SEED, KEY='kpi2026:v1', LOGMAX=300, APP_VERSION='6'; // app.config.json version과 같이 올릴 것
var META={
 i01:{f:'산식 문구는 파일에 없음(확인 못 함). 시트 구성: 공사 실적 + SR 실적 합산(통합 효과), 좌석당 이동거리 보정 계산 포함.',n:'SR 통합 시나리오 5종(원안·2년평균·3년평균·결측보정·3년결측)'},
 i02:{f:'산식 문구는 파일에 없음(확인 못 함). 2020~21년(코로나) 결측·평균 처리 방식별 시나리오 5종.',n:'2020~22년 평균·결측 보정은 파일의 연도 라벨 그대로 표시'},
 i03:{f:'평균운행속도 = 총 주행거리(㎞) ÷ 총 주행시간(h) (시트 항목명 기준) · 정차시분 제외, 교외선·경원선 제외',n:'2026 = 7월말 + 8월 이후 합산(통합 후 전망)'},
 i04:{f:'열차운행㎞ = 광역철도 운행열차당 주행거리의 합 (파일 명시). 지표정의: 광역철도 운행을 확대하여 수도권 및 지방 대도시권 대중교통 이용자의 이용편익 확대를 위한 노력을 평가한다.',n:'7월 기준전망·자구노력 전망 2종 + 2027·2028 목표 시트 있음'},
 i05:{f:'산식 문구는 파일에 없음(확인 못 함).',n:''},
 i06:{f:'산식 문구는 파일에 없음(확인 못 함).',n:'교외선·경원선 제외(06번 시트 표기)'},
 i07:{f:'산식 문구는 파일에 없음(확인 못 함). 교외선·경원선 제외(시트 표기). 통합 이후 정선선 1,400회 가산 표기가 있음.',n:''},
 i08:{f:'산식 문구는 파일에 없음(확인 못 함). 단위 %.',n:'2020년 실적 없음(2021~)'},
 i10:{f:'수송톤㎞/화차수. 수송톤거리 = 수송한 화물에 운반한 거리를 곱한 것의 누계, 화차수 = 보유 화차수. 평가방식: 목표부여(편차), 상향지표.',n:'2021~2025 5개년만 있음'},
 i11:{f:'종합물류사업 매출액 = 물류서비스업 + 물류시설운영업 매출액 (물류정책기본법시행령 제3조 물류사업 범위 중 생활물류서비스 매출액 제외). 목표부여(편차), 상향지표.',n:'2026 = 종합물류 전체 매출 − 생활물류 매출'},
 i12:{f:'생활물류서비스 매출액 = KTX특송·짐배송·생활물류 트레인·레일택배. 목표부여(편차), 상향지표.',n:''}};
var PRESET_LATEST={i01:'srm',i02:'ox',i03:'int',i04:'jg',i05:'sr',i06:'sr',i07:'ye',i08:'sr',i10:'f28',i11:'v2',i12:'f29'};
var NOFORM={i01:1,i02:1,i05:1,i06:1,i07:1,i08:1}; // 원본 파일에 산식 문구가 없는 지표 → 실적 직접 입력 + 공통 목표부여(편차) 산출
var GROUPS=[ // 평가범주 표시 순서
 {t:'편리한 철도',h:'고속철도 수송서비스 증대',ids:['i01']},{t:null,h:'일반철도 수송서비스 증대',ids:['i02','i03']},
 {t:null,h:'광역철도 수송서비스 증대',ids:['i04']},{t:null,h:'철도이용 편의제고',ids:['i05','i06','i07','i08']},
 {t:'종합물류 철도',h:'물류사업 경쟁력 제고',ids:['i10','i11','i12']}];
var SHORT={i01:'고속철도 연인거리',i02:'일반철도 연인거리',i03:'일반철도 운행속도',i04:'광역철도 운행㎞',i05:'스마트 발권',i06:'철도연계서비스',i07:'이용 접근성',i08:'대국민 교통비',i10:'톤㎞/화차수',i11:'종합물류 매출',i12:'생활물류 매출'};
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var IND={},FLOOR=20; // 평점 하한 20 고정(목표부여(편차): MAX(20,MIN(100,…)))
SEED.indicators.forEach(function(i){IND[i.id]=i});
var ST,tab='home',drillId=null,YEARS=[2026,2027];

/* ---------- 저장소(localStorage, 시트 연동 대비 구조) ---------- */
function scenOf(i,sid){return i.scen.filter(function(s){return s.id===sid})[0]||i.scen[0]}
function initY27(i,o){o.y27Auto=(o.y27==null);if(!o.y27Auto){var a=calcY(i,2026,o),b=calcY(i,2027,o);if(a.ok&&(!b.ok||b.pj<a.pj-1e-9))o.y27Auto=true}if(o.y27Auto){var pv=prov(i,o);if(pv!=null)o.y27=pv}}
function fromScen(i,sid){var s=scenOf(i,sid),o={scen:s.id,hist:s.hist.slice(),y26:s.y26,y27:(i.y27==null?null:i.y27),sigma:s.sigmaApplied,sigma27:'5yr',weight:i.weight,edited:false};initY27(i,o);return o}
function freshState(preset){preset=preset||'latest';var st={v:1,year:2026,ind:{},log:[],updatedAt:null,preset:preset};
 SEED.indicators.forEach(function(i){st.ind[i.id]=fromScen(i,preset==='mg'?'mg':PRESET_LATEST[i.id])});
 return st}
function load(){try{var r=localStorage.getItem(KEY);if(r){var s=JSON.parse(r);if(s&&s.v===1){s.year=s.year===2027?2027:2026;SEED.indicators.forEach(function(i){var x=s.ind[i.id];if(!x){s.ind[i.id]=fromScen(i,PRESET_LATEST[i.id]);return}if(x.y27===undefined)x.y27=(i.y27==null?null:i.y27);if(!x.sigma27)x.sigma27='5yr';if(x.y27Auto===undefined)initY27(i,x)});return s}}}catch(e){}return freshState('latest')}
function save(){ST.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){toast('저장 실패: 브라우저 저장공간 확인')}}
function logc(id,field,o,n){ST.log.push({t:new Date().toISOString(),id:id,f:field,o:o,n:n});if(ST.log.length>LOGMAX)ST.log.splice(0,ST.log.length-LOGMAX)}

/* ---------- 산출(통합관리 ② 시트 산식과 동일) ---------- */
function pstd(a){var m=a.reduce(function(x,y){return x+y},0)/a.length;return Math.sqrt(a.reduce(function(x,y){return x+(y-m)*(y-m)},0)/a.length)}
function num(x){return typeof x==='number'&&isFinite(x)}
/* 2027 임시 설정값 규칙: 2026 평점을 그대로 유지하는 최소 2027 실적(= 2027 최저목표 + (2026 평점−20)/80 × (최고−최저목표)), 유효숫자 4자리 올림 */
function ceil4(x){if(!(x>0))return x;var st=Math.pow(10,Math.floor(Math.log10(x))-3);return Number((Math.ceil(x/st-1e-9)*st).toPrecision(12))}
function prov(i,s){var a=calcY(i,2026,s);if(!a.ok)return null;var h=[s.hist[2],s.hist[3],s.hist[4],s.hist[5],s.y26];if(!h.every(num))return null;
 var base=Math.max(h[4],(h[2]+h[3]+h[4])/3),s5=pstd(h),s4=Infinity,k;for(k=0;k<5;k++){s4=Math.min(s4,pstd(h.slice(0,k).concat(h.slice(k+1))))}
 var sg=s.sigma27==='min4'?s4:s5,hi=base+2*sg,lo=base-2*sg;if(!(hi>lo))return null;
 var sc=function(x){return Math.max(FLOOR,Math.min(100,20+80*(x-lo)/(hi-lo)))},x=ceil4(lo+(a.pj-20)/80*(hi-lo)),st=Math.pow(10,Math.floor(Math.log10(Math.abs(x)||1))-3),g=0;
 while(sc(x)<a.pj-1e-9&&g++<50)x+=st;return x}
function calcY(i,yr,so){var s=so||ST.ind[i.id],h,act,mode;
 if(yr===2027&&s.y27Auto){var pv=prov(i,s);if(pv!=null)s.y27=pv}
 if(yr===2027){h=[s.hist[2],s.hist[3],s.hist[4],s.hist[5],s.y26];act=s.y27;mode=s.sigma27}
 else{h=s.hist.slice(1,6);act=s.y26;mode=s.sigma}
 var ok=h.every(function(x){return typeof x==='number'&&isFinite(x)})&&typeof act==='number'&&isFinite(act);
 var r={ok:ok,w:s.weight,yr:yr,act:act};if(!ok)return r;
 var base=Math.max(h[4],(h[2]+h[3]+h[4])/3),s5=pstd(h),s4=Infinity,k;
 for(k=0;k<5;k++){var o=h.slice(0,k).concat(h.slice(k+1));s4=Math.min(s4,pstd(o))}
 var sg=mode==='min4'?s4:s5,hi=base+2*sg,lo=base-2*sg;
 var pj=Math.max(FLOOR,Math.min(100,20+80*(act-lo)/(hi-lo)));
 r.h=h;r.base=base;r.s5=s5;r.s4=s4;r.sg=sg;r.hi=hi;r.lo=lo;r.pj=pj;r.ds=pj/100*s.weight;r.rate=act/hi*100;r.yoy=h[4]?(act/h[4]-1)*100:null;r.screen=s4<=0.5*s5;
 if(yr===2026){var b27=Math.max((h[3]+h[4]+act)/3,act)+2*pstd([h[1],h[2],h[3],h[4],act]);r.need27=b27;r.g27=b27/act-1}
 return r}
function calc(i){return calcY(i,2026)}
function totals(yr){var t={ds:0,w:0,n:0};SEED.indicators.forEach(function(i){var c=calcY(i,yr);if(c.ok){t.ds+=c.ds;t.w+=c.w;t.n++}});return t}
/* ---------- 표시 ---------- */
function nf(x,d){if(x==null||!isFinite(x))return '-';return Number(x).toLocaleString('ko-KR',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})}
function big(v,unit,scale){if(v==null||!isFinite(v))return '-';
 if(scale===100)return nf(v*100,2)+'%';if(unit==='㎞/h')return nf(v,2)+' ㎞/h';
 var a=Math.abs(v),u=' '+unit; if(unit==='원')u='원';
 if(a>=1e12)return nf(v/1e12,2)+'조'+u; if(a>=1e8)return nf(v/1e8,1)+'억'+u; if(a>=1e4)return nf(v/1e4,0)+'만'+u; return nf(v,0)+u}
function stCls(p){return p>=90?'st-g':p>=70?'st-b':p>=50?'st-a':'st-r'}
function stTxt(p){return p>=90?'만점권':p>=70?'양호':p>=50?'보강':'취약'}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('on')},1800)}
function presetState(){var ms=true,ls=true;SEED.indicators.forEach(function(i){var s=ST.ind[i.id];if(s.edited||s.scen!=='mg')ms=false;if(s.edited||s.scen!==PRESET_LATEST[i.id])ls=false});return ms?'mg':ls?'latest':'mix'}
function fmtT(iso){if(!iso)return '저장 이력 없음';var d=new Date(iso);return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate()+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}

/* ---------- 총괄 ---------- */
function renderHome(){var yr=ST.year,t=totals(yr),ta=totals(2026),tb=totals(2027),pst=presetState(),rate=t.w?t.ds/t.w*100:0,h='',n=SEED.indicators.length,npv=SEED.indicators.filter(function(i){return ST.ind[i.id].y27Auto}).length;
 h+='<div class="card hero"><div class="yr"><button data-year="2026" class="'+(yr===2026?'on':'')+'">2026년</button><button data-year="2027" class="'+(yr===2027?'on':'')+'">2027년</button></div>'
 +'<div class="lab">'+yr+'년 예상 득점 (입력값 기준 실시간 산출)</div><div class="row"><div class="big">'+nf(t.ds,2)+'<small>/ '+nf(t.w,1)+'점</small></div><div class="pc">'+nf(rate,1)+'%<small>가중치 대비</small></div></div>'
 +'<div class="hbar"><i style="width:'+Math.min(100,rate)+'%"></i></div>'
 +'<div class="two"><span>2026 <b>'+nf(ta.ds,2)+'</b> / '+nf(ta.w,1)+' ('+ta.n+'/'+n+')</span><span>2027 <b>'+nf(tb.ds,2)+'</b> / '+nf(tb.w,1)+' ('+tb.n+'/'+n+')</span></div>'
 +'<div class="seg"><button data-preset="mg" class="'+(pst==='mg'?'on':'')+'">통합관리 260710</button><button data-preset="latest" class="'+(pst==='latest'?'on':'')+'">최신 파일 전망</button><button class="'+(pst==='mix'?'on':'')+'" disabled style="opacity:'+(pst==='mix'?1:.45)+'">직접 수정·혼합</button></div>'
 +'<div class="hint">득점 = Σ 평점 ÷ 100 × 가중치 · 괄호는 산출된 지표 수 · '+(tb.n<n?'2027은 실적이 입력된 지표만 합산(분모도 그만큼)':'11개 지표 합계')+(npv?' · 2027 임시 설정값 '+npv+'개 포함':'')+'</div></div>';
 h+=window.KPIMascot.render(t,yr);
 h+=glance(yr);
 h+='<div class="legend"><span><i class="st-g"></i>90↑ 만점권</span><span><i class="st-b"></i>70~90 양호</span><span><i class="st-a"></i>50~70 보강</span><span><i class="st-r"></i>50↓ 취약</span></div>';
 GROUPS.forEach(function(g){var ds=0,w=0;g.ids.forEach(function(id){var c2=calcY(IND[id],yr);if(c2.ok){ds+=c2.ds;w+=c2.w}});
  if(g.t)h+='<div class="cat">'+g.t+'</div>';
  h+='<div class="sec"><b>'+g.h+'</b><span>'+yr+' '+nf(ds,2)+' / '+nf(w,1)+'점</span></div>';
  g.ids.forEach(function(id){h+=indCard(IND[id],yr)})});
 h+='<p class="hint" style="margin:10px 2px">달성률 = 해당 연도 실적 ÷ 최고목표(평점 100 기준). 막대는 득점률(평점). 2027 목표는 2026 입력값을 직전 연도로 넣어 5개년 창을 한 해 밀어 계산합니다(저장·자료 탭의 설명 참고). 카드를 누르면 입력·산출 상세가 열립니다.</p>';
 $('#view').innerHTML=h}
function glance(yr){var h='<div class="card gl"><div class="gh"><b>한눈에 보기</b><span>막대 = '+yr+'년 득점률</span></div><div class="gr gh2"><span class="n">지표</span><span class="b"></span><span class="s'+(yr===2026?' sel':'')+'">2026 득점</span><span class="s'+(yr===2027?' sel':'')+'">2027 득점</span></div>';
 GROUPS.forEach(function(g){g.ids.forEach(function(id){var i=IND[id],a=calcY(i,2026),b=calcY(i,2027),c=yr===2027?b:a;
  var cell=function(x,sel,pv){return '<span class="s'+(sel?' sel':'')+'">'+(x.ok?'<b>'+nf(x.ds,2)+'</b>/'+nf(x.w,1)+(pv?'<sup class="pvs">*</sup>':''):'<em>미입력</em>')+'</span>'};
  h+='<button class="gr" data-open="'+id+'"><span class="n">'+esc(SHORT[id])+'</span><span class="b">'+(c.ok?'<i class="'+stCls(c.pj)+'" style="width:'+c.pj+'%"></i>':'')+'</span>'+cell(a,yr===2026,false)+cell(b,yr===2027,ST.ind[id].y27Auto)+'</button>'})});
 return h+'<div class="gf"><span>득점률 = 평점 · 색 구간은 화면 구분용 · * = 2027 임시 설정값(수정 가능) · 미입력은 합계에서 제외</span></div></div>'}
function indCard(i,yr){var s=ST.ind[i.id],c=calcY(i,yr),o=calcY(i,yr===2026?2027:2026),sc=scenOf(i,s.scen),act=yr===2027?s.y27:s.y26;
 if(!c.ok)return '<button class="card k" data-open="'+i.id+'"><div class="nm"><em>'+i.id.slice(1)+'</em>'+esc(i.name)+'</div><div class="hint" style="margin-top:6px">'+(yr===2027&&s.y27==null?'2027 실적이 아직 없습니다. 눌러서 입력하면 2027 득점이 계산됩니다.':'입력값이 비어 있어 산출 불가')+'</div></button>';
 var yo=c.yoy==null?'':'전년비 '+(c.yoy>=0?'+':'')+nf(c.yoy,1)+'%';
 return '<button class="card k" data-open="'+i.id+'"><div class="r1"><div class="nm"><em>'+i.id.slice(1)+'</em>'+esc(i.name)+'</div><div class="sc"><b>'+nf(c.ds,2)+'</b> / '+nf(c.w,1)+'<br><span class="chip '+stCls(c.pj)+'">'+stTxt(c.pj)+'</span></div></div>'
 +'<div class="r2"><span>'+yr+' 실적 <b>'+big(act,i.unit,i.scale)+'</b></span><span>달성률 <b>'+nf(c.rate,1)+'%</b></span></div>'
 +'<div class="bar"><i class="'+stCls(c.pj)+'" style="width:'+c.pj+'%"></i></div>'
 +'<div class="r3"><span class="tag">평점 '+nf(c.pj,1)+'</span><span class="tag">최고목표 '+big(c.hi,i.unit,i.scale)+'</span>'+(yo?'<span class="tag">'+yo+'</span>':'')
 +(yr===2027&&s.y27Auto?'<span class="tag prov">2027 임시 설정값</span>':'')+'<span class="tag">'+(yr===2026?2027:2026)+' 득점 '+(o.ok?nf(o.ds,2)+(yr===2026&&s.y27Auto?' (임시)':''):'미입력')+'</span>'
 +(s.edited?'<span class="tag ed">직접 수정</span>':'<span class="tag">'+esc(sc.label)+'</span>')+(sc.flag?'<span class="tag warn">확인 필요</span>':'')+(c.screen&&(yr===2026?s.sigma:s.sigma27)==='5yr'?'<span class="tag warn">극단치 ○</span>':'')+'</div></button>'}
/* ---------- 2026 입력(일괄) ---------- */
function renderInput(){var h='<div class="card"><div class="lbl">2026·2027 실적(전망) 일괄 입력 — 값을 바꾸면 총괄에 바로 반영되고 이 기기에 저장됩니다. 점수는 입력과 동시에 다시 계산됩니다.</div>';
 SEED.indicators.forEach(function(i){var s=ST.ind[i.id],a=calcY(i,2026),b=calcY(i,2027);
  h+='<div class="q2"><div class="n">'+esc(i.name)+'<small>가중치 '+nf(s.weight,1)+' · '+esc(i.unit)+(s.edited?' · 수정됨':'')+(NOFORM[i.id]?' · 직접 입력':'')+'</small></div><div class="qrow3">'
  +'<label>2026<input type="text" inputmode="decimal" data-q="'+i.id+'" data-yr="2026" class="'+(s.edited?'edited':'')+'" value="'+inVal(i,s.y26)+'"><span id="qs-'+i.id+'-2026">'+(a.ok?nf(a.ds,3):'-')+'</span></label>'
  +'<label>2027'+(s.y27Auto?' <i class="pvb">임시 설정값</i>':'')+'<input type="text" inputmode="decimal" data-q="'+i.id+'" data-yr="2027" class="'+(s.y27Auto?'prov':'')+'" placeholder="미입력" value="'+inVal(i,s.y27)+'"><span id="qs-'+i.id+'-2027">'+(b.ok?nf(b.ds,3):'-')+'</span></label></div></div>'});
 h+='</div><p class="hint" style="margin:6px 2px">입력칸 아래 숫자는 예상 득점. % 지표는 퍼센트 단위로 입력. 2027 칸이 비어 있으면(원본에 2027 값이 없는 지표) 2027 득점은 계산하지 않고 합계에서도 뺍니다. 2027 목표는 2026 입력값을 직전 연도로 넣어 계산하므로 2026 값을 바꾸면 2027 득점도 함께 바뀝니다. 산출은 모두 공통 목표부여(편차) 방식입니다.</p>';
 $('#view').innerHTML=h}
function inVal(i,v){if(v==null)return '';var x=i.scale===100?v*100:v;return i.scale===100?String(Math.round(x*1e6)/1e6):nf(x,Math.abs(x)<1000&&x%1?2:0).replace(/,/g,',')}
function parseIn(i,str){var t=String(str).replace(/[,\s]/g,'');if(t===''||!/^-?\d*\.?\d+$/.test(t))return null;var x=parseFloat(t);return i.scale===100?x/100:x}

/* ---------- 지표 상세(편집) ---------- */
function openDrill(id){drillId=id;var d=$('#drill');d.innerHTML=indDrill(IND[id]);d.classList.add('open');d.setAttribute('aria-hidden','false');$('.sh-b',d).scrollTop=0;refreshDrill()}
function closeDrill(){var d=$('#drill');d.classList.remove('open');d.setAttribute('aria-hidden','true');drillId=null;render()}
function indDrill(i){var s=ST.ind[i.id],h='<div class="sh-h"><button data-close>‹ 총괄</button><b>'+esc(i.name)+'</b></div><div class="sh-b">';
 h+='<div class="card"><div class="two2"><div><div class="lbl" style="margin:0">2026 예상 득점 <span id="d-pj">-</span></div><div class="big3" id="d-ds">-</div><div class="bar" style="height:10px"><i id="d-bar"></i></div><div class="hint" id="d-sub" style="margin-top:5px"></div></div><div><div class="lbl" style="margin:0">2027 예상 득점 <span id="d-pj7">-</span></div><div class="big3" id="d-ds7">-</div><div class="bar" style="height:10px"><i id="d-bar7"></i></div><div class="hint" id="d-sub7" style="margin-top:5px"></div></div></div><div class="hint" style="margin-top:6px">입력값을 바꾸면 두 해의 평점·득점이 바로 다시 계산됩니다.</div></div>';
 h+='<div class="card"><div class="lbl">기준 시나리오 (원본 파일의 2026 전망 버전)</div><div id="d-scen"></div><div id="d-flag"></div></div>';
 if(NOFORM[i.id])h+='<div class="note" style="background:#eaf2ff;border-color:#bcd3f7;color:#1c4a8f"><b>실적 직접 입력 지표</b> — 원본 파일에 이 지표의 산식 문구와 2027 값이 없어(확인 못 함), 2026 실적을 아래 칸에 직접 입력하면 됩니다(2027은 임시 설정값이 들어 있고 직접 입력하면 바뀝니다). 입력한 값은 다른 지표와 같은 공통 <b>목표부여(편차)</b> 방식(기준치·σ·최고/최저목표·평점·득점)으로 자동 계산됩니다.</div>';
 h+='<div class="card"><div class="lbl" style="font-weight:700;color:var(--navy);font-size:13px">입력 (직접 수정 가능)<span class="tag" style="margin-left:6px;font-weight:400">산출방식 목표부여(편차)</span></div><div class="grid2" style="margin-top:6px"><div class="y" style="color:var(--blue);font-weight:700">2026 실적</div><div><input type="text" inputmode="decimal" data-y26 value="'+inVal(i,s.y26)+'"><div class="help" id="d-y26h"></div></div>'
 +'<div class="y" style="color:var(--blue);font-weight:700">2027 실적<br><i class="pvb" id="d-pvb" hidden>임시 설정값</i></div><div><input type="text" inputmode="decimal" data-y27 placeholder="미입력" value="'+inVal(i,s.y27)+'"><div class="help" id="d-y27h"></div><button class="btn" id="d-prov" data-prov27 style="margin-top:6px;padding:6px 10px;font-size:12px" hidden>2027을 임시 설정값으로 되돌리기</button></div>';
 for(var k=0;k<6;k++){var sc=scenOf(i,s.scen);h+='<div class="y">'+esc(String(sc.labels[k]==null?'(없음)':sc.labels[k]))+(k===0?' <span class="help">참고</span>':'')+'</div><div><input type="text" inputmode="decimal" data-h="'+k+'" value="'+(s.hist[k]==null?'':inVal(i,s.hist[k]))+'"></div>'}
 h+='<div class="y">가중치</div><div><input type="text" inputmode="decimal" data-w value="'+s.weight+'"></div>'
 +'<div class="y">2026 σ</div><div><select data-sigma><option value="5yr">직전 5개년 σ (기본)</option><option value="min4">극단치 적용: 1개년 제외 4개년 σ 최솟값</option></select><div class="help" id="d-scr"></div></div>'
 +'<div class="y">2027 σ</div><div><select data-sigma27><option value="5yr">직전 5개년 σ (기본)</option><option value="min4">극단치 적용: 1개년 제외 4개년 σ 최솟값</option></select><div class="help" id="d-scr7"></div></div></div>'
 +'<div class="help" style="margin-top:8px">연도별 실적 중 첫 줄(참고)은 산출에 쓰이지 않고, 아래 5개 연도(\'21~\'25)가 2026 σ·기준치에 쓰입니다. 2027은 \'22~\'25 + 위 2026 실적이 직전 5개년입니다.</div></div>';
 h+='<div class="card"><div class="lbl" style="font-weight:700;color:var(--navy);font-size:13px">산출 (연도별 기준치·목표)</div><div id="d-calc"></div></div>';
 h+='<div class="card"><div class="lbl" style="font-weight:700;color:var(--navy);font-size:13px">내년(\'27) 만점 시뮬레이션</div><div id="d-27"></div></div>';
 if(i.id==='i11'||i.id==='i12')h+='<div class="card" id="d-logi"></div>';
 h+='<div class="card" id="d-ref"></div>';
 h+='<div class="card"><div class="lbl" style="font-weight:700;color:var(--navy);font-size:13px">산식·근거</div><p style="margin:6px 0;font-size:12.5px">'+esc(META[i.id].f)+'</p>'+(META[i.id].n?'<p class="hint">'+esc(META[i.id].n)+'</p>':'')+'<p class="hint">평점 = 20 + 80 × (실적 − 최저목표) ÷ (최고목표 − 최저목표) [하한 20·상한 100] · 득점 = 평점 ÷ 100 × 가중치<br>기준치 = Max(직전3개년 평균, 직전년도) · σ = 직전5개년 모표준편차 · 최고/최저목표 = 기준치 ± 2σ</p><p class="hint"><b>2027 기준</b>: 평가연도가 한 해 넘어가면 직전 5개년 창을 한 칸 밀어 \'22~\'26(2026은 위 입력값)으로 같은 산식을 적용합니다. 04·10·11·12번 원본 2027 시트가 이 방식입니다. 그 외 지표의 2027 값·편람상 2027 규정은 파일에 없어 확인 못 함 — 같은 방식을 적용한 가정입니다.</p><p class="hint" id="d-src"></p></div>';
 h+='<div class="btns"><button class="btn" data-reset>이 시나리오 값으로 되돌리기</button></div></div>';return h}
function setSum(d,sfx,c,s,yr){var ok=c.ok;$('#d-ds'+sfx,d).innerHTML=ok?nf(c.ds,3)+'<small> / '+nf(c.w,1)+'</small>':'-';$('#d-pj'+sfx,d).textContent=ok?'· 평점 '+nf(c.pj,1):'';
 var b=$('#d-bar'+sfx,d);b.className=ok?stCls(c.pj):'';b.style.width=ok?c.pj+'%':'0';
 $('#d-sub'+sfx,d).textContent=ok?'달성률 '+nf(c.rate,1)+'% · '+stTxt(c.pj)+(yr===2027&&s.y27Auto?' · 임시 설정값':''):(yr===2027&&s.y27==null?'2027 실적을 입력하세요':'입력값을 확인하세요')}
function refreshDrill(){var id=drillId;if(!id)return;var i=IND[id],s=ST.ind[id],c=calcY(i,2026),c7=calcY(i,2027),sc=scenOf(i,s.scen),d=$('#drill');
 setSum(d,'',c,s,2026);setSum(d,'7',c7,s,2027);
 var sh='';i.scen.forEach(function(x){var tmp=JSON.parse(JSON.stringify(ST.ind[id]));tmp.scen=x.id;tmp.hist=x.hist.slice();tmp.y26=x.y26;tmp.sigma=x.sigmaApplied;tmp.weight=i.weight;var keep=ST.ind[id];ST.ind[id]=tmp;var cc=calcY(i,2026),c2=calcY(i,2027);ST.ind[id]=keep;
  sh+='<label class="sc-row'+(x.id===s.scen?' on':'')+'"><input type="radio" name="sc" data-sc="'+x.id+'" '+(x.id===s.scen?'checked':'')+'><span class="l">'+esc(x.label)+(x.flag?' ⚠':'')+'<br><span class="hint">2026 '+big(x.y26,i.unit,i.scale)+'</span></span><span class="v">'+(cc.ok?'26 '+nf(cc.ds,3)+'점':'-')+'<br><span class="hint">'+(c2.ok?'27 '+nf(c2.ds,3)+'점':'27 미입력')+'</span></span></label>'});
 $('#d-scen',d).innerHTML=sh;$('#d-flag',d).innerHTML=(sc.flag?'<div class="note">⚠ '+esc(sc.flag)+'</div>':'')+(sc.note?'<div class="hint">'+esc(sc.note)+'</div>':'');
 $('#d-y26h',d).textContent=s.y26!=null?'= '+big(s.y26,i.unit,i.scale):'';
 var pb=$('#d-pvb',d);pb.hidden=!s.y27Auto;var y7=$('[data-y27]',d);y7.classList.toggle('prov',!!s.y27Auto);if(s.y27Auto&&document.activeElement!==y7)y7.value=inVal(i,s.y27);
 $('#d-y27h',d).innerHTML=s.y27==null?'2027 실적 미입력':'= '+big(s.y27,i.unit,i.scale)+(s.y27Auto?' <b style="color:#b45f00">임시 설정값</b> — 2026 평점을 유지하는 최소 실적(4자리 올림). 직접 입력하면 임시값이 해제됩니다.':(i.f27&&s.y27===i.f27.y27?' (원본 2027 시트 값)':' (직접 입력)'));
 $('#d-prov',d).hidden=!!s.y27Auto;
 $('[data-sigma]',d).value=s.sigma;$('[data-sigma27]',d).value=s.sigma27;
 $('#d-scr',d).textContent=c.ok?(c.screen?'극단치 스크리닝 ○ (4개년 σ 최솟값이 5개년 σ의 50% 이하) — 원인 검토 후 적용 여부 결정':'극단치 스크리닝 해당 없음'):'';
 $('#d-scr7',d).textContent=c7.ok?(c7.screen?'극단치 스크리닝 ○ — 원인 검토 후 적용 여부 결정':'극단치 스크리닝 해당 없음'):'';
 var row=function(l,a,b){return '<tr><td>'+l+'</td><td>'+a+'</td><td>'+b+'</td></tr>'};
 var f=function(c,k){return c.ok?big(c[k],i.unit,i.scale):'-'};
 var lab=function(yr){var n=yr-5;return '\''+String(n).slice(2)+'~\''+String(yr-1).slice(2)};
 var chk='',fs=sc.fileScore;
 if(c.ok&&!s.edited&&fs&&fs.pj!=null){var dd=Math.abs(fs.pj-c.pj);chk+='<div class="kv"><span>2026 원본 파일 평점 / 득점</span><b>'+nf(fs.pj,3)+' / '+nf(fs.ds,3)+' <span class="'+(dd<0.01?'ok':'bad')+'">'+(dd<0.01?'✓ 일치':'차이')+'</span></b></div>'}
 var f7=i.f27,m7='';
 if(f7){var same=c7.ok&&Math.abs(s.y26-f7.y26)<1e-6*Math.max(1,Math.abs(f7.y26))&&Math.abs(s.y27-f7.y27)<1e-6*Math.max(1,Math.abs(f7.y27))&&!s.edited;
  m7='<div class="kv"><span>원본 2027 시트('+esc(f7.sheet)+') 평점 / 득점</span><b>'+nf(f7.pj,3)+' / '+nf(f7.ds,3)+(same?' <span class="'+(Math.abs(f7.pj-c7.pj)<0.01?'ok':'bad')+'">'+(Math.abs(f7.pj-c7.pj)<0.01?'✓ 일치':'차이')+'</span>':'')+'</b></div><div class="help">원본 2027 시트의 입력: 2026 '+big(f7.y26,i.unit,i.scale)+' · 2027 '+big(f7.y27,i.unit,i.scale)+(same?'' :' (현재 입력값과 달라 직접 비교는 안 됨)')+'</div>'}
 $('#d-calc',d).innerHTML='<table class="t"><tr><th></th><th>2026</th><th>2027</th></tr>'+row('직전 5개년',lab(2026),lab(2027))+row('기준치',f(c,'base'),f(c7,'base'))+row('σ (적용)',f(c,'sg'),f(c7,'sg'))+row('최고목표 (+2σ)',f(c,'hi'),f(c7,'hi'))+row('최저목표 (−2σ)',f(c,'lo'),f(c7,'lo'))+row('실적',big(s.y26,i.unit,i.scale),big(s.y27,i.unit,i.scale))+row('평점 (하한 20)',c.ok?nf(c.pj,3):'-',c7.ok?nf(c7.pj,3):'-')+row('득점',c.ok?nf(c.ds,3):'-',c7.ok?nf(c7.ds,3):'-')+'</table>'+chk+m7;
 $('#d-27',d).innerHTML=c.ok?'<div class="kv"><span>2027 만점(평점 100) 필요 실적 = 2027 최고목표</span><b>'+big(c.need27,i.unit,i.scale)+'</b></div><div class="kv"><span>2026 대비 필요 성장률</span><b>'+nf(c.g27*100,1)+'%</b></div><div class="help">원본 ② 시트 AA·AB열 산식: Max(\'24~\'26 평균, \'26)+2σ(\'22~\'26). 2026 입력값이 바뀌면 같이 바뀝니다.</div>':'<div class="hint">2026 값이 있어야 계산됩니다.</div>';
 var r=i.ref;$('#d-ref',d).innerHTML=r&&r.ds!=null?'<div class="lbl" style="font-weight:700;color:var(--navy);font-size:13px">참고: 붙임2 「실제 득점 전망 수준」(260811)</div><div class="kv"><span>2026 득점 / 득점률</span><b>'+nf(r.ds,3)+' / '+nf(r.rate,1)+'%</b></div><div class="kv"><span>2025 득점 / 득점률</span><b>'+(r.ds25!=null?nf(r.ds25,3)+' / '+nf(r.rate25,1)+'%':'신규(해당 없음)')+'</b></div><div class="help">'+(r.adj?'보정 방법: '+esc(r.adj)+' · ':'')+'득점만 있고 근거 실적값은 파일에 없음(확인 못 함). 앱 산출과 비교용.</div>':'';
 if($('#d-logi',d)){var L=SEED.logi,a11=ST.ind.i11.y26,a12=ST.ind.i12.y26,sum=(a11||0)+(a12||0),okk=Math.abs(sum-L.total)<1,b11=ST.ind.i11.y27,b12=ST.ind.i12.y27,sum7=(b11==null||b12==null)?null:b11+b12;$('#d-logi',d).innerHTML='<div class="lbl" style="font-weight:700;color:var(--navy);font-size:13px">종합물류 전체 매출(생활물류 포함) 연결</div><div class="kv"><span>2026: 11 종합물류(생활물류 제외)</span><b>'+nf(a11,0)+'원</b></div><div class="kv"><span>2026: 12 생활물류서비스</span><b>'+nf(a12,0)+'원</b></div><div class="kv"><span>2026: 11 + 12</span><b>'+nf(sum,0)+'원 <span class="'+(okk?'ok':'bad')+'">'+(okk?'✓ 56,000,000,000과 일치':'기준값과 다름')+'</span></b></div><div class="help">기준: v2 총괄 2026 자구 전망 전체 '+nf(L.total,0)+'원 = 생활물류 '+nf(L.life,0)+'원(F6) + 그 외 '+nf(L.excl,0)+'원(F7).</div><div class="kv"><span>2027: 11 + 12</span><b>'+(sum7==null?'-':nf(sum7,0)+'원')+'</b></div><div class="help">2027 기본값은 원본 2027 시트(11: 53,200,000,000 / 12: 800,000,000, 합계 54,000,000,000)입니다. 이 시트들은 2026 합계를 52,520,000,000으로 두고 만든 것이라 2026 합계 560억과 맞지 않습니다 — 2027 값은 필요하면 직접 고치세요.</div>'}
 $('#d-src',d).textContent='출처: '+sc.file+' › '+sc.sheet;
 $$('[data-y26]',d).forEach(function(e){e.classList.toggle('edited',s.edited)})}
function setField(i,field,idx,val){var s=ST.ind[i.id],old;
 if(field==='y26'){old=s.y26;s.y26=val}else if(field==='h'){old=s.hist[idx];s.hist[idx]=val}else if(field==='w'){old=s.weight;s.weight=val}else if(field==='sigma'){old=s.sigma;s.sigma=val}else if(field==='y27'){old=s.y27;s.y27=val;s.y27Auto=false}else if(field==='sigma27'){old=s.sigma27;s.sigma27=val}
 if(old!==val){s.edited=true;logc(i.id,field+(idx!=null?'['+idx+']':''),old,val);save()}}

/* ---------- 저장·자료 ---------- */
var NOTES=[
 ['종합물류 매출 56,000,000,000원 기준(jeongjin 결정)','2026 종합물류 전체(생활물류 포함) = 56,000,000,000원(v2 「종합물류 총괄」 F3). 이를 지표 11(생활물류 제외)과 12(생활물류)로 나눔: 생활물류 631,004,561원(F6, 4개 항목 합) → 지표 12, 나머지 55,368,995,439원(F7 = F3−F6) → 지표 11. 합계 56,000,000,000원. 「11_종합물류사업 매출액(260831)」의 626,870,857,000원은 사용하지 않으며 시나리오에서도 제거. 참고: 파일 값 56,000,000,000원은 560억원 규모(과거 실적 약 509억원 수준).'],
 ['지표 11 기본값 변경에 따른 점수','지표 11의 2026 값이 51,888,995,439원(통합 유지본)에서 55,368,995,439원으로 바뀌어 득점이 0.259에서 약 0.303으로 올라갑니다. 원본 파일에는 이 값 기준 평점이 없어 앱이 산출한 값입니다. 이전 값은 시나리오 목록에 남아 있습니다.'],
 ['2027 목표 산정 방식(원본 근거와 가정)','원본 중 04(광역)·10(화물)·11(종합물류)·12(생활물류) 파일에는 2027 평가 시트가 있고, 모두 같은 방식입니다: 평가연도 2027의 직전 5개년 = 2022~2026(2026은 해당 파일의 2026 값), 기준치 = Max(2026, 2024~2026 평균), σ = 2022~2026 모표준편차, 최고·최저목표 = 기준치 ± 2σ, 평점 = 20+80×(실적−최저목표)÷(최고−최저목표). 04번은 2028 행까지 같은 식으로 한 칸씩 밀려 있고, 통합관리 ② 시트의 \'27 만점 시뮬레이션(AA열)도 같은 롤링입니다. 이 앱은 이를 전 지표에 동일 적용합니다(2026 입력값이 2027의 직전 연도). 01·02·03·05·06·07·08번 파일에는 2027 시트·값이 없고, 편람의 2027 평가 규정 원문은 폴더에 없어 확인 못 함 — 같은 목표부여(편차) 방식의 연장 가정입니다. 극단치(σ 대체)는 2027 창에서 별도로 판단하도록 2027 σ 설정을 따로 두었고 기본은 5개년 σ입니다.'],
 ['2027 실적: 임시 설정값(앱돌이 가정)','jeongjin 요청으로 2027 실적을 임시로 채웠습니다 — 화면에 「임시 설정값」으로 표시되며 직접 입력하면 해제됩니다. 규칙(전 지표 공통): 2026 입력값을 직전 연도로 넣은 2027 목표(위 롤링 방식)를 계산하고, 2027 평점이 2026 평점과 같아지는 최소 실적 = 2027 최저목표 + (2026 평점−20)÷80 × (2027 최고목표−최저목표) 을 유효숫자 4자리로 올림해 사용합니다(2026 평점이 100이면 2027 최고목표). 그래서 지표별·합계 2027 득점이 2026보다 낮아지지 않습니다. 2026 값이나 시나리오를 바꾸면 임시값도 같이 다시 계산됩니다. 예외: 원본 2027 시트 값(04: 50,829,000㎞, 10: 998,080.6톤㎞/칸, 12: 800,000,000원)은 이미 2026 득점 이상이라 임시값 대신 원본 값을 유지했습니다(11번 원본 값 53,200,000,000원은 2026 득점보다 낮아져 임시값으로 대체). 임시값은 편람·원본 근거가 없는 가정이며 what-if 용도입니다.'],
 ['평점 하한 20 고정','jeongjin 결정: 평점 하한 20 고정(목표부여(편차) 방식). 근거 — 개별 지표 파일(01~08, 10~12)의 평점 셀 산식이 MAX(20,MIN(100,20+80×(실적−최저목표)÷(최고목표−최저목표))) 이고, 10·11·12번 파일에 「평가산식: 20+{(실적-최저목표)/(최고목표-최저목표)}*80」이 적혀 있습니다. 통합관리 ② 시트만 하한 0으로 계산되어 있어(11개 지표 모두 최저목표 이상이라 결과 동일) 차이가 있습니다. 「주요사업 평가방식」 편람 PDF 원문은 폴더에 없어 확인 못 함.'],
 ['버전 차이','통합관리(260710)와 최신 개별 파일(0804~0929)은 2026 값·과거 실적(SR 통합 등)이 다릅니다. 붙임2(260811)의 「실사 보정」 득점은 근거 실적값이 파일에 없어 참고 득점으로만 표시합니다.'],
 ['시트명 표기','「07_대국민 교통비 절감(260710)」의 시트명이 「철도이용 접근성 제고_…」로 되어 있고 SR 연말 시트 단위가 「회」로 표기됨(내용은 교통비 %).'],
 ['이번 범위에서 뺀 지표','jeongjin 결정: 글로벌 정시율 2개·안전한 철도(8점)·지속성장(2점)은 이번 범위에서 제외(화면·데이터·합계 모두). 총괄 합계는 편리한 철도 8개 + 종합물류 3개 = 가중치 11점 기준입니다. (철도교통카드사업 성장률 2026 템플릿도 폴더에 없음)'],
 ['열어 보지 못했거나 해석하지 않은 부분','「00_제출용 원본묶음(260616).zip」(7개 구버전 파일, 시트 목록만 확인), 숨김 시트(「…_5월말」 일부), 03번의 연도별 원시 데이터 시트(수천~백만 행), 06번의 열차번호대장·정차역별 운행횟수 원시 시트, 전망 근거_v1의 근거 시트(화물 효율성·종합물류 확대 노력), 실적 관리용의 지역본부별 매출표는 앱 산출에 반영하지 않음.']];
function renderData(){var n=ST.log.length,h='';
 h+='<div class="card"><b>저장소</b><div class="kv"><span>현재 저장 위치</span><b>이 기기 브라우저(localStorage)</b></div><div class="kv"><span>마지막 저장</span><b>'+fmtT(ST.updatedAt)+'</b></div><div class="kv"><span>수정 이력</span><b>'+n+'건(최근 '+LOGMAX+'건 보관)</b></div>'
 +'<div class="kv"><span>앱 버전</span><b>v'+APP_VERSION+'</b></div><div class="kv"><span>Google 시트 연동</span><b>준비 중(아래 계획)</b></div>'
 +'<div class="btns"><button class="btn p" data-export>JSON 내보내기</button><button class="btn" data-csv>시트용 CSV</button><button class="btn" data-import>JSON 가져오기</button><button class="btn d" data-resetall>시드로 초기화</button></div><input type="file" id="file" accept="application/json" hidden>'
 +'<p class="hint" style="margin-top:8px">브라우저 데이터를 지우거나 다른 기기로 옮기면 값이 사라집니다. 중요한 수정은 JSON/CSV로 백업하세요.</p></div>';
  h+='<details class="card"><summary>Google 시트 저장 제안</summary><div class="hint">jeongjin이 연결해 둔 Google 계정에 만들 비공개 시트 1개(아직 만들지 않음, 공유 없음). 탭 구조:</div><table class="t"><tr><th>탭</th><th>열</th></tr>'
 +'<tr><td>indicators</td><td>id, 평가범주, 지표명, 단위, scale, 가중치, 방향</td></tr><tr><td>scenarios</td><td>indicator_id, scenario_id, 라벨, 원본파일, 시트, 2026값, 원본평점, 원본득점, flag</td></tr>'
 +'<tr><td>inputs</td><td>indicator_id, scenario_id, field(hist/y26/weight/sigma), period, value, updated_at, updated_by</td></tr><tr><td>computed</td><td>id, 기준치, σ, 최고목표, 최저목표, 평점, 득점(읽기 전용)</td></tr><tr><td>changelog</td><td>시각, indicator_id, field, 이전값, 새값</td></tr></table>'
 +'<div class="hint" style="margin-top:6px">연동 방식: 앱은 지금처럼 로컬에 즉시 저장하고, 시트와는 [가져오기]/[저장] 버튼으로 동기화(Apps Script 웹앱 또는 OAuth). 시트가 없어도 이 앱은 단독으로 동작. 자세한 계획은 README 참고. 「시트용 CSV」는 inputs 탭 형식 그대로입니다.</div></details>';
 h+='<div class="card"><b>데이터 확인 사항</b><div class="hint">원본 파일을 열어 보며 발견한 불일치·미확인 항목</div>';NOTES.forEach(function(x){h+='<details><summary>'+esc(x[0])+'</summary><div style="font-size:12.5px;color:var(--ink)">'+esc(x[1])+'</div></details>'});h+='</div>';
 h+='<div class="card"><b>원본 자료</b><div class="hint" style="margin-top:4px">01_템플릿모음_2026 (시드 생성: '+esc(SEED.generated)+')<br>편리한 철도 8개 지표 · 종합물류 철도 3개 지표 · 통합관리(만점분석)·실제 전망 수준(붙임2) 참고 파일</div></div>';
 $('#view').innerHTML=h}
function csv(){var rows=[['indicator_id','indicator_name','scenario_id','field','period','value','updated_at']],t=ST.updatedAt||'';
 SEED.indicators.forEach(function(i){var s=ST.ind[i.id],sc=scenOf(i,s.scen);rows.push([i.id,i.name,s.scen,'weight','',s.weight,t]);rows.push([i.id,i.name,s.scen,'sigma_mode','',s.sigma,t]);rows.push([i.id,i.name,s.scen,'y26','2026',s.y26,t]);rows.push([i.id,i.name,s.scen,'y27','2027',s.y27==null?'':s.y27,t]);rows.push([i.id,i.name,s.scen,'sigma27_mode','2027',s.sigma27,t]);rows.push([i.id,i.name,s.scen,'y27_provisional','2027',s.y27Auto?'TRUE':'FALSE',t]);
  for(var k=0;k<6;k++)rows.push([i.id,i.name,s.scen,'hist',sc.labels[k]==null?'':String(sc.labels[k]).replace(/^'(\d\d)$/,'20$1'),s.hist[k]==null?'':s.hist[k],t])});
 return '\ufeff'+rows.map(function(r){return r.map(function(c){c=String(c);return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(',')}).join('\n')}
function dl(name,text,type){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}

/* ---------- 라우팅·이벤트 ---------- */
function render(){$$('#tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===tab)});({home:renderHome,input:renderInput,data:renderData})[tab]()}
document.addEventListener('click',function(e){var t=e.target.closest('button,[data-sc],label.sc-row');if(!t)return;
 if(t.dataset&&t.dataset.year){ST.year=+t.dataset.year;save();render();return}
 if(t.dataset&&t.dataset.tab){tab=t.dataset.tab;render();$('#view').scrollTop=0;return}
 if(t.dataset.open){openDrill(t.dataset.open);return}
 if(t.hasAttribute('data-close')){closeDrill();return}
 if(t.dataset.preset){if(presetState()==='mix'&&!confirm('직접 수정한 값이 모두 시나리오 값으로 바뀝니다. 계속할까요?'))return;var st=freshState(t.dataset.preset);st.log=ST.log;ST=st;logc('*','preset',null,t.dataset.preset);save();render();toast(t.dataset.preset==='mg'?'통합관리(260710) 값 적용':'최신 파일 전망 적용');return}
 if(t.hasAttribute('data-prov27')&&drillId){var ii=IND[drillId],ss=ST.ind[drillId];logc(ii.id,'y27_auto',ss.y27,'auto');ss.y27Auto=true;save();refreshDrill();toast('2027 임시 설정값 적용');return}
 if(t.hasAttribute('data-reset')){var i=IND[drillId];if(!confirm('입력한 값을 이 시나리오의 원본 값으로 되돌릴까요?'))return;ST.ind[i.id]=fromScen(i,ST.ind[i.id].scen);logc(i.id,'reset',null,ST.ind[i.id].scen);save();openDrill(i.id);toast('되돌렸습니다');return}
 if(t.hasAttribute('data-export')){dl('kpi2026_backup_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(ST,null,1),'application/json');toast('JSON 내보냄');return}
 if(t.hasAttribute('data-csv')){dl('kpi2026_inputs.csv',csv(),'text/csv');toast('CSV 내보냄');return}
 if(t.hasAttribute('data-import')){$('#file').click();return}
 if(t.hasAttribute('data-resetall')){if(!confirm('모든 수정 내용을 지우고 통합관리(260710) 시드(최신 개별 파일)로 되돌립니다. 계속할까요?'))return;ST=freshState('latest');save();render();toast('초기화 완료');return}
 if(t.id==='btnInfo'){tab='data';render();return}
});
document.addEventListener('change',function(e){var t=e.target;
 if(t.dataset.sc&&drillId){var i=IND[drillId],s=ST.ind[i.id];if(s.edited&&!confirm('직접 수정한 값이 시나리오 값으로 바뀝니다. 계속할까요?')){refreshDrill();return}var w=s.weight;ST.ind[i.id]=fromScen(i,t.dataset.sc);logc(i.id,'scenario',s.scen,t.dataset.sc);save();openDrill(i.id);return}
 if(t.hasAttribute('data-sigma')&&drillId){setField(IND[drillId],'sigma',null,t.value);refreshDrill();return}
 if(t.hasAttribute('data-sigma27')&&drillId){setField(IND[drillId],'sigma27',null,t.value);refreshDrill();return}
 if(t.id==='file'&&t.files[0]){var fr=new FileReader();fr.onload=function(){try{var s=JSON.parse(fr.result);if(!s||s.v!==1||!s.ind)throw 0;s.year=s.year===2027?2027:2026;SEED.indicators.forEach(function(i){var x=s.ind[i.id];if(!x){s.ind[i.id]=fromScen(i,PRESET_LATEST[i.id]);return}if(x.y27===undefined)x.y27=(i.y27==null?null:i.y27);if(!x.sigma27)x.sigma27='5yr';if(x.y27Auto===undefined)initY27(i,x)});ST=s;save();render();toast('가져오기 완료')}catch(x){toast('가져오기 실패: 형식 오류')}};fr.readAsText(t.files[0]);t.value=''}});
document.addEventListener('input',function(e){var t=e.target,i;
 if(t.dataset.q){i=IND[t.dataset.q];var yr=t.dataset.yr==='2027'?2027:2026,raw=t.value.trim(),v=raw===''?null:parseIn(i,t.value);if(raw!==''&&v==null)return;if(v==null&&yr===2026)return;setField(i,yr===2027?'y27':'y26',null,v);if(yr===2027){var bd=t.parentNode.querySelector('.pvb');if(bd)bd.remove();t.classList.remove('prov')}if(yr===2026)t.classList.add('edited');
  [2026,2027].forEach(function(y){var c=calcY(i,y),el=$('#qs-'+i.id+'-'+y);if(el)el.textContent=c.ok?nf(c.ds,3):'-'});var s7=ST.ind[i.id],in7=$('[data-q='+i.id+'][data-yr="2027"]');if(in7){if(s7.y27Auto&&document.activeElement!==in7)in7.value=inVal(i,s7.y27);in7.classList.toggle('prov',!!s7.y27Auto);var lb=in7.parentNode.firstChild;if(lb&&lb.nodeType===3){}}return}
 if(!drillId)return;
 i=IND[drillId];
 if(t.hasAttribute('data-y26')){var v1=parseIn(i,t.value);if(v1==null)return;setField(i,'y26',null,v1);refreshDrill()}
 else if(t.hasAttribute('data-y27')){var r7=t.value.trim(),v7=r7===''?null:parseIn(i,t.value);if(r7!==''&&v7==null)return;setField(i,'y27',null,v7);refreshDrill()}
 else if(t.dataset.h!=null){var v2=t.value.trim()===''?null:parseIn(i,t.value);if(t.value.trim()!==''&&v2==null)return;setField(i,'h',+t.dataset.h,v2);refreshDrill()}
 else if(t.hasAttribute('data-w')){var v3=parseFloat(t.value);if(!isFinite(v3)||v3<=0)return;setField(i,'w',null,v3);refreshDrill()}});
ST=load();render();
if('serviceWorker' in navigator&&location.protocol!=='file:'){/* 서비스워커는 루트(index.html)가 등록 */}
})();
