/* Supplied original mascot artwork (Dalli). Display-only bands; not handbook scoring rules. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KPIMascot=api;})(typeof window!=='undefined'?window:this,function(){'use strict';
var moods={
 low:{title:'차근차근',line:'한 칸씩, 함께 채워 가요.',face:'생각에 잠긴 표정',image:'low'},
 normal:{title:'좋은 흐름',line:'차곡차곡, 잘 쌓이고 있어요!',face:'다정한 미소',image:'mid'},
 high:{title:'반짝 성과',line:'멋진 성과! 함께 이어 가요.',face:'활짝 웃는 표정',image:'high'},
 waiting:{title:'입력 대기',line:'실적을 입력하면 함께 살펴볼게요.',face:'입력을 기다리는 표정',image:'mid'}
};
function classify(total){var ds=total.ds,w=total.w,valid=Number.isFinite(ds)&&Number.isFinite(w)&&w>0,rate=valid?ds/w*100:null;return {band:!valid?'waiting':rate<70?'low':rate<90?'normal':'high',rate:rate};}
function render(total,year){var state=classify(total),m=moods[state.band],yr=year===2027?2027:2026;
 return '<section class="mascot-card" data-band="'+state.band+'" data-year="'+yr+'" aria-label="'+yr+'년 성과 응원" aria-live="polite">'
 +'<img class="mascot-art" src="mascot/kpi_mascot_'+m.image+'.png" width="112" height="112" alt="냥콩: '+m.face+'">'
 +'<div class="mascot-copy"><div class="mascot-eyebrow">냥콩 <span>· 영업기획실 친구</span></div>'
 +'<div class="mascot-state">'+yr+'년 <b>'+m.title+'</b></div><p>'+m.line+'</p>'
 +'<small>'+ (state.rate===null?'산출 가능한 실적을 기다려요': '득점률 '+state.rate.toFixed(1)+'% · 선택한 연도 기준')+'</small></div></section>';
}
return {classify:classify,render:render};
});
