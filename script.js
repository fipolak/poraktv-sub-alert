var subSound = new Audio('https://fipolak.github.io/poraktv-sub-alert/you-sob-arnold.mp3');
subSound.load();


var scene=document.getElementById('scene');
var container=document.getElementById('container');
var flash=document.getElementById('flash');
var logo=document.getElementById('logo');
var progressCircle=document.getElementById('progress-circle');
var radarSvg=document.getElementById('radar-svg');
var radarSweep=document.getElementById('radar-sweep');
var glowRing=document.getElementById('glow-ring');
var subName=document.getElementById('sub-name');
var running=false;
var SPARKS=['#FFD700','#FF8C00','#FF5500','#ffffff','#FFAA44','#FF3300'];

function easeInOut(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}
function easeOut(t){return 1-Math.pow(1-t,3);}
function easeOutBack(t){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);}

function spawnSparks(){
  var rect=container.getBoundingClientRect();
  var cx=rect.left+rect.width/2,cy=rect.top+210;
  for(var i=0;i<50;i++){
    var s=document.createElement('div');s.className='spark';
    s.style.background=SPARKS[Math.floor(Math.random()*SPARKS.length)];
    var sz=4+Math.random()*10;s.style.width=sz+'px';s.style.height=sz+'px';
    s.style.position='absolute';s.style.left=cx+'px';s.style.top=cy+'px';
    scene.appendChild(s);
    var angle=Math.random()*Math.PI*2,speed=5+Math.random()*18;
    var vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed;
    var life=0,mL=30+Math.random()*30;
    (function(e,vx2,vy2,ml){
      function mv(){life++;vy2+=0.4;
        e.style.left=(parseFloat(e.style.left)+vx2)+'px';
        e.style.top=(parseFloat(e.style.top)+vy2)+'px';
        e.style.opacity=''+(1-life/ml);
        if(life<ml)requestAnimationFrame(mv);
        else if(e.parentNode)e.parentNode.removeChild(e);
      }requestAnimationFrame(mv);
    })(s,vx,vy,mL);
  }
}

function radarPath(deg){
  var rad=deg*Math.PI/180,cx=210,cy=210,r=195;
  var x=cx+r*Math.sin(rad),y=cy-r*Math.cos(rad);
  var rad2=(deg-60)*Math.PI/180;
  var x2=cx+r*Math.sin(rad2),y2=cy-r*Math.cos(rad2);
  return 'M '+cx+' '+cy+' L '+x2+' '+y2+' A '+r+' '+r+' 0 0 1 '+x+' '+y+' Z';
}

function resetWidget(){
  container.style.opacity='0';
  logo.style.transform='translate(-50%,-50%) scale(0)';
  subName.style.opacity='0';
  subName.style.transform='translateY(20px)';
  progressCircle.style.strokeDashoffset='1257';
  glowRing.style.boxShadow='none';
  radarSvg.style.opacity='0';
  flash.style.opacity='0';
  scene.style.transform='';
  scene.style.opacity='1';
  running=false;
}

function runAlert(){
  if(running)return;
  running=true;
  subName.textContent='NEW SUBSCRIBER';
  try{ subSound.currentTime=0; subSound.play(); }catch(e){}
  var snd=document.getElementById('sub-sound'); if(snd){snd.currentTime=0;snd.play();}
  container.style.opacity='1';

  var startTime=null;
  var PHASE1=1200,PHASE2=600,PHASE3=500,PHASE4=600,TOTAL=PHASE1+PHASE2+PHASE3+PHASE4;
  var radarStarted=false,logoPopped=false,textStarted=false,done=false;
  var radarStart=null;

  function tick(ts){
    if(!startTime)startTime=ts;
    var elapsed=ts-startTime;
    if(elapsed<=PHASE1){
      progressCircle.style.strokeDashoffset=1257*(1-easeInOut(elapsed/PHASE1));
    }
    if(elapsed>=PHASE1&&!radarStarted){
      radarStarted=true;radarSvg.style.opacity='1';radarStart=ts;
    }
    if(radarStarted&&elapsed<PHASE1+PHASE2){
      var rp=(ts-radarStart)/PHASE2;
      radarSweep.setAttribute('d',radarPath((rp*720)%360));
      glowRing.style.boxShadow='0 0 '+(20+15*Math.sin(rp*Math.PI*4))+'px '+(10+8*Math.sin(rp*Math.PI*4))+'px rgba(255,140,0,0.4)';
    }
    if(elapsed>=PHASE1+PHASE2&&!logoPopped){
      logoPopped=true;radarSvg.style.opacity='0';
      flash.style.opacity='0.5';setTimeout(function(){flash.style.opacity='0';},150);
      spawnSparks();
      scene.style.transform='translateY(8px)';
      setTimeout(function(){scene.style.transform='translateY(-5px)';},70);
      setTimeout(function(){scene.style.transform='translateY(3px)';},140);
      setTimeout(function(){scene.style.transform='translateY(0)';},210);
      var logoStart=ts;
      function logoAnim(t2){
        var lp=Math.min(1,(t2-logoStart)/PHASE3);
        logo.style.transform='translate(-50%,-50%) scale('+easeOutBack(lp)+')';
        if(lp<1){requestAnimationFrame(logoAnim);}
        else{
          glowRing.style.boxShadow='0 0 40px 20px rgba(255,140,0,0.35)';
          var ps=Date.now();
          (function pulse(){
            var pp=(Date.now()-ps)/1000;
            glowRing.style.boxShadow='0 0 '+(40+10*Math.sin(pp*3))+'px '+(20+5*Math.sin(pp*3))+'px rgba(255,140,0,'+(0.35+0.15*Math.sin(pp*3))+')';
            if(running)requestAnimationFrame(pulse);
          })();
        }
      }
      requestAnimationFrame(logoAnim);
    }
    if(elapsed>=PHASE1+PHASE2+PHASE3&&!textStarted){
      textStarted=true;
      var tStart=ts;
      function textAnim(t2){
        var tp=Math.min(1,(t2-tStart)/PHASE4),ep=easeOut(tp);
        subName.style.opacity=ep;
        subName.style.transform='translateY('+(20*(1-ep))+'px)';
        if(tp<1)requestAnimationFrame(textAnim);
      }
      requestAnimationFrame(textAnim);
    }
    if(elapsed>=TOTAL+3000&&!done){
      done=true;
      var fo=Date.now();
      (function fade(){
        var p=Math.min(1,(Date.now()-fo)/800);
        scene.style.opacity=''+(1-p);
        if(p<1){requestAnimationFrame(fade);}
        else{ resetWidget(); }
      })();
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

window.addEventListener('onEventReceived', function(obj){
  var detail = obj.detail;
  if(!detail || !detail.event) return;
  var type = detail.listener;
  if(type === 'subscriber-latest' || type === 'subscriber'){
    runAlert();
  }
});

window.addEventListener('onWidgetLoad', function(){
  resetWidget();
});
