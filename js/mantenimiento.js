// ══ SUPERVISIÓN ══
function rSuper(){document.getElementById('tbSuper').innerHTML=DB.supervision.map(r=>`<tr><td class="mono">${r.fecha}</td><td>${r.sup}</td><td>${r.area}</td><td>${r.act}</td><td>${r.obs||'—'}</td><td>${bge(r.res)}</td><td><button class="btn btn-del btn-sm" onclick="del('supervision',${r.id})">🗑</button></td></tr>`).join('');}
function gSuper(){DB.supervision.push({id:nid('super'),fecha:document.getElementById('suF').value||today(),sup:document.getElementById('suS').value,area:document.getElementById('suA').value,act:document.getElementById('suAc').value,obs:document.getElementById('suO').value,res:document.getElementById('suR').value});syncSheet('saveSupervision',DB.supervision[DB.supervision.length-1]);closeM('mSuper');rSuper();toast('Supervisión registrada');}

// ══ SEGURIDAD ══
function rSeg(){
  document.getElementById('segKpis').innerHTML=[{l:'Incidentes Mes',v:DB.incidentes.length,c:'#ef4444'},{l:'Sin Cerrar',v:DB.incidentes.filter(i=>i.est!=='Cerrado').length,c:'#f97316'},{l:'PETAR Activos',v:DB.petar.filter(p=>p.est==='Activo').length,c:'#f59e0b'},{l:'Días sin Accidente',v:15,c:'#10b981'}].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  document.getElementById('tbInc').innerHTML=DB.incidentes.map(r=>`<tr><td class="mono">${r.fecha}</td><td><span class="badge b-red">${r.tipo}</span></td><td>${r.area}</td><td>${r.desc}</td><td>${r.trab}</td><td>${bge(r.sev)}</td><td>${bge(r.est)}</td><td><button class="btn btn-del btn-sm" onclick="del('incidentes',${r.id})">🗑</button></td></tr>`).join('');
  document.getElementById('tbPetar').innerHTML=DB.petar.map(r=>`<tr><td class="mono" style="color:var(--seg)">${r.num}</td><td><span class="badge b-yellow">${r.tipo}</span></td><td>${r.resp}</td><td class="mono">${r.vig}</td><td>${bge(r.est)}</td><td><button class="btn btn-del btn-sm" onclick="del('petar',${r.id})">🗑</button></td></tr>`).join('');
}
function gInc(){DB.incidentes.push({id:nid('inc'),fecha:document.getElementById('inF').value||today(),tipo:document.getElementById('inT').value,area:document.getElementById('inA').value,desc:document.getElementById('inD').value,trab:document.getElementById('inTr').value,sev:document.getElementById('inSv').value,est:document.getElementById('inE').value});syncSheet('saveIncidente',DB.incidentes[DB.incidentes.length-1]);closeM('mInc');rSeg();toast('Incidente registrado');}
function gPetar(){DB.petar.push({id:nid('pet'),num:document.getElementById('ptN').value,tipo:document.getElementById('ptT').value,resp:document.getElementById('ptR').value,vig:document.getElementById('ptV').value,est:document.getElementById('ptE').value});syncSheet('savePetar',DB.petar[DB.petar.length-1]);closeM('mPetar');rSeg();toast('PETAR registrado');}

// ══ AMBIENTAL ══
function rAmb(){document.getElementById('tbAmb').innerHTML=DB.ambiental.map(r=>`<tr><td class="mono">${r.fecha}</td><td><span class="badge b-teal">${r.tipo}</span></td><td>${r.desc}</td><td class="mono">${r.cant}</td><td>${r.dest}</td><td>${bge(r.est)}</td><td><button class="btn btn-del btn-sm" onclick="del('ambiental',${r.id})">🗑</button></td></tr>`).join('');}
function gAmb(){DB.ambiental.push({id:nid('amb'),fecha:document.getElementById('maF').value||today(),tipo:document.getElementById('maT').value,desc:document.getElementById('maD').value,cant:document.getElementById('maCn').value,dest:document.getElementById('maDst').value,est:document.getElementById('maE').value});syncSheet('saveAmbiental',DB.ambiental[DB.ambiental.length-1]);closeM('mAmb');rAmb();toast('Registro ambiental guardado');}

