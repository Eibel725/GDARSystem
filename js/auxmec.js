// ══ AUXILIOS MECÁNICOS ══
let _amTab=0,_amEditId=null;
function amGoTab(n){
  _amTab=n;
  [0,1,2,3].forEach(i=>{
    const t=document.getElementById('amTab'+i);
    if(t)t.classList.toggle('eq-tab-act',i===n);
    const p=document.getElementById('amP'+i);
    if(!p)return;
    if(i===n){p.style.display=i===3?'block':'grid';}else{p.style.display='none';}
  });
  const prev=document.getElementById('amBPrev'),next=document.getElementById('amBNext'),save=document.getElementById('amBSave');
  if(prev)prev.style.display=n>0?'':'none';
  if(next)next.style.display=n<3?'':'none';
  if(save)save.style.display=n===3?'':'none';
}
function amAddInsumo(){
  const tbody=document.getElementById('amInsumosBody');
  const ISS='background:var(--panel2);border:1px solid var(--border);border-radius:4px;padding:.25rem .4rem;color:var(--text);font-size:.73rem;width:100%';
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input style="${ISS}" placeholder="Descripción del ítem"></td>
    <td><input style="${ISS};width:85px" placeholder="M-001"></td>
    <td><input type="number" style="${ISS};width:65px" step="0.01" min="0" placeholder="0"></td>
    <td><input style="${ISS};width:60px" placeholder="und"></td>
    <td><select style="${ISS};width:95px"><option>Almacén</option><option>Campo</option></select></td>
    <td><button class="btn btn-del btn-sm" onclick="this.closest('tr').remove()" style="padding:.2rem .4rem">✕</button></td>`;
  tbody.appendChild(tr);
}
function amGetInsumos(){
  return[...document.getElementById('amInsumosBody').children].map(tr=>{
    const inp=tr.querySelectorAll('input,select');
    return{desc:inp[0].value.trim(),cod:inp[1].value.trim(),cant:+inp[2].value||0,und:inp[3].value.trim(),origen:inp[4].value};
  }).filter(r=>r.desc);
}
function rAuxMec(){
  const tots=DB.auxiliosMecanicos.length;
  const pen=DB.auxiliosMecanicos.filter(r=>r.est==='Pendiente').length;
  const proc=DB.auxiliosMecanicos.filter(r=>r.est==='En Proceso').length;
  const aten=DB.auxiliosMecanicos.filter(r=>r.est==='Atendido').length;
  document.getElementById('auxMecKpis').innerHTML=[
    {l:'Total Auxilios',v:tots,c:'#8b5cf6'},
    {l:'Pendientes',v:pen,c:'#ef4444'},
    {l:'En Proceso',v:proc,c:'#f59e0b'},
    {l:'Atendidos',v:aten,c:'#10b981'}
  ].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  document.getElementById('tbAuxMec').innerHTML=DB.auxiliosMecanicos.slice().reverse().map(r=>{
    const eq=DB.equipos.find(e=>e.id===r.eqId);
    const eqLabel=eq?`<span class="mono" style="font-size:.71rem;color:var(--mec)">${eq.codigo}</span> ${eq.nombre.split(' ').slice(0,2).join(' ')}`:'—';
    return`<tr>
      <td class="mono" style="color:var(--mec);font-size:.71rem">${r.cod||'—'}</td>
      <td class="mono">${r.fecha||'—'}</td>
      <td style="font-size:.8rem">${eqLabel}</td>
      <td class="mono tr" style="font-size:.78rem">${r.horometro!=null?fmtN(r.horometro)+' h':'—'}</td>
      <td><span class="badge b-purple" style="font-size:.64rem">${r.tipo||'—'}</span></td>
      <td style="font-size:.77rem;max-width:170px;white-space:normal">${r.desc||'—'}</td>
      <td style="font-size:.78rem">${r.mec||'—'}</td>
      <td class="mono tr">${r.tiempoParada!=null?fmtN(r.tiempoParada)+' h':'—'}</td>
      <td>${bge(r.est)}</td>
      <td><span class="mono" style="font-size:.72rem;color:#a78bfa">${eq?eq.proyecto||'—':'—'}</span></td>
      <td style="font-size:.72rem;color:var(--muted2)">${DB.auxMecInsumos.filter(i=>i.auxilioId===r.id).length||'—'}</td>
      <td style="display:flex;gap:.3rem;flex-wrap:nowrap">
        <button class="btn btn-out btn-sm" title="Ver detalle" onclick="verAuxMec(${r.id})" style="color:#3b82f6;border-color:#3b82f660">👁</button>
        ${r.est!=='Atendido'?`<button class="btn btn-out btn-sm" title="Editar" onclick="editAuxMec(${r.id})" style="color:#f59e0b;border-color:#f59e0b60">✏️</button>`:''}
        ${r.est!=='Atendido'?`<button class="btn btn-del btn-sm" onclick="del('auxiliosMecanicos',${r.id})">🗑</button>`:''}
      </td>
    </tr>`;
  }).join('');
}
function openAuxMec(){
  _amEditId=null;
  document.querySelector('#mAuxMec .mttl').textContent='🚨 Registrar Auxilio Mecánico';
  _amTab=0;amGoTab(0);
  const eqSel=document.getElementById('amEq');
  if(eqSel)eqSel.innerHTML='<option value="">— Seleccionar —</option>'+DB.equipos.map(e=>`<option value="${e.id}">${e.codigo} – ${e.nombre.split(' ').slice(0,3).join(' ')}</option>`).join('');
  const mecSel=document.getElementById('amMec');
  if(mecSel){const mecList=DB.personal.filter(p=>p.cat==='Mecánico'||(p.cargo||'').toLowerCase().includes('mecán'));
    mecSel.innerHTML='<option value="">— Seleccionar —</option>'+(mecList.length?mecList:DB.personal).map(p=>`<option>${p.ape}, ${p.nom}</option>`).join('');}
  const fSel=document.getElementById('amFrente');
  if(fSel)fSel.innerHTML='<option value="">— Seleccionar frente —</option>'+DB.frentesTrabajo.map(f=>`<option>${f.nombre}</option>`).join('');
  const yr=new Date().getFullYear();
  document.getElementById('amCod').value=`AUX-${yr}-${String(DB.auxiliosMecanicos.length+1).padStart(4,'0')}`;
  document.getElementById('amFecha').value=today();
  ['amHora','amOp','amHorometro','amDesc','amAccion','amParada','amObs','amNMec','amTrasladoDest','amSupervisor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('amNMec').value='';
  document.getElementById('amTipo').value='Mecánico';
  document.getElementById('amTipoInt').value='Correctiva no planificada';
  document.getElementById('amCausaRaiz').value='';
  document.getElementById('amTraslado').value='No';
  document.getElementById('amTrasladoDiv').style.display='none';
  document.getElementById('amEst').value='Pendiente';
  document.getElementById('amConforme').checked=false;
  document.getElementById('amInsumosBody').innerHTML='';
  openM('mAuxMec');
}
function gAuxMec(){
  const eqId=+document.getElementById('amEq').value||null;
  const horometro=parseFloat(document.getElementById('amHorometro').value)||null;
  if(!eqId){toast('Seleccione un equipo (Tab Identificación)',true);amGoTab(0);return;}
  if(!horometro){toast('El horómetro/Km es obligatorio (Tab Identificación)',true);amGoTab(0);return;}
  if(!document.getElementById('amDesc').value.trim()){toast('Ingrese descripción del problema (Tab Diagnóstico)',true);amGoTab(1);return;}
  const rec={
    id:nid('auxMec'),
    cod:document.getElementById('amCod').value,
    fecha:document.getElementById('amFecha').value||today(),
    hora:document.getElementById('amHora').value||null,
    eqId,horometro,
    operador:document.getElementById('amOp').value.trim()||null,
    frente:document.getElementById('amFrente').value||null,
    tipo:document.getElementById('amTipo').value,
    tipoInt:document.getElementById('amTipoInt').value,
    desc:document.getElementById('amDesc').value.trim(),
    causaRaiz:document.getElementById('amCausaRaiz').value||null,
    mec:document.getElementById('amMec').value||null,
    ayudante:document.getElementById('amNMec').value.trim()||null,
    accion:document.getElementById('amAccion').value.trim()||null,
    tiempoParada:parseFloat(document.getElementById('amParada').value)||null,
    traslado:document.getElementById('amTraslado').value,
    trasladoDest:document.getElementById('amTrasladoDest').value.trim()||null,
    est:document.getElementById('amEst').value,
    supervisor:document.getElementById('amSupervisor').value.trim()||null,
    conforme:document.getElementById('amConforme').checked,
    obs:document.getElementById('amObs').value.trim()||null,
  };
  const _saveInsumos=(auxilioId)=>{
    amGetInsumos().forEach(ins=>{
      const insRec={id:nid('auxMecIns'),auxilioId,desc:ins.desc,cod:ins.cod||null,cant:ins.cant,und:ins.und||null,origen:ins.origen};
      DB.auxMecInsumos.push(insRec);
      syncSheet('saveAuxMecInsumo',insRec);
    });
  };
  if(_amEditId!==null){
    // EDITAR: actualizar registro existente
    const idx=DB.auxiliosMecanicos.findIndex(x=>x.id===_amEditId);
    if(idx>-1){DB.auxiliosMecanicos[idx]={...DB.auxiliosMecanicos[idx],...rec,id:_amEditId};syncSheet('saveAuxMec',DB.auxiliosMecanicos[idx]);}
    // Reemplazar insumos: borrar los viejos e insertar nuevos
    const viejosIds=DB.auxMecInsumos.filter(i=>i.auxilioId===_amEditId).map(i=>i.id);
    DB.auxMecInsumos=DB.auxMecInsumos.filter(i=>i.auxilioId!==_amEditId);
    viejosIds.forEach(vid=>supaDelete('auxMecInsumos',vid));
    _saveInsumos(_amEditId);
    _amEditId=null;
    closeM('mAuxMec');rAuxMec();toast('Auxilio actualizado: '+rec.cod);
  }else{
    // CREAR: nuevo registro
    DB.auxiliosMecanicos.push(rec);
    syncSheet('saveAuxMec',rec);
    _saveInsumos(rec.id);
    closeM('mAuxMec');rAuxMec();toast('Auxilio registrado: '+rec.cod);
  }
}

function editAuxMec(id){
  const r=DB.auxiliosMecanicos.find(x=>x.id===id);if(!r)return;
  _amEditId=id;
  openAuxMec();
  // Sobreescribir código y modo
  document.getElementById('amCod').value=r.cod||'';
  document.querySelector('#mAuxMec .mttl').textContent='✏️ Editar Auxilio: '+r.cod;
  // Tab 0
  const eqSel=document.getElementById('amEq');if(eqSel&&r.eqId)eqSel.value=r.eqId;
  document.getElementById('amFecha').value=r.fecha||'';
  document.getElementById('amHora').value=r.hora||'';
  document.getElementById('amHorometro').value=r.horometro||'';
  document.getElementById('amOp').value=r.operador||'';
  const fSel=document.getElementById('amFrente');if(fSel)fSel.value=r.frente||'';
  // Tab 1
  document.getElementById('amTipo').value=r.tipo||'Mecánico';
  document.getElementById('amTipoInt').value=r.tipoInt||'Correctiva no planificada';
  document.getElementById('amDesc').value=r.desc||'';
  document.getElementById('amCausaRaiz').value=r.causaRaiz||'';
  // Tab 2
  const mecSel=document.getElementById('amMec');if(mecSel)mecSel.value=r.mec||'';
  document.getElementById('amNMec').value=r.ayudante||'';
  document.getElementById('amAccion').value=r.accion||'';
  document.getElementById('amParada').value=r.tiempoParada||'';
  document.getElementById('amTraslado').value=r.traslado||'No';
  document.getElementById('amTrasladoDiv').style.display=r.traslado==='Sí'?'':'none';
  document.getElementById('amTrasladoDest').value=r.trasladoDest||'';
  document.getElementById('amEst').value=r.est||'Pendiente';
  // Tab 3 — insumos
  document.getElementById('amInsumosBody').innerHTML='';
  DB.auxMecInsumos.filter(i=>i.auxilioId===id).forEach(ins=>{
    document.getElementById('amInsumosBody').appendChild((()=>{
      const ISS='background:var(--panel2);border:1px solid var(--border);border-radius:4px;padding:.25rem .4rem;color:var(--text);font-size:.73rem;width:100%';
      const tr=document.createElement('tr');
      tr.innerHTML=`<td><input style="${ISS}" value="${ins.desc||''}"></td>
        <td><input style="${ISS};width:85px" value="${ins.cod||''}"></td>
        <td><input type="number" style="${ISS};width:65px" step="0.01" min="0" value="${ins.cant||0}"></td>
        <td><input style="${ISS};width:60px" value="${ins.und||''}"></td>
        <td><select style="${ISS};width:95px"><option${ins.origen==='Almacén'?' selected':''}>Almacén</option><option${ins.origen==='Campo'?' selected':''}>Campo</option></select></td>
        <td><button class="btn btn-del btn-sm" onclick="this.closest('tr').remove()" style="padding:.2rem .4rem">✕</button></td>`;
      return tr;
    })());
  });
  document.getElementById('amSupervisor').value=r.supervisor||'';
  document.getElementById('amConforme').checked=!!r.conforme;
  document.getElementById('amObs').value=r.obs||'';
}
function verAuxMec(id){
  const r=DB.auxiliosMecanicos.find(x=>x.id===id);if(!r)return;
  const eq=DB.equipos.find(e=>e.id===r.eqId);
  const ins=DB.auxMecInsumos.filter(i=>i.auxilioId===id);
  const row=(l,v)=>`<div style="display:flex;gap:.5rem;padding:.3rem 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted2);min-width:160px;font-size:.75rem">${l}</span><span style="font-weight:500">${v||'—'}</span></div>`;
  const sec=(t)=>`<div style="background:var(--mec);color:#fff;font-size:.7rem;font-weight:700;padding:.25rem .6rem;border-radius:4px;margin:.7rem 0 .3rem;letter-spacing:.05em">${t}</div>`;
  document.getElementById('auxVerTtl').textContent='🔍 '+r.cod;
  document.getElementById('auxVerBody').innerHTML=`
    ${sec('IDENTIFICACIÓN')}
    ${row('Código',r.cod)}${row('Fecha',r.fecha)}${row('Hora',r.hora)}
    ${row('Equipo',eq?eq.codigo+' – '+eq.nombre:r.eqId)}
    ${row('Horómetro/Km',r.horometro!=null?fmtN(r.horometro)+' h':'—')}
    ${row('Operador',r.operador)}${row('Frente',r.frente)}
    ${sec('DIAGNÓSTICO')}
    ${row('Tipo de Falla',r.tipo)}${row('Tipo de Intervención',r.tipoInt)}
    ${row('Descripción',r.desc)}${row('Causa Raíz',r.causaRaiz)}
    ${sec('ATENCIÓN')}
    ${row('Mecánico',r.mec)}${row('Ayudante',r.ayudante)}
    ${row('Acciones',r.accion)}
    ${row('T. Parada',r.tiempoParada!=null?fmtN(r.tiempoParada)+' h':'—')}
    ${row('Traslado',r.traslado+(r.trasladoDest?' → '+r.trasladoDest:''))}
    ${row('Estado',r.est)}
    ${sec('INSUMOS Y REPUESTOS')}
    ${ins.length?`<table style="width:100%;font-size:.75rem;border-collapse:collapse;margin-top:.3rem">
      <thead><tr style="color:var(--muted2)"><th style="text-align:left;padding:.2rem .4rem">Descripción</th><th>Cód.</th><th>Cant.</th><th>Und.</th><th>Origen</th></tr></thead>
      <tbody>${ins.map(i=>`<tr style="border-top:1px solid var(--border)"><td style="padding:.25rem .4rem">${i.desc}</td><td class="mono">${i.cod||'—'}</td><td class="mono tr">${i.cant}</td><td>${i.und||'—'}</td><td style="font-size:.7rem">${i.origen}</td></tr>`).join('')}</tbody>
    </table>`:'<span style="color:var(--muted);font-size:.78rem">Sin insumos registrados</span>'}
    ${sec('CIERRE')}
    ${row('Supervisor',r.supervisor)}
    ${row('Operador conforme',r.conforme?'✅ Sí':'❌ No')}
    ${row('Observaciones',r.obs)}
  `;
  openM('mAuxMecVer');
}

// ══ PLANNER ══
function rPlanner(){
  const tot=DB.planner.length,done=DB.planner.filter(p=>p.est==='Completado').length,cursos=DB.planner.filter(p=>p.est==='En Curso').length;
  document.getElementById('plannerKpis').innerHTML=[{l:'Total',v:tot,c:'var(--ctl)'},{l:'En Curso',v:cursos,c:'#f59e0b'},{l:'Completadas',v:done,c:'#10b981'},{l:'Avance Prom.',v:tot?Math.round(DB.planner.reduce((a,x)=>a+x.av,0)/tot)+'%':'0%',c:'#3b82f6'}].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  document.getElementById('tbPlanner').innerHTML=DB.planner.map(a=>`<tr>
    <td class="mono" style="color:var(--ctl)">${a.cod}</td><td><strong>${a.nom}</strong></td><td>${a.resp}</td>
    <td class="mono">${a.ini}</td><td class="mono">${a.fin}</td>
    <td><div style="display:flex;align-items:center;gap:.4rem;min-width:90px"><div class="prog-wrap" style="flex:1"><div class="prog-bar" style="width:${a.av}%;background:${a.av>=80?'var(--ctl)':a.av>=40?'var(--ope)':'var(--seg)'}"></div></div><span class="mono" style="font-size:.7rem;color:var(--muted2)">${a.av}%</span></div></td>
    <td>${bge(a.est)}</td>
    <td><button class="btn btn-del btn-sm" onclick="del('planner',${a.id})">🗑</button></td>
  </tr>`).join('');
}
function gAct(){const nom=document.getElementById('acNom').value.trim();if(!nom){toast('Ingrese nombre',true);return;}DB.planner.push({id:nid('plan'),cod:document.getElementById('acCod').value||'ACT-'+String(DB.planner.length+1).padStart(3,'0'),nom,resp:document.getElementById('acRe').value,ini:document.getElementById('acFi').value,fin:document.getElementById('acFf').value,av:+document.getElementById('acAv').value||0,est:document.getElementById('acEs').value});closeM('mAct');rPlanner();toast('Actividad registrada');}

// ══ CONTROL EQUIPOS POR LÍNEA ══
const lineaMap={'Línea Amarilla':'lineaAmarilla','Línea Blanca':'lineaBlanca','Vehículo Menor':'vehiculosMenores','Equipos Complementarios':'equiposComplementarios'};
let currentReporteTipo='Línea Amarilla';
function openReporte(tipo){
  currentReporteTipo=tipo;
  document.getElementById('mRepTtl').textContent=`Nuevo Reporte – ${tipo}`;
  const sel=document.getElementById('rpEq');
  if(sel)sel.innerHTML=DB.equipos.filter(e=>e.tipo===tipo).map(e=>`<option value="${e.id}">${e.codigo} – ${e.nombre}</option>`).join('');
  openM('mReporte');
}
// ── ESTADO FORMULARIO PARTE ──
let parteState = { turno:'DIA', guardia:'A', viajeCount:0, tipo:'' };

function switchTab(n){
  document.getElementById('tabContent1').style.display = n===1?'block':'none';
  document.getElementById('tabContent2').style.display = n===2?'block':'none';
  document.getElementById('tab1').classList.toggle('active', n===1);
  document.getElementById('tab2').classList.toggle('active', n===2);
}

function setToggle(grupo, val){
  parteState[grupo] = val;
  if(grupo==='turno'){
    ['DIA','NOCHE'].forEach(v => document.getElementById('t'+v).classList.toggle('active', v===val));
  } else {
    ['A','B','C'].forEach(v => document.getElementById('g'+v).classList.toggle('active', v===val));
  }
}

function filtrarEquipos(){
  const tipo = document.getElementById('rpTipo').value;
  parteState.tipo = tipo;
  const sel = document.getElementById('rpCodigo');
  const eq = DB.equipos.filter(e => !tipo || e.tipo === tipo || e.nombre.toUpperCase().includes(tipo));
  sel.innerHTML = '<option value="">— Seleccionar —</option>' +
    eq.map(e=>`<option value="${e.id}">${e.codigo} – ${e.nombre}</option>`).join('');
  // Mostrar tab viajes si es volquete
  const tabV = document.getElementById('tab2');
  if(tabV) tabV.style.display = tipo==='VOLQUETE' ? 'block' : 'none';
}

function autoFillEquipo(){
  const id = +document.getElementById('rpCodigo').value;
  const eq = DB.equipos.find(e=>e.id===id);
  if(eq && eq.hr) document.getElementById('rpHrIni').value = eq.hr;
}

function filtrarFrentes(){
  const area = document.getElementById('rpArea').value;
  const todos = [...new Set(DB.partes.filter(p=>p.areaT===area).map(p=>p.frenteT).filter(Boolean))];
  const sel = document.getElementById('rpFrente');
  sel.innerHTML = '<option value="">— Seleccionar —</option>' + todos.map(f=>`<option>${f}</option>`).join('');
}

function calcHoras(){
  const ini = +document.getElementById('rpHrIni').value||0;
  const fin = +document.getElementById('rpHrFin').value||0;
  const diff = fin > ini ? (fin-ini).toFixed(1) : 0;
  document.getElementById('rpHrsTrab').value = diff;
}

function calcKm(){
  const ini = +document.getElementById('rpKmIni').value||0;
  const fin = +document.getElementById('rpKmFin').value||0;
  const diff = fin > ini ? fin-ini : 0;
  document.getElementById('rpKmRec').value = diff;
}

let viajeCount = 0;
function addViaje(){
  viajeCount++;
  const nombres = ['PRIMER','SEGUNDO','TERCER','CUARTO','QUINTO'];
  const n = Math.min(viajeCount, 5);
  const c = document.getElementById('viajesContainer');
  const div = document.createElement('div');
  div.className = 'viaje-block';
  div.id = 'viaje-'+viajeCount;
  div.innerHTML = `<div class="viaje-title">${nombres[n-1]} TRANSPORTE</div>
    <div class="fg-grid" style="grid-template-columns:1fr 1fr 1fr">
      <div class="fg"><label>Lugar de Traslado</label>
        <input id="vLugar${viajeCount}" list="lugaresData" placeholder="Destino...">
        <datalist id="lugaresData">
          ${[...new Set(DB.partes.flatMap(p=>p.viajes||[]).map(v=>v.lugar).filter(Boolean))].map(l=>`<option value="${l}">`).join('')}
        </datalist>
      </div>
      <div class="fg"><label>Cantidad</label><input id="vCant${viajeCount}" type="number" placeholder="0"></div>
      <div class="fg"><label>Material</label><input id="vMat${viajeCount}" placeholder="Tipo de material"></div>
    </div>`;
  c.appendChild(div);
}

function openReporte(tipo){
  currentReporteTipo = tipo;
  document.getElementById('mRepTtl').textContent = '📋 Parte Diario – '+tipo;
  parteState.tipo = tipo;
  viajeCount = 0;
  document.getElementById('viajesContainer').innerHTML = '';
  // Poblar áreas únicas
  const areas = [...new Set(DB.partes.map(p=>p.areaT).filter(Boolean))];
  if(areas.length === 0) areas.push('R3','NINGUNO');
  const selA = document.getElementById('rpArea');
  selA.innerHTML = '<option value="">— Seleccionar —</option>' + areas.map(a=>`<option>${a}</option>`).join('');
  // Filtrar equipos por tipo
  const selEq = document.getElementById('rpCodigo');
  const eqs = DB.equipos.filter(e=> tipo==='all' || e.tipo===tipo ||
    (tipo==='Línea Amarilla' && ['Línea Amarilla'].includes(e.tipo)) ||
    (tipo==='Línea Blanca' && e.tipo==='Línea Blanca') ||
    (tipo==='Vehículo Menor' && e.tipo==='Vehículo Menor') ||
    e.tipo.toUpperCase().includes(tipo.toUpperCase()));
  selEq.innerHTML = '<option value="">— Seleccionar —</option>' + eqs.map(e=>`<option value="${e.id}">${e.codigo} – ${e.nombre}</option>`).join('');
  // Operadores
  document.getElementById('rpOperador').innerHTML = DB.personal.filter(p=>p.est==='Activo').map(p=>`<option>${p.ape}, ${p.nom}</option>`).join('');
  // Tab viajes
  const tabV = document.getElementById('tab2');
  if(tabV) tabV.style.display = tipo==='Línea Blanca'||tipo==='VOLQUETE' ? 'block' : 'none';
  // Reset toggles
  setToggle('turno','DIA');
  setToggle('guardia','A');
  switchTab(1);
  openM('mReporte');
}
//REPORTE DE TRABAJO
async function gReporte(){
  const eqId  = +document.getElementById('rpCodigo').value;
  const fecha = document.getElementById('rpFecha').value;
  if(!eqId||!fecha){ toast('Seleccione equipo y fecha',true); return; }

  const eq = DB.equipos.find(e=>e.id===eqId);

  // VIAJES
  const viajes=[];
  for(let i=1;i<=viajeCount;i++){
    viajes.push({
      lugar:    document.getElementById('vLugar'+i)?.value||'',
      cant:    +document.getElementById('vCant'+i)?.value||0,
      material: document.getElementById('vMat'+i)?.value||''
    });
  }

  const parte = {
    tipoEquipo:    document.getElementById('rpTipo').value,
    codigoEquipo:  eq ? eq.codigo+' – '+eq.nombre : '',
    operador:      document.getElementById('rpOperador').value,
    fecha,
    turno:         parteState.turno,
    guardia:       parteState.guardia,
    condicion:     document.getElementById('rpCondicion').value,
    hrIni:        +document.getElementById('rpHrIni').value||0,
    hrFin:        +document.getElementById('rpHrFin').value||0,
    kmIni:        +document.getElementById('rpKmIni').value||0,
    kmFin:        +document.getElementById('rpKmFin').value||0,
    descuentos:   +document.getElementById('rpDescuentos').value||0,
    hrsInop:      +document.getElementById('rpHrsInop').value||0,
    areaT:         document.getElementById('rpArea').value,
    frenteT:       document.getElementById('rpFrente').value,
    actividades:   document.getElementById('rpDescripcion').value,
    observaciones: document.getElementById('rpObservaciones').value,
    nViajes:      +document.getElementById('rpNViajes').value||0,
    tiempoTrans:   document.getElementById('rpTiempoTrans').value,
    conclusion:    document.getElementById('rpConclusion').value,
    colaborador:   CU.nombre,
    viajes
  };

  // Mostrar guardando...
  toast('Guardando en data...');

  const result = await apiFetch('saveParte', parte);

  if(result.error){
    toast('Error: '+result.error, true);
    return;
  }

  // Actualizar horómetro local
  if(eq && parte.hrFin > eq.hr) eq.hr = parte.hrFin;

  // Guardar también en memoria local
  DB.partes.push({...parte, id:result.id, ef:parte.hrFin-parte.hrIni, im:parte.hrsInop, comb:0, act:parte.actividades, eqId});

  closeM('mReporte');
  viajeCount = 0;
  document.getElementById('viajesContainer').innerHTML='';

  const pg = lineaMap[currentReporteTipo];
  if(pg) renderPage(pg); else renderPage(AP);

  toast('✓ Parte #'+result.id+' guardado data');
}
function rLinea(tipo){
  const eqs=DB.equipos.filter(e=>e.tipo===tipo);
  const partes=DB.partes.filter(p=>eqs.some(e=>e.id===p.eqId));
  // map to right tbodies
  const tbMap={'Línea Amarilla':'tbLA','Línea Blanca':'tbLB','Vehículo Menor':'tbVM','Equipos Complementarios':'tbEC'};
  const tbPMap={'Línea Amarilla':'tbPartesLA','Línea Blanca':'tbPartesLB','Vehículo Menor':'tbSalidasVM'};
  const tb=document.getElementById(tbMap[tipo]);
  if(!tb)return;
  if(tipo==='Línea Amarilla'){
    tb.innerHTML=eqs.map(e=>`<tr><td class="mono" style="color:var(--ceq)">${e.codigo}</td><td><strong>${e.nombre}</strong></td><td><span class="badge b-cyan">${e.sub||'—'}</span></td><td>${bge(e.est)}</td><td class="mono">${fmtN(e.hr)} h</td><td class="mono">${e.ultMant||'—'}</td><td class="mono">${e.proxMant||'—'}</td><td><button class="btn btn-del btn-sm" onclick="del('equipos',${e.id})">🗑</button></td></tr>`).join('');
    const tbP=document.getElementById('tbPartesLA');
    if(tbP)tbP.innerHTML=partes.map(p=>{const eq=DB.equipos.find(x=>x.id===p.eqId);return`<tr><td class="mono">${p.fecha}</td><td>${eq?eq.codigo+' '+eq.nombre.split(' ')[1]:''}</td><td>${p.op}</td><td class="mono text-acc">${p.ef}h</td><td class="mono">${p.im}h</td><td class="mono">${p.comb} gal</td><td>${p.act}</td></tr>`;}).join('');
  }else if(tipo==='Línea Blanca'){
    tb.innerHTML=eqs.map(e=>`<tr><td class="mono" style="color:var(--ceq)">${e.codigo}</td><td><strong>${e.nombre}</strong></td><td class="mono">${e.placa||'—'}</td><td>${e.modelo||'—'}</td><td>${bge(e.est)}</td><td class="mono">${fmtN(e.hr)} km</td><td class="mono">${e.proxMant||'—'}</td><td><button class="btn btn-del btn-sm" onclick="del('equipos',${e.id})">🗑</button></td></tr>`).join('');
    const tbP=document.getElementById('tbPartesLB');
    if(tbP)tbP.innerHTML=partes.map(p=>{const eq=DB.equipos.find(x=>x.id===p.eqId);return`<tr><td class="mono">${p.fecha}</td><td>${eq?eq.codigo:''}</td><td>${p.op}</td><td class="mono tr">—</td><td class="mono tr">—</td><td class="mono tr">—</td><td class="mono tr">${p.comb} gal</td><td>${p.act}</td></tr>`;}).join('');
  }else if(tipo==='Vehículo Menor'){
    tb.innerHTML=eqs.map(e=>`<tr><td class="mono" style="color:var(--ceq)">${e.codigo}</td><td><strong>${e.nombre}</strong></td><td class="mono">${e.placa||'—'}</td><td><span class="badge b-cyan">${e.sub||'—'}</span></td><td>${bge(e.est)}</td><td class="mono">${fmtN(e.hr)} km</td><td class="mono">—</td><td><button class="btn btn-del btn-sm" onclick="del('equipos',${e.id})">🗑</button></td></tr>`).join('');
    const tbS=document.getElementById('tbSalidasVM');if(tbS)tbS.innerHTML='<tr><td colspan="8" class="text-muted" style="text-align:center;padding:1rem">Registre salidas usando ＋ Reporte Diario</td></tr>';
  }else{
    tb.innerHTML=eqs.map(e=>`<tr><td class="mono" style="color:var(--ceq)">${e.codigo}</td><td><strong>${e.nombre}</strong></td><td><span class="badge b-cyan">${e.sub||'—'}</span></td><td>${e.marca}</td><td>${e.modelo}</td><td>${bge(e.est)}</td><td class="mono">${fmtN(e.hr)} h</td><td><button class="btn btn-del btn-sm" onclick="del('equipos',${e.id})">🗑</button></td></tr>`).join('');
  }
}

// ══ PANEL HORAS ══
const HM_COLS=['Excavadora','Cargador Frontal','Motoniveladora','Retroexcavadora','Tractor Oruga','Rodillo'];
const HM_COLORS={'Excavadora':'#ef4444','Cargador Frontal':'#f97316','Motoniveladora':'#f59e0b','Retroexcavadora':'#10b981','Tractor Oruga':'#3b82f6','Rodillo':'#8b5cf6','Volquete':'#06b6d4'};
function rPanelHoras(){
  // Totals per equipo
  const totHs={};
  DB.partes.forEach(p=>{if(!totHs[p.eqId])totHs[p.eqId]={ef:0,im:0,comb:0};totHs[p.eqId].ef+=p.ef;totHs[p.eqId].im+=p.im;totHs[p.eqId].comb+=p.comb;});
  const totEf=Object.values(totHs).reduce((a,t)=>a+t.ef,0);
  document.getElementById('panelKpis').innerHTML=[{l:'Hs Totales Efectivas',v:fmtN(totEf)+'h',c:'var(--ceq)'},{l:'Equipos con Partes',v:Object.keys(totHs).length,c:'#10b981'},{l:'Total Combustible',v:DB.partes.reduce((a,p)=>a+p.comb,0)+' gal',c:'#f97316'}].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');

  // PANEL LA
  const laEqs=DB.equipos.filter(e=>e.tipo==='Línea Amarilla');
  document.getElementById('panelLA').innerHTML=laEqs.map(e=>{
    const t=totHs[e.id]||{ef:0,im:0,comb:0};
    const pct=Math.min(100,(t.ef/200*100));
    const col=HM_COLORS[e.sub]||'var(--ceq)';
    return`<div class="hm-card" style="--hmc:${col}">
      <div class="hm-equipo">${e.sub||e.nombre.split(' ')[0]}</div>
      <div style="font-size:.72rem;color:var(--muted2);margin-bottom:.5rem">${e.codigo} · ${e.nombre.split(' ').slice(0,3).join(' ')}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.4rem">
        <span style="font-family:'Barlow Condensed';font-size:1.6rem;font-weight:800;color:${col}">${fmtN(t.ef)}h</span>
        <span style="font-size:.68rem;color:var(--muted2)">/ 200h mín.</span>
      </div>
      <div class="prog-wrap"><div class="prog-bar" style="width:${pct}%;background:${col}"></div></div>
      <div class="hm-stat" style="margin-top:.5rem"><span>🛑 Impr: <strong>${t.im}h</strong></span></div>
      <div class="hm-stat"><span>⛽ Comb: <strong>${t.comb} gal</strong></span></div>
      <div style="margin-top:.4rem">${bge(e.est)}</div>
    </div>`;
  }).join('')||'<div class="text-muted" style="padding:1rem">No hay equipos de línea amarilla registrados.</div>';

  // PANEL LB (VOLQUETES)
  const lbEqs=DB.equipos.filter(e=>e.tipo==='Línea Blanca');
  document.getElementById('panelLB').innerHTML=lbEqs.map(e=>{
    const t=totHs[e.id]||{ef:0,im:0,comb:0};
    const col='#06b6d4';
    return`<div class="hm-card" style="--hmc:${col}">
      <div class="hm-equipo">Volquete</div>
      <div style="font-size:.72rem;color:var(--muted2);margin-bottom:.5rem">${e.codigo} · ${e.placa||''}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.4rem">
        <span style="font-family:'Barlow Condensed';font-size:1.6rem;font-weight:800;color:${col}">${fmtN(t.ef)}h</span>
        <span style="font-size:.68rem;color:var(--muted2)">/ 200h mín.</span>
      </div>
      <div class="prog-wrap"><div class="prog-bar" style="width:${Math.min(100,t.ef/200*100)}%;background:${col}"></div></div>
      <div class="hm-stat" style="margin-top:.5rem"><span>⛽ Comb: <strong>${t.comb} gal</strong></span></div>
      <div style="margin-top:.4rem">${bge(e.est)}</div>
    </div>`;
  }).join('')||'<div class="text-muted" style="padding:1rem">No hay volquetes registrados.</div>';

  // Detail table
  document.getElementById('tbPanelDet').innerHTML=DB.partes.map(p=>{
    const eq=DB.equipos.find(e=>e.id===p.eqId);
    return`<tr><td class="mono">${p.fecha}</td><td>${eq?eq.codigo+' '+eq.nombre.split(' ').slice(0,2).join(' '):'—'}</td><td>${eq?`<span class="badge b-cyan">${eq.sub||eq.tipo}</span>`:'—'}</td><td>${p.op}</td><td class="mono text-acc">${p.ef}h</td><td class="mono">${p.im}h</td><td class="mono">${p.comb} gal</td><td>${p.act}</td></tr>`;
  }).join('');
}

