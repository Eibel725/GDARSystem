// ══ ENGRASE MENSUAL ══
function rEngrase(){
  const pad=n=>String(n).padStart(2,'0');
  const mv=document.getElementById('engraseMes')?.value||new Date().toISOString().slice(0,7);
  const [y,m]=mv.split('-').map(Number);
  const days=new Date(y,m,0).getDate();
  const monthStr=`${y}-${pad(m)}`;
  const DN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  // Poblar dropdown de proyectos
  const proyEl=document.getElementById('engraseProy');
  if(proyEl){
    const cur=proyEl.value;
    proyEl.innerHTML='<option value="">— Todos los proyectos —</option>'+
      (DB.proyectos||[]).map(p=>`<option value="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');
    if(cur)proyEl.value=cur;
  }
  const proyFiltro=proyEl?proyEl.value:'';
  const tipoEl=document.getElementById('engraseTipoFilt');
  if(tipoEl){const curTipo=tipoEl.value||'Línea Amarilla';const tipos=[...new Set((DB.equipos||[]).map(eq=>eq.tipo).filter(Boolean))].sort();tipoEl.innerHTML='<option value="">— Todos los tipos —</option>'+tipos.map(t=>`<option value="${t}">${t}</option>`).join('');tipoEl.value=curTipo;}
  const tipoFiltro=tipoEl?tipoEl.value:'Línea Amarilla';
  const equiposFilt=(proyFiltro?DB.equipos.filter(eq=>eq.proyecto===proyFiltro):DB.equipos).filter(eq=>!tipoFiltro||eq.tipo===tipoFiltro);
  const monthRecs=DB.engrase.filter(r=>r.fecha&&r.fecha.startsWith(monthStr));
  const uniqueEqs=[...new Set(monthRecs.map(r=>r.eqId))].length;
  document.getElementById('engraseKpis').innerHTML=[
    {l:'Total Engrase',v:monthRecs.length,c:'var(--mec)',ic:'🛢️',sub:'registros del mes'},
    {l:'Equipos Activos',v:uniqueEqs,c:'#10b981',ic:'🚜',sub:'con engrase este mes'},
    {l:'Promedio',v:uniqueEqs?(Math.round(monthRecs.length/uniqueEqs*10)/10):0,c:'#f59e0b',ic:'📊',sub:'engrase por equipo'},
  ].map(k=>`<div style="background:var(--panel);border:1px solid var(--border);border-top:3px solid ${k.c};border-radius:10px;padding:.85rem 1.1rem;flex:1;min-width:150px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem"><span style="font-size:.67rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted2);font-weight:600">${k.l}</span><span style="font-size:1.3rem;line-height:1;opacity:.75">${k.ic}</span></div><div style="font-size:2.4rem;font-weight:800;color:${k.c};line-height:1;margin-bottom:.25rem">${k.v}</div><div style="font-size:.68rem;color:var(--muted2)">${k.sub}</div></div>`).join('');
  const dayHdrs=Array.from({length:days},(_,i)=>{
    const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
    const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
    return`<th style="text-align:center;min-width:26px;width:26px;padding:2px 1px;font-size:.62rem;${isSun?'color:#f59e0b;background:rgba(245,158,11,.12)':''}">${d}<div style="font-size:.55rem;opacity:.7">${DN[dow]}</div></th>`;
  }).join('');
  const rows=equiposFilt.map((eq,idx)=>{
    const cells=Array.from({length:days},(_,i)=>{
      const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
      const erec=DB.engrase.find(r=>r.eqId===eq.id&&r.fecha===fecha);
      const estado=erec?(erec.tipo||'P'):'';
      const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
      const cbg=estado==='E'?'#10b981':estado==='P'?'#3b82f6':isSun?'rgba(245,158,11,.06)':'';
      const ccol=(estado==='E'||estado==='P')?'#fff':'';
      const cfn=estado==='E'?`showEngraseDetail(${eq.id},'${fecha}')`:`openEngrasePicker(${eq.id},'${fecha}',event)`;
      return`<td id="eng-${eq.id}-${fecha}" onclick="${cfn}" style="text-align:center;cursor:pointer;height:26px;padding:0;border:1px solid var(--border);background:${cbg};color:${ccol};" title="${fecha}">${estado?`<span style="font-size:.7rem;font-weight:700">${estado}</span>`:''}</td>`;
    }).join('');
    const pCnt=DB.engrase.filter(r=>r.eqId===eq.id&&r.fecha.startsWith(monthStr)&&(r.tipo||'P')==='P').length;
    const eCnt=DB.engrase.filter(r=>r.eqId===eq.id&&r.fecha.startsWith(monthStr)&&r.tipo==='E').length;
    return`<tr style="border-bottom:1px solid var(--border)">
      <td style="text-align:center;font-size:.7rem;color:var(--muted2);padding:3px 5px;white-space:nowrap">${idx+1}</td>
      <td style="padding:3px 5px;white-space:nowrap"><span class="badge b-purple" style="font-size:.58rem">${eq.tipo||'—'}</span></td>
      <td style="padding:3px 8px;white-space:nowrap;font-size:.78rem"><strong>${eq.nombre}</strong></td>
      <td class="mono" style="padding:3px 5px;font-size:.7rem;white-space:nowrap">${eq.placa||'—'}</td>
      ${cells}
      <td id="eng-tot-${eq.id}" style="text-align:center;font-size:.78rem;padding:3px 4px;white-space:nowrap;background:rgba(4,78,100,.08)">${(pCnt||eCnt)?`<span style="color:#3b82f6;font-weight:700">${pCnt}P</span> <span style="color:#10b981;font-weight:700">${eCnt}E</span>`:''}</td>
    </tr>`;
  }).join('');
  const mesNombre=new Date(y,m-1,1).toLocaleString('es-PE',{month:'long'}).toUpperCase();
  document.getElementById('tbEngrase').innerHTML=`
    <thead>
      <tr style="background:var(--panel2)">
        <th style="padding:5px 6px;font-size:.68rem;white-space:nowrap;min-width:30px">N°</th>
        <th style="padding:5px 6px;font-size:.68rem;white-space:nowrap;min-width:110px">Tipo</th>
        <th style="padding:5px 8px;font-size:.68rem;white-space:nowrap;min-width:180px">Descripción del Equipo</th>
        <th style="padding:5px 6px;font-size:.68rem;white-space:nowrap;min-width:65px">Placa</th>
        <th colspan="${days}" style="text-align:center;padding:5px;font-size:.72rem;background:rgba(4,78,100,.2);color:var(--mec);font-weight:700;letter-spacing:.05em">${mesNombre} ${y}</th>
        <th style="padding:5px 6px;font-size:.68rem;text-align:center;white-space:nowrap;min-width:45px;background:rgba(4,78,100,.12)">Total</th>
      </tr>
      <tr style="background:var(--panel2)">${'<th></th>'.repeat(4)}${dayHdrs}<th></th></tr>
    </thead>
    <tbody>${rows}</tbody>`;
}
let _engPickEqId=null,_engPickFecha=null;
function openEngrasePicker(eqId,fecha,evt){
  if(evt)evt.stopPropagation();
  _engPickEqId=eqId;_engPickFecha=fecha;
  const rec=DB.engrase.find(r=>r.eqId===eqId&&r.fecha===fecha);
  const estado=rec?(rec.tipo||'P'):'';
  const pk=document.getElementById('engrasePicker');if(!pk)return;
  let btns='';
  if(!estado){
    btns=`<button class="btn btn-sm" onclick="setEngraseP(${eqId},'${fecha}')" style="background:#3b82f6;color:#fff;border:none;width:100%;justify-content:center;padding:.35rem .6rem">📋 Programar (P)</button>`;
  }else if(estado==='P'){
    btns=`<button class="btn btn-sm" onclick="openEngraseEjecForm(${eqId},'${fecha}')" style="background:#10b981;color:#fff;border:none;width:100%;justify-content:center;padding:.35rem .6rem;margin-bottom:.25rem">✔ Ejecutado (E)</button><button class="btn btn-sm btn-del" onclick="delEngrase(${eqId},'${fecha}')" style="width:100%;justify-content:center;padding:.35rem .6rem">↩ Reprogramar / Borrar</button>`;
  }
  pk.innerHTML=btns;
  const cell=document.getElementById(`eng-${eqId}-${fecha}`);
  const r=cell?cell.getBoundingClientRect():{bottom:100,left:100};
  const left=Math.max(4,Math.min(r.left,window.innerWidth-200));
  pk.style.cssText=`display:flex;flex-direction:column;gap:.25rem;position:fixed;z-index:9999;background:var(--panel);border:1px solid var(--border);border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.28);padding:.5rem;min-width:190px;top:${r.bottom+4}px;left:${left}px`;
  setTimeout(()=>document.addEventListener('click',_closeEngrasePicker,{once:true}),20);
}
function _closeEngrasePicker(){
  const pk=document.getElementById('engrasePicker');if(pk)pk.style.display='none';
}
function setEngraseP(eqId,fecha){
  _closeEngrasePicker();
  if(DB.engrase.find(r=>r.eqId===eqId&&r.fecha===fecha))return;
  const rec={id:nid('eng'),eqId,fecha,tipo:'P'};
  DB.engrase.push(rec);syncSheet('saveEngrase',rec);
  _refreshEngraseCell(eqId,fecha);
  _updateEngraseTotals(fecha.slice(0,7));
}
function delEngrase(eqId,fecha){
  _closeEngrasePicker();
  const ex=DB.engrase.find(r=>r.eqId===eqId&&r.fecha===fecha);if(!ex)return;
  DB.engrase=DB.engrase.filter(r=>r.id!==ex.id);supaDelete('engrase',ex.id);
  _refreshEngraseCell(eqId,fecha);
  _updateEngraseTotals(fecha.slice(0,7));
}
function openEngraseEjecForm(eqId,fecha){
  _closeEngrasePicker();
  _engPickEqId=eqId;_engPickFecha=fecha;
  const personal=DB.personal||[];
  const opts='<option value="">— Seleccionar —</option>'+personal.map(p=>`<option value="${p.ape}, ${p.nom}">${p.ape}, ${p.nom}</option>`).join('');
  document.getElementById('ejecMec').innerHTML=opts;
  document.getElementById('ejecAyu').innerHTML=opts;
  document.getElementById('ejecCant').value='';
  document.getElementById('ejecHH').value='';
  document.getElementById('ejecObs').value='';
  document.getElementById('mEngraseEjec').style.display='flex';
}
function gEngraseEjec(){
  const eqId=_engPickEqId,fecha=_engPickFecha;
  const ex=DB.engrase.find(r=>r.eqId===eqId&&r.fecha===fecha);if(!ex)return;
  ex.tipo='E';
  ex.cantEngrase=+document.getElementById('ejecCant').value||0;
  ex.tiempoHH=+document.getElementById('ejecHH').value||0;
  ex.obs=document.getElementById('ejecObs').value.trim();
  ex.mecanico=document.getElementById('ejecMec').value;
  ex.ayudante=document.getElementById('ejecAyu').value;
  syncSheet('saveEngrase',ex);
  document.getElementById('mEngraseEjec').style.display='none';
  _refreshEngraseCell(eqId,fecha);
  _updateEngraseTotals(fecha.slice(0,7));
}
function showEngraseDetail(eqId,fecha){
  const rec=DB.engrase.find(r=>r.eqId===eqId&&r.fecha===fecha);if(!rec)return;
  toast(`Ejecutado • Engrase:${rec.cantEngrase||0} • HH:${rec.tiempoHH||0}${rec.obs?' • '+rec.obs:''}${rec.mecanico?' • Mec:'+rec.mecanico:''}`);
}
function _refreshEngraseCell(eqId,fecha){
  const rec=DB.engrase.find(r=>r.eqId===eqId&&r.fecha===fecha);
  const estado=rec?(rec.tipo||'P'):'';
  const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
  const cbg=estado==='E'?'#10b981':estado==='P'?'#3b82f6':isSun?'rgba(245,158,11,.06)':'';
  const ccol=(estado==='E'||estado==='P')?'#fff':'';
  const cell=document.getElementById(`eng-${eqId}-${fecha}`);if(!cell)return;
  cell.style.background=cbg;cell.style.color=ccol;
  cell.innerHTML=estado?`<span style="font-size:.7rem;font-weight:700">${estado}</span>`:'';
  cell.setAttribute('onclick',estado==='E'?`showEngraseDetail(${eqId},'${fecha}')`:`openEngrasePicker(${eqId},'${fecha}',event)`);
}
function _updateEngraseTotals(monthStr){
  const ms=(document.getElementById('engraseMes')?.value||monthStr).slice(0,7);
  (DB.equipos||[]).forEach(eq=>{
    const totCell=document.getElementById('eng-tot-'+eq.id);if(!totCell)return;
    const recs=DB.engrase.filter(r=>r.eqId===eq.id&&r.fecha.startsWith(ms));
    const pCnt=recs.filter(r=>(r.tipo||'P')==='P').length,eCnt=recs.filter(r=>r.tipo==='E').length;
    totCell.innerHTML=(pCnt||eCnt)?`<span style="color:#3b82f6;font-weight:700">${pCnt}P</span> <span style="color:#10b981;font-weight:700">${eCnt}E</span>`:'';
  });
  const monthRecs=DB.engrase.filter(r=>r.fecha&&r.fecha.startsWith(ms));
  const uniqueEqs=[...new Set(monthRecs.map(r=>r.eqId))].length;
  const kEl=document.getElementById('engraseKpis');
  if(kEl){const divs=kEl.querySelectorAll('div>div:nth-child(2)');if(divs[0])divs[0].textContent=monthRecs.length;if(divs[1])divs[1].textContent=uniqueEqs;if(divs[2])divs[2].textContent=uniqueEqs?(Math.round(monthRecs.length/uniqueEqs*10)/10):0;}
}
function printEngrase(){
  const pad=n=>String(n).padStart(2,'0');
  const mv=document.getElementById('engraseMes')?.value||new Date().toISOString().slice(0,7);
  const [y,m]=mv.split('-').map(Number);
  const days=new Date(y,m,0).getDate();
  const monthStr=`${y}-${pad(m)}`;
  const DN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const mesNombre=new Date(y,m-1,1).toLocaleString('es-PE',{month:'long'}).toUpperCase();
  const _logoUrl=window.location.href.replace(/[^\/\\]+$/,'')+'09.-ERP/Imagenes/ECOSERMO-LOGO.png';
  const dayHdrs=Array.from({length:days},(_,i)=>{
    const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
    const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
    return`<th style="text-align:center;width:22px;min-width:22px;padding:2px 0;font-size:7.5px;${isSun?'background:#fef3c7;color:#92400e':'background:#1e3a5f;color:#fff'}">${d}<br><span style="font-size:6.5px">${DN[dow]}</span></th>`;
  }).join('');
  const proyEl=document.getElementById('engraseProy');
  const proyFiltro=proyEl?proyEl.value:'';
  const proyNombre=proyFiltro||(proyEl&&proyEl.value===''?'':proyEl?.options[proyEl.selectedIndex]?.text||'');
  const elab=document.getElementById('engraseElab')?.value||'';
  const tipoElP=document.getElementById('engraseTipoFilt');
  const tipoFiltroP=tipoElP?tipoElP.value:'Línea Amarilla';
  const equiposFilt=(proyFiltro?DB.equipos.filter(eq=>eq.proyecto===proyFiltro):DB.equipos).filter(eq=>!tipoFiltroP||eq.tipo===tipoFiltroP);
  const rows=equiposFilt.map((eq,idx)=>{
    const cells=Array.from({length:days},(_,i)=>{
      const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
      const prec=DB.engrase.find(r=>r.eqId===eq.id&&r.fecha===fecha);
      const estado=prec?(prec.tipo||'P'):'';
      const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
      const pbg=estado==='E'?'#10b981':estado==='P'?'#3b82f6':isSun?'#fffbeb':'';
      return`<td style="text-align:center;padding:0;border:1px solid #e2e8f0;height:20px;background:${pbg};${estado?'color:#fff;font-weight:700;font-size:9px':''}">${estado}</td>`;
    }).join('');
    const pCntP=DB.engrase.filter(r=>r.eqId===eq.id&&r.fecha.startsWith(monthStr)&&(r.tipo||'P')==='P').length;
    const eCntP=DB.engrase.filter(r=>r.eqId===eq.id&&r.fecha.startsWith(monthStr)&&r.tipo==='E').length;
    return`<tr><td style="text-align:center;font-size:8px;padding:2px 3px;border:1px solid #e2e8f0">${idx+1}</td><td style="font-size:7.5px;padding:2px 3px;border:1px solid #e2e8f0;white-space:nowrap">${eq.tipo||'—'}</td><td style="font-size:8px;font-weight:700;padding:2px 5px;border:1px solid #e2e8f0;white-space:nowrap">${eq.nombre}</td><td style="font-size:7.5px;padding:2px 3px;border:1px solid #e2e8f0;font-family:monospace">${eq.placa||'—'}</td>${cells}<td style="text-align:center;font-size:8px;padding:2px 4px;border:1px solid #e2e8f0;background:#e0f2fe;white-space:nowrap">${(pCntP||eCntP)?`<span style="color:#3b82f6;font-weight:700">${pCntP}P</span> <span style="color:#10b981;font-weight:700">${eCntP}E</span>`:''}</td></tr>`;
  }).join('');
  const elaborador=elab;
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Engrase ${mesNombre} ${y}</title>
<style>@page{size:A4 landscape;margin:.8cm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:9px;color:#111;margin:0}
.hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1e3a5f;padding-bottom:6px;margin-bottom:8px}
.hdr img{height:50px;object-fit:contain}
.info-row{display:grid;grid-template-columns:120px 1fr 120px 1fr 80px 120px;gap:0;border:1px solid #1e3a5f;border-radius:4px;margin-bottom:8px;overflow:hidden;font-size:8px}
.info-lbl{background:#1e3a5f;color:#fff;padding:3px 6px;font-weight:700;text-align:center}
.info-val{padding:3px 6px;border-right:1px solid #e2e8f0}
table{width:100%;border-collapse:collapse}th{background:#1e3a5f;color:#fff;padding:3px 2px;font-size:8px}
td{border:1px solid #e2e8f0;vertical-align:middle}tr:nth-child(even) td{background:#f8fafc}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="hdr">
  <img src="${_logoUrl}" alt="Ecosermo">
  <div style="text-align:center;flex:1"><div style="font-size:13px;font-weight:700;color:#1e3a5f">PROGRAMACIÓN MENSUAL DE ENGRASE DE EQUIPOS</div><div style="font-size:9px;color:#64748b">ECOSERMO – Sistema de Control de Mantenimiento Mecánico – GDAR</div></div>
  <div style="text-align:right;font-size:8px;color:#64748b"><div style="font-weight:700;color:#1e3a5f;font-size:10px">${mesNombre} ${y}</div><div>Generado: ${new Date().toLocaleString('es-PE')}</div></div>
</div>
<div class="info-row">
  <div class="info-lbl">Proyecto:</div><div class="info-val">${proyNombre||'— Todos —'}</div>
  <div class="info-lbl">Elaborado por:</div><div class="info-val">${elaborador}</div>
  <div class="info-lbl">Fecha:</div><div class="info-val" style="background:#fef08a;font-weight:700;color:#1e3a5f">${new Date().toLocaleDateString('es-PE')}</div>
</div>
<table>
  <thead>
    <tr><th rowspan="2">N°</th><th rowspan="2" style="min-width:90px">Tipo / Área</th><th rowspan="2" style="min-width:150px">Descripción del Equipo</th><th rowspan="2" style="min-width:55px">Placa</th><th colspan="${days}" style="text-align:center;background:#044e64">${mesNombre} ${y}</th><th rowspan="2" style="background:#e0f2fe;color:#044e64;min-width:35px">Total</th></tr>
    <tr>${dayHdrs}</tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</body></html>`;
  const win=window.open('','_blank','width=1200,height=750');
  win.document.write(html);win.document.close();
  setTimeout(()=>win.print(),700);
}

