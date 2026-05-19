// ══ UTILS ══
const fmt=n=>'S/ '+Number(n).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtN=n=>Number(n).toLocaleString('es-PE',{minimumFractionDigits:1,maximumFractionDigits:1});
const today=()=>new Date().toISOString().split('T')[0];
const nid=k=>DB.nx[k]++;
function toast(m,e=false){const t=document.getElementById('toast');t.textContent=(e?'✗ ':'✔ ')+m;t.className='show'+(e?' err':'');setTimeout(()=>t.className='',2500);}
function openM(id){document.getElementById(id).classList.add('open');refreshSelects();}
function closeM(id){document.getElementById(id).classList.remove('open');}

function bge(e){
  const m={'Activo':'b-green','Operativo':'b-green','Pagada':'b-green','Conforme':'b-green','Resuelto':'b-green','Completado':'b-green','Levantado':'b-green','Cerrado':'b-green','Entregado':'b-green','Finalizado':'b-green',
    'En Mantenimiento':'b-yellow','De Permiso':'b-yellow','Enviada':'b-yellow','En Proceso':'b-yellow','En Curso':'b-yellow','Investigando':'b-yellow','Activo':'b-green','Reportado':'b-yellow','Programado':'b-blue','En Lavado':'b-yellow',
    'Pendiente':'b-yellow','Disponible':'b-cyan','Derivado':'b-blue','Recibido':'b-blue',
    'Parado':'b-red','Inactivo':'b-red','Observada':'b-red','No Conforme':'b-red','Grave':'b-red','Crítico':'b-red','Retrasado':'b-red','Observado':'b-yellow','Leve':'b-yellow','Moderado':'b-yellow','Vencido':'b-red','Inoperativo':'b-red','Postergado':'b-red',
    'Normal':'b-cyan','Urgente':'b-yellow','Muy Urgente':'b-red',
    'Atendido':'b-green','Atendido Parcial':'b-yellow','Anulado':'b-red',
    'Verificado':'b-cyan','Recibido':'b-blue','Pagado':'b-green','Factura':'b-orange','Boleta de Venta':'b-purple','Nota de Débito':'b-yellow','Nota de Crédito':'b-teal',
    'Costo Directo':'b-orange','Costo Indirecto':'b-purple','Reembolsable':'b-teal','Costo de Terceros':'b-blue'};
  return`<span class="badge ${m[e]||'b-blue'}">${e}</span>`;
}

function flt(inp,tid){
  const v=inp.value.toLowerCase();
  const tb=document.getElementById(tid);if(!tb)return;
  Array.from(tb.rows).forEach(r=>r.style.display=r.textContent.toLowerCase().includes(v)?'':'none');
}

// ══ SELECTS REFRESH ══
function refreshSelects(){
  const trabList=DB.personal.filter(p=>p.est==='Activo').map(p=>`<option>${p.ape}, ${p.nom}</option>`).join('');
  const eqList=DB.equipos.map(e=>`<option value="${e.id}">${e.codigo} – ${e.nombre.split(' ').slice(0,3).join(' ')}</option>`).join('');
  const eqListOpt='<option value="">— Ninguno —</option>'+eqList;
  const mecList=DB.personal.filter(p=>p.cat==='Mecánico'||p.cargo.toLowerCase().includes('mecán')).map(p=>`<option>${p.ape}, ${p.nom}</option>`).join('')||trabList;
  const persItemList=DB.personal.map(p=>`<option>${p.ape}, ${p.nom}</option>`).join('');
  const eqNomList=DB.equipos.map(e=>`<option>${e.codigo} – ${e.nombre}</option>`).join('');
  const allPersEq=persItemList+'<optgroup label="──Equipos──">'+eqNomList+'</optgroup>';
  // stock items for salida
  const stock=getStock();
  const stockOpts=Object.entries(stock).map(([cod,v])=>`<option value="${cod}">${cod} – ${v.nombre} (Stock: ${fmtN(v.stock)} ${v.unidad})</option>`).join('');

  const frenteOpts=DB.frentesTrabajo.map(f=>`<option>${f.nombre}</option>`).join('');
  const areaOpts='<option>Operaciones</option><option>Seguridad</option><option>Mantenimiento</option><option>Administración</option><option>Control de Proyectos</option><option>Almacén y Logística</option><option>Bienestar Social</option><option>Otros</option>';//+DB.frentesTrabajo.map(f=>`<option>${f.nombre}</option>`).join('')
  const reqOpts='<option value="">— Sin Requerimiento —</option>'+DB.requerimientos.map(r=>`<option value="${r.id}">[${r.est}] ${r.num} – ${r.solicitante}</option>`).join('');

  [['soT',trabList],['rT',trabList],['alT',trabList],['hT',trabList],['lvT',trabList],
   ['inTr',trabList],['ptR',trabList],['suS',trabList],['acRe',trabList],
   ['otEq',eqList],['otMec',mecList],['cbEq',eqList],['cbOp',trabList],
   ['coEq',eqListOpt],['rpEq',eqList],['rpOp',trabList],
   ['aePers',trabList],['asPers',allPersEq],['smPers',allPersEq],['emPers',trabList],
   ['asItem',stockOpts],
   ['rqSol',trabList],['rqArea',areaOpts],
   ['fpReq',reqOpts]
  ].forEach(([id,html])=>{const el=document.getElementById(id);if(el)el.innerHTML=html;});
}

