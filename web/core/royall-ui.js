(function(w){
"use strict";
var RoyallUI=(function(){
  var api={},toastTimer;
  var tones={red:{bg:'#fff3f3',border:'#efc4c4',text:'#c73535'},green:{bg:'#eaf8f3',border:'#bde7d7',text:'#0f8b65'},blue:{bg:'#edf5fb',border:'#cfe4f5',text:'#1769aa'},amber:{bg:'#fff5df',border:'#ecd08d',text:'#9a6800'}};
  function make(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x}
  function esc(s){return String(s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function toneStyle(el,tone){var t=tones[tone];if(!t)return;el.style.setProperty('--royall-header-bg',t.bg);el.style.setProperty('--royall-header-border',t.border);el.style.setProperty('--royall-header-text',t.text)}
  function normalizeTone(v){v=String(v||'').toLowerCase();return tones[v]?v:'red'}
  function applyHeaderButton(button,opts){opts=opts||{};button.className='royall-header-action '+(opts.tone||'red')+' '+(opts.className||'');if(opts.color){button.style.setProperty('--royall-header-bg',opts.color);button.style.background=opts.color;button.style.borderColor=opts.borderColor||opts.color;button.style.color=opts.textColor||'#fff'}else{toneStyle(button,normalizeTone(opts.tone||'red'));button.style.removeProperty('background');button.style.removeProperty('border-color');button.style.removeProperty('color')}}

  api.mount=function(opts){
    opts=opts||{};
    var root=typeof opts.mount==='string'?document.querySelector(opts.mount):(opts.mount||document.body);
    if(!root)throw new Error('RoyallUI: mount element not found');
    root.innerHTML='';root.className=(root.className?root.className+' ':'')+'royall-app';
    var header=make('header','royall-header');
    header.appendChild(make('div','royall-header-icon',opts.icon||'🥏'));
    var hm=make('div','royall-header-main');hm.appendChild(make('h1','royall-title',opts.title||'Royall Tool'));hm.appendChild(make('div','royall-sub',opts.description||''));header.appendChild(hm);
    var headerActions=make('div','royall-header-actions');
    if(opts.headerButton){
      var hb=opts.headerButton,b=make('button','royall-header-action',hb.text||'Action');
      b.type='button';applyHeaderButton(b,hb);b.onclick=hb.onClick||function(){};headerActions.appendChild(b);b._royallOptions=hb;
    }
    if(headerActions.children.length)header.appendChild(headerActions);
    root.appendChild(header);

    var feature=make('div','royall-feature-strip');
    var left=make('span','royall-feature-left');left.innerHTML='• Feature Provided by <strong class="royall-developer-name">'+esc(opts.developer||'Araaf Royall')+'</strong> ❣️';feature.appendChild(left);
    function makeStatus(s){var cfg=typeof s==='string'?{text:s,mode:'success'}:(s||{});var mode=String(cfg.mode||'success').toLowerCase();if(mode!=='success'&&mode!=='error'&&mode!=='info')mode='success';var badge=make('span','royall-status-badge '+mode,cfg.text||'Active ✔️');return badge}
    if(opts.status!=null){feature.appendChild(makeStatus(opts.status));feature._statusBadge=feature.lastChild}
    root.appendChild(feature);
    var content=make('main','royall-content');root.appendChild(content);
    return {root:root,header:header,headerActions:headerActions,feature:feature,status:feature._statusBadge||null,content:content,
      setStatus:function(text,mode){if(!feature._statusBadge){feature._statusBadge=makeStatus({text:text,mode:mode});feature.appendChild(feature._statusBadge)}else{var m=String(mode||'success').toLowerCase();if(m!=='success'&&m!=='error'&&m!=='info')m='success';feature._statusBadge.textContent=text||'Active ✔️';feature._statusBadge.className='royall-status-badge '+m}return feature._statusBadge},
      removeStatus:function(){if(feature._statusBadge){feature._statusBadge.remove();feature._statusBadge=null}},
      setHeaderButton:function(config){if(!headerActions.children.length){var b=make('button','royall-header-action',config&&config.text||'Action');b.type='button';headerActions.appendChild(b)}var btn=headerActions.children[0];config=config||{};btn.textContent=config.text||'Action';applyHeaderButton(btn,config);btn.onclick=config.onClick||function(){};return btn},
      removeHeaderButton:function(){headerActions.innerHTML=''}
    };
  };

  api.card=function(title,opts){opts=opts||{};var card=make('section','royall-card');if(opts.result)card.classList.add('royall-result-card');
    if(opts.head){var h=make('div','royall-input-head');h.appendChild(make('div','royall-input-title',title||''));if(opts.stats)h.appendChild(make('div','royall-input-stats',opts.stats));(opts.actions||[]).forEach(function(a){var b=make('button',a.className||'royall-btn soft',a.text||'Action');b.type='button';b.onclick=a.onClick||function(){};h.appendChild(b)});card.appendChild(h)}else card.appendChild(make('h2','royall-section-title',title||''));return card};
  api.input=function(opts){opts=opts||{};var row=make('div','royall-field-row'),input=make('input','royall-input');input.type=opts.type||'text';input.placeholder=opts.placeholder||'';if(opts.value!=null)input.value=opts.value;row.appendChild(input);(opts.actions||[]).forEach(function(a){var b=make('button',a.className||'royall-small-btn',a.text||'Action');b.type='button';b.onclick=function(){if(a.onClick)a.onClick(input)};row.appendChild(b)});return {el:row,input:input}};
  api.textarea=function(opts){opts=opts||{};var ta=make('textarea','royall-textarea');ta.placeholder=opts.placeholder||'';if(opts.value!=null)ta.value=opts.value;return {el:ta,textarea:ta}};
  api.result=function(text){return make('div','royall-result',text||'')};
  api.divider=function(){return make('div','royall-divider')};
  api.button=function(text,cls,onClick){var b=make('button',cls||'royall-btn soft',text||'Action');b.type='button';b.onclick=onClick||function(){};return b};
  api.chips=function(items,onChange){var row=make('div','royall-chip-row');(items||[]).forEach(function(it,i){var b=make('button','royall-chip'+(i===0?' active':''),it.label||String(it.value||it));b.type='button';b.onclick=function(){Array.prototype.forEach.call(row.children,function(x){x.classList.remove('active')});b.classList.add('active');if(onChange)onChange(it.value!=null?it.value:it,i)};row.appendChild(b)});return row};
  api.toggle=function(target){var x=typeof target==='string'?document.getElementById(target):target;if(!x)return false;x.classList.toggle('open');return x.classList.contains('open')};
  api.copy=async function(text){var v=String(text==null?'':text);try{await navigator.clipboard.writeText(v)}catch(e){var t=document.createElement('textarea');t.value=v;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.focus();t.select();document.execCommand('copy');t.remove()}api.toast('Copied','success')};
  api.paste=async function(){try{return await navigator.clipboard.readText()}catch(e){api.toast('Clipboard unavailable','error');return ''}};
  api.download=function(filename,text,type){var blob=new Blob([String(text==null?'':text)],{type:type||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename||'download.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},800)};
  api.downloadNamed=function(opts,text,type){opts=opts||{};api.prompt({icon:'⬇️',theme:'info',title:opts.title||'Download',text:opts.text||'Enter a file name.',placeholder:opts.placeholder||'File name',value:opts.value||'download'},function(name){name=(name||'download').trim();if(!name)return api.toast('File name required','error');var ext=opts.extension||'';if(ext&&!name.toLowerCase().endsWith(ext.toLowerCase()))name+=ext;api.download(name,text,type)})};
  function openDialog(opts){opts=opts||{};var kind=opts.theme||opts.type||'confirm';var back=make('div','royall-dialog-backdrop'),box=make('div','royall-dialog theme-'+kind),head=make('div','royall-dialog-head');head.appendChild(make('div','royall-dialog-icon',opts.icon||({warning:'⚠️',error:'✖',info:'ℹ️',confirm:'?'})[kind]||'⚠️'));head.appendChild(make('h3','',opts.title||'Confirm'));box.appendChild(head);if(opts.text)box.appendChild(make('p','',opts.text));var actions=make('div','royall-dialog-actions');box.appendChild(actions);back.appendChild(box);document.body.appendChild(back);function close(){back.classList.remove('show');setTimeout(function(){back.remove()},180)}back.onclick=function(e){if(e.target===back)close()};setTimeout(function(){back.classList.add('show')},0);return {back:back,box:box,actions:actions,close:close}};
  api.dialog=function(opts){return openDialog(opts)};
  api.confirm=function(opts,onConfirm){opts=Object.assign({},opts||{},{theme:'confirm'});var d=openDialog(opts),cancel=make('button','royall-dialog-btn cancel',opts.cancelText||'Cancel'),yes=make('button','royall-dialog-btn '+(opts.actionTheme==='warning'?'warning':'confirm'),opts.confirmText||'Confirm');cancel.type=yes.type='button';cancel.onclick=d.close;yes.onclick=function(){d.close();if(onConfirm)onConfirm()};d.actions.append(cancel,yes);return d};
  api.warning=function(opts,onContinue){opts=Object.assign({},opts||{},{theme:'warning'});var d=openDialog(opts),cancel=make('button','royall-dialog-btn cancel',opts.cancelText||'Cancel'),yes=make('button','royall-dialog-btn warning',opts.confirmText||'Continue');cancel.type=yes.type='button';cancel.onclick=d.close;yes.onclick=function(){d.close();if(onContinue)onContinue()};d.actions.append(cancel,yes);return d};
  api.errorDialog=function(opts,onClose){opts=Object.assign({},opts||{},{theme:'error'});var d=openDialog(opts),ok=make('button','royall-dialog-btn danger',opts.buttonText||'OK');ok.type='button';ok.onclick=function(){d.close();if(onClose)onClose()};d.actions.append(ok);return d};
  api.infoDialog=function(opts,onOk){opts=Object.assign({},opts||{},{theme:'info'});var d=openDialog(opts),ok=make('button','royall-dialog-btn info',opts.buttonText||'OK');ok.type='button';ok.onclick=function(){d.close();if(onOk)onOk()};d.actions.append(ok);return d};
  api.choice=function(opts,choices){opts=Object.assign({},opts||{},{theme:opts&&opts.theme||'info'});var d=openDialog(opts);(choices||[]).forEach(function(item){var b=make('button','royall-dialog-btn '+(item.theme==='warning'?'warning':item.theme==='danger'?'danger':'info'),item.text||item[0]||'Option');b.type='button';b.onclick=function(){d.close();if(item.onClick)item.onClick();else if(item[1])item[1]()};d.actions.appendChild(b)});return d};
  api.prompt=function(opts,onSubmit){opts=Object.assign({},opts||{},{theme:opts&&opts.theme||'info'});var d=openDialog(opts),input=make('input','royall-dialog-input');input.placeholder=opts.placeholder||'';if(opts.value!=null)input.value=opts.value;d.box.insertBefore(input,d.actions);var cancel=make('button','royall-dialog-btn cancel',opts.cancelText||'Cancel'),ok=make('button','royall-dialog-btn info',opts.submitText||'OK');cancel.type=ok.type='button';cancel.onclick=d.close;ok.onclick=function(){var v=input.value;d.close();if(onSubmit)onSubmit(v)};d.actions.append(cancel,ok);setTimeout(function(){input.focus()},40);return d};
  api.clearConfirm=function(target,label){return api.confirm({icon:'🗑️',title:'Clear '+(label||'content')+'?',text:'This action will clear the current content.',cancelText:'Cancel',confirmText:'Clear'},function(){if(typeof target==='function')target();else if(target&&'value' in target)target.value='';})};
  api.toast=function(text,type,ms){type=type||'success';var t=document.querySelector('.royall-toast');if(!t){t=make('div','royall-toast');document.body.appendChild(t)}t.className='royall-toast '+type;t.textContent=text||'';requestAnimationFrame(function(){t.classList.add('show')});clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('show')},ms||1600)};
  api.errorToast=function(text,ms){api.toast(text||'Error','error',ms)};api.warningToast=function(text,ms){api.toast(text||'Warning','warning',ms)};api.successToast=function(text,ms){api.toast(text||'Done','success',ms)};
  api.fab=function(text,onClick,amber){var b=make('button','royall-fab'+(amber?' amber':''),text||'Action');b.type='button';b.onclick=onClick||function(){};document.body.appendChild(b);return b};
  api.bottomBar=function(items){var bar=make('div','royall-bottom-bar');(items||[]).slice(0,2).forEach(function(item,i){var b=make('button',i===0?'royall-bottom-primary':'royall-bottom-secondary',item.text||'Action');b.type='button';b.onclick=item.onClick||function(){};bar.appendChild(b)});document.body.appendChild(bar);return bar};
  return api;
})();
w.RoyallUI=RoyallUI;
})(window);
