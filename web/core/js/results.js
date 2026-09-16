import {make} from './base.js';
export function attachResults(api){
  function actionClass(a){
    if(a.className)return a.className;
    const kind=String(a.kind||a.type||a.text||'').toLowerCase();
    if(kind==='copy')return 'royall-copy-small';
    if(kind==='paste')return 'royall-paste-small';
    if(kind==='clear')return 'royall-clear-small';
    if(kind==='download')return 'royall-download-small';
    return 'royall-btn soft';
  }
  api.card=function(title,o={}){const c=make('section','royall-card');if(o.result)c.classList.add('royall-result-card');if(o.head){const h=make('div','royall-input-head');h.appendChild(make('div','royall-input-title',title||''));if(o.stats)h.appendChild(make('div','royall-input-stats',o.stats));(o.actions||[]).forEach(a=>{const b=make('button',actionClass(a),a.text||'Action');b.type='button';b.onclick=a.onClick||null;h.appendChild(b)});c.appendChild(h)}else c.appendChild(make('h2','royall-section-title',title||''));return c};
  api.result=text=>make('div','royall-result',text||'');
  api.divider=()=>make('div','royall-divider');
  api.message=text=>make('div','royall-message',text||'');
  api.empty=text=>make('div','royall-empty',text||'');
}
