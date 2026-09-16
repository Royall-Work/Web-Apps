(function(w){'use strict';
function toast(text,mode){
  var old=document.querySelector('.royall-toast');if(old)old.remove();
  var t=document.createElement('div');
  t.className='royall-toast '+(mode||'green');
  t.textContent=text==null?'':String(text);
  document.body.appendChild(t);
  requestAnimationFrame(function(){t.classList.add('show')});
  setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove()},180)},2200);
  return t;
}
w.RoyallToast={show:toast,green:function(v){return toast(v,'green')},red:function(v){return toast(v,'red')},blue:function(v){return toast(v,'blue')}};
})(window);
