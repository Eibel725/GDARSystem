// ══ TAREAJE ══
const _TARE_T={
  TD:{l:'Trabajo Día',     bg:'#10b981',tx:'#fff'},
  TN:{l:'Trabajo Noche',   bg:'#1e3a8a',tx:'#fff'},
  DL:{l:'Día Libre',       bg:'#6b7280',tx:'#fff'},
  P: {l:'Permiso',         bg:'#f59e0b',tx:'#000'},
  F: {l:'Falta',           bg:'#ef4444',tx:'#fff'},
  DM:{l:'Descanso Médico', bg:'#8b5cf6',tx:'#fff'},
  LP:{l:'Lic. Paternidad', bg:'#3b82f6',tx:'#fff'},
  LM:{l:'Lic. Maternidad', bg:'#ec4899',tx:'#fff'},
  LF:{l:'Lic. Fallecim.',  bg:'#374151',tx:'#fff'},
  V: {l:'Vacaciones',      bg:'#0ea5e9',tx:'#fff'},
  DLT:{l:'DL Trabajado',   bg:'#84cc16',tx:'#000'},
  A5:{l:'Anexo 5',         bg:'#f97316',tx:'#fff'},
  R: {l:'Retirado',        bg:'#7f1d1d',tx:'#fff'}
};
let _tarPickerCb=null;
function rTareaje(){
  const pad=n=>String(n).padStart(2,'0');
  const mv=document.getElementById('tareMes')?.value||new Date().toISOString().slice(0,7);
  const [y,m]=mv.split('-').map(Number);
  const days=new Date(y,m,0).getDate();
  const monthStr=`${y}-${pad(m)}`;
  const DN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const proyEl=document.getElementById('tareProy');
  if(proyEl){const cur=proyEl.value;proyEl.innerHTML='<option value="">— Todos los proyectos —</option>'+(DB.proyectos||[]).map(p=>`<option value="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');if(cur)proyEl.value=cur;}
  const proyFiltro=proyEl?proyEl.value:'';
  const persF=proyFiltro?DB.personal.filter(p=>p.proy===proyFiltro):DB.personal;
  const monthRecs=DB.tareaje.filter(r=>r.fecha&&r.fecha.startsWith(monthStr));
  document.getElementById('tareKpis').innerHTML=[
    {l:'Trabajadores',v:persF.length,c:'var(--mec)',ic:'👷',sub:'en grilla'},
    {l:'Trabajo Día',v:monthRecs.filter(r=>r.tipo==='TD').length,c:'#10b981',ic:'☀️',sub:'jornadas TD'},
    {l:'Trabajo Noche',v:monthRecs.filter(r=>r.tipo==='TN').length,c:'#3b82f6',ic:'🌙',sub:'jornadas TN'},
    {l:'Faltas',v:monthRecs.filter(r=>r.tipo==='F').length,c:'#ef4444',ic:'❌',sub:'del mes'}
  ].map(k=>`<div style="background:var(--panel);border:1px solid var(--border);border-top:3px solid ${k.c};border-radius:10px;padding:.85rem 1.1rem;flex:1;min-width:150px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem"><span style="font-size:.67rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted2);font-weight:600">${k.l}</span><span style="font-size:1.3rem;line-height:1;opacity:.75">${k.ic}</span></div><div style="font-size:2.4rem;font-weight:800;color:${k.c};line-height:1;margin-bottom:.25rem">${k.v}</div><div style="font-size:.68rem;color:var(--muted2)">${k.sub}</div></div>`).join('');
  document.getElementById('tareLeyenda').innerHTML=Object.entries(_TARE_T).map(([k,v])=>`<span style="background:${v.bg};color:${v.tx};font-size:.6rem;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap">${k} – ${v.l}</span>`).join('');
  const mesNombre=new Date(y,m-1,1).toLocaleString('es-PE',{month:'long'}).toUpperCase();
  const dayHdrs=Array.from({length:days},(_,i)=>{
    const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
    const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
    return`<th style="text-align:center;min-width:30px;width:30px;padding:2px 1px;font-size:.6rem;${isSun?'color:#f59e0b;background:rgba(245,158,11,.12)':''}">${d}<div style="font-size:.5rem;opacity:.7">${DN[dow]}</div></th>`;
  }).join('');
  const rows=persF.map((p,idx)=>{
    const cells=Array.from({length:days},(_,i)=>{
      const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
      const rec=DB.tareaje.find(r=>r.personalId===p.id&&r.fecha===fecha);
      const tipo=rec?rec.tipo:'';
      const t=tipo?_TARE_T[tipo]:null;
      const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
      return`<td id="tar-${p.id}-${fecha}" onclick="openTarePicker(${p.id},'${fecha}',this)" style="text-align:center;cursor:pointer;height:26px;padding:0;border:1px solid var(--border);${t?`background:${t.bg};color:${t.tx};`:''}${isSun&&!tipo?'background:rgba(245,158,11,.06);':''}font-size:.6rem;font-weight:700" title="${t?t.l:fecha}">${tipo}</td>`;
    }).join('');
    const totD=DB.tareaje.filter(r=>r.personalId===p.id&&r.fecha.startsWith(monthStr)&&r.tipo==='TD').length;
    const totN=DB.tareaje.filter(r=>r.personalId===p.id&&r.fecha.startsWith(monthStr)&&r.tipo==='TN').length;
    const totDL=DB.tareaje.filter(r=>r.personalId===p.id&&r.fecha.startsWith(monthStr)&&r.tipo==='DL').length;
    return`<tr style="border-bottom:1px solid var(--border)">
      <td style="text-align:center;font-size:.7rem;color:var(--muted2);padding:3px 5px;white-space:nowrap">${idx+1}</td>
      <td style="padding:3px 8px;white-space:nowrap;font-size:.78rem;min-width:180px"><strong>${p.ape}, ${p.nom}</strong></td>
      <td style="padding:3px 5px;white-space:nowrap;font-size:.7rem;color:var(--muted2);min-width:100px">${p.cargo||'—'}</td>
      ${cells}
      <td style="text-align:center;font-size:.68rem;padding:3px 4px;white-space:nowrap;background:rgba(4,78,100,.08);line-height:1.5"><span style="color:#10b981;font-weight:700">${totD}</span><span style="color:var(--muted2);font-size:.6rem">TD</span> <span style="color:#3b82f6;font-weight:700">${totN}</span><span style="color:var(--muted2);font-size:.6rem">TN</span><br><span style="color:#6b7280;font-weight:700">${totDL}</span><span style="color:var(--muted2);font-size:.6rem">DL</span></td>
    </tr>`;
  }).join('');
  document.getElementById('tbTareaje').innerHTML=`
    <thead>
      <tr style="background:var(--panel2)">
        <th style="padding:5px 6px;font-size:.68rem;white-space:nowrap;min-width:30px">N°</th>
        <th style="padding:5px 8px;font-size:.68rem;white-space:nowrap;min-width:180px">Trabajador</th>
        <th style="padding:5px 6px;font-size:.68rem;white-space:nowrap;min-width:100px">Cargo</th>
        <th colspan="${days}" style="text-align:center;padding:5px;font-size:.72rem;background:rgba(4,78,100,.2);color:var(--mec);font-weight:700;letter-spacing:.05em">${mesNombre} ${y}</th>
        <th style="padding:5px 4px;font-size:.62rem;text-align:center;white-space:nowrap;min-width:55px;background:rgba(4,78,100,.12);line-height:1.4"><span style="color:#10b981">TD</span>/<span style="color:#3b82f6">TN</span><br><span style="color:#6b7280">DL</span></th>
      </tr>
      <tr style="background:var(--panel2)"><th></th><th></th><th></th>${dayHdrs}<th></th></tr>
    </thead>
    <tbody>${rows}</tbody>`;
}
function openTarePicker(personalId,fecha,cellEl){
  if(_tarPickerCb)document.removeEventListener('click',_tarPickerCb);
  const picker=document.getElementById('tarePicker');
  const rect=cellEl.getBoundingClientRect();
  const rec=DB.tareaje.find(r=>r.personalId===personalId&&r.fecha===fecha);
  const curTipo=rec?rec.tipo:'';
  let html=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;min-width:230px">`;
  Object.entries(_TARE_T).forEach(([k,v])=>{
    html+=`<button onclick="setTareaje(${personalId},'${fecha}','${k}')" style="background:${v.bg};color:${v.tx};border:2px solid ${k===curTipo?'#fff':'transparent'};border-radius:5px;padding:4px 2px;font-size:.65rem;font-weight:700;cursor:pointer" title="${v.l}">${k}</button>`;
  });
  html+=`<button onclick="setTareaje(${personalId},'${fecha}','')" style="background:#374151;color:#9ca3af;border:1px solid #6b7280;border-radius:5px;padding:4px 2px;font-size:.65rem;font-weight:700;cursor:pointer">✕ Borrar</button>`;
  html+=`</div><div style="font-size:.6rem;color:var(--muted2);margin-top:4px;text-align:center">${fecha}</div>`;
  const left=Math.min(rect.left,window.innerWidth-250);
  picker.style.cssText=`display:block;position:fixed;left:${Math.max(4,left)}px;top:${rect.bottom+4}px;z-index:9999;background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:.5rem;box-shadow:0 8px 24px rgba(0,0,0,.6)`;
  picker.innerHTML=html;
  _tarPickerCb=function(e){if(!picker.contains(e.target))closeTarePicker();};
  setTimeout(()=>document.addEventListener('click',_tarPickerCb),10);
}
function closeTarePicker(){
  if(_tarPickerCb){document.removeEventListener('click',_tarPickerCb);_tarPickerCb=null;}
  const p=document.getElementById('tarePicker');if(p)p.style.display='none';
}
function setTareaje(personalId,fecha,tipo){
  closeTarePicker();
  const existing=DB.tareaje.find(r=>r.personalId===personalId&&r.fecha===fecha);
  if(existing){
    if(!tipo){DB.tareaje=DB.tareaje.filter(r=>r.id!==existing.id);supaDelete('tareaje',existing.id);}
    else{existing.tipo=tipo;syncSheet('saveTareaje',existing);}
  }else{
    if(!tipo)return;
    const rec={id:nid('tar'),personalId,fecha,tipo};
    DB.tareaje.push(rec);syncSheet('saveTareaje',rec);
  }
  const cell=document.getElementById(`tar-${personalId}-${fecha}`);
  if(cell){
    const t=tipo?_TARE_T[tipo]:null;
    const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
    cell.textContent=tipo;
    cell.style.background=t?t.bg:(isSun?'rgba(245,158,11,.06)':'');
    cell.style.color=t?t.tx:'';cell.title=t?t.l:fecha;
    const mv=document.getElementById('tareMes')?.value||new Date().toISOString().slice(0,7);
    const ms=mv;
    const totD=DB.tareaje.filter(r=>r.personalId===personalId&&r.fecha.startsWith(ms)&&r.tipo==='TD').length;
    const totN=DB.tareaje.filter(r=>r.personalId===personalId&&r.fecha.startsWith(ms)&&r.tipo==='TN').length;
    const totDL=DB.tareaje.filter(r=>r.personalId===personalId&&r.fecha.startsWith(ms)&&r.tipo==='DL').length;
    const row=cell.closest('tr');
    if(row){const last=row.querySelector('td:last-child');if(last)last.innerHTML=`<span style="color:#10b981;font-weight:700">${totD}</span><span style="color:var(--muted2);font-size:.6rem">TD</span> <span style="color:#3b82f6;font-weight:700">${totN}</span><span style="color:var(--muted2);font-size:.6rem">TN</span><br><span style="color:#6b7280;font-weight:700">${totDL}</span><span style="color:var(--muted2);font-size:.6rem">DL</span>`;}
  }
}
function printTareaje(){
  const pad=n=>String(n).padStart(2,'0');
  const mv=document.getElementById('tareMes')?.value||new Date().toISOString().slice(0,7);
  const [y,m]=mv.split('-').map(Number);
  const days=new Date(y,m,0).getDate();
  const monthStr=`${y}-${pad(m)}`;
  const DN=['D','L','M','X','J','V','S'];
  const mesNombre=new Date(y,m-1,1).toLocaleString('es-PE',{month:'long'}).toUpperCase();
  const _logoUrl=window.location.href.replace(/[^\/\\]+$/,'')+'09.-ERP/Imagenes/ECOSERMO-LOGO.png';
  const proyEl=document.getElementById('tareProy');
  const proyFiltro=proyEl?proyEl.value:'';
  const proyNombre=proyFiltro?(DB.proyectos.find(p=>p.codigo===proyFiltro)?.nombre||proyFiltro):'— Todos —';
  const elab=document.getElementById('tareElab')?.value||'';
  const persF=proyFiltro?DB.personal.filter(p=>p.proy===proyFiltro):DB.personal;
  const dayHdrs=Array.from({length:days},(_,i)=>{
    const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
    const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
    return`<th style="text-align:center;width:18px;min-width:18px;padding:1px 0;font-size:6.5px;${isSun?'background:#fef3c7;color:#92400e':'background:#1e3a5f;color:#fff'}">${d}<br><span style="font-size:5.5px">${DN[dow]}</span></th>`;
  }).join('');
  const rows=persF.map((p,idx)=>{
    const cells=Array.from({length:days},(_,i)=>{
      const d=i+1,fecha=`${y}-${pad(m)}-${pad(d)}`;
      const rec=DB.tareaje.find(r=>r.personalId===p.id&&r.fecha===fecha);
      const tipo=rec?rec.tipo:'';
      const t=tipo?_TARE_T[tipo]:null;
      const dow=new Date(fecha+'T12:00:00').getDay(),isSun=dow===0;
      return`<td style="text-align:center;padding:0;border:1px solid #e2e8f0;height:18px;${t?`background:${t.bg};color:${t.tx};font-weight:700;font-size:6px`:''}${isSun&&!tipo?'background:#fffbeb;':''}">${tipo}</td>`;
    }).join('');
    const totD=DB.tareaje.filter(r=>r.personalId===p.id&&r.fecha.startsWith(monthStr)&&r.tipo==='TD').length;
    const totN=DB.tareaje.filter(r=>r.personalId===p.id&&r.fecha.startsWith(monthStr)&&r.tipo==='TN').length;
    const totDL=DB.tareaje.filter(r=>r.personalId===p.id&&r.fecha.startsWith(monthStr)&&r.tipo==='DL').length;
    return`<tr><td style="text-align:center;font-size:7px;padding:1px 2px;border:1px solid #e2e8f0">${idx+1}</td><td style="font-size:7.5px;font-weight:700;padding:1px 4px;border:1px solid #e2e8f0;white-space:nowrap">${p.ape}, ${p.nom}</td><td style="font-size:6.5px;padding:1px 3px;border:1px solid #e2e8f0;white-space:nowrap;color:#64748b">${p.cargo||'—'}</td>${cells}<td style="text-align:center;font-size:7px;padding:1px 3px;border:1px solid #e2e8f0;background:#e0f2fe;line-height:1.6"><span style="color:#059669;font-weight:700">${totD}</span>TD <span style="color:#1e40af;font-weight:700">${totN}</span>TN<br><span style="color:#6b7280;font-weight:700">${totDL}</span>DL</td></tr>`;
  }).join('');
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tareaje ${mesNombre} ${y}</title>
<style>@page{size:A4 landscape;margin:.7cm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:9px;color:#111;margin:0}
.hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1e3a5f;padding-bottom:5px;margin-bottom:6px}
.hdr img{height:44px;object-fit:contain}
.info-row{display:grid;grid-template-columns:100px 1fr 100px 1fr 70px 100px;gap:0;border:1px solid #1e3a5f;border-radius:4px;margin-bottom:6px;overflow:hidden;font-size:7.5px}
.il{background:#1e3a5f;color:#fff;padding:3px 5px;font-weight:700;text-align:center}
.iv{padding:3px 5px;border-right:1px solid #e2e8f0}
table{width:100%;border-collapse:collapse}th{padding:2px 1px;font-size:7px}
td{border:1px solid #e2e8f0;vertical-align:middle}tr:nth-child(even) td{background:#f8fafc}
.ley{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px}
.lt{font-size:6px;font-weight:700;padding:2px 4px;border-radius:3px;color:#fff}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
<div class="hdr"><img src="${_logoUrl}" alt="Ecosermo"><div style="text-align:center"><div style="font-size:13px;font-weight:900;color:#1e3a5f">TAREAJE DE PERSONAL</div><div style="font-size:9px;color:#64748b">Control de Asistencia Mensual</div></div><div style="text-align:right;font-size:7.5px;color:#64748b"><div style="font-weight:700;color:#1e3a5f;font-size:10px">${mesNombre} ${y}</div><div>Generado: ${new Date().toLocaleString('es-PE')}</div></div></div>
<div class="info-row"><div class="il">Proyecto</div><div class="iv">${proyNombre}</div><div class="il">Elaborado por</div><div class="iv">${elab}</div><div class="il">Fecha</div><div class="iv" style="background:#fef08a;font-weight:700;color:#1e3a5f">${new Date().toLocaleDateString('es-PE')}</div></div>
<div class="ley">${Object.entries(_TARE_T).map(([k,v])=>`<span class="lt" style="background:${v.bg};color:${v.tx}">${k}=${v.l}</span>`).join('')}</div>
<table><thead><tr><th style="background:#1e3a5f;color:#fff;width:20px">N°</th><th style="background:#1e3a5f;color:#fff;text-align:left;min-width:130px">Trabajador</th><th style="background:#1e3a5f;color:#fff;text-align:left;min-width:80px">Cargo</th>${dayHdrs}<th style="background:#1e3a5f;color:#fff;width:30px">D/N</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
  const win=window.open('','_blank');if(!win){toast('Active ventanas emergentes',true);return;}
  win.document.write(html);win.document.close();win.focus();setTimeout(()=>win.print(),500);
}

