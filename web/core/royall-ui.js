(function(w){
"use strict";
var RoyallUI=(function(){
  var api={},toastTimer;
  function make(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x}
  function esc(s){return String(s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}

  /* Fixed imported parent. The application only supplies icon, name and description. */
  api.mount=function(opts){
    opts=opts||{};
    var root=typeof opts.mount==='string'?document.querySelector(opts.mount):(opts.mount||document.body);
    if(!root)throw new Error('RoyallUI: mount element not found');
    root.innerHTML='';root.className=(root.className?root.className+' ':'')+'royall-app';
    var header=make('header','royall-header');
    header.appendChild(make('div','royall-header-icon',opts.icon||'🥏'));
    var hm=make('div','royall-header-main');hm.appendChild(make('h1','royall-title',opts.title||'Royall Tool'));hm.appendChild(make('div','royall-sub',opts.description||''));header.appendChild(hm);
    if(opts.headerButton){var ha=make('div','royall-header-actions');var b=make('button','royall-header-action '+(opts.headerButton.className||''),opts.headerButton.text||'Action');b.type='button';b.onclick=opts.headerButton.onClick||function(){};ha.appendChild(b);header.appendChild(ha)}
    root.appendChild(header);
    var feature=make('div','royall-feature-strip');feature.appendChild(make('span','royall-feature-left'));feature.firstChild.innerHTML='• Feature Provided by <strong class="royall-developer-name">'+esc(opts.developer||'Araaf Royall')+'</strong> ❣️';root.appendChild(feature);
    var content=make('main','royall-content');root.appendChild(content);
    return {root:root,header:header,feature:feature,content:content};
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
  api.downloadNamed=function(opts,text,type){opts=opts||{};api.prompt({icon:'⬇️',theme:'info',title:opts.title||'Download',text:opts.text||'Enter a file name.',placeholder:opts.placeholder||'File name',value:opts.value||'download'},function(name){name=(name||'download').trim();if(!name)return api.toast('File name required','error');var ext=opts.extension||'';if(ext && !name.toLowerCase().endsWith(ext.toLowerCase()))name+=ext;api.download(name,text,type)})};

  function openDialog(opts){opts=opts||{};var kind=opts.theme||opts.type||'confirm';var back=make('div','royall-dialog-backdrop'),box=make('div','royall-dialog theme-'+kind),head=make('div','royall-dialog-head');head.appendChild(make('div','royall-dialog-icon',opts.icon||({warning:'⚠️',error:'✖',info:'ℹ️',confirm:'?'})[kind]||'⚠️'));head.appendChild(make('h3','',opts.title||'Confirm'));box.appendChild(head);if(opts.text)box.appendChild(make('p','',opts.text));var actions=make('div','royall-dialog-actions');box.appendChild(actions);back.appendChild(box);document.body.appendChild(back);function close(){back.classList.remove('show');setTimeout(function(){back.remove()},180)}back.onclick=function(e){if(e.target===back)close()};setTimeout(function(){back.classList.add('show')},0);return {back:back,box:box,actions:actions,close:close}};

  api.dialog=function(opts){return openDialog(opts)};
  api.confirm=function(opts,onConfirm){opts=Object.assign({},opts||{}, {theme:'confirm'});var d=openDialog(opts),cancel=make('button','royall-dialog-btn cancel',opts.cancelText||'Cancel'),yes=make('button','royall-dialog-btn '+(opts.actionTheme==='warning'?'warning':'confirm'),opts.confirmText||'Confirm');cancel.type=yes.type='button';cancel.onclick=d.close;yes.onclick=function(){d.close();if(onConfirm)onConfirm()};d.actions.append(cancel,yes);return d};
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