// ══ DEMO CHIPS ══
function buildDemos(){
  const demos=[
    {c:'ECOADMIN00000001',l:'Administrador',s:'Acceso Total'},
    {c:'ECOADM87654321',l:'Carmen Salazar',s:'Administración'},
    {c:'ECOBSW11112222',l:'María Torres',s:'Bienestar Social'},
    {c:'ECOALM33334444',l:'Zein Alcedo',s:'Almacén y Logística'},
    {c:'ECOSEG12345678',l:'Pablo Quispe',s:'Seguridad'},
    {c:'ECOMEC55556666',l:'Roberto Yauri',s:'Mantenimiento'},
    {c:'ECOCTL99887766',l:'Marco Valdivia',s:'Control Proy./Equipos'},
    {c:'ECOOTRO55667788',l:'Ana García',s:'Otros'},
  ];
  const demoEl=document.getElementById('demoChips');if(!demoEl)return;
  demoEl.innerHTML=demos.map(d=>`
    <div class="demo-chip" onclick="autoLogin('${d.c}')">
      <span class="demo-code">${d.c}</span>
      <span class="demo-name">${d.l}</span>
      <span class="demo-area">${d.s}</span>
    </div>`).join('');
}
function autoLogin(c){document.getElementById('loginCodigo').value=c;doLogin();}

// ══ AUTH ══
function doLogin(){
  const raw=document.getElementById('loginCodigo').value.trim().toUpperCase();
  const err=document.getElementById('loginErr');
  err.style.display='none';
  const u=USERS.find(u=>raw===(u.codigo+u.dni).toUpperCase());
  if(!u){err.style.display='block';return;}
  CU=u;launchApp();
}
function doLogout(){
  cerrarSesion();
  CU=null;
  document.getElementById('appShell').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('loginCodigo').value='';
}

// ══ SESIONES EN LÍNEA ══
let _sesionId=null,_heartbeatIv=null;
async function registrarSesion(){
  if(!supa||!CU)return;
  try{
    const{data,error}=await supa.from('sesiones').insert({
      usuario:CU.nombre,cargo:CU.cargo,codigo:CU.codigo,
      online:true,login_at:new Date().toISOString(),last_seen:new Date().toISOString()
    }).select();
    if(!error&&data&&data[0]){_sesionId=data[0].id;}
    _heartbeatIv=setInterval(async()=>{
      if(!supa||!_sesionId)return;
      await supa.from('sesiones').update({last_seen:new Date().toISOString()}).eq('id',_sesionId);
    },120000);
  }catch(e){console.warn('[Sesión]',e);}
}
async function cerrarSesion(){
  if(_heartbeatIv){clearInterval(_heartbeatIv);_heartbeatIv=null;}
  if(!supa||!_sesionId)return;
  try{await supa.from('sesiones').update({online:false,last_seen:new Date().toISOString()}).eq('id',_sesionId);}catch(e){}
  _sesionId=null;
}
async function cargarUsuariosOnline(){
  const body=document.getElementById('bodyOnline');if(!body||!supa)return;
  body.innerHTML='<div style="color:var(--muted2);font-size:.78rem;padding:.3rem 0">Cargando...</div>';
  try{
    const corte=new Date(Date.now()-4*60*1000).toISOString();
    const{data,error}=await supa.from('sesiones').select('usuario,cargo,login_at,last_seen,online').eq('online',true).gte('last_seen',corte).order('last_seen',{ascending:false});
    if(error||!data){body.innerHTML='<div style="color:var(--seg);font-size:.75rem">Error al cargar sesiones.</div>';return;}
    const ahora=new Date();
    const rows=data.map(s=>{
      const hora=new Date(s.login_at).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
      return`<div style="display:flex;align-items:center;gap:.6rem;padding:.42rem .6rem;background:var(--panel2);border-radius:6px;margin-bottom:.3rem;border-left:3px solid #10b981">
        <span style="font-size:.85rem">🟢</span>
        <div style="flex:1"><div style="font-size:.78rem;font-weight:600">${s.usuario}</div><div style="font-size:.63rem;color:var(--muted2)">${s.cargo}</div></div>
        <div style="font-size:.65rem;color:#10b981;text-align:right">desde las ${hora}</div>
      </div>`;
    });
    body.innerHTML=rows.length?rows.join(''):'<div style="color:var(--muted2);font-size:.78rem;padding:.3rem 0">Sin sesiones registradas aún.</div>';
  }catch(e){body.innerHTML='<div style="color:var(--seg);font-size:.75rem">Error de conexión.</div>';}
}

