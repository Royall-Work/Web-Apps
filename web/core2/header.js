export function attachHeader(RoyallUI){
  function make(tag, cls, text){
    var e=document.createElement(tag);
    if(cls)e.className=cls;
    if(text!==undefined)e.textContent=text;
    return e;
  }

  RoyallUI.mount=function(options){
    var o=options||{};
    var root=typeof o.mount==='string'?document.querySelector(o.mount):(o.mount||document.body);
    if(!root)throw new Error('RoyallUI: mount not found');

    root.innerHTML='';
    root.className=((root.className||'')+' royall-app').trim();

    var top=make('header','royall-top');
    var icon=make('div','royall-icon',o.icon||'🥏');
    var head=make('div','royall-head');
    var title=make('h1','royall-title',o.title||'Royall Tool');
    var desc=make('div','royall-description',o.description||'');
    var actions=make('div','royall-top-actions');

    head.append(title,desc);
    top.append(icon,head,actions);
    root.appendChild(top);

    var feature=make('div','royall-feature');
    var left=make('span','', '• Feature Provided by ');
    var name=make('strong','',o.developer||'Araaf Royall');
    left.append(name,document.createTextNode(' ❣️'));
    feature.appendChild(left);
    root.appendChild(feature);

    var content=make('main','royall-content');
    root.appendChild(content);

    var ui={
      root:root,
      top:top,
      icon:icon,
      title:title,
      description:desc,
      actions:actions,
      feature:feature,
      content:content,
      setTitle:function(v){title.textContent=v==null?'':String(v)},
      setDescription:function(v){desc.textContent=v==null?'':String(v)},
      setIcon:function(v){icon.textContent=v==null?'':String(v)},
      setHeader:function(v){
        v=v||{};
        if(v.icon!==undefined)ui.setIcon(v.icon);
        if(v.title!==undefined)ui.setTitle(v.title);
        if(v.description!==undefined)ui.setDescription(v.description);
        if(v.status!==undefined)ui.setStatus(v.status);
        return ui;
      },
      setStatus:function(v){return RoyallUI.setStatus(feature,v)},
      setButton:function(v){
        actions.innerHTML='';
        if(!v)return null;
        var b=make('button','royall-top-button',v.text||'Action');
        b.type='button';
        if(typeof v.onClick==='function')b.addEventListener('click',v.onClick);
        actions.appendChild(b);
        return b;
      },
      removeButton:function(){actions.innerHTML='';return ui}
    };

    if(o.status!=null)ui.setStatus(o.status);
    if(o.button)ui.setButton(o.button);
    return ui;
  };

  RoyallUI.setStatus=function(feature,value){
    var old=feature.querySelector('.royall-status');
    if(old)old.remove();
    if(value==null||value==='')return null;

    var x=typeof value==='string'?{text:value}:Object.assign({},value);
    var status=make('span','royall-status '+(x.mode||''),x.text||'Active ✔️');
    feature.appendChild(status);
    return status;
  };
} 
