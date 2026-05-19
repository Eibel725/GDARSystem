// ══ REQUERIMIENTOS ══
const REQ_PREFIXES={MATERIALES:'MT-',ADMINISTRATIVO:'UA-',DISPOSITIVOS:'DS-',EPPS:'EPP-',EQUIPOS:'EQ-',HERRAMIENTAS:'HM-',INSUMOS:'INS-'};
const REQ_TIPOS=['MATERIALES','ADMINISTRATIVO','DISPOSITIVOS','EPPS','EQUIPOS','HERRAMIENTAS','INSUMOS'];
const COSTO_TIPOS=['','C. Directo','C. Indirecto','C. Reembolsable','C. Proveedores','C. EQ Propios'];
const ISS='padding:.25rem .4rem;font-size:.72rem;background:var(--panel2);border:1px solid var(--border);border-radius:4px;color:var(--text)';
let reqItemsArr=[];
let _reqVerCurrentId=null;
let _reqEditId=null;
let _editPersonalId=null;
function addReqItem(item){
  reqItemsArr.push(item||{tipo:'MATERIALES',cod:'MT-',desc:'',und:'und',cant:1,obs:'',tcosto:''});
  renderReqItems();
}
function removeReqItem(i){reqItemsArr.splice(i,1);renderReqItems();}
function onReqTipo(i,tipo){
  const prev=REQ_PREFIXES[reqItemsArr[i].tipo]||'';
  let cod=reqItemsArr[i].cod;
  if(cod.startsWith(prev))cod=cod.slice(prev.length);
  reqItemsArr[i].tipo=tipo;
  reqItemsArr[i].cod=(REQ_PREFIXES[tipo]||'')+cod;
  renderReqItems();
  // restore focus on tipo select
  const sel=document.querySelectorAll('#rqItemsBody tr')[i]?.querySelector('select');
  if(sel)sel.focus();
}
function renderReqItems(){
  const b=document.getElementById('rqItemsBody');if(!b)return;
  b.innerHTML=reqItemsArr.map((it,i)=>{
    const tipoOpts=REQ_TIPOS.map(t=>`<option value="${t}"${it.tipo===t?' selected':''}>${t}</option>`).join('');
    const undOpts=(DB.unidades&&DB.unidades.length?DB.unidades:[{abrev:'und'},{abrev:'gal'},{abrev:'lt'},{abrev:'kg'},{abrev:'caja'},{abrev:'par'},{abrev:'m'}]).map(u=>`<option value="${u.abrev}"${it.und===u.abrev?' selected':''}>${u.abrev}</option>`).join('');
    const cat=DB.catalogoItems.find(c=>c.cod===it.cod);
    const img=cat?.img||'';
    return`<tr>
      <td style="padding:.28rem .4rem;color:var(--muted2);font-size:.7rem;text-align:center">${i+1}</td>
      <td style="padding:.28rem .4rem">
        <select onchange="onReqTipo(${i},this.value)" style="${ISS};width:120px;cursor:pointer">${tipoOpts}</select>
      </td>
      <td style="padding:.28rem .4rem">
        <input id="rqC${i}" value="${it.cod}" oninput="reqItemsArr[${i}].cod=this.value;renderReqItems()" placeholder="${REQ_PREFIXES[it.tipo]||''}000" style="${ISS};width:90px;font-family:'Roboto Mono',monospace">
      </td>
      <td style="padding:.28rem .4rem;text-align:center;width:40px">
        ${img?`<img src="${img}" style="width:34px;height:34px;object-fit:cover;border-radius:5px;border:1px solid var(--border)">`
        :`<div style="width:34px;height:34px;background:var(--panel2);border-radius:5px;border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:.5rem;color:var(--muted)">—</div>`}
      </td>
      <td style="padding:.28rem .4rem;position:relative">
        <input id="rqD${i}" value="${it.desc.replace(/"/g,'&quot;')}" autocomplete="off"
          oninput="reqItemsArr[${i}].desc=this.value;showReqSug(${i},this.value)"
          onblur="setTimeout(()=>hideReqAc(),200)"
          placeholder="Descripción del material..." style="${ISS};width:210px">
      </td>
      <td style="padding:.28rem .4rem"><select onchange="reqItemsArr[${i}].und=this.value" style="${ISS};width:68px">${undOpts}</select></td>
      <td style="padding:.28rem .4rem"><input type="number" value="${it.cant}" oninput="reqItemsArr[${i}].cant=+this.value" style="${ISS};width:58px;text-align:right"></td>
      <td style="padding:.28rem .4rem"><input value="${it.obs}" oninput="reqItemsArr[${i}].obs=this.value" placeholder="Obs..." style="${ISS};width:100px"></td>
      <td style="padding:.28rem .4rem"><select onchange="reqItemsArr[${i}].tcosto=this.value" style="${ISS};width:120px;cursor:pointer">${COSTO_TIPOS.map(t=>`<option value="${t}"${it.tcosto===t?' selected':''}>${t||'— Costo —'}</option>`).join('')}</select></td>
      <td style="padding:.28rem .4rem"><button class="btn btn-del btn-sm" onclick="removeReqItem(${i})">✕</button></td>
    </tr>`;
  }).join('');
}
function showReqSug(i,val){
  const drop=document.getElementById('reqAcDrop');
  if(!val||val.length<2){drop.style.display='none';return;}
  const v=val.toLowerCase();
  const allMatches=DB.catalogoItems.filter(c=>c.desc.toLowerCase().includes(v)||c.cod.toLowerCase().includes(v));
  if(!allMatches.length){drop.style.display='none';return;}
  const matches=allMatches.slice(0,30);
  const mas=allMatches.length-30;
  const inp=document.getElementById('rqD'+i);if(!inp)return;
  const r=inp.getBoundingClientRect();
  drop.style.cssText=`position:fixed;left:${r.left}px;top:${r.bottom+2}px;width:${Math.max(r.width,520)}px;z-index:9999;display:block;background:#1e2740;border:1px solid #2e3d60;border-radius:7px;box-shadow:0 8px 28px rgba(0,0,0,.7);max-height:320px;overflow-y:auto`;
  const ea=s=>(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
  drop.innerHTML=matches.map(c=>`
    <div data-ri="${i}" data-tipo="${ea(c.tipo)}" data-cod="${ea(c.cod)}" data-desc="${ea(c.desc)}" data-und="${ea(c.und)}"
      onmousedown="selectReqSugFromEl(this)"
      style="padding:.4rem .75rem;cursor:pointer;font-size:.75rem;border-bottom:1px solid #2a3556;display:flex;align-items:center;gap:.6rem;background:transparent"
      onmouseover="this.style.background='#2a3a5e'" onmouseout="this.style.background='transparent'">
      ${c.img?`<img src="${c.img}" style="width:30px;height:30px;object-fit:cover;border-radius:4px;border:1px solid #2e3d60;flex-shrink:0;pointer-events:none">`
      :`<div style="width:30px;height:30px;background:#161e30;border-radius:4px;border:1px solid #2e3d60;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.55rem;color:#64748b;pointer-events:none">—</div>`}
      <div style="display:flex;flex-direction:column;flex:1;min-width:0;gap:1px;pointer-events:none">
        <div style="display:flex;align-items:center;gap:.4rem">
          <span style="font-size:.6rem;background:rgba(249,115,22,.18);color:var(--alm);border-radius:3px;padding:1px 5px;font-weight:700;white-space:nowrap">${c.tipo}</span>
          <span style="font-family:'Roboto Mono',monospace;font-size:.68rem;color:var(--alm)">${c.cod}</span>
        </div>
        <span style="color:#e2e8f0;white-space:normal;word-break:break-word;line-height:1.35">${c.desc}</span>
      </div>
      <span style="color:#94a3b8;font-size:.68rem;background:#161e30;padding:1px 6px;border-radius:3px;white-space:nowrap;pointer-events:none">${c.und}</span>
    </div>`).join('')
  +(mas>0?`<div style="padding:.35rem .75rem;font-size:.68rem;color:#64748b;text-align:center;background:#161e30;border-top:1px solid #2a3556">Escribe más para filtrar — ${mas} resultado${mas>1?'s':''} adicionale${mas>1?'s':''}</div>`:'');
}
function selectReqSugFromEl(el){
  const d=el.closest('[data-ri]')||el;
  selectReqSug(+d.dataset.ri,d.dataset.tipo,d.dataset.cod,d.dataset.desc,d.dataset.und);
}
function selectReqSug(i,tipo,cod,desc,und){
  reqItemsArr[i].tipo=tipo;
  reqItemsArr[i].cod=cod;
  reqItemsArr[i].desc=desc;
  reqItemsArr[i].und=und;
  document.getElementById('reqAcDrop').style.display='none';
  renderReqItems();
}
function hideReqAc(){document.getElementById('reqAcDrop').style.display='none';}

// ── AUTOCOMPLETE ALMACÉN ENTRADA ──
function showAlmAc(field,val){
  const drop=document.getElementById('almAcDrop');
  if(!val||val.length<1){drop.style.display='none';return;}
  const v=val.toLowerCase();
  const matches=DB.catalogoItems.filter(c=>
    field==='cod'
      ? c.cod.toLowerCase().includes(v)
      : c.desc.toLowerCase().includes(v)||c.cod.toLowerCase().includes(v)
  ).slice(0,14);
  if(!matches.length){drop.style.display='none';return;}
  const inp=document.getElementById(field==='cod'?'aeCod':'aeNom');
  if(!inp)return;
  const r=inp.getBoundingClientRect();
  drop.style.cssText=`position:fixed;left:${r.left}px;top:${r.bottom+2}px;width:${Math.max(r.width,340)}px;z-index:9999;display:block;background:#1e2740;border:1px solid #2e3d60;border-radius:7px;box-shadow:0 8px 28px rgba(0,0,0,.75);max-height:240px;overflow-y:auto`;
  drop.innerHTML=matches.map(c=>`
    <div onmousedown="selectAlmAc('${c.cod}','${c.desc.replace(/'/g,"\\'").replace(/"/g,'&quot;')}','${c.und}')"
      style="padding:.42rem .75rem;cursor:pointer;font-size:.76rem;border-bottom:1px solid #2a3556;display:flex;align-items:center;gap:.6rem;background:transparent"
      onmouseover="this.style.background='#2a3a5e'" onmouseout="this.style.background='transparent'">
      ${c.img?`<img src="${c.img}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;border:1px solid #2e3d60;flex-shrink:0">`
      :`<div style="width:32px;height:32px;background:#161e30;border-radius:4px;border:1px solid #2e3d60;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.55rem;color:#64748b">—</div>`}
      <span style="font-family:'Roboto Mono',monospace;font-size:.68rem;color:var(--alm);min-width:68px;flex-shrink:0">${c.cod}</span>
      <span style="flex:1;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.desc}</span>
      <span style="color:#94a3b8;font-size:.68rem;background:#161e30;padding:1px 6px;border-radius:3px;flex-shrink:0">${c.und}</span>
      ${c.pur?`<span style="color:#10b981;font-size:.67rem;font-family:'Roboto Mono',monospace;flex-shrink:0">S/${Number(c.pur).toFixed(2)}</span>`:''}
    </div>`).join('');
}
function selectAlmAc(cod,desc,und){
  document.getElementById('aeCod').value=cod;
  document.getElementById('aeNom').value=desc;
  document.getElementById('aeUnd').value=und;
  hideAlmAc();
}
function hideAlmAc(){document.getElementById('almAcDrop').style.display='none';}

// ── AUTOCOMPLETE ENTRADA MÚLTIPLE ──
let _emAcIdx=-1;
function showEmAc(idx,val){
  _emAcIdx=idx;
  const drop=document.getElementById('emAcDrop');
  if(!val||val.length<1){drop.style.display='none';return;}
  const v=val.toLowerCase();
  const matches=DB.catalogoItems.filter(c=>c.desc.toLowerCase().includes(v)||c.cod.toLowerCase().includes(v)).slice(0,30);
  if(!matches.length){drop.style.display='none';return;}
  const inp=document.getElementById('emAcInp'+idx);
  if(!inp)return;
  const r=inp.getBoundingClientRect();
  const dropW=Math.min(Math.max(r.width,580),window.innerWidth-20);
  const dropLeft=Math.min(r.left,window.innerWidth-dropW-8);
  drop.style.cssText=`position:fixed;left:${Math.max(4,dropLeft)}px;top:${r.bottom+2}px;width:${dropW}px;z-index:9999;display:block;background:#1e2740;border:1px solid #2e3d60;border-radius:7px;box-shadow:0 8px 28px rgba(0,0,0,.75);max-height:380px;overflow-y:auto`;
  drop.innerHTML=matches.map(c=>`
    <div onmousedown="selectEmAc(${idx},'${c.cod}','${c.desc.replace(/'/g,"\\'").replace(/"/g,'&quot;')}','${c.und}')"
      style="padding:.42rem .75rem;cursor:pointer;font-size:.76rem;border-bottom:1px solid #2a3556;display:flex;align-items:center;gap:.6rem;background:transparent"
      onmouseover="this.style.background='#2a3a5e'" onmouseout="this.style.background='transparent'">
      ${c.img?`<img src="${c.img}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;border:1px solid #2e3d60;flex-shrink:0">`
      :`<div style="width:32px;height:32px;background:#161e30;border-radius:4px;border:1px solid #2e3d60;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.55rem;color:#64748b">—</div>`}
      <span style="font-family:'Roboto Mono',monospace;font-size:.68rem;color:var(--alm);min-width:68px;flex-shrink:0">${c.cod}</span>
      <span style="flex:1;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.desc}</span>
      <span style="color:#94a3b8;font-size:.68rem;background:#161e30;padding:1px 6px;border-radius:3px;flex-shrink:0">${c.und}</span>
      ${c.pur?`<span style="color:#10b981;font-size:.67rem;font-family:'Roboto Mono',monospace;flex-shrink:0">S/${Number(c.pur).toFixed(2)}</span>`:''}
    </div>`).join('');
}
function selectEmAc(idx,cod,desc,und){
  emItemsArr[idx].cod=cod;emItemsArr[idx].nom=desc;emItemsArr[idx].und=und;
  const inp=document.getElementById('emAcInp'+idx);if(inp)inp.value=cod+' – '+desc;
  const undInp=document.getElementById('emAcUnd'+idx);if(undInp)undInp.value=und;
  hideEmAc();
}
function hideEmAc(){const d=document.getElementById('emAcDrop');if(d)d.style.display='none';}
function openMReq(){_reqEditId=null;reqItemsArr=[];addReqItem();document.getElementById('rqProy').value='';document.getElementById('rqCodProy').value='';document.getElementById('rqProyNumHint').textContent='';document.querySelector('#mReq .mttl').textContent='📝 Nuevo Requerimiento de Materiales';document.querySelector('#mReq .mf .btn-a').textContent='Registrar Requerimiento';openM('mReq');}
function intentarEditarReq(id){
  const r=DB.requerimientos.find(x=>x.id===id);if(!r)return;
  const bloqueado=r.est==='Atendido'||r.est==='Anulado';
  if(bloqueado&&CU.codigo!=='EIBEL25'){
    alert('⚠️ Este requerimiento ya no se puede editar porque está '+r.est.toLowerCase()+'.\n\nComunícate con el Administrador General para que atienda tu solicitud.');
    return;
  }
  editReq(id);
}
function editReq(id){
  const r=DB.requerimientos.find(x=>x.id===id);if(!r)return;
  _reqEditId=id;
  reqItemsArr=JSON.parse(JSON.stringify(r.items));
  document.querySelector('#mReq .mttl').textContent='✏️ Editar Requerimiento: '+r.num;
  document.querySelector('#mReq .mf .btn-a').textContent='Guardar Cambios';
  document.getElementById('rqProy').value=r.proyecto||'';
  document.getElementById('rqCodProy').value=r.codProy||'';
  document.getElementById('rqF').value=r.fecha||'';
  // set solicitante select
  const solSel=document.getElementById('rqSol');[...solSel.options].forEach(o=>{o.selected=o.text===r.solicitante||o.value===r.solicitante;});
  // set area select
  const areaSel=document.getElementById('rqArea');[...areaSel.options].forEach(o=>{o.selected=o.text===r.area||o.value===r.area;});
  document.getElementById('rqFEnt').value=r.fechaEnt||'';
  const priorSel=document.getElementById('rqPrior');[...priorSel.options].forEach(o=>{o.selected=o.value===r.prioridad;});
  const estSel=document.getElementById('rqEst');[...estSel.options].forEach(o=>{o.selected=o.value===r.est;});
  document.getElementById('rqObs').value=r.obs||'';
  renderReqItems();
  closeM('mReqVer');
  openM('mReq');
}
function exportReqPDF(id){
  const r=DB.requerimientos.find(x=>x.id===id);if(!r)return;
  const comps=DB.facturasPago.filter(f=>f.reqId===id);
  function e(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  const iRows=r.items.map((it,i)=>{
    const _cat=DB.catalogoItems.find(c=>c.cod===it.cod);const _img=_cat?.img||'';
    const _imgCell=_img?'<img src="'+_img+'" style="width:38px;height:38px;object-fit:cover;border-radius:4px;border:1px solid #ddd">':`<span style="color:#ccc;font-size:10px">—</span>`;
    return'<tr><td align=center>'+(i+1)+'</td><td class=m>'+e(it.cod||'—')+'</td><td align=center>'+_imgCell+'</td><td><b>'+e(it.desc)+'</b></td><td align=center>'+e(it.und)+'</td><td align=center style="font-weight:700;font-size:13px">'+it.cant+'</td><td style="color:#666">'+e(it.obs||'—')+'</td><td style="color:#d97706;font-size:10px;white-space:nowrap">'+e(it.tcosto||'—')+'</td></tr>';
  }).join('');
  const cRows=comps.map(c=>'<tr><td>'+e(c.tipo)+'</td><td class=m>'+e(c.num)+'</td><td>'+e(c.prov)+'</td><td align=right style=color:#10b981>S/ '+c.total.toFixed(2)+'</td><td>'+e(c.est)+'</td></tr>').join('');
  const _baseUrl=window.location.href.replace(/[^\/\\]+$/,'');
  const _logoUrl=_baseUrl+'09.-ERP/Imagenes/ECOSERMO-LOGO.png';
  const css='*{margin:0;padding:0;box-sizing:border-box}'
    +'@page{margin:15px 0}'
    +'body{font-family:Segoe UI,Arial,sans-serif;font-size:12px;color:#111;padding:0 30px}'
    /* ── Tabla envolvente (thead = encabezado real que se repite por página) ── */
    +'.doc{width:100%;border-collapse:collapse}'
    +'.doc>thead>tr>td,.doc>tbody>tr>td{padding:0;border:none;vertical-align:top}'
    /* ── Encabezado ── */
    +'.ph{padding:8px 0 6px;border-top:3px solid #1e3a6e;border-bottom:2px solid #1e3a6e;margin-bottom:12px}'
    +'.ph-inner{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px}'
    +'.ph-logo{height:40px;max-width:160px;object-fit:contain}'
    +'.ph-center{text-align:center}'
    +'.ph-title{font-size:13px;font-weight:900;color:#1e3a6e;letter-spacing:.02em;line-height:1.2}'
    +'.ph-rq{font-family:Courier New,monospace;font-size:11px;font-weight:700;color:#d97706;letter-spacing:.08em}'
    +'.ph-right{text-align:right;font-size:7.5px;color:#999;line-height:1.7}'
    /* ── Pie de página de firmas ── */
    +'.pf{padding:6px 0 4px;border-top:2px solid #1e3a6e}'
    +'.pf-sep{display:none}'
    +'.vb-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:5px}'
    +'.vb{text-align:center}'
    +'.vb-space{height:38px}'
    +'.vb-line{border-top:1.5px solid #333;margin:0 10px 5px}'
    +'.vb-label{font-size:8.5px;text-transform:uppercase;font-weight:700;color:#1e3a6e;letter-spacing:.06em}'
    +'.vb-sub{font-size:7.5px;color:#aaa;margin-top:2px}'
    /* ── Contenido ── */
    +'.proy{background:#eef3ff;border-left:4px solid #1e3a6e;border-radius:4px;padding:7px 12px;margin-bottom:12px}'
    +'.proy .lbl{font-size:8px;text-transform:uppercase;color:#888;font-weight:700;margin-bottom:2px}'
    +'.proy .val{font-weight:700;font-size:13px;color:#1e3a6e}'
    +'.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;background:#f8f9fb;border-radius:6px;padding:12px;border:1px solid #e2e6f0}'
    +'.lbl{font-size:8.5px;text-transform:uppercase;color:#999;margin-bottom:2px;font-weight:700}'
    +'.val{font-weight:600;font-size:11px}'
    /* ── Tablas de contenido (.ct) ── */
    +'.ct{width:100%;border-collapse:collapse;margin-bottom:14px}'
    +'.ct th{background:#1e3a6e;color:#fff;padding:6px 8px;font-size:9px;text-transform:uppercase;font-weight:700}'
    +'.ct th.l{text-align:left}.ct th.c{text-align:center}'
    +'.ct td{padding:5px 8px;border-bottom:1px solid #eee;font-size:11px}'
    +'.ct tr{page-break-inside:avoid}'
    +'.m{font-family:Courier New,monospace}'
    +'.sec{font-size:9.5px;text-transform:uppercase;color:#1e3a6e;margin:12px 0 6px;font-weight:700;border-left:3px solid #f59e0b;padding-left:7px}'
    +'.obs-box{background:#fafafa;border-left:3px solid #ccc;padding:8px 10px;color:#555;margin-bottom:12px;font-size:11px;border-radius:0 4px 4px 0}';
  let body='';
  // ── Tabla envolvente: thead = encabezado real repetido por página ──
  body+='<table class=doc><thead><tr><td>';
  body+='<div class=ph><div class=ph-inner>';
  body+='<img src="'+_logoUrl+'" class=ph-logo alt="Ecosermo">';
  body+='<div class=ph-center><div class=ph-title>Requerimiento de Materiales</div><div class=ph-rq>N° '+e(r.num)+'</div></div>';
  body+='<div class=ph-right>Documento de uso interno<br>Generado por GDAR</div>';
  body+='</div></div>';
  body+='</td></tr></thead>';
  // ── tfoot = firmas reales repetidas en cada página ──
  body+='<tfoot><tr><td>';
  body+='<div class=pf><div class=pf-sep></div><div class=vb-wrap>';
  body+='<div class=vb><div class=vb-space></div><div class=vb-line></div><div class=vb-label>V°B° Jefe de Área</div><div class=vb-sub>Firma y sello</div></div>';
  body+='<div class=vb><div class=vb-space></div><div class=vb-line></div><div class=vb-label>V°B° Jefe de Proy. / Residente</div><div class=vb-sub>Firma y sello</div></div>';
  body+='<div class=vb><div class=vb-space></div><div class=vb-line></div><div class=vb-label>V°B° Almacén</div><div class=vb-sub>Firma y sello</div></div>';
  body+='</div></div>';
  body+='</td></tr></tfoot>';
  body+='<tbody><tr><td>';

  // ── Contenido de página ──
  if(r.proyecto)body+='<div class=proy><div class=lbl>Proyecto'+(r.codProy?' <span style="font-family:monospace;color:#d97706;font-size:10px;margin-left:6px">'+e(r.codProy)+'</span>':'')+'</div><div class=val>'+e(r.proyecto)+'</div></div>';
  body+='<div class=grid>';
  body+='<div><div class=lbl>Solicitante</div><div class=val>'+e(r.solicitante)+'</div></div>';
  body+='<div><div class=lbl>Área / Frente</div><div class=val>'+e(r.area)+'</div></div>';
  body+='<div><div class=lbl>Fecha RQ</div><div class=val>'+e(r.fecha)+'</div></div>';
  body+='<div><div class=lbl>F. Entrega</div><div class=val>'+e(r.fechaEnt||'—')+'</div></div>';
  body+='<div><div class=lbl>Prioridad</div><div class=val>'+e(r.prioridad)+'</div></div>';
  body+='<div><div class=lbl>Estado</div><div class=val>'+e(r.est)+'</div></div>';
  body+='</div>';
  body+='<div class=sec>Ítems Solicitados</div>';
  body+='<table class=ct><thead><tr><th class=c>#</th><th class=l>Código</th><th class=c>Img.</th><th class=l>Descripción</th><th class=c>Unid.</th><th class=c>Cant.</th><th class=l>Obs.</th><th class=l>T. Costo</th></tr></thead><tbody>'+iRows+'</tbody></table>';
  if(r.obs)body+='<div class=sec>Observaciones</div><div class=obs-box>'+e(r.obs)+'</div>';
  if(comps.length)body+='<div class=sec>Comprobantes Vinculados</div><table class=ct><thead><tr><th class=l>Tipo</th><th class=l>N° Comp.</th><th class=l>Proveedor</th><th class=c>Total S/</th><th class=l>Estado</th></tr></thead><tbody>'+cRows+'</tbody></table>';
  body+='</td></tr></tbody></table>';
  const S='<'+'/';
  const html='<!DOCTYPE html><html><head><meta charset=utf-8><title>'+e(r.num)+S+'title><style>'+css+S+'style>'+S+'head><body>'+body+S+'body>'+S+'html>';
  const win=window.open('','_blank');
  if(!win){toast('Active ventanas emergentes para exportar PDF',true);return;}
  win.document.write(html);win.document.close();win.focus();
  setTimeout(function(){win.print();},400);
}
// ══ PROYECTOS ══
let _editProyectoId=null;
function rProyectos(){
  document.getElementById('proyKpis').innerHTML=[
    {l:'Total Proyectos',v:DB.proyectos.length,c:'#f97316'},
    {l:'Activos',v:DB.proyectos.filter(p=>p.estado==='Activo').length,c:'#10b981'},
    {l:'Con Requerimientos',v:DB.proyectos.filter(p=>DB.requerimientos.some(r=>r.codProy===p.codigo||r.proyecto===p.nombre)).length,c:'#3b82f6'}
  ].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  document.getElementById('tbProyectos').innerHTML=DB.proyectos.map(p=>{
    const nReqs=DB.requerimientos.filter(r=>r.codProy===p.codigo||r.proyecto===p.nombre).length;
    return`<tr>
      <td class="mono" style="color:var(--alm);font-weight:700">${p.codigo}</td>
      <td><strong>${p.nombre}</strong></td>
      <td style="color:var(--muted2);font-size:.8rem">${p.descripcion||'—'}</td>
      <td>${bge(p.estado)}</td>
      <td style="text-align:center;color:${nReqs?'var(--alm)':'var(--muted)'};font-weight:600">${nReqs||'0'}</td>
      <td style="display:flex;gap:.3rem">
        <button class="btn btn-sm" style="background:rgba(245,158,11,.15);border:1px solid #f59e0b60;color:#f59e0b" onclick="openProyectoEdit(${p.id})">✏️</button>
        <button class="btn btn-del btn-sm" onclick="del('proyectos',${p.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
  
}
function _nextProyCod(){
  const yy=String(new Date().getFullYear()).slice(-2);
  const re=/^([A-Z]+)-(\d+)-(\d+)$/;
  const same=DB.proyectos.map(p=>p.codigo&&p.codigo.match(re)).filter(m=>m&&m[3]===yy);
  if(same.length===0)return'EPY-001-'+yy;
  const prefix=same[same.length-1][1];
  const maxN=Math.max(...same.filter(m=>m[1]===prefix).map(m=>+m[2]));
  return prefix+'-'+String(maxN+1).padStart(3,'0')+'-'+yy;
}
function openProyectoNew(){
  _editProyectoId=null;
  document.getElementById('pCod').value=_nextProyCod();
  document.getElementById('pNom').value='';
  document.getElementById('pDesc').value='';
  document.getElementById('pEst').value='Activo';
  document.getElementById('mProyTtl').textContent='🏗 Nuevo Proyecto';
  openM('mProyecto');
}

function openProyectoEdit(id){
  const p=DB.proyectos.find(x=>x.id===id);if(!p)return;
  _editProyectoId=id;
  document.getElementById('pCod').value=p.codigo||'';
  document.getElementById('pNom').value=p.nombre||'';
  document.getElementById('pDesc').value=p.descripcion||'';
  document.getElementById('pEst').value=p.estado||'Activo';
  document.getElementById('mProyTtl').textContent='✏️ Editar Proyecto';
  openM('mProyecto');
}
function gProyecto(){
  const codigo=document.getElementById('pCod').value.trim().toUpperCase();
  const nombre=document.getElementById('pNom').value.trim();
  if(!codigo||!nombre){toast('Ingrese código y nombre del proyecto',true);return;}
  const rec={codigo,nombre,descripcion:document.getElementById('pDesc').value.trim(),estado:document.getElementById('pEst').value};
  if(_editProyectoId){
    const idx=DB.proyectos.findIndex(x=>x.id===_editProyectoId);
    if(idx>-1){Object.assign(DB.proyectos[idx],rec);syncSheet('saveProyecto',DB.proyectos[idx]);}
    _editProyectoId=null;
    closeM('mProyecto');rProyectos();toast('Proyecto actualizado');
  }else{
    if(DB.proyectos.some(p=>p.codigo===codigo)){toast('Ya existe un proyecto con ese código',true);return;}
    rec.id=nid('proy');
    DB.proyectos.push(rec);
    syncSheet('saveProyecto',rec);
    closeM('mProyecto');rProyectos();toast('Proyecto registrado: '+codigo);
  }
}

let _rReqSortAsc=true;
function _rReqToggleSort(){
  _rReqSortAsc=!_rReqSortAsc;
  const ic=document.getElementById('rqSortIcon');
  if(ic)ic.textContent=_rReqSortAsc?'▲':'▼';
  rReq();
}
function exportReqXLS(){
  if(!window.XLSX){toast('Librería Excel no cargada aún, intenta en unos segundos',true);return;}
  const pfEl=document.getElementById('rqProyFilter');
  const filtProy=pfEl?pfEl.value:'';
  let lista=DB.requerimientos;
  if(filtProy)lista=lista.filter(r=>(r.proyecto||'')===filtProy);
  const wb=XLSX.utils.book_new();
  // Hoja 1: Resumen
  const h1=['Cód. Proyecto','N° RQ','Fecha','Proyecto','Solicitante','Área','Prioridad','Estado','N° Ítems','Comprobantes'];
  const d1=lista.map(r=>[
    r.codProy||'',r.num||'',r.fecha||'',r.proyecto||'',
    r.solicitante||'',r.area||'',r.prioridad||'',r.est||'',
    (r.items||[]).length,
    DB.facturasPago.filter(f=>f.reqId===r.id).map(f=>f.num).join(', ')
  ]);
  const ws1=XLSX.utils.aoa_to_sheet([h1,...d1]);
  ws1['!cols']=[{wch:12},{wch:10},{wch:12},{wch:28},{wch:22},{wch:18},{wch:12},{wch:16},{wch:8},{wch:22}];
  XLSX.utils.book_append_sheet(wb,ws1,'Requerimientos');
  // Hoja 2: Detalle ítems
  const h2=['Cód. Proyecto','N° RQ','Fecha','Estado','Cód. Ítem','Descripción','Unidad','Cantidad','Observación','Tipo Costo'];
  const d2=[];
  lista.forEach(r=>(r.items||[]).forEach(it=>d2.push([
    r.codProy||'',r.num||'',r.fecha||'',r.est||'',
    it.cod||'',it.desc||'',it.und||'',it.cant||0,it.obs||'',it.tcosto||''
  ])));
  const ws2=XLSX.utils.aoa_to_sheet([h2,...d2]);
  ws2['!cols']=[{wch:12},{wch:10},{wch:12},{wch:16},{wch:14},{wch:35},{wch:8},{wch:9},{wch:25},{wch:16}];
  XLSX.utils.book_append_sheet(wb,ws2,'Detalle Ítems');
  XLSX.writeFile(wb,`Requerimientos_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('✓ Excel descargado');
}

function exportKardexXLS(){
  if(!window.XLSX){toast('Librería Excel no cargada aún, intenta en unos segundos',true);return;}
  // Mismo orden y filtros que rAlm()
  const filas=[...DB.almacen].sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id-b.id);
  const saldos={},saldoMap={};
  filas.forEach(r=>{if(saldos[r.codigo]===undefined)saldos[r.codigo]=0;saldos[r.codigo]+=(r.tipo==='E'?1:-1)*r.cant;saldoMap[r.id]=saldos[r.codigo];});
  let fm=_almFiltTipo?filas.filter(r=>r.tipo===_almFiltTipo):filas;
  if(_almFiltProy)fm=fm.filter(r=>(r.codProy||'').trim()===_almFiltProy);
  if(_almFiltMat)fm=fm.filter(r=>r.codigo&&r.codigo.toUpperCase().startsWith(_almFiltMat.toUpperCase()+'-'));
  if(_almFiltFecha)fm=fm.filter(r=>r.fecha===_almFiltFecha);
  if(_almFiltText)fm=fm.filter(r=>[r.codigo,r.nombre,r.proyecto,r.rqRef,r.numVale,r.para,r.tipoCosto,r.proveedor].some(v=>String(v||'').toLowerCase().includes(_almFiltText)));
  const wb=XLSX.utils.book_new();
  const hdr=['Fecha','Proyecto','Cód. Proyecto','RQ / VAL','Código','Descripción','Unidad','Movimiento','Cantidad','Saldo','Tipo Costo','Para Persona/Equipo','Proveedor'];
  const rows=fm.map(r=>[
    r.fecha||'',r.proyecto||'',r.codProy||'',
    r.tipo==='S'?(r.numVale||''):(r.rqRef||''),
    r.codigo||'',r.nombre||'',r.unidad||'',
    r.tipo==='E'?'Entrada':'Salida',
    r.tipo==='E'?+r.cant:-r.cant,
    saldoMap[r.id]||0,
    r.tipoCosto||'',r.para||'',r.proveedor||''
  ]);
  const ws=XLSX.utils.aoa_to_sheet([hdr,...rows]);
  ws['!cols']=[{wch:12},{wch:28},{wch:12},{wch:12},{wch:14},{wch:32},{wch:8},{wch:9},{wch:9},{wch:9},{wch:15},{wch:28},{wch:22}];
  XLSX.utils.book_append_sheet(wb,ws,'Kardex');
  XLSX.writeFile(wb,`Kardex_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('✓ Excel descargado');
}

function rReq(){
  // Actualizar opciones del filtro de proyecto preservando selección
  const pfEl=document.getElementById('rqProyFilter');
  const prevProy=pfEl?pfEl.value:'';
  if(pfEl){
    pfEl.innerHTML='<option value="">— Todos —</option>'
      +DB.proyectos.filter(p=>p.estado!=='Anulado')
        .sort((a,b)=>a.codigo.localeCompare(b.codigo))
        .map(p=>`<option value="${p.nombre}">${p.codigo} – ${p.nombre}</option>`).join('');
    pfEl.value=prevProy;
  }
  const filtProy=pfEl?pfEl.value:'';

  // Filtrar primero, luego calcular KPIs sobre el mismo subconjunto
  let lista=DB.requerimientos;
  if(filtProy) lista=lista.filter(r=>(r.proyecto||'')===filtProy);

  const tot=lista.length;
  const pend=lista.filter(r=>r.est==='Pendiente').length;
  const aten=lista.filter(r=>r.est==='Atendido').length;
  document.getElementById('reqKpis').innerHTML=[
    {l:'Total Requerimientos',v:tot,c:'#f97316'},
    {l:'Pendientes',v:pend,c:'#ef4444'},
    {l:'En Proceso',v:lista.filter(r=>r.est==='En Proceso').length,c:'#f59e0b'},
    {l:'Atendido Parcial',v:lista.filter(r=>r.est==='Atendido Parcial').length,c:'#06b6d4'},
    {l:'Atendidos',v:aten,c:'#10b981'},
    {l:'Con Comprobante',v:lista.filter(r=>DB.facturasPago.some(f=>f.reqId===r.id)).length,c:'#3b82f6'}
  ].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  const dir=_rReqSortAsc?1:-1;
  document.getElementById('tbReq').innerHTML=[...lista].sort((a,b)=>{
    const pc=(a.codProy||'').localeCompare(b.codProy||'');
    if(pc!==0)return pc*dir;
    const na=parseInt((a.num||'').replace(/\D/g,''))||0;
    const nb=parseInt((b.num||'').replace(/\D/g,''))||0;
    return(na-nb)*dir;
  }).map(r=>{
    const comps=DB.facturasPago.filter(f=>f.reqId===r.id);
    const compBadge=comps.length?`<span class="badge b-green" style="cursor:pointer" onclick="verTrazReq(${r.id})">🔗 ${comps.length} comp.</span>`:`<span class="badge b-yellow">Sin comp.</span>`;
    return`<tr>
      <td class="mono" style="font-weight:700;color:var(--alm)">${r.codProy||'<span style="color:var(--muted)">—</span>'}</td>
      <td class="mono" style="font-weight:600">${r.num}</td>
      <td class="mono">${r.fecha}</td>
      <td>${r.solicitante}</td>
      <td>${r.area}</td>
      <td>${bge(r.prioridad)}</td>
      <td style="color:var(--muted2);font-size:.72rem">${r.items.length} ítem(s)</td>
      <td>${bge(r.est)}</td>
      <td>${compBadge}</td>
      <td style="display:flex;gap:.3rem">
        <button class="btn btn-out btn-sm" onclick="verDetalleReq(${r.id})">👁 Ver</button>
        ${r.est!=='Atendido'?`<button class="btn btn-del btn-sm" onclick="del('requerimientos',${r.id})">🗑</button>`:''}
      </td></tr>`;
  }).join('');
}
function _proyNextNum(proy){
  if(!proy||!proy.trim())return null;
  const p=proy.trim().toUpperCase();
  const proyReqs=DB.requerimientos.filter(r=>r.proyecto&&r.proyecto.toUpperCase()===p);
  const maxNum=proyReqs.reduce((mx,r)=>{const n=parseInt((r.num||'').replace(/\D/g,''))||0;return Math.max(mx,n);},0);
  return{next:'RQ-'+String(maxNum+1).padStart(3,'0'),last:proyReqs.length?[...proyReqs].sort((a,b)=>a.num>b.num?1:-1).pop().num:null,count:proyReqs.length};
}
function showRqProyAc(val){
  const drop=document.getElementById('rqProyAcDrop');
  let lista=DB.proyectos.filter(p=>p.estado!=='Anulado');
  if(val){const v=val.toLowerCase();lista=lista.filter(p=>p.nombre.toLowerCase().includes(v)||p.codigo.toLowerCase().includes(v));}
  updateRqNumHint(val);
  if(!lista.length){drop.style.display='none';return;}
  drop.innerHTML=lista.map(p=>{
    const info=_proyNextNum(p.nombre);
    const esc=p.nombre.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return`<div onmousedown="selectRqProy('${esc}','${p.codigo}')"
      style="padding:.5rem .8rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)"
      onmouseover="this.style.background='var(--panel2)'" onmouseout="this.style.background=''">
      <div>
        <div style="font-weight:600;font-size:.83rem">${p.nombre}</div>
        <div style="font-size:.65rem;color:var(--alm);font-family:'Roboto Mono',monospace;margin-top:.1rem">${p.codigo}</div>
      </div>
      <span style="font-size:.65rem;color:var(--muted2);margin-left:.8rem;white-space:nowrap">${info&&info.count?info.count+' RQ · → '+info.next:'Primer RQ'}</span>
    </div>`;
  }).join('');
  drop.style.display='block';
}
function selectRqProy(nombre,codigo){
  document.getElementById('rqProy').value=nombre;
  document.getElementById('rqCodProy').value=codigo||'';
  hideRqProyAc();
  updateRqNumHint(nombre);
}
function hideRqProyAc(){const d=document.getElementById('rqProyAcDrop');if(d)d.style.display='none';}
function updateRqNumHint(proy){
  const hint=document.getElementById('rqProyNumHint');if(!hint)return;
  if(!proy||!proy.trim()){hint.textContent='';return;}
  // Auto-fill code if not already filled
  const codEl=document.getElementById('rqCodProy');
  if(codEl&&!codEl.value){
    const match=DB.proyectos.find(p=>p.nombre.toLowerCase()===proy.trim().toLowerCase());
    if(match)codEl.value=match.codigo;
  }
  const info=_proyNextNum(proy);
  if(!info)return;
  const codProy=codEl&&codEl.value?` [${codEl.value}]`:'';
  hint.textContent=info.last
    ?`Proyecto${codProy} · ${info.count} RQ · Último: ${info.last} · Siguiente: ${info.next}`
    :`Proyecto${codProy} · Primer requerimiento: ${info.next}`;
}
function _resolverCodProy(nombre,codManual){
  if(codManual)return codManual;
  if(!nombre)return '';
  const n=nombre.trim().toLowerCase();
  const found=DB.proyectos.find(p=>p.nombre.toLowerCase()===n||p.codigo.toLowerCase()===n);
  return found?found.codigo:'';
}
function gReq(){
  if(!reqItemsArr.length){toast('Agregue al menos un ítem',true);return;}
  const valid=reqItemsArr.some(it=>it.desc.trim());
  if(!valid){toast('Complete la descripción del ítem',true);return;}
  const items=JSON.parse(JSON.stringify(reqItemsArr));
  if(_reqEditId){
    // modo edición
    const idx=DB.requerimientos.findIndex(x=>x.id===_reqEditId);
    if(idx<0){toast('Requerimiento no encontrado',true);return;}
    const r=DB.requerimientos[idx];
    r.proyecto=document.getElementById('rqProy').value.trim();
    r.codProy=_resolverCodProy(r.proyecto,document.getElementById('rqCodProy').value.trim());
    document.getElementById('rqCodProy').value=r.codProy;
    r.fecha=document.getElementById('rqF').value||today();
    r.solicitante=document.getElementById('rqSol').value;
    r.area=document.getElementById('rqArea').value;
    r.fechaEnt=document.getElementById('rqFEnt').value;
    r.prioridad=document.getElementById('rqPrior').value;
    r.est=document.getElementById('rqEst').value;
    r.obs=document.getElementById('rqObs').value;
    r.items=items;
    // Recalcular num por proyecto al editar
    if(r.proyecto){
      const p=r.proyecto.toUpperCase();
      const sorted=DB.requerimientos.filter(x=>x.proyecto&&x.proyecto.toUpperCase()===p).sort((a,b)=>a.id-b.id);
      const pos=sorted.findIndex(x=>x.id===_reqEditId);
      if(pos>=0)r.num='RQ-'+String(pos+1).padStart(3,'0');
    }
    supaGuardarRequerimiento(r);
    _reqEditId=null;
    closeM('mReq');rReq();toast('Requerimiento actualizado: '+r.num);
    return;
  }
  const newId=nid('req');
  const _proy=document.getElementById('rqProy').value.trim();
  const _info=_proyNextNum(_proy);
  const num=_info?_info.next:'RQ-'+String(newId).padStart(3,'0');
  const _codProy=_resolverCodProy(_proy,document.getElementById('rqCodProy').value.trim());
  if(_codProy)document.getElementById('rqCodProy').value=_codProy;
  const newReq={
    id:newId,num,
    proyecto:_proy,
    codProy:_codProy,
    fecha:document.getElementById('rqF').value||today(),
    solicitante:document.getElementById('rqSol').value,
    area:document.getElementById('rqArea').value,
    fechaEnt:document.getElementById('rqFEnt').value,
    prioridad:document.getElementById('rqPrior').value,
    est:document.getElementById('rqEst').value,
    obs:document.getElementById('rqObs').value,
    userEmail:CU?CU.nombre:'',
    items
  };
  DB.requerimientos.push(newReq);
  reqItemsArr.forEach(it=>{
    if(!it.desc.trim())return;
    const existe=DB.catalogoItems.some(c=>c.tipo===it.tipo&&c.desc.toLowerCase()===it.desc.toLowerCase());
    if(!existe)DB.catalogoItems.push({id:nid('cat'),tipo:it.tipo,cod:it.cod,desc:it.desc,und:it.und});
  });
  supaGuardarRequerimiento(newReq);
  closeM('mReq');rReq();toast('Requerimiento registrado: '+num);
}
function verDetalleReq(id){
  const r=DB.requerimientos.find(x=>x.id===id);if(!r)return;
  _reqVerCurrentId=id;
  const comps=DB.facturasPago.filter(f=>f.reqId===id);
  document.getElementById('mReqVerTtl').textContent='Detalle: '+r.num;
  document.getElementById('mReqVerBody').innerHTML=`
    ${r.proyecto?`<div style="background:var(--panel2);border:1px solid var(--border);border-radius:7px;padding:.5rem .8rem;margin-bottom:.7rem"><span style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Proyecto</span><div style="font-weight:700;font-size:.95rem;margin-top:.15rem">${r.proyecto}</div></div>`:''}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem;margin-bottom:.9rem">
      <div><div style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Solicitante</div><div style="font-weight:600">${r.solicitante}</div></div>
      <div><div style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Área / Frente</div><div>${r.area}</div></div>
      <div><div style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Fecha</div><div class="mono">${r.fecha}</div></div>
      <div><div style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">F. Entrega</div><div class="mono">${r.fechaEnt||'—'}</div></div>
      <div><div style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Prioridad</div>${bge(r.prioridad)}</div>
      <div><div style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Estado</div>${bge(r.est)}</div>
    </div>
    <div style="font-size:.62rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">Ítems Solicitados</div>
    <div style="overflow-x:auto;margin-bottom:.9rem"><table style="width:100%;font-size:.76rem;border-collapse:collapse">
      <thead><tr><th style="background:var(--panel2);padding:.32rem .6rem;text-align:left;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase">#</th><th style="background:var(--panel2);padding:.32rem .6rem;text-align:left;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase">Código</th><th style="background:var(--panel2);padding:.32rem .6rem;text-align:center;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase">Img.</th><th style="background:var(--panel2);padding:.32rem .6rem;text-align:left;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase">Descripción</th><th style="background:var(--panel2);padding:.32rem .6rem;text-align:left;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase">Unid.</th><th style="background:var(--panel2);padding:.32rem .6rem;text-align:right;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase">Cant.</th><th style="background:var(--panel2);padding:.32rem .6rem;text-align:left;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase">Obs.</th><th style="background:var(--panel2);padding:.32rem .6rem;text-align:left;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;white-space:nowrap">T. Costo</th></tr></thead>
      <tbody>${r.items.map((it,i)=>{const _cat=DB.catalogoItems.find(c=>c.cod===it.cod);const _img=_cat?.img||'';const _imgCell=_img?`<img src="${_img}" style="width:36px;height:36px;object-fit:cover;border-radius:5px;border:1px solid var(--border)">`:`<div style="width:36px;height:36px;background:var(--panel2);border-radius:5px;border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:.5rem;color:var(--muted)">—</div>`;return`<tr><td style="padding:.3rem .6rem;color:var(--muted2)">${i+1}</td><td style="padding:.3rem .6rem" class="mono">${it.cod||'—'}</td><td style="padding:.3rem .6rem;text-align:center">${_imgCell}</td><td style="padding:.3rem .6rem"><strong>${it.desc}</strong></td><td style="padding:.3rem .6rem">${it.und}</td><td style="padding:.3rem .6rem;text-align:right" class="mono">${it.cant}</td><td style="padding:.3rem .6rem;color:var(--muted2)">${it.obs||'—'}</td><td style="padding:.3rem .6rem;font-size:.72rem;color:${it.tcosto?'var(--alm)':'var(--muted2)'}">${it.tcosto||'—'}</td></tr>`}).join('')}</tbody>
    </table></div>
    ${r.obs?`<div style="margin-bottom:.9rem"><div style="font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.25rem">Observaciones</div><div style="color:var(--muted2);font-size:.8rem">${r.obs}</div></div>`:''}
    <div style="font-size:.62rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">🔗 Comprobantes Vinculados</div>
    ${comps.length?`<div style="overflow-x:auto"><table style="width:100%;font-size:.76rem;border-collapse:collapse">
      <thead><tr><th style="background:var(--panel2);padding:.32rem .6rem;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;text-align:left">Tipo</th><th style="background:var(--panel2);padding:.32rem .6rem;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;text-align:left">N° Comp.</th><th style="background:var(--panel2);padding:.32rem .6rem;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;text-align:left">Proveedor</th><th style="background:var(--panel2);padding:.32rem .6rem;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;text-align:right">Total S/</th><th style="background:var(--panel2);padding:.32rem .6rem;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;text-align:left">Estado</th><th style="background:var(--panel2);padding:.32rem .6rem;font-size:.59rem;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;text-align:left">PDF</th></tr></thead>
      <tbody>${comps.map(c=>`<tr><td style="padding:.3rem .6rem">${bge(c.tipo)}</td><td style="padding:.3rem .6rem" class="mono">${c.num}</td><td style="padding:.3rem .6rem">${c.prov}</td><td style="padding:.3rem .6rem;text-align:right;color:#10b981;font-family:'Roboto Mono',monospace">${fmt(c.total)}</td><td style="padding:.3rem .6rem">${bge(c.est)}</td><td style="padding:.3rem .6rem">${(c.pdfUrl||c.pdfData)?`<a href="${c.pdfUrl||c.pdfData}" target="_blank" rel="noopener" style="color:var(--alm);text-decoration:none;font-size:.72rem">📄 ${c.pdfName||'Ver PDF'}</a>`:'<span style="color:var(--muted);font-size:.72rem">—</span>'}</td></tr>`).join('')}</tbody>
    </table></div>`:
    `<div style="color:var(--muted2);font-size:.8rem;padding:.5rem 0">Sin comprobantes vinculados aún.</div>`}`;
  openM('mReqVer');
  const btnEdit=document.getElementById('btnReqEdit');
  if(btnEdit){
    const bloqueado=r.est==='Atendido'||r.est==='Anulado';
    btnEdit.style.opacity=bloqueado?'0.45':'1';
    btnEdit.style.cursor=bloqueado?'not-allowed':'pointer';
  }
}
function verTrazReq(reqId){
  const r=DB.requerimientos.find(x=>x.id===reqId);if(!r)return;
  const comps=DB.facturasPago.filter(f=>f.reqId===reqId);
  const card=document.getElementById('cardTraz');
  const body=document.getElementById('bodyTraz');
  body.innerHTML=`
    <div style="margin-bottom:.7rem">
      <span style="font-size:.8rem;color:var(--muted2)">Requerimiento:</span>
      <strong style="margin-left:.4rem;color:var(--alm)">${r.num}</strong>
      <span style="margin-left:.6rem;font-size:.8rem">${r.solicitante} · ${r.area}</span>
      <span style="margin-left:.5rem">${bge(r.est)}</span>
    </div>
    <div style="font-size:.62rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">Comprobantes Vinculados</div>
    <div style="overflow-x:auto"><table style="width:100%;font-size:.77rem;border-collapse:collapse">
      <thead><tr><th style="background:var(--panel2);padding:.35rem .65rem;text-align:left;font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Tipo</th><th style="background:var(--panel2);padding:.35rem .65rem;text-align:left;font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">N° Comprobante</th><th style="background:var(--panel2);padding:.35rem .65rem;text-align:left;font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Proveedor</th><th style="background:var(--panel2);padding:.35rem .65rem;text-align:right;font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Total S/</th><th style="background:var(--panel2);padding:.35rem .65rem;text-align:left;font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">Estado</th><th style="background:var(--panel2);padding:.35rem .65rem;text-align:left;font-size:.6rem;color:var(--muted2);text-transform:uppercase;letter-spacing:.1em">PDF</th></tr></thead>
      <tbody>${comps.map(c=>`<tr><td style="padding:.35rem .65rem">${bge(c.tipo)}</td><td style="padding:.35rem .65rem" class="mono">${c.num}</td><td style="padding:.35rem .65rem">${c.prov}</td><td style="padding:.35rem .65rem;text-align:right;color:#10b981;font-family:'Roboto Mono',monospace">${fmt(c.total)}</td><td style="padding:.35rem .65rem">${bge(c.est)}</td><td style="padding:.35rem .65rem">${(c.pdfUrl||c.pdfData)?`<a href="${c.pdfUrl||c.pdfData}" target="_blank" rel="noopener" style="color:var(--alm);text-decoration:none;font-size:.72rem">📄 ${c.pdfName||'Ver PDF'}</a>`:'<span style="color:var(--muted);font-size:.72rem">—</span>'}</td></tr>`).join('')}</tbody>
    </table></div>`;
  card.style.display='block';
  card.scrollIntoView({behavior:'smooth',block:'start'});
}

// ══ FACTURAS / BOLETAS DE PAGO ══
function rFPago(){
  // Poblar filtro de proyecto preservando selección
  const pfEl=document.getElementById('fpProyFilterMain');
  const prevProy=pfEl?pfEl.value:'';
  if(pfEl){
    pfEl.innerHTML='<option value="">— Todos —</option>'
      +DB.proyectos.filter(p=>p.estado!=='Anulado')
        .sort((a,b)=>a.codigo.localeCompare(b.codigo))
        .map(p=>`<option value="${p.nombre}">${p.codigo} – ${p.nombre}</option>`).join('');
    pfEl.value=prevProy;
  }
  const filtProy=pfEl?pfEl.value:'';

  // Filtrar facturas según proyecto seleccionado
  let lista=DB.facturasPago;
  if(filtProy){
    lista=lista.filter(f=>{
      if(!f.reqId) return false;
      const req=DB.requerimientos.find(r=>r.id===f.reqId);
      return req&&(req.proyecto||'')===filtProy;
    });
  }

  // KPIs DEL SUBCONJUNTO FILTRADO
  const tot=lista.reduce((a,c)=>a+c.total,0);
  const pag=lista.filter(f=>f.est==='Pagado').length;
  document.getElementById('fpagoKpis').innerHTML=[
    {l:'Total Registrado',v:fmt(tot),c:'#10b981'},
    {l:'Comprobantes',v:lista.length,c:'#f97316'},
    {l:'Pagados',v:pag,c:'#3b82f6'},
    {l:'Pendientes',v:lista.filter(f=>f.est==='Recibido'||f.est==='Verificado').length,c:'#ef4444'}
  ].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val" style="font-size:${k.v.toString().length>8?'1.2rem':'1.85rem'}">${k.v}</div></div>`).join('');
  document.getElementById('tbFPago').innerHTML=lista.map(f=>{
    const req=DB.requerimientos.find(r=>r.id===f.reqId);
    const reqBadge=req?`<span class="badge b-orange" style="cursor:pointer" onclick="verTrazReq(${req.id})">${req.num}</span>`:`<span style="color:var(--muted);font-size:.72rem">—</span>`;
    const _pdfHref=f.pdfUrl||f.pdfData||'';
    const pdfLink=_pdfHref?`<a href="${_pdfHref}" target="_blank" rel="noopener" style="color:var(--alm);text-decoration:none;font-size:.76rem;display:flex;align-items:center;gap:.2rem">📄 Ver PDF</a>`:`<span style="color:var(--muted);font-size:.72rem">—</span>`;
    return`<tr>
      <td class="mono" style="font-weight:600">${f.num}</td>
      <td>${bge(f.tipo)}</td>
      <td class="mono">${f.fecha}</td>
      <td>${f.prov}</td>
      <td>${reqBadge}</td>
      <td style="font-size:.75rem;color:var(--alm);font-weight:600;font-family:'Roboto Mono',monospace">${f.moneda||'Soles (S/)'}</td>
      <td class="tr mono" style="color:#10b981">${fmt(f.total)}</td>
      <td>${bge(f.est)}</td>
      <td style="font-size:.73rem;color:var(--alm)">${f.tipoCobro||'<span style="color:var(--muted)">—</span>'}</td>
      <td style="font-size:.73rem;color:var(--muted2)">${f.edp||'<span style="color:var(--muted)">—</span>'}</td>
      <td>${pdfLink}</td>
      <td style="display:flex;gap:.3rem">
        <button class="btn btn-out btn-sm" title="Editar" onclick="editFPago(${f.id})" style="color:#f59e0b;border-color:#f59e0b40">✏️</button>
        ${f.est!=='Pagado'?`<button class="btn btn-del btn-sm" onclick="del('facturasPago',${f.id})">🗑</button>`:''}
      </td></tr>`;
  }).join('');
}
const todayDMY=()=>{const d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();};
const toDMY=iso=>{if(!iso||!iso.includes('-'))return iso||'';const[y,m,d]=iso.split('-');return`${d}/${m}/${y}`;};
const toISO=dmy=>{if(!dmy||!dmy.includes('/'))return dmy||'';const[d,m,y]=dmy.split('/');return`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;};
function actualizarLabelMoneda(val,custom){
  const sym=val==='Soles (S/)'?'S/':val==='Dólares (USD)'?'USD':val==='Euros (€)'?'€':(custom||'').trim();
  const lm=document.getElementById('fpMontoLbl');if(lm)lm.textContent='Monto'+(sym?' '+sym:'')+ ' (sin IGV)';
  const li=document.getElementById('fpIgvLbl');if(li)li.textContent='IGV'+(sym?' '+sym:'')+ ' (18%)';
  const lt=document.getElementById('fpTotalLbl');if(lt)lt.textContent='Total'+(sym?' '+sym:'');
}
function _initFpProyFilter(selProy){
  const el=document.getElementById('fpProyFilter');if(!el)return;
  el.innerHTML='<option value="">— Todos los proyectos —</option>'
    +DB.proyectos.filter(p=>p.estado!=='Anulado').map(p=>`<option value="${p.nombre}">${p.codigo} – ${p.nombre}</option>`).join('');
  el.value=selProy||'';
}
function filtrarFpReq(proyNombre){
  const sel=document.getElementById('fpReq');if(!sel)return;
  let reqs=DB.requerimientos;
  if(proyNombre)reqs=reqs.filter(r=>(r.proyecto||'')===proyNombre);
  sel.innerHTML='<option value="">— Sin Requerimiento —</option>'
    +reqs.map(r=>`<option value="${r.id}">[${r.est}] ${r.num} – ${r.solicitante}</option>`).join('');
}
function refreshFPagoProvDatalist(){
  const dl=document.getElementById('fpProvDatalist');if(!dl)return;
  const provs=[...new Set(DB.facturasPago.map(r=>r.prov).filter(v=>v&&v.trim()))].sort();
  dl.innerHTML=provs.map(p=>`<option value="${p}">`).join('');
}
function _fpProvAutoFill(){
  const val=(document.getElementById('fpProv').value||'').trim();
  if(!val)return;
  const match=DB.facturasPago.find(r=>(r.prov||'').trim()===val&&r.ruc);
  const el=document.getElementById('fpRuc');
  if(el){el.value=match?match.ruc:'';}
}
function newFPago(){
  _fpEditId=null;
  refreshSelects();
  refreshFPagoProvDatalist();
  _initFpProyFilter('');filtrarFpReq('');
  ['fpNum','fpProv','fpRuc','fpObs','fpEdp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fpTipoCobro').value='';
  ['fpMonto','fpIgv','fpTotal'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fpTipo').value='Factura';
  document.getElementById('fpFecha').value=todayDMY();
  document.getElementById('fpEst').value='Recibido';
  document.getElementById('fpMoneda').value='Soles (S/)';
  document.getElementById('fpMonedaOtro').value='';
  document.getElementById('fpMonedaOtroDiv').style.display='none';
  actualizarLabelMoneda('Soles (S/)','');
  document.getElementById('fpPdf').value='';
  document.getElementById('fpPdfPreview').textContent='';
  document.querySelector('#mFPago .mttl').textContent='🧾 Cargar Comprobante de Pago';
  openM('mFPago');
}
let _fpEditId=null;
function editFPago(id){
  const f=DB.facturasPago.find(x=>x.id===id);if(!f)return;
  _fpEditId=id;
  refreshSelects();
  const _fpProy=(()=>{if(!f.reqId)return'';const rq=DB.requerimientos.find(r=>r.id==f.reqId);return rq?rq.proyecto||'':''})();
  _initFpProyFilter(_fpProy);
  // Cargar TODOS los requerimientos sin filtrar para garantizar que el req guardado esté disponible
  filtrarFpReq('');
  document.getElementById('fpTipo').value=f.tipo;
  document.getElementById('fpNum').value=f.num;
  document.getElementById('fpFecha').value=toDMY(f.fecha);
  document.getElementById('fpProv').value=f.prov;
  document.getElementById('fpRuc').value=f.ruc||'';
  document.getElementById('fpMonto').value=f.monto;
  document.getElementById('fpIgv').value=f.igv;
  document.getElementById('fpTotal').value=f.total;
  document.getElementById('fpEst').value=f.est;
  const _stdMonedas=['Soles (S/)','Dólares (USD)','Euros (€)'];
  const _mon=f.moneda||'Soles (S/)';
  const _monEsStd=_stdMonedas.includes(_mon);
  document.getElementById('fpMoneda').value=_monEsStd?_mon:'Otro';
  document.getElementById('fpMonedaOtro').value=_monEsStd?'':_mon;
  document.getElementById('fpMonedaOtroDiv').style.display=_monEsStd?'none':'flex';
  actualizarLabelMoneda(_monEsStd?_mon:'Otro',_monEsStd?'':_mon);
  document.getElementById('fpObs').value=f.obs||'';
  document.getElementById('fpTipoCobro').value=f.tipoCobro||'';
  document.getElementById('fpEdp').value=f.edp||'';
  const _ppEl=document.getElementById('fpPdfPreview');
  if(f.pdfUrl){_ppEl.innerHTML=`📎 <a href="${f.pdfUrl}" target="_blank" rel="noopener" style="color:var(--alm)">${f.pdfName||'Ver archivo'}</a> <span style="color:var(--muted2)">(existente — selecciona nuevo para reemplazar)</span>`;}
  else if(f.pdfName){_ppEl.textContent='📎 '+f.pdfName+' (existente)';}
  else{_ppEl.textContent='';}
  const fpReqEl=document.getElementById('fpReq');
  if(fpReqEl&&f.reqId)fpReqEl.value=f.reqId;
  const ttl=document.querySelector('#mFPago .mttl');
  if(ttl)ttl.textContent='✏️ Editar Comprobante: '+f.num;
  openM('mFPago');
}

function _fpStoragePath(url){
  if(!url)return null;
  const marker='/object/public/Facturas_RQ_pdf/';
  const i=url.indexOf(marker);
  return i!==-1?decodeURIComponent(url.slice(i+marker.length)):null;
}
async function gFPago(){
  const num=document.getElementById('fpNum').value.trim();
  if(!num){toast('Ingrese número de comprobante',true);return;}
  const file=document.getElementById('fpPdf').files[0];
  let pdfUrl='',pdfName='';
  if(file){
    // Si es edición y ya existía un PDF, borrar el archivo anterior del bucket
    if(_fpEditId!==null){
      const _prev=DB.facturasPago.find(x=>x.id===_fpEditId);
      const _oldPath=_fpStoragePath(_prev&&_prev.pdfUrl);
      if(_oldPath)await supa.storage.from('Facturas_RQ_pdf').remove([_oldPath]);
    }
    toast('Subiendo archivo PDF...');
    const ext=(file.name.split('.').pop()||'pdf').toLowerCase();
    const path=num.replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+Date.now()+'.'+ext;
    const {error:upErr}=await supa.storage.from('Facturas_RQ_pdf').upload(path,file,{upsert:true});
    if(upErr){toast('Error al subir PDF: '+upErr.message,true);return;}
    const {data:urlData}=supa.storage.from('Facturas_RQ_pdf').getPublicUrl(path);
    pdfUrl=urlData.publicUrl;
    pdfName=file.name;
  }
  const reqIdRaw=document.getElementById('fpReq').value;
  const _mSel=document.getElementById('fpMoneda').value;
  const _moneda=_mSel==='Otro'?document.getElementById('fpMonedaOtro').value.trim()||'Otro':_mSel;
  const fields={
    tipo:document.getElementById('fpTipo').value,
    num,fecha:toISO(document.getElementById('fpFecha').value)||today(),
    prov:document.getElementById('fpProv').value,
    ruc:document.getElementById('fpRuc').value,
    monto:+document.getElementById('fpMonto').value||0,
    igv:+document.getElementById('fpIgv').value||0,
    total:+document.getElementById('fpTotal').value||0,
    moneda:_moneda,
    reqId:reqIdRaw?+reqIdRaw:null,
    est:document.getElementById('fpEst').value,
    tipoCobro:document.getElementById('fpTipoCobro').value||null,
    edp:document.getElementById('fpEdp').value.trim()||null,
    obs:document.getElementById('fpObs').value,
  };
  if(_fpEditId!==null){
    const idx=DB.facturasPago.findIndex(x=>x.id===_fpEditId);
    if(idx>-1){
      const prev=DB.facturasPago[idx];
      DB.facturasPago[idx]={...prev,...fields,
        pdfName:pdfName||(prev.pdfName||''),
        pdfUrl:pdfUrl||(prev.pdfUrl||'')
      };
      syncSheet('saveFacturaPago',DB.facturasPago[idx]);
    }
    _fpEditId=null;
    const ttl=document.querySelector('#mFPago .mttl');
    if(ttl)ttl.textContent='🧾 Cargar Comprobante de Pago';
    closeM('mFPago');rFPago();rReq();toast('Comprobante actualizado: '+num);
  }else{
    const newFpId=nid('fpago');
    DB.facturasPago.push({id:newFpId,...fields,pdfName,pdfUrl});
    if(reqIdRaw){
      const req=DB.requerimientos.find(r=>r.id===+reqIdRaw);
      if(req&&req.est==='Pendiente')req.est='Atendido';
    }
    syncSheet('saveFacturaPago',DB.facturasPago[DB.facturasPago.length-1]);
    closeM('mFPago');rFPago();rReq();toast('Comprobante registrado: '+num);
  }
}

