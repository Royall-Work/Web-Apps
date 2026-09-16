(function(w){
"use strict";

var RoyallUI=(function(){
  var api={},toastTimer;
  function make(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x}

  /* Fixed parent: header -> Feature strip -> application content. */
  api.mount=function(opts){
    opts=opts||{};
    var root=typeof opts.mount==='string'?document.querySelector(opts.mount):(opts.mount||document.body);
    if(!root)throw new Error('RoyallUI: mount element not found');
    root.innerHTML='';
    root.className=(root.className?root.className+' ':'')+'royall-app';

    var header=make('header','royall-header');
    var icon=make('div','royall-header-icon',opts.icon||'🥏');
    var hm=make('div','royall-header-main');
    hm.appendChild(make('h1','royall-title',opts.title||'Royall Tool'));
    hm.appendChild(make('div','royall-sub',opts.description||''));
    header.appendChild(icon);header.appendChild(hm);

    var actions=make('div','royall-header-actions');
    (opts.headerButtons||[]).forEach(function(a){
      var b=make('button','royall-header-action '+(a.className||''),a.text||'Action');
      b.type='button';b.addEventListener('click',a.onClick||function(){});actions.appendChild(b);
    });
    if(opts.headerButton){
      var b=make('button','royall-header-action '+(opts.headerButton.className||''),opts.headerButton.text||'Action');
      b.type='button';b.addEventListener('click',opts.headerButton.onClick||function(){});actions.appendChild(b);
    }
    if(actions.childElementCount)header.appendChild(actions);
    root.appendChild(header);

    var feature=make('div','royall-feature-strip');
    var left=make('span','royall-feature-left');
    left.innerHTML='• Feature Provided by <strong class="royall-developer-name">'+escapeHtml(opts.developer||'Araaf Royall')+'</strong> ❣️';
    feature.appendChild(left);
    if(opts.featureRight)feature.appendChild(make('span','royall-feature-right',opts.featureRight));
    root.appendChild(feature);

    var content=make('main','royall-content');root.appendChild(content);
    return {root:root,content:content,header:header,feature:feature};
  };

  api.card=function(title,opts){
    opts=opts||{};var card=make('section','royall-card');
    if(opts.result)card.classList.add('royall-result-card');
    if(opts.head){
      var head=make('div','royall-input-head');
      head.appendChild(make('div','royall-input-title',title||''));
      if(opts.stats)head.appendChild(make('div','royall-input-stats',opts.stats));
      (opts.actions||[]).forEach(function(a){
        var b=make('button',a.className||'royall-btn soft',a.text||'Action');
        b.type='button';b.addEventListener('click',a.onClick||function(){});head.appendChild(b);
      });
      card.appendChild(head);
    }else card.appendChild(make('h2','royall-section-title',title||''));
    return card;
  };

  api.input=function(opts){
    opts=opts||{};var row=make('div','royall-field-row');
    var input=make('input','royall-input');input.type=opts.type||'text';input.placeholder=opts.placeholder||'';
    if(opts.value!=null)input.value=opts.value;row.appendChild(input);
    (opts.actions||[]).forEach(function(a){
      var b=make('button',a.className||'royall-small-btn',a.text||'Action');b.type='button';
      b.addEventListener('click',function(){if(a.onClick)a.onClick(input)});row.appendChild(b);
    });
    return {el:row,input:input};
  };

  api.textarea=function(opts){opts=opts||{};var ta=make('textarea','royall-textarea');ta.placeholder=opts.placeholder||'';if(opts.value!=null)ta.value=opts.value;return {el:ta,textarea:ta}}
  api.result=function(text){return make('div','royall-result',text||'')};
  api.divider=function(){return make('div','royall-divider')};
  api.button=function(text,cls,onClick){var b=make('button',cls||'royall-btn soft',text||'Action');b.type='button';if(onClick)b.addEventListener('click',onClick);return b};

  api.chips=function(items,onChange){
    var row=make('div','royall-chip-row');items=items||[];
    items.forEach(function(it,i){
      var b=make('button','royall-chip'+(i===0?' active':''),it.label||String(it.value||it));b.type='button';
      b.addEventListener('click',function(){Array.prototype.forEach.call(row.children,function(x){x.classList.remove('active')});b.classList.add('active');if(onChange)onChange(it.value!=null?it.value:it,i)});
      row.appendChild(b);
    });
    return row;
  };

  api.copy=async function(text){
    var value=String(text==null?'':text);
    try{await navigator.clipboard.writeText(value)}catch(e){var ta=document.createElement('textarea');ta.value=value;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');ta.remove()}
    api.toast('Copied');
  };
  api.paste=async function(){try{return await navigator.clipboard.readText()}catch(e){api.toast('Clipboard unavailable');return ''}};
  api.download=function(filename,text,type){var blob=new Blob([String(text==null?'':text)],{type:type||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename||'download.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},800)};

  function openDialog(opts){
    opts=opts||{};var back=make('div','royall-dialog-backdrop'),box=make('div','royall-dialog'),head=make('div','royall-dialog-head');
    head.appendChild(make('div','royall-dialog-icon',opts.icon||'⚠️'));head.appendChild(make('h3','',opts.title||'Confirm'));box.appendChild(head);
    if(opts.text)box.appendChild(make('p','',opts.text));
    var actions=make('div','royall-dialog-actions');box.appendChild(actions);back.appendChild(box);document.body.appendChild(back);
    function close(){back.classList.remove('show');setTimeout(function(){back.remove()},180)}
    back.addEventListener('click',function(e){if(e.target===back)close()});setTimeout(function(){back.classList.add('show')},0);
    return {back:back,box:box,actions:actions,close:close};
  }

  api.confirm=function(opts,onConfirm){
    var d=openDialog(opts),cancel=make('button','royall-dialog-btn cancel',opts.cancelText||'Cancel'),yes=make('button','royall-dialog-btn '+(opts.danger===false?'primary':'danger'),opts.confirmText||'Clear');
    cancel.type=yes.type='button';cancel.onclick=d.close;yes.onclick=function(){d.close();if(onConfirm)onConfirm()};d.actions.append(cancel,yes);return d;
  };
  api.choice=function(opts,choices){
    var d=openDialog(opts);(choices||[]).forEach(function(item){var b=make('button','royall-dialog-btn primary',item.text||item[0]||'Option');b.type='button';b.onclick=function(){d.close();if(item.onClick)item.onClick();else if(item[1])item[1]()};d.actions.appendChild(b)});return d;
  };
  api.prompt=function(opts,onSubmit){
    var d=openDialog(opts),input=make('input','royall-dialog-input');input.placeholder=opts.placeholder||'';if(opts.value!=null)input.value=opts.value;d.box.insertBefore(input,d.actions);
    var cancel=make('button','royall-dialog-btn cancel',opts.cancelText||'Cancel'),ok=make('button','royall-dialog-btn primary',opts.submitText||'OK');cancel.type=ok.type='button';cancel.onclick=d.close;ok.onclick=function(){var v=input.value;d.close();if(onSubmit)onSubmit(v)};d.actions.append(cancel,ok);setTimeout(function(){input.focus()},40);return d;
  };
  api.clearConfirm=function(target,label){return api.confirm({icon:'!',title:'Clear '+(label||'content')+'?',text:'This action will clear the current content.',cancelText:'Cancel',confirmText:'Clear'},function(){if(typeof target==='function')target();else if(target&&'value' in target)target.value=''})};
  api.toggle=function(id){var x=typeof id==='string'?document.getElementById(id):id;if(!x)return false;x.classList.toggle('open');return x.classList.contains('open')};
  api.toast=function(text,ms){var t=document.querySelector('.royall-toast');if(!t){t=make('div','royall-toast');document.body.appendChild(t)}t.textContent=text||'';t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('show')},ms||1400)};
  api.fab=function(text,onClick,amber){var b=make('button','royall-fab'+(amber?' amber':''),text||'Action');b.type='button';b.onclick=onClick||function(){};document.body.appendChild(b);return b};
  api.bottomBar=function(items){var bar=make('div','royall-bottom-bar');(items||[]).forEach(function(item,i){var b=make('button',i===0?'royall-bottom-primary':'royall-bottom-secondary',item.text||'Action');b.type='button';b.onclick=item.onClick||function(){};bar.appendChild(b)});document.body.appendChild(bar);return bar};

  function escapeHtml(s){return String(s).replace(/[&<>'\"]/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'})[c]})}
  return api;
})();
w.RoyallUI=RoyallUI;
})(window);