// ══ MANTENIMIENTO ══
function rMaster(){
  document.getElementById('tbMaster').innerHTML=DB.equipos.map(e=>`<tr>
    <td class="mono" style="color:var(--mec)">${e.codigo}</td>
    <td><strong>${e.nombre}</strong></td>
    <td><span class="badge b-purple" style="font-size:.65rem">${e.tipo}</span></td>
    <td class="mono">${e.anio||'—'}</td>
    <td class="mono">${e.placa||'—'}</td>
    <td class="tr mono">${fmtN(e.hr)} h</td>
    <td>${bge(e.est)}</td>
    <td><span class="mono" style="font-size:.72rem;color:#a78bfa">${e.proyecto||'—'}</span></td>
    <td style="display:flex;gap:.3rem">
      <button class="btn btn-out btn-sm" title="Ver detalle" onclick="verEquipo(${e.id})" style="color:#3b82f6;border-color:#3b82f660">👁</button>
      <button class="btn btn-out btn-sm" title="Editar" onclick="editEquipo(${e.id})" style="color:#f59e0b;border-color:#f59e0b60">✏️</button>
      <button class="btn btn-del btn-sm" onclick="del('equipos',${e.id})">🗑</button>
    </td>
  </tr>`).join('');
}
let _eqTab=0,_eqEditId=null;
function openEquipo(){
  _eqEditId=null;
  document.querySelector('#mEquipo .mttl').textContent='Agregar Equipo';
  _eqTab=0;eqGoTab(0);
  const ps=document.getElementById('eqProy');
  if(ps)ps.innerHTML='<option value="">— Sin proyecto —</option>'+DB.proyectos.map(p=>`<option value="${p.codigo}">${p.codigo}</option>`).join('');
  openM('mEquipo');
}
function eqGoTab(n){
  _eqTab=n;
  [0,1,2,3].forEach(i=>{
    const p=document.getElementById('eqP'+i),t=document.getElementById('eqTab'+i);
    if(p)p.style.display=i===n?'grid':'none';
    if(t)t.classList.toggle('eq-tab-act',i===n);
  });
  const prev=document.getElementById('eqBPrev'),next=document.getElementById('eqBNext'),save=document.getElementById('eqBSave');
  if(prev)prev.style.display=n>0?'':'none';
  if(next)next.style.display=n<3?'':'none';
  if(save)save.style.display=n===3?'':'none';
}
function gEquipo(){
  const cod=document.getElementById('eqCod').value.trim();
  if(!cod){toast('Ingrese el código del equipo',true);eqGoTab(0);return;}
  const eq={
    id:nid('eq'),codigo:cod,
    nombre:(document.getElementById('eqSub').value+' '+document.getElementById('eqMa').value+' '+document.getElementById('eqMo').value).trim(),
    tipo:document.getElementById('eqTi').value,
    sub:document.getElementById('eqSub').value,
    marca:document.getElementById('eqMa').value,
    modelo:document.getElementById('eqMo').value,
    anio:+document.getElementById('eqAn').value||2020,
    placa:document.getElementById('eqPl').value,
    hr:+document.getElementById('eqHr').value||0,
    est:document.getElementById('eqEst').value,
    numSerie:document.getElementById('eqNs').value,
    potenciaHp:+document.getElementById('eqPhp').value||null,
    capacidadM3:+document.getElementById('eqCm3').value||null,
    pesoKg:+document.getElementById('eqPkg').value||null,
    dimensiones:document.getElementById('eqDim').value,
    ubicacion:document.getElementById('eqUbi').value,
    fechaLlegada:document.getElementById('eqFll').value||null,
    fechaSalida:document.getElementById('eqFls').value||null,
    status:document.getElementById('eqSts').value,
    soat:document.getElementById('eqSoat').value,
    polizaTrec:document.getElementById('eqPtr').value,
    revisionTecnica:document.getElementById('eqRtec').value,
    gps:document.getElementById('eqGps').value,
    proveedor:document.getElementById('eqProv').value,
    contacto:document.getElementById('eqCtc').value,
    celular:document.getElementById('eqCel').value,
    correo:document.getElementById('eqCor').value,
    horasMinimas:+document.getElementById('eqHmin').value||null,
    tarifa:+document.getElementById('eqTar').value||null,
    inicioContrato:document.getElementById('eqIco').value||null,
    terminoContrato:document.getElementById('eqTco').value||null,
    ccGets:+document.getElementById('eqCcg').value||null,
    ccEngrase:+document.getElementById('eqCce').value||null,
    ccRellenoNiveles:+document.getElementById('eqCcrn').value||null,
    ccMantPreventivo:+document.getElementById('eqCcmp').value||null,
    ccMantCorrectivo:+document.getElementById('eqCcmc').value||null,
    proyecto:document.getElementById('eqProy').value||null,
    ultMant:null,proxMant:null
  };
  if(_eqEditId!==null){
    const idx=DB.equipos.findIndex(x=>x.id===_eqEditId);
    if(idx>-1){DB.equipos[idx]={...DB.equipos[idx],...eq,id:_eqEditId};syncSheet('saveEquipo',DB.equipos[idx]);}
    _eqEditId=null;
    document.querySelector('#mEquipo .mttl').textContent='Agregar Equipo';
    closeM('mEquipo');rMaster();toast('Equipo actualizado');
  }else{
    DB.equipos.push(eq);
    syncSheet('saveEquipo',eq);
    closeM('mEquipo');rMaster();toast('Equipo agregado');
  }
}
function verEquipo(id){
  const e=DB.equipos.find(x=>x.id===id);if(!e)return;
  const row=(l,v)=>`<div style="display:flex;gap:.5rem;padding:.28rem 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted2);min-width:170px;font-size:.74rem">${l}</span><span style="font-weight:500;font-size:.82rem">${v||'—'}</span></div>`;
  const sec=(t)=>`<div style="background:var(--mec);color:#fff;font-size:.69rem;font-weight:700;padding:.22rem .6rem;border-radius:4px;margin:.65rem 0 .25rem;letter-spacing:.06em;text-transform:uppercase">${t}</div>`;
  document.getElementById('eqVerTtl').textContent='🔍 '+e.codigo+' – '+e.nombre;
  document.getElementById('eqVerBody').innerHTML=`
    ${sec('Generales')}
    ${row('Código',e.codigo)}${row('Tipo / Línea',e.tipo)}${row('Subtipo',e.sub)}
    ${row('Marca',e.marca)}${row('Modelo',e.modelo)}${row('Año',e.anio)}
    ${row('Placa',e.placa)}${row('Horómetro',fmtN(e.hr)+' h')}${row('Estado',e.est)}
    ${row('Proyecto',e.proyecto)}
    ${sec('Técnicos')}
    ${row('N° de Serie',e.numSerie)}${row('Potencia HP',e.potenciaHp)}
    ${row('Capacidad M³',e.capacidadM3)}${row('Peso KG',e.pesoKg)}
    ${row('Dimensiones',e.dimensiones)}${row('Ubicación',e.ubicacion)}
    ${row('F. Llegada',e.fechaLlegada)}${row('F. Salida',e.fechaSalida)}
    ${row('Status',e.status)}${row('SOAT',e.soat)}${row('P. TREC',e.polizaTrec)}
    ${row('Rev. Técnica',e.revisionTecnica)}${row('GPS',e.gps)}
    ${sec('Contrato / Proveedor')}
    ${row('Proveedor',e.proveedor)}${row('Contacto',e.contacto)}
    ${row('Celular',e.celular)}${row('Correo',e.correo)}
    ${row('H. Mínimas',e.horasMinimas!=null?fmtN(e.horasMinimas)+' h':null)}
    ${row('Tarifa S/',e.tarifa?fmt(e.tarifa):null)}
    ${row('Inicio Contrato',e.inicioContrato)}${row('Término Contrato',e.terminoContrato)}
    ${sec('Costos Mantenimiento')}
    ${row('CC GET\'S',e.ccGets?fmt(e.ccGets):null)}${row('CC Engrase',e.ccEngrase?fmt(e.ccEngrase):null)}
    ${row('CC Relleno Niveles',e.ccRellenoNiveles?fmt(e.ccRellenoNiveles):null)}
    ${row('CC Mant. Preventivo',e.ccMantPreventivo?fmt(e.ccMantPreventivo):null)}
    ${row('CC Mant. Correctivo',e.ccMantCorrectivo?fmt(e.ccMantCorrectivo):null)}
  `;
  openM('mEqVer');
}
function editEquipo(id){
  const e=DB.equipos.find(x=>x.id===id);if(!e)return;
  openEquipo();     // populates dropdowns (resets _eqEditId=null internally)
  _eqEditId=id;    // restore AFTER openEquipo so gEquipo() sabe que es edición
  document.querySelector('#mEquipo .mttl').textContent='✏️ Editar Equipo: '+e.codigo;
  // Tab 0
  document.getElementById('eqCod').value=e.codigo||'';
  document.getElementById('eqTi').value=e.tipo||'Línea Amarilla';
  document.getElementById('eqSub').value=e.sub||'Excavadora';
  document.getElementById('eqMa').value=e.marca||'';
  document.getElementById('eqMo').value=e.modelo||'';
  document.getElementById('eqAn').value=e.anio||'';
  document.getElementById('eqPl').value=e.placa||'';
  document.getElementById('eqHr').value=e.hr||0;
  document.getElementById('eqEst').value=e.est||'Operativo';
  document.getElementById('eqProy').value=e.proyecto||'';
  // Tab 1
  document.getElementById('eqNs').value=e.numSerie||'';
  document.getElementById('eqPhp').value=e.potenciaHp||'';
  document.getElementById('eqCm3').value=e.capacidadM3||'';
  document.getElementById('eqPkg').value=e.pesoKg||'';
  document.getElementById('eqDim').value=e.dimensiones||'';
  document.getElementById('eqUbi').value=e.ubicacion||'';
  document.getElementById('eqFll').value=e.fechaLlegada||'';
  document.getElementById('eqFls').value=e.fechaSalida||'';
  document.getElementById('eqSts').value=e.status||'';
  document.getElementById('eqSoat').value=e.soat||'';
  document.getElementById('eqPtr').value=e.polizaTrec||'';
  document.getElementById('eqRtec').value=e.revisionTecnica||'';
  document.getElementById('eqGps').value=e.gps||'';
  // Tab 2
  document.getElementById('eqProv').value=e.proveedor||'';
  document.getElementById('eqCtc').value=e.contacto||'';
  document.getElementById('eqCel').value=e.celular||'';
  document.getElementById('eqCor').value=e.correo||'';
  document.getElementById('eqHmin').value=e.horasMinimas||'';
  document.getElementById('eqTar').value=e.tarifa||'';
  document.getElementById('eqIco').value=e.inicioContrato||'';
  document.getElementById('eqTco').value=e.terminoContrato||'';
  // Tab 3
  document.getElementById('eqCcg').value=e.ccGets||'';
  document.getElementById('eqCce').value=e.ccEngrase||'';
  document.getElementById('eqCcrn').value=e.ccRellenoNiveles||'';
  document.getElementById('eqCcmp').value=e.ccMantPreventivo||'';
  document.getElementById('eqCcmc').value=e.ccMantCorrectivo||'';
}
let _mantEditId=null;
function _genOT(){
  const yy=String(new Date().getFullYear()).slice(-2);
  const seq=String(DB.mantenimientos.length+1).padStart(3,'0');
  return`OT-${seq}-${yy}`;
}
function openMant(){
  _mantEditId=null;
  document.getElementById('mMantTtl').textContent='Programar Mantenimiento';
  ['otDe','otFp','otFe','otHs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('otN').value=_genOT();
  const es=document.getElementById('otEs');if(es)es.value='Programado';
  openM('mMant');
}
function rProg(){
  const pen=DB.mantenimientos.filter(m=>m.est==='Programado').length,proc=DB.mantenimientos.filter(m=>m.est==='En Proceso').length,comp=DB.mantenimientos.filter(m=>m.est==='Completado').length;
  const total=DB.mantenimientos.length;
  document.getElementById('progKpis').innerHTML=[
    {l:'Programados',v:pen,c:'#3b82f6',ic:'📅',sub:'órdenes pendientes'},
    {l:'En Proceso',v:proc,c:'#f59e0b',ic:'🔄',sub:'en ejecución'},
    {l:'Completados',v:comp,c:'#10b981',ic:'✅',sub:'finalizados'},
    {l:'Total OT',v:total,c:'#8b5cf6',ic:'📋',sub:'órdenes registradas'}
  ].map(k=>`<div style="background:var(--panel);border:1px solid var(--border);border-top:3px solid ${k.c};border-radius:10px;padding:.85rem 1.1rem;flex:1;min-width:150px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
      <span style="font-size:.67rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted2);font-weight:600">${k.l}</span>
      <span style="font-size:1.3rem;line-height:1;opacity:.75">${k.ic}</span>
    </div>
    <div style="font-size:2.4rem;font-weight:800;color:${k.c};line-height:1;margin-bottom:.25rem">${k.v}</div>
    <div style="font-size:.68rem;color:var(--muted2)">${k.sub}</div>
  </div>`).join('');
  const fd=document.getElementById('progFDesde')?document.getElementById('progFDesde').value:'';
  const fh=document.getElementById('progFHasta')?document.getElementById('progFHasta').value:'';
  const rows=DB.mantenimientos.filter(r=>{
    if(fd&&r.fp&&r.fp<fd)return false;
    if(fh&&r.fp&&r.fp>fh)return false;
    return true;
  });
  document.getElementById('tbProg').innerHTML=rows.map(r=>{
    const eq=DB.equipos.find(e=>e.id===r.eqId);
    const proy=eq?eq.proyecto||'—':'—';
    return`<tr>
      <td class="mono" style="color:var(--mec)">${r.ot}</td>
      <td>${eq?eq.codigo+' '+eq.nombre.split(' ').slice(0,2).join(' '):''}</td>
      <td><span class="badge b-purple" style="font-size:.65rem">${r.tipo}</span></td>
      <td style="font-size:.8rem">${r.desc}</td>
      <td style="font-size:.8rem">${r.mec}</td>
      <td class="mono">${r.fp}</td>
      <td class="mono">${r.fe||'—'}</td>
      <td class="mono tr">${fmtN(r.hs)}</td>
      <td>${bge(r.est)}</td>
      <td><span class="mono" style="font-size:.72rem;color:#a78bfa">${proy}</span></td>
      <td style="display:flex;gap:.3rem">
        <button class="btn btn-out btn-sm" title="Ver detalle" onclick="verMant(${r.id})" style="color:#3b82f6;border-color:#3b82f660">👁</button>
        <button class="btn btn-out btn-sm" title="Editar" onclick="editMant(${r.id})" style="color:#f59e0b;border-color:#f59e0b60">✏️</button>
        <button class="btn btn-del btn-sm" onclick="del('mantenimientos',${r.id})">🗑</button>
      </td>
    </tr>`;
  }).join('');
}
function verMant(id){
  const r=DB.mantenimientos.find(x=>x.id===id);if(!r)return;
  const eq=DB.equipos.find(e=>e.id===r.eqId);
  const proy=eq?eq.proyecto||'—':'—';
  document.getElementById('mantVerTtl').textContent=`🔍 ${r.ot}`;
  document.getElementById('mantVerBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem 1.2rem">
      <div><span style="color:var(--muted2);font-size:.72rem">OT N°</span><div class="mono" style="color:var(--mec);font-size:.95rem;font-weight:700">${r.ot}</div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">Estado</span><div style="margin-top:.15rem">${bge(r.est)}</div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">Equipo</span><div>${eq?`<span class="mono" style="color:var(--mec)">${eq.codigo}</span> ${eq.nombre}`:'—'}</div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">Proyecto</span><div class="mono" style="color:#a78bfa">${proy}</div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">Tipo Mantenimiento</span><div><span class="badge b-purple" style="font-size:.65rem">${r.tipo}</span></div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">Mecánico Responsable</span><div>${r.mec||'—'}</div></div>
      <div style="grid-column:1/-1"><span style="color:var(--muted2);font-size:.72rem">Descripción del Trabajo</span><div style="margin-top:.2rem;padding:.5rem .7rem;background:var(--panel2);border-radius:6px;line-height:1.5">${r.desc||'—'}</div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">F. Programada</span><div class="mono">${r.fp||'—'}</div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">F. Ejecución Real</span><div class="mono">${r.fe||'—'}</div></div>
      <div><span style="color:var(--muted2);font-size:.72rem">Hs / Km Programado</span><div class="mono">${fmtN(r.hs)} h</div></div>
    </div>`;
  openM('mMantVer');
}
function editMant(id){
  const r=DB.mantenimientos.find(x=>x.id===id);if(!r)return;
  _mantEditId=id;
  document.getElementById('mMantTtl').textContent='Editar OT';
  document.getElementById('otN').value=r.ot||'';
  const eq=document.getElementById('otEq');if(eq)eq.value=r.eqId||'';
  const ti=document.getElementById('otTi');if(ti)ti.value=r.tipo||'';
  document.getElementById('otDe').value=r.desc||'';
  const mc=document.getElementById('otMec');if(mc)mc.value=r.mec||'';
  document.getElementById('otFp').value=r.fp||'';
  document.getElementById('otFe').value=r.fe||'';
  document.getElementById('otHs').value=r.hs||0;
  const es=document.getElementById('otEs');if(es)es.value=r.est||'Programado';
  openM('mMant');
}
function gMant(){
  const eqId=+document.getElementById('otEq').value;
  if(!eqId){toast('Seleccione equipo',true);return;}
  const data={ot:document.getElementById('otN').value||_genOT(),eqId,tipo:document.getElementById('otTi').value,desc:document.getElementById('otDe').value,mec:document.getElementById('otMec').value,fp:document.getElementById('otFp').value||today(),fe:document.getElementById('otFe').value||null,hs:+document.getElementById('otHs').value||0,est:document.getElementById('otEs').value};
  if(_mantEditId!==null){
    const idx=DB.mantenimientos.findIndex(x=>x.id===_mantEditId);
    if(idx>-1){DB.mantenimientos[idx]={...DB.mantenimientos[idx],...data,id:_mantEditId};syncSheet('saveMantenimiento',DB.mantenimientos[idx]);}
    _mantEditId=null;
    document.getElementById('mMantTtl').textContent='Programar Mantenimiento';
    closeM('mMant');rProg();toast('OT actualizada');
  }else{
    const rec={id:nid('mant'),...data};
    DB.mantenimientos.push(rec);
    syncSheet('saveMantenimiento',rec);
    closeM('mMant');rProg();toast('Mantenimiento programado');
  }
}
function printProgGantt(){
  const fdEl=document.getElementById('progFDesde'),fhEl=document.getElementById('progFHasta');
  let desde=fdEl?fdEl.value:'',hasta=fhEl?fhEl.value:'';
  if(!desde||!hasta){
    const now=new Date(),dow=now.getDay()||7;
    const mon=new Date(now);mon.setDate(now.getDate()-dow+1);
    const sun=new Date(mon);sun.setDate(mon.getDate()+6);
    if(!desde)desde=mon.toISOString().slice(0,10);
    if(!hasta)hasta=sun.toISOString().slice(0,10);
  }
  const rows=DB.mantenimientos.filter(r=>r.fp&&r.fp>=desde&&r.fp<=hasta);
  const days=[];
  let dc=new Date(desde+'T12:00:00');const endD=new Date(hasta+'T12:00:00');
  while(dc<=endD){days.push(dc.toISOString().slice(0,10));dc.setDate(dc.getDate()+1);}
  const DN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const SC={'Programado':{bg:'#dbeafe',tx:'#1e40af',bar:'#3b82f6'},'En Proceso':{bg:'#fef3c7',tx:'#92400e',bar:'#f59e0b'},'Completado':{bg:'#d1fae5',tx:'#065f46',bar:'#10b981'},'Postergado':{bg:'#f3f4f6',tx:'#374151',bar:'#9ca3af'}};
  const wk=(ds)=>{const d=new Date(ds+'T12:00:00'),j4=new Date(d.getFullYear(),0,4),w1=new Date(j4);w1.setDate(j4.getDate()-(j4.getDay()||7)+1);return Math.ceil(((d-w1)/86400000+1)/7);};
  const semana=wk(desde);
  const dayHdrs=days.map(day=>{const d=new Date(day+'T12:00:00');return`<th style="text-align:center;width:38px;padding:3px 1px;font-size:8.5px;background:#1e3a5f;color:#fff"><div>${DN[d.getDay()]}</div><div style="opacity:.8;font-size:8px">${day.slice(5).replace('-','/')}</div></th>`;}).join('');
  const summaryRows=rows.map(r=>{
    const eq=DB.equipos.find(e=>e.id===r.eqId),sc=SC[r.est]||SC['Postergado'],proy=eq?eq.proyecto||'—':'—';
    return`<tr><td style="font-weight:700;color:#1e3a5f;white-space:nowrap">${r.ot}</td><td>${eq?eq.codigo+' '+eq.nombre.split(' ').slice(0,2).join(' '):'—'}</td><td>${r.tipo}</td><td style="font-size:9px">${r.desc||'—'}</td><td>${r.mec||'—'}</td><td style="text-align:center">${r.fp||'—'}</td><td style="text-align:center">${r.fe||'—'}</td><td style="text-align:right">${r.hs||0} h</td><td><span style="background:${sc.bg};color:${sc.tx};padding:2px 5px;border-radius:3px;font-size:8.5px;font-weight:700">${r.est}</span></td><td style="color:#7c3aed;font-size:9px">${proy}</td></tr>`;
  }).join('');
  const ganttRows=rows.map(r=>{
    const eq=DB.equipos.find(e=>e.id===r.eqId),sc=SC[r.est]||SC['Postergado'];
    const fe=r.fe||r.fp||'';
    const cells=days.map(day=>{
      const active=r.fp&&day>=r.fp&&day<=fe;
      return active?`<td style="background:${sc.bar};padding:0;border:1px solid ${sc.bar}"></td>`:`<td style="border:1px solid #e2e8f0"></td>`;
    }).join('');
    return`<tr><td style="font-weight:700;font-size:9.5px;white-space:nowrap;color:#1e3a5f">${r.ot}</td><td style="font-size:9px">${eq?eq.codigo+' '+eq.nombre.split(' ').slice(0,2).join(' '):'—'}</td><td style="font-size:9px">${r.mec||'—'}</td><td><span style="background:${sc.bg};color:${sc.tx};padding:1px 4px;border-radius:2px;font-size:8px;font-weight:700">${r.est}</span></td>${cells}</tr>`;
  }).join('');
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Programación Semana ${semana}</title>
<style>@page{size:A4 landscape;margin:1cm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:10px;color:#111;margin:0}
.hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1e3a5f;padding-bottom:7px;margin-bottom:9px;gap:1rem}
.hdr-logo{flex:0 0 auto}.hdr-logo img{height:52px;object-fit:contain}
.hdr-mid{flex:1;text-align:center}.hdr-mid h1{font-size:15px;color:#1e3a5f;margin:0 0 2px;font-weight:700}.hdr-mid p{font-size:9px;color:#64748b;margin:0}
.hdr-info{flex:0 0 auto;text-align:right;font-size:8.5px;color:#94a3b8}
table{width:100%;border-collapse:collapse}th{background:#1e3a5f;color:#fff;padding:4px 6px;text-align:left;font-size:9px}
td{border:1px solid #e2e8f0;padding:3px 5px;vertical-align:middle}tr:nth-child(even) td{background:#f8fafc}
.gantt td{height:22px}.sec{font-size:11px;font-weight:700;color:#1e3a5f;margin:10px 0 4px;border-bottom:2px solid #1e3a5f;padding-bottom:3px}
.legend{display:flex;gap:8px;margin-top:6px;font-size:8.5px;align-items:center}
.ld{width:10px;height:10px;border-radius:2px;display:inline-block}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="hdr">
  <div class="hdr-logo"><img src="__LOGO__" alt="Ecosermo"></div>
  <div class="hdr-mid"><h1>PROGRAMACIÓN DE MANTENIMIENTO</h1><p>ECOSERMO – Sistema de Control de Mantenimiento Mecánico – GDAR</p></div>
  <div class="hdr-info"><div style="font-weight:700;color:#1e3a5f;font-size:10px">Semana N° ${semana}</div><div>${desde} → ${hasta}</div><div>${rows.length} orden(es)</div><div style="margin-top:3px">Generado: ${new Date().toLocaleString('es-PE')}</div></div>
</div>
<div style="margin-bottom:10px">
  <div style="display:inline-block;border:1px solid #dbeafe;border-top:3px solid #3b82f6;border-radius:8px;padding:.7rem 1.4rem;min-width:180px;background:#f0f6ff">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.4rem">
      <span style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:600">Órdenes Programadas</span>
      <span style="font-size:1.2rem;opacity:.7">📅</span>
    </div>
    <div style="font-size:2.4rem;font-weight:800;color:#3b82f6;line-height:1;margin-bottom:.2rem">${rows.length}</div>
    <div style="font-size:.68rem;color:#64748b">semana N° ${semana} · ${desde} → ${hasta}</div>
  </div>
</div>
<div class="sec">Detalle de Órdenes</div>
<table><thead><tr><th>OT</th><th>Equipo</th><th>Tipo</th><th>Descripción</th><th>Mecánico</th><th>F. Prog.</th><th>F. Ejec.</th><th>Hs/Km</th><th>Estado</th><th>Proyecto</th></tr></thead><tbody>${summaryRows}</tbody></table>
<div class="sec">Diagrama de Gantt</div>
<table class="gantt"><thead><tr><th style="width:80px">OT</th><th style="width:140px">Equipo</th><th style="width:120px">Mecánico</th><th style="width:75px">Estado</th>${dayHdrs}</tr></thead><tbody>${ganttRows}</tbody></table>
<div class="legend"><strong>Leyenda:</strong><span class="ld" style="background:#3b82f6"></span>Programado<span class="ld" style="background:#f59e0b"></span>En Proceso<span class="ld" style="background:#10b981"></span>Completado<span class="ld" style="background:#9ca3af"></span>Postergado</div>
</body></html>`;
  const _logoUrl=window.location.href.replace(/[^\/\\]+$/,'')+'09.-ERP/Imagenes/ECOSERMO-LOGO.png';
  const htmlFinal=html.replace('__LOGO__',_logoUrl);
  const win=window.open('','_blank','width=1200,height=750');
  win.document.write(htmlFinal);win.document.close();
  setTimeout(()=>win.print(),700);
}