// ══ LAUNCH ══
function launchApp(){
  document.getElementById('loginScreen').style.display='none';
  const app=document.getElementById('appShell');
  app.style.display='flex';
  const a1=AREAS[CU.areas[0]];
  const multi=CU.areas.length>1;
  const lbl=document.getElementById('hArea');
  lbl.textContent=multi?'Acceso General':a1.label.toUpperCase();
  const c=multi?'#f59e0b':a1.color;
  lbl.style.cssText=`color:${c};border-color:${c}40;background:${c}15;`;
  document.getElementById('hDot').style.background=multi?'#f59e0b':a1.color;
  document.getElementById('hHex').style.background=multi?'#f59e0b':a1.color;
  document.getElementById('hName').textContent=CU.nombre;
  document.getElementById('hRole').textContent=CU.cargo;
  buildSidebar();
  startClock();
  setPage('dashboard');
  loadSheetsData();
  registrarSesion();
}

// ══ SIDEBAR ══
function buildSidebar(){
const nav = document.getElementById('sideNav');
  let h = `<div class="nav-dash active" id="nd-dashboard" onclick="setPage('dashboard')">
    <span style="font-size:.9rem">📊</span> Panel General
  </div>`;

  // CU.modules (opcional): array de keys de módulos permitidos; null = sin restricción
  const allowedMods = CU.modules || null;

  CU.areas.forEach(ak => {
    const a = AREAS[ak];
    let modsHtml = '';

    a.modules.forEach(m => {
      if(m.isSubgroup){
        // Filtrar hijos si hay restricción
        const visibleChildren = m.children.filter(c => !allowedMods || allowedMods.includes(c.key));
        if(allowedMods && visibleChildren.length === 0) return;
        const children = visibleChildren.map(c =>
          `<div class="nav-submod" id="nm-${c.key}" style="--nc:${a.color}" onclick="setPage('${c.key}')">
            <span style="font-size:.78rem">${c.icon}</span>${c.label}
          </div>`
        ).join('');
        modsHtml += `
          <div class="nav-subgroup-wrap" id="nsg-${m.key}">
            <div class="nav-subgroup-head" onclick="toggleSubgroup('${m.key}')">
              <span style="font-size:.82rem">${m.icon}</span>
              <span>${m.label}</span>
              <span class="nav-subgroup-head-chev">▶</span>
            </div>
            <div class="nav-submods">${children}</div>
          </div>`;
      } else {
        // Módulo normal: omitir si hay restricción y no está en la lista
        if(allowedMods && !allowedMods.includes(m.key)) return;
        modsHtml += `
          <div class="nav-mod" id="nm-${m.key}" style="--nc:${a.color}" onclick="setPage('${m.key}')">
            <span class="nav-mod-icon">${m.icon}</span>${m.label}
          </div>`;
      }
    });

    h += `
      <div class="nav-area-wrap open" id="na-${ak}">
        <div class="nav-ah" onclick="toggleArea('${ak}')" style="color:${a.color}">
          <span class="nav-ah-icon">${a.icon}</span>
          <span class="nav-ah-name">${a.label}</span>
          <span class="nav-ah-chev">▶</span>
        </div>
        <div class="nav-mods">${modsHtml}</div>
      </div>`;
  });

  nav.innerHTML = h;
}
function toggleArea(k){document.getElementById('na-'+k)?.classList.toggle('open');}
function toggleSubgroup(k){
  document.getElementById('nsg-'+k)?.classList.toggle('open');
}

// ══ PAGE NAV ══
function setPage(k){
  AP=k;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+k)?.classList.add('active');
  document.querySelectorAll('.nav-dash,.nav-mod').forEach(el=>el.classList.remove('active'));
  (document.getElementById('nd-'+k)||document.getElementById('nm-'+k))?.classList.add('active');
  renderPage(k);
}
function renderPage(k){
  const m={dashboard:rDash,personal:rPersonal,asistencia:rAsistencia,planilla:()=>{},asistentaSocial:rSocial,residencia:rResidencia,alimentacion:rAli,hospedaje:rHosp,lavanderia:rLav,almacen:rAlm,combustible:rComb,proyectos:rProyectos,requerimientos:rReq,materiales:rMateriales,facturasPago:rFPago,supervision:rSuper,seguridad:rSeg,medioAmbiente:rAmb,masterEquipos:rMaster,programacionEquipos:rProg,auxiliosMecanicos:rAuxMec,engraseEquipos:rEngrase,tareaje:rTareaje,planner:rPlanner,lineaAmarilla:()=>rLinea('Línea Amarilla'),lineaBlanca:()=>rLinea('Línea Blanca'),vehiculosMenores:()=>rLinea('Vehículo Menor'),equiposComplementarios:()=>rLinea('Equipos Complementarios'),panelHoras:rPanelHoras,frentesTrabajo:rFrentes,tipoMaterial:rTipoMaterial,tramos:rTramos,facturacion:rFact,costos:rCostos};
  if(m[k])m[k]();
}

// ══ CLOCK ══
function startClock(){
  const u=()=>document.getElementById('hDate').textContent=new Date().toLocaleDateString('es-PE',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase()+' · '+new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
  u();setInterval(u,30000);
}

