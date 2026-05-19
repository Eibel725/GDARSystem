// ══ DASHBOARD ══
function rDash(){
  document.getElementById('dashSub').textContent=`Bienvenido, ${CU.nombre} · ${CU.cargo}`;
  const areas=CU.areas;
  const tF=DB.facturas.reduce((a,f)=>a+f.monto,0);
  const tC=DB.costos.reduce((a,c)=>a+c.monto,0);
  const kpis=[
    {l:'Personal Activo',v:DB.personal.filter(p=>p.est==='Activo').length,s:'Trabajadores',c:'#3b82f6',a:['administracion']},
    {l:'Equipos Operativos',v:`${DB.equipos.filter(e=>e.est==='Operativo').length}/${DB.equipos.length}`,s:'Flota activa',c:'#10b981',a:['controlEquipos','mantenimiento']},
    {l:'Facturado Total',v:fmt(tF),s:'Todas las facturas',c:'#a78bfa',a:['otros']},
    {l:'Costos del Mes',v:fmt(tC),s:'Egresos',c:'#ef4444',a:['otros']},
    {l:'Incidentes Abiertos',v:DB.incidentes.filter(i=>i.est!=='Cerrado').length,s:'Sin cerrar',c:'#ef4444',a:['seguridad']},
    {l:'Stock Items',v:Object.keys(getStock()).length,s:'Tipos en almacén',c:'#f97316',a:['almacenLogistica']},
    {l:'Mantenimientos OT',v:DB.mantenimientos.filter(m=>m.est!=='Completado').length,s:'Pendientes/en proceso',c:'#8b5cf6',a:['mantenimiento']},
    {l:'Actividades en Curso',v:DB.planner.filter(p=>p.est==='En Curso').length,s:'Del proyecto',c:'#10b981',a:['controlProyecto']},
  ].filter(k=>k.a.some(a=>areas.includes(a))||areas.length>3);
  document.getElementById('dashKpis').innerHTML=kpis.map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div><div class="kpi-sub">${k.s}</div></div>`).join('');

  let cards='';
  if(areas.includes('controlEquipos')||areas.includes('mantenimiento')||areas.length>3){
    cards+=`<div class="card"><div class="card-head"><span class="card-title">🚜 Estado de Flota</span></div><div class="card-body">
      ${DB.equipos.map(e=>`<div class="stat-row" style="margin-bottom:.4rem;padding:.4rem .6rem;background:var(--panel2);border-radius:5px;"><span class="mono" style="color:var(--muted2);font-size:.72rem">${e.codigo}</span><strong style="margin-left:.4rem;font-size:.78rem">${e.nombre.split(' ').slice(0,3).join(' ')}</strong><span style="margin-left:auto">${bge(e.est)}</span></div>`).join('')}
    </div></div>`;
  }
  if(areas.includes('seguridad')||areas.length>3){
    cards+=`<div class="card"><div class="card-head"><span class="card-title">⛑️ Últimos Eventos Seg.</span></div><div class="card-body">
      ${DB.incidentes.slice(-3).reverse().map(i=>`<div class="stat-row" style="margin-bottom:.5rem;padding:.4rem .6rem;background:var(--panel2);border-radius:5px;"><strong style="font-size:.78rem">${i.tipo}</strong> · <span style="font-size:.74rem">${i.area}</span><span style="margin-left:auto">${bge(i.sev)}</span></div>`).join('')}
    </div></div>`;
  }
  if(areas.includes('controlProyecto')||areas.length>3){
    cards+=`<div class="card"><div class="card-head"><span class="card-title">📈 Avance Actividades</span></div><div class="card-body">
      ${DB.planner.map(a=>`<div style="margin-bottom:.7rem"><div class="stat-row" style="margin-bottom:.3rem"><strong style="font-size:.78rem">${a.nom}</strong><span style="margin-left:auto;font-family:'Roboto Mono',monospace;font-size:.72rem;color:var(--ctl)">${a.av}%</span></div><div class="prog-wrap"><div class="prog-bar" style="width:${a.av}%;background:${a.av>=80?'var(--ctl)':a.av>=40?'var(--ope)':'var(--seg)'}"></div></div></div>`).join('')}
    </div></div>`;
  }
  if(areas.includes('almacenLogistica')||areas.length>3){
    const totComb=DB.combustible.reduce((a,c)=>a+c.gal*c.precio,0);
    cards+=`<div class="card"><div class="card-head"><span class="card-title">⛽ Combustible del Mes</span></div><div class="card-body">
      <div class="stat-row" style="margin-bottom:.5rem"><span>Total Galones</span><strong style="margin-left:auto">${DB.combustible.reduce((a,c)=>a+c.gal,0)} gal</strong></div>
      <div class="stat-row"><span>Costo Total</span><strong style="margin-left:auto;color:var(--alm)">${fmt(totComb)}</strong></div>
    </div></div>`;
  }
  // ── Panel usuarios en línea (solo Administrador General) ──
  if(CU.codigo==='ECOADMIN'){
    cards+=`<div class="card"><div class="card-head"><span class="card-title">🟢 Usuarios en Línea</span>
      <button class="btn btn-out btn-sm" onclick="cargarUsuariosOnline()" style="font-size:.63rem;padding:.18rem .5rem">↻ Actualizar</button>
    </div><div class="card-body" id="bodyOnline"><div style="color:var(--muted2);font-size:.78rem">Cargando...</div></div></div>`;
  }
  document.getElementById('dashCards').innerHTML=cards;
  if(CU.codigo==='ECOADMIN')cargarUsuariosOnline();
}

// ══ PERSONAL ══
function rPersonal(){
  document.getElementById('tbPersonal').innerHTML=DB.personal.map(p=>{
    const proy=p.proy?DB.proyectos.find(x=>x.codigo===p.proy):null;
    return`<tr>
    <td class="mono">${p.dni}</td><td><strong>${p.ape}, ${p.nom}</strong></td><td>${p.cargo}</td>
    <td><span class="badge b-blue">${p.cat}</span></td>
    <td>${proy?`<span class="mono" style="font-size:.73rem;color:#a78bfa">${proy.codigo}</span>`:'<span style="color:var(--muted)">—</span>'}</td>
    <td>${p.proc||'<span style="color:var(--muted)">—</span>'}</td>
    <td>${p.tipo?`<span class="badge" style="background:${p.tipo==='Staff'?'rgba(99,102,241,.2)':'rgba(16,185,129,.2)'};color:${p.tipo==='Staff'?'#818cf8':'#34d399'};border:1px solid ${p.tipo==='Staff'?'#818cf860':'#34d39960'}">${p.tipo}</span>`:'<span style="color:var(--muted)">—</span>'}</td>
    <td>${p.guardia?`<span class="badge" style="background:rgba(245,158,11,.15);color:#f59e0b;border:1px solid #f59e0b60">Grd. ${p.guardia}</span>`:'<span style="color:var(--muted)">—</span>'}</td>
    <td class="mono">${p.ing}</td>
    <td>${bge(p.est)}</td>
    <td style="max-width:160px;font-size:.75rem;color:var(--muted2)">${p.notas||'<span style="color:var(--muted)">—</span>'}</td>
    <td style="display:flex;gap:.3rem"><button class="btn btn-sm" style="background:rgba(245,158,11,.15);border:1px solid #f59e0b60;color:#f59e0b" onclick="openPersonalEdit(${p.id})">✏️</button><button class="btn btn-del btn-sm" onclick="del('personal',${p.id})">🗑</button></td>
  </tr>`;}).join('');
}
function _poblarProyPersonal(sel){
  sel.innerHTML='<option value="">— Sin proyecto —</option>'+DB.proyectos.map(p=>`<option value="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');
}
function openPersonalNew(){
  _editPersonalId=null;
  ['wDni','wApe','wNom','wCargo','wSue','wProc','wNotas'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('wCat').value='Operador A';
  document.getElementById('wTipo').value='';
  document.getElementById('wGuardia').value='';
  document.getElementById('wAsig').value='0';
  document.getElementById('wEst').value='Activo';
  document.getElementById('wIng').value=today();
  const ps=document.getElementById('wProy');if(ps){_poblarProyPersonal(ps);ps.value='';}
  document.querySelector('#mPersonal .mttl').textContent='Agregar Trabajador';
  openM('mPersonal');
}
function openPersonalEdit(id){
  const p=DB.personal.find(x=>x.id===id);if(!p)return;
  _editPersonalId=id;
  document.getElementById('wDni').value=p.dni||'';
  document.getElementById('wApe').value=p.ape||'';
  document.getElementById('wNom').value=p.nom||'';
  document.getElementById('wCargo').value=p.cargo||'';
  document.getElementById('wCat').value=p.cat||'Operador A';
  document.getElementById('wProc').value=p.proc||'';
  document.getElementById('wTipo').value=p.tipo||'';
  document.getElementById('wGuardia').value=p.guardia||'';
  document.getElementById('wIng').value=p.ing||'';
  document.getElementById('wSue').value=p.sue||'';
  document.getElementById('wAsig').value=p.asig!=null?String(p.asig):'0';
  document.getElementById('wEst').value=p.est||'Activo';
  document.getElementById('wNotas').value=p.notas||'';
  const ps=document.getElementById('wProy');if(ps){_poblarProyPersonal(ps);ps.value=p.proy||'';}
  document.querySelector('#mPersonal .mttl').textContent='Editar Trabajador';
  openM('mPersonal');
}
function gPersonal(){
  const dni=document.getElementById('wDni').value.trim(),nom=document.getElementById('wNom').value.trim();
  if(!dni||!nom){toast('Ingrese DNI y nombre',true);return;}
  const rec={dni,ape:document.getElementById('wApe').value,nom,cargo:document.getElementById('wCargo').value,cat:document.getElementById('wCat').value,proy:document.getElementById('wProy').value,proc:document.getElementById('wProc').value,tipo:document.getElementById('wTipo').value,guardia:document.getElementById('wGuardia').value,ing:document.getElementById('wIng').value,sue:+document.getElementById('wSue').value||0,asig:+document.getElementById('wAsig').value,est:document.getElementById('wEst').value,notas:document.getElementById('wNotas').value};
  if(_editPersonalId){
    const idx=DB.personal.findIndex(x=>x.id===_editPersonalId);
    if(idx>-1){Object.assign(DB.personal[idx],rec);syncSheet('savePersonal',DB.personal[idx]);}
    _editPersonalId=null;
    closeM('mPersonal');rPersonal();toast('Trabajador actualizado');
  }else{
    rec.id=nid('personal');
    DB.personal.push(rec);
    syncSheet('savePersonal',DB.personal[DB.personal.length-1]);
    closeM('mPersonal');rPersonal();toast('Trabajador registrado');
  }
}
// ══ ASISTENCIA / TAREAJE ══
let _html5QrScanner=null,_scannerCooldown=false;
let _manualAsiPersonalId=null,_manualAsiFecha=null;

async function rAsistencia(){
  const dateEl=document.getElementById('asiDate');
  if(!dateEl.value) dateEl.value=today();
  const fecha=dateEl.value;
  const guardia=document.getElementById('asiGuardia').value;
  await loadAsistenciaFecha(fecha);
  const trabajadores=DB.personal.filter(p=>p.est==='Activo'&&(!guardia||p.guardia===guardia));
  const registros=DB.asistencia.filter(a=>a.fecha===fecha);
  const presentes=registros.filter(a=>a.horaEntrada).length;
  const conSalida=registros.filter(a=>a.horaEntrada&&a.horaSalida).length;
  const enTurno=presentes-conSalida;
  const ausentes=trabajadores.length-presentes;
  document.getElementById('asiKpis').innerHTML=[
    {l:'Total Activos',v:trabajadores.length,c:'#3b82f6'},
    {l:'Presentes',v:presentes,c:'#10b981'},
    {l:'Ausentes',v:ausentes<0?0:ausentes,c:'#ef4444'},
    {l:'En Turno (sin salida)',v:enTurno,c:'#f59e0b'}
  ].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  document.getElementById('tbAsistencia').innerHTML=trabajadores.map(p=>{
    const reg=registros.find(a=>a.personalId===p.id);
    const entrada=reg?.horaEntrada||'';
    const salida=reg?.horaSalida||'';
    const horas=entrada&&salida?calcHoras(entrada,salida):'';
    const estadoBadge=!entrada
      ?'<span class="badge" style="background:rgba(239,68,68,.18);color:#ef4444;border:1px solid #ef444435">AUSENTE</span>'
      :!salida
        ?'<span class="badge" style="background:rgba(245,158,11,.18);color:#f59e0b;border:1px solid #f59e0b35">EN TURNO</span>'
        :'<span class="badge" style="background:rgba(16,185,129,.18);color:#10b981;border:1px solid #10b98135">COMPLETO</span>';
    const tipoBadge=p.tipo?`<span class="badge" style="background:${p.tipo==='Staff'?'rgba(99,102,241,.2)':'rgba(16,185,129,.2)'};color:${p.tipo==='Staff'?'#818cf8':'#34d399'};border:1px solid ${p.tipo==='Staff'?'#818cf860':'#34d39960'}">${p.tipo}</span>`:'<span style="color:var(--muted)">—</span>';
    const grdBadge=p.guardia?`<span class="badge" style="background:rgba(245,158,11,.15);color:#f59e0b;border:1px solid #f59e0b50">Grd.${p.guardia}</span>`:'<span style="color:var(--muted)">—</span>';
    return `<tr>
      <td class="mono">${p.dni}</td>
      <td><strong>${p.ape}, ${p.nom}</strong></td>
      <td>${tipoBadge}</td><td>${grdBadge}</td>
      <td class="mono" style="color:#10b981;font-weight:600">${entrada||'<span style="color:var(--muted)">—</span>'}</td>
      <td class="mono" style="color:#f59e0b;font-weight:600">${salida||'<span style="color:var(--muted)">—</span>'}</td>
      <td class="mono">${horas||'<span style="color:var(--muted)">—</span>'}</td>
      <td>${estadoBadge}</td>
      <td><button class="btn btn-sm" style="background:rgba(59,130,246,.15);border:1px solid #3b82f660;color:#60a5fa" onclick="registrarManualAsistencia(${p.id},'${fecha}')" title="Editar manualmente">✏️</button></td>
    </tr>`;
  }).join('');
}

function calcHoras(e,s){
  try{const[eh,em]=e.split(':').map(Number),[sh,sm]=s.split(':').map(Number);
  const m=(sh*60+sm)-(eh*60+em);if(m<=0)return '—';return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m';}catch{return '—';}
}

async function loadAsistenciaFecha(fecha){
  try{
    const{data,error}=await supa.from('asistencia').select('*').eq('fecha',fecha);
    if(!error&&data)DB.asistencia=data.map(toCamel);
  }catch(e){console.warn('[Asistencia]',e);}
}

// ── ESCÁNER QR ──
function openScanner(){
  document.getElementById('mScanner').classList.add('open');
  document.getElementById('scannerResult').style.display='none';
  setScannerStatus('Iniciando cámara... apunte al QR del fotocheck','wait');
  setTimeout(iniciarScanner,400);
}
function closeScanner(){
  if(_html5QrScanner){_html5QrScanner.stop().catch(()=>{});_html5QrScanner=null;}
  document.getElementById('mScanner').classList.remove('open');
}
function setScannerStatus(msg,type){
  const el=document.getElementById('scannerStatus');
  el.textContent=msg;el.className='scanner-status scanner-'+type;
}
function iniciarScanner(){
  if(typeof Html5Qrcode==='undefined'){setScannerStatus('Error: librería QR no cargada. Verifica tu conexión a internet.','err');return;}
  _html5QrScanner=new Html5Qrcode('qr-reader');
  _html5QrScanner.start(
    {facingMode:'environment'},
    {fps:10,qrbox:{width:240,height:240}},
    (decoded)=>{
      if(_scannerCooldown)return;
      _scannerCooldown=true;
      procesarQR(decoded);
      setTimeout(()=>{_scannerCooldown=false;},3000);
    },
    ()=>{}
  ).then(()=>{setScannerStatus('Listo — apunte al QR del fotocheck','wait');}
  ).catch(err=>{setScannerStatus('Error de cámara: '+err,'err');});
}
async function procesarQR(texto){
  const match=texto.match(/ECO-PERSONAL-(\d+)/);
  if(!match){setScannerStatus('⚠ QR no reconocido. Use los fotochecks del sistema.','err');return;}
  const pId=parseInt(match[1]);
  const p=DB.personal.find(x=>x.id===pId);
  if(!p){setScannerStatus('⚠ Trabajador no encontrado en el sistema.','err');return;}
  const fecha=today();
  const ahora=new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',hour12:false});
  await loadAsistenciaFecha(fecha);
  const existing=DB.asistencia.find(a=>a.personalId===pId&&a.fecha===fecha);
  let rec,accion;
  if(!existing){
    rec={personalId:pId,fecha,horaEntrada:ahora,horaSalida:'',guardia:p.guardia||'',estado:'Presente',registradoPor:CU.nombre,obs:''};
    const{data,error}=await supa.from('asistencia').insert(toSnake(rec)).select().single();
    if(!error&&data){rec.id=data.id;DB.asistencia.push(rec);}
    accion='✅ ENTRADA: '+ahora;
  }else if(!existing.horaSalida){
    existing.horaSalida=ahora;
    await supa.from('asistencia').update({hora_salida:ahora}).eq('id',existing.id);
    rec=existing;accion='🔴 SALIDA: '+ahora;
  }else{
    setScannerStatus(`${p.ape}, ${p.nom} — ya tiene jornada completa registrada`,'err');return;
  }
  setScannerStatus(`${p.ape}, ${p.nom} — ${accion}`,'ok');
  document.getElementById('scannerResult').style.display='block';
  document.getElementById('scannerResultName').textContent=`${p.ape}, ${p.nom}`;
  document.getElementById('scannerResultInfo').textContent=`${p.cargo} · DNI ${p.dni} · ${accion}`;
  if(AP==='asistencia')rAsistencia();
}

// ── FOTOCHECK QR ──
function openQRFotocheck(){
  const sel=document.getElementById('fotocheckSelect');
  sel.innerHTML='<option value="">— Seleccionar trabajador —</option>'+
    DB.personal.filter(p=>p.est==='Activo').map(p=>`<option value="${p.id}">${p.ape}, ${p.nom}</option>`).join('');
  document.getElementById('fotocheckDisplay').style.display='none';
  document.getElementById('fc-qr').innerHTML='';
  openM('mFotocheck');
}
function renderFotocheck(){
  const id=parseInt(document.getElementById('fotocheckSelect').value);
  if(!id){document.getElementById('fotocheckDisplay').style.display='none';return;}
  const p=DB.personal.find(x=>x.id===id);if(!p)return;
  document.getElementById('fotocheckDisplay').style.display='block';
  document.getElementById('fc-nombre').textContent=`${p.ape}, ${p.nom}`;
  document.getElementById('fc-cargo').textContent=p.cargo||'';
  document.getElementById('fc-dni').textContent='DNI: '+p.dni;
  document.getElementById('fc-guardia').textContent=(p.guardia?'Guardia '+p.guardia:'')+' '+(p.tipo||'');
  const qrDiv=document.getElementById('fc-qr');
  qrDiv.innerHTML='';
  if(typeof QRCode!=='undefined'){
    new QRCode(qrDiv,{text:'ECO-PERSONAL-'+p.id,width:160,height:160,colorDark:'#0a0a1a',colorLight:'#ffffff'});
  }
}
function imprimirFotocheck(){
  const card=document.getElementById('fotocheckCard').outerHTML;
  const win=window.open('','_blank');
  if(!win){toast('Active ventanas emergentes para imprimir',true);return;}
  const S='<'+'/';
  const css='body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;font-family:Arial,sans-serif}'
    +'.fotocheck-card{background:#fff;color:#0a0a1a;border-radius:12px;border:2px solid #1e3a6e;padding:1.4rem 1.2rem;text-align:center;width:200px;box-shadow:0 4px 16px #0003}'
    +'.fc-brand{font-size:.55rem;letter-spacing:.2em;color:#1e3a6e;text-transform:uppercase;font-weight:700;margin-bottom:.4rem}'
    +'.fc-nombre{font-weight:900;font-size:.9rem;margin-bottom:.15rem;color:#0a0a1a;line-height:1.2}'
    +'.fc-cargo{font-size:.65rem;color:#444;margin-bottom:.8rem}'
    +'.fc-dni{font-family:monospace;font-size:.72rem;margin-top:.5rem;color:#333}'
    +'.fc-guardia{font-size:.62rem;color:#666;margin-top:.2rem}'
    +'@media print{body{background:#fff}}';
  const html='<!DOCTYPE html><html><head><title>Fotocheck'+S+'title><style>'+css+S+'style>'+S+'head><body>'+card+S+'body>'+S+'html>';
  win.document.write(html);win.document.close();win.focus();
  setTimeout(function(){win.print();},400);
}

// ── REGISTRO MANUAL ──
function registrarManualAsistencia(personalId,fecha){
  _manualAsiPersonalId=personalId;_manualAsiFecha=fecha;
  const p=DB.personal.find(x=>x.id===personalId);
  const reg=DB.asistencia.find(a=>a.personalId===personalId&&a.fecha===fecha);
  document.getElementById('manAsiNombre').textContent=p?`${p.ape}, ${p.nom} — ${fecha}`:'';
  document.getElementById('manAsiEntrada').value=reg?.horaEntrada||'';
  document.getElementById('manAsiSalida').value=reg?.horaSalida||'';
  document.getElementById('manAsiObs').value=reg?.obs||'';
  openM('mManualAsi');
}
async function gManualAsi(){
  const entrada=document.getElementById('manAsiEntrada').value;
  const salida=document.getElementById('manAsiSalida').value;
  const obs=document.getElementById('manAsiObs').value;
  if(!entrada){toast('Ingrese hora de entrada',true);return;}
  const p=DB.personal.find(x=>x.id===_manualAsiPersonalId);
  const existing=DB.asistencia.find(a=>a.personalId===_manualAsiPersonalId&&a.fecha===_manualAsiFecha);
  if(existing){
    Object.assign(existing,{horaEntrada:entrada,horaSalida:salida,obs,registradoPor:CU.nombre});
    await supa.from('asistencia').update(toSnake(existing)).eq('id',existing.id);
  }else{
    const rec={personalId:_manualAsiPersonalId,fecha:_manualAsiFecha,horaEntrada:entrada,horaSalida:salida,guardia:p?.guardia||'',estado:'Presente',obs,registradoPor:CU.nombre};
    const{data}=await supa.from('asistencia').insert(toSnake(rec)).select().single();
    if(data){rec.id=data.id;DB.asistencia.push(rec);}
  }
  closeM('mManualAsi');rAsistencia();toast('Asistencia guardada');
}

// ── EXPORTAR PDF TAREAJE ──
function exportTareajePDF(){
  const fecha=document.getElementById('asiDate').value||today();
  const guardia=document.getElementById('asiGuardia').value;
  const trabajadores=DB.personal.filter(p=>p.est==='Activo'&&(!guardia||p.guardia===guardia));
  const rows=trabajadores.map(p=>{
    const reg=DB.asistencia.find(a=>a.personalId===p.id&&a.fecha===fecha);
    const entrada=reg?.horaEntrada||'—';
    const salida=reg?.horaSalida||'—';
    const horas=reg?.horaEntrada&&reg?.horaSalida?calcHoras(reg.horaEntrada,reg.horaSalida):'—';
    const estado=!reg?.horaEntrada?'AUSENTE':!reg?.horaSalida?'EN TURNO':'COMPLETO';
    const color=estado==='AUSENTE'?'#ef4444':estado==='EN TURNO'?'#f59e0b':'#059669';
    return '<tr><td>'+p.dni+'</td><td>'+p.ape+', '+p.nom+'</td><td>'+(p.tipo||'—')+'</td><td>'+(p.guardia?'Grd.'+p.guardia:'—')+'</td><td style="color:#059669;font-weight:600">'+entrada+'</td><td style="color:#d97706;font-weight:600">'+salida+'</td><td>'+horas+'</td><td style="color:'+color+';font-weight:700">'+estado+'</td><td style="height:28px;border-bottom:1px solid #ccc;min-width:80px"></td></tr>';
  }).join('');
  const presentes=DB.asistencia.filter(a=>a.fecha===fecha&&a.horaEntrada).length;
  const win=window.open('','_blank');
  if(!win){toast('Active ventanas emergentes para exportar PDF',true);return;}
  const S='<'+'/';
  const css='body{font-family:Arial,sans-serif;font-size:11px;padding:20px;color:#000}'
    +'.hdr{text-align:center;margin-bottom:12px;border-bottom:3px solid #1e3a6e;padding-bottom:8px}'
    +'h2{margin:0;font-size:15px;color:#1e3a6e}p{margin:3px 0;font-size:10px;color:#555}'
    +'table{width:100%;border-collapse:collapse}'
    +'th{background:#1e3a6e;color:#fff;padding:6px 4px;text-align:left;font-size:10px}'
    +'td{padding:5px 4px;border-bottom:1px solid #eee;font-size:10px}'
    +'tr:nth-child(even){background:#f9f9f9}'
    +'.footer{margin-top:16px;font-size:9px;color:#888;text-align:right}'
    +'@media print{button{display:none}}';
  let body='<div class="hdr"><h2>ECOSERMO — CONTROL DE ASISTENCIA / TAREAJE</h2>';
  body+='<p>Fecha: <strong>'+fecha+'</strong>'+(guardia?' · Guardia: '+guardia:'')+' · Generado por: '+CU.nombre+' · Presentes: '+presentes+'/'+trabajadores.length+'</p></div>';
  body+='<table><thead><tr><th>DNI</th><th>Apellidos y Nombres</th><th>Tipo</th><th>Guardia</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th><th>Firma / V°B°</th></tr></thead>';
  body+='<tbody>'+rows+'</tbody></table>';
  body+='<div class="footer">ECOSERMO · Sistema de Gestion Operativa</div>';
  const html='<!DOCTYPE html><html><head><meta charset=utf-8><title>Tareaje '+fecha+S+'title><style>'+css+S+'style>'+S+'head><body>'+body+S+'body>'+S+'html>';
  win.document.write(html);win.document.close();win.focus();
  setTimeout(function(){win.print();},400);
}

function genPlanilla(){
  const mes=+document.getElementById('plMes').value,anio=document.getElementById('plAnio').value;
  const mn=['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('planillaTtl').textContent=`Planilla ${mn[mes]} ${anio}`;
  const act=DB.personal.filter(p=>p.est==='Activo');
  let tB=0,tD=0,tN=0;
  document.getElementById('tbPlanilla').innerHTML=act.map((p,i)=>{
    const asig=p.asig?113.0:0,bon=p.sue*.05,bruto=p.sue+asig+bon,desc=bruto*.13,neto=bruto-desc;
    tB+=bruto;tD+=desc;tN+=neto;
    return`<tr><td>${i+1}</td><td><strong>${p.ape}, ${p.nom}</strong></td><td>${p.cargo}</td><td class="tr mono">${fmt(p.sue)}</td><td class="tr mono">${asig?fmt(asig):'—'}</td><td class="tr mono">${fmt(bon)}</td><td class="tr mono text-acc"><strong>${fmt(bruto)}</strong></td><td class="tr mono text-red">${fmt(desc)}</td><td class="tr mono text-green"><strong>${fmt(neto)}</strong></td></tr>`;
  }).join('');
  document.getElementById('tfPlanilla').innerHTML=`<tr style="background:var(--panel2);font-weight:700"><td colspan="6" class="tr" style="color:var(--muted2);font-family:'Barlow Condensed',sans-serif;letter-spacing:.1em">TOTALES</td><td class="tr mono text-acc">${fmt(tB)}</td><td class="tr mono text-red">${fmt(tD)}</td><td class="tr mono text-green">${fmt(tN)}</td></tr>`;
  document.getElementById('planillaCard').style.display='block';
}

// ══ BIENESTAR ══
function rSocial(){document.getElementById('tbSocial').innerHTML=DB.social.map(r=>`<tr><td class="mono">${r.fecha}</td><td>${r.trab}</td><td><span class="badge b-pink">${r.tipo}</span></td><td>${r.desc}</td><td>${r.deriv}</td><td>${bge(r.est)}</td><td><button class="btn btn-del btn-sm" onclick="del('social',${r.id})">🗑</button></td></tr>`).join('');}
function gSocial(){DB.social.push({id:nid('social'),fecha:document.getElementById('soF').value||today(),trab:document.getElementById('soT').value,tipo:document.getElementById('soTi').value,desc:document.getElementById('soD').value,deriv:document.getElementById('soDr').value,est:document.getElementById('soE').value});syncSheet('saveSocial',DB.social[DB.social.length-1]);closeM('mSocial');rSocial();toast('Atención registrada');}

function rResidencia(){
  const ocu=DB.residencia.filter(r=>r.est==='Ocupado').length,tot=DB.residencia.length;
  document.getElementById('resKpis').innerHTML=[{l:'Total Hab.',v:tot,c:'#3b82f6'},{l:'Ocupadas',v:ocu,c:'#f59e0b'},{l:'Disponibles',v:tot-ocu,c:'#10b981'}].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  document.getElementById('tbResidencia').innerHTML=DB.residencia.map(r=>`<tr><td class="mono" style="color:var(--bsw);font-weight:700">Hab.${r.hab}</td><td>${r.trab||'<span class="text-muted">—</span>'}</td><td>${r.area||'—'}</td><td class="mono">${r.ing||'—'}</td><td class="mono">${r.sal||'—'}</td><td>${bge(r.est)}</td><td>${r.est==='Ocupado'?`<button class="btn btn-del btn-sm" onclick="libHab(${r.id})">↩ Liberar</button>`:''}</td></tr>`).join('');
}
function gResidencia(){const h=document.getElementById('rH').value.trim();if(!h){toast('Ingrese N° habitación',true);return;}DB.residencia.push({id:nid('res'),hab:h,trab:document.getElementById('rT').value,area:document.getElementById('rA').value,ing:document.getElementById('rI').value||today(),sal:document.getElementById('rS').value,est:'Ocupado'});syncSheet('saveResidencia',DB.residencia[DB.residencia.length-1]);closeM('mResidencia');rResidencia();toast('Habitación asignada');}
function libHab(id){const r=DB.residencia.find(x=>x.id===id);if(r){Object.assign(r,{est:'Disponible',trab:'',area:'',ing:'',sal:''});syncSheet('saveResidencia',r);}rResidencia();toast('Habitación liberada');}

function rAli(){
  const t=DB.alimentacion.length;
  document.getElementById('aliKpis').innerHTML=[{l:'Registros del Mes',v:t,c:'#ec4899'},{l:'Desayunos',v:DB.alimentacion.filter(a=>a.des==='✔ Sí').length,c:'#f59e0b'},{l:'Almuerzos',v:DB.alimentacion.filter(a=>a.alm==='✔ Sí').length,c:'#10b981'}].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val">${k.v}</div></div>`).join('');
  document.getElementById('tbAli').innerHTML=DB.alimentacion.map(r=>`<tr><td class="mono">${r.fecha}</td><td><span class="badge b-blue">${r.turno}</span></td><td>${r.trab}</td><td>${r.area}</td><td>${r.des==='✔ Sí'?'<span class="badge b-green">✔ Sí</span>':'<span class="badge b-red">✘ No</span>'}</td><td>${r.alm==='✔ Sí'?'<span class="badge b-green">✔ Sí</span>':'<span class="badge b-red">✘ No</span>'}</td><td>${r.cen==='✔ Sí'?'<span class="badge b-green">✔ Sí</span>':'<span class="badge b-red">✘ No</span>'}</td><td>${r.obs||'—'}</td><td><button class="btn btn-del btn-sm" onclick="del('alimentacion',${r.id})">🗑</button></td></tr>`).join('');
}
function gAli(){DB.alimentacion.push({id:nid('ali'),fecha:document.getElementById('alF').value||today(),turno:document.getElementById('alTu').value,trab:document.getElementById('alT').value,area:document.getElementById('alA').value,des:document.getElementById('alD').value,alm:document.getElementById('alAl').value,cen:document.getElementById('alC').value,obs:document.getElementById('alO').value});syncSheet('saveAlimentacion',DB.alimentacion[DB.alimentacion.length-1]);closeM('mAli');rAli();toast('Alimentación registrada');}

function rHosp(){document.getElementById('tbHosp').innerHTML=DB.hospedaje.map(r=>`<tr><td class="mono">${r.fecha}</td><td>${r.trab}</td><td>${r.estab}</td><td class="mono tr">${r.noches} noc.</td><td class="mono tr">${fmt(r.costo)}</td><td>${bge(r.tipoCosto)}</td><td>${bge(r.est)}</td><td><button class="btn btn-del btn-sm" onclick="del('hospedaje',${r.id})">🗑</button></td></tr>`).join('');}
function gHosp(){DB.hospedaje.push({id:nid('hosp'),fecha:document.getElementById('hF').value||today(),trab:document.getElementById('hT').value,estab:document.getElementById('hEs').value,noches:+document.getElementById('hN').value||1,costo:+document.getElementById('hC').value||0,tipoCosto:document.getElementById('hTc').value,est:document.getElementById('hE').value});syncSheet('saveHospedaje',DB.hospedaje[DB.hospedaje.length-1]);closeM('mHosp');rHosp();toast('Hospedaje registrado');}

function rLav(){document.getElementById('tbLav').innerHTML=DB.lavanderia.map(r=>`<tr><td class="mono">${r.fecha}</td><td>${r.trab}</td><td><span class="badge b-blue">${r.prendas}</span></td><td class="mono tr">${r.cant}</td><td class="mono">${r.fEnt}</td><td>${bge(r.est)}</td><td><button class="btn btn-del btn-sm" onclick="del('lavanderia',${r.id})">🗑</button></td></tr>`).join('');}
function gLav(){DB.lavanderia.push({id:nid('lav'),fecha:document.getElementById('lvF').value||today(),trab:document.getElementById('lvT').value,prendas:document.getElementById('lvP').value,cant:+document.getElementById('lvC').value||1,fEnt:document.getElementById('lvFE').value,est:document.getElementById('lvE').value});syncSheet('saveLavanderia',DB.lavanderia[DB.lavanderia.length-1]);closeM('mLav');rLav();toast('Lavandería registrada');}

