// ══ AREAS CONFIG ══
const AREAS={
  administracion:{label:'Administración',icon:'🏢',color:'#3b82f6',prefix:'ECOADM',
    modules:[{key:'personal',label:'Personal / RR.HH.',icon:'👷'},{key:'asistencia',label:'Asistencia / Tareaje',icon:'✅'},{key:'planilla',label:'Planilla',icon:'💵'},{key:'tareaje',label:'Tareaje Mensual',icon:'📋'}]},
  bienestarSocial:{label:'Bienestar Social',icon:'🤝',color:'#ec4899',prefix:'ECOBSW',
    modules:[{key:'asistentaSocial',label:'Asistenta Social',icon:'💼'},{key:'residencia',label:'Residencia',icon:'🏠'},{key:'alimentacion',label:'Alimentación',icon:'🍽️'},{key:'hospedaje',label:'Hospedaje',icon:'🛏️'},{key:'lavanderia',label:'Lavandería',icon:'👕'}]},
  almacenLogistica:{label:'Almacén y Logística',icon:'📦',color:'#f97316',prefix:'ECOALM',
    modules:[{key:'proyectos',label:'Proyectos',icon:'🏗️'},{key:'almacen',label:'Kardex / Almacén',icon:'📋'},{key:'combustible',label:'Combustible',icon:'⛽'},{key:'requerimientos',label:'Requerimientos',icon:'📝'},{key:'materiales',label:'Materiales',icon:'🏗️'},{key:'facturasPago',label:'Facturas / Boletas',icon:'🧾'}]},
  operaciones:{label:'Operaciones',icon:'⚙️',color:'#f59e0b',prefix:'ECOOPE',
    modules:[{key:'supervision',label:'Supervisión',icon:'🔍'}]},
  seguridad:{label:'Seguridad',icon:'🛡️',color:'#ef4444',prefix:'ECOSEG',
    modules:[{key:'seguridad',label:'Seguridad',icon:'⛑️'},{key:'medioAmbiente',label:'Medio Ambiente',icon:'🌿'}]},
  mantenimiento:{label:'Mantenimiento Mecánico',icon:'🔧',color:'#8b5cf6',prefix:'ECOMEC',
    modules:[{key:'masterEquipos',label:'Máster de Equipos',icon:'🗂️'},{key:'programacionEquipos',label:'Programación',icon:'📅'},{key:'auxiliosMecanicos',label:'Auxilios Mecánicos',icon:'🚨'},{key:'engraseEquipos',label:'Engrase Mensual',icon:'🛢️'}]},
  controlProyecto:{label:'Control de Proyecto',icon:'📊',color:'#10b981',prefix:'ECOCTL',
    modules:[{key:'planner',label:'Planner',icon:'📈'}]},
    //-Menu para control de equipos.
  controlEquipos:{label:'Control de Equipos',icon:'🚜',color:'#06b6d4',prefix:'ECOCEQ',
    modules:[{key:'lineaAmarilla',label:'Línea Amarilla',icon:'🟡'},{key:'lineaBlanca',label:'Línea Blanca',icon:'⚪'},{key:'vehiculosMenores',label:'Vehículos Menores',icon:'🚗'},{key:'equiposComplementarios',label:'Complementarios',icon:'🔩'},{key:'panelHoras',label:'Panel Horas Máq.',icon:'⏱️'},{
              key:'dataIngresos', label:'Data de Ingresos', icon:'🗄️', isSubgroup: true,
              children:[
                {key:'frentesTrabajo', label:'Frentes de Trabajo', icon:'📍'},
                {key:'tipoMaterial',   label:'Tipo de Material',   icon:'🪨'},
                {key:'tramos',         label:'Tramos',              icon:'🗺️'}
                      ]
            }]},
  otros:{label:'Otros',icon:'📁',color:'#a78bfa',prefix:'ECOOTRO',
    modules:[{key:'facturacion',label:'Facturación',icon:'🧾'},{key:'costos',label:'Costos',icon:'💰'}]}
};

// ══ USERS ══
const USERS=[
  {codigo:'EIBEL25',dni:'46108109',nombre:'Abel Rodriguez A.',cargo:'PCO',areas:Object.keys(AREAS)},
  {codigo:'ECOADM',dni:'11111111',nombre:'Usuario General',cargo:'General',areas:Object.keys(AREAS)},
  {codigo:'ECOADM',dni:'87654321',nombre:'Omar Silva Santa Cruz',cargo:'Administrador',areas:['administracion']},
  {codigo:'NOHPAL',dni:'73890744',nombre:'Nohelia Palomino',cargo:'Asist. Administración',areas:['administracion']},
  {codigo:'ECOBSW',dni:'11112222',nombre:'María Torres Díaz',cargo:'Asistenta Social',areas:['bienestarSocial']},
  {codigo:'FLOBEN',dni:'10199407',nombre:'Flor Benites',cargo:'Jefe de Seguridad',areas:['almacenLogistica','seguridad']},
  {codigo:'ECOALM',dni:'11112222',nombre:'Logistica Central',cargo:'Ecosermo',areas:['almacenLogistica'],modules:['requerimientos','facturasPago']},
  {codigo:'ANDMAR',dni:'10199407',nombre:'Andres Martines',cargo:'Ing. Residente',areas:['almacenLogistica','administracion']},
  {codigo:'YONMEL',dni:'43616432',nombre:'Yonder Melendrez',cargo:'Supervisor de Almacén',areas:['almacenLogistica']},
  {codigo:'ECOOPE',dni:'11223344',nombre:'Luis Flores Cóndor',cargo:'Residente de Obra',areas:['operaciones']},
  {codigo:'ECOSEG',dni:'12345678',nombre:'Pablo Quispe Mamani',cargo:'Jefe de Seguridad',areas:['seguridad']},
  {codigo:'ECOMEC',dni:'55556666',nombre:'Roberto Yauri Poma',cargo:'Jefe de Mantenimiento',areas:['mantenimiento']},
  {codigo:'JAYOJA',dni:'73760497',nombre:'Jaime Aquino J.',cargo:'Asist. de Mantenimiento',areas:['mantenimiento']},
  {codigo:'ECOCTL',dni:'99887766',nombre:'Marco Valdivia Cruz',cargo:'Planner de Proyecto',areas:['controlProyecto','controlEquipos']},
  {codigo:'ECOOTRO',dni:'55667788',nombre:'Ana García Torres',cargo:'Asistente Contable',areas:['otros']},
];

// ══ SUPABASE CONFIG ══
const SUPA_URL = 'https://kotqxhpkjuaxbgwhiode.supabase.co';
const SUPA_KEY = 'sb_publishable_2vedvLuUivaSULcoSGJcpQ_Womkq8ST';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

// ══ FIELD MAPPERS (camelCase ↔ snake_case) ══
const _RENAME_TO   = {desc:'descripcion', con:'concepto', img:'imagen'};
const _RENAME_FROM = {descripcion:'desc', concepto:'con', imagen:'img'};

function toSnake(obj){
  const r={};
  for(const [k,v] of Object.entries(obj)){
    if(k==='items'||k==='pdfData')continue;
    const key=_RENAME_TO[k]||k.replace(/([A-Z])/g,m=>'_'+m.toLowerCase());
    r[key]=(v===''||v==='—')?null:v;
  }
  return r;
}
function toCamel(obj){
  const r={};
  for(const [k,v] of Object.entries(obj)){
    const key=_RENAME_FROM[k]||k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    r[key]=v??'';
  }
  return r;
}

const SUPA_TABLES={
  personal:'personal',social:'social',residencia:'residencia',
  alimentacion:'alimentacion',hospedaje:'hospedaje',lavanderia:'lavanderia',
  almacen:'almacen',requerimientos:'requerimientos',facturasPago:'facturas_pago',
  combustible:'combustible',supervision:'supervision',incidentes:'incidentes',
  petar:'petar',ambiental:'ambiental',equipos:'equipos',partes:'partes',
  mantenimientos:'mantenimientos',planner:'planner',facturas:'facturas',
  costos:'costos',frentesTrabajo:'frentes_trabajo',tipoMaterial:'tipo_material',
  tramos:'tramos',catalogoItems:'materiales',unidades:'unidades',
  asistencia:'asistencia',proyectos:'proyectos',auxiliosMecanicos:'auxilios_mecanicos',
  auxMecInsumos:'aux_mec_insumos',engrase:'engrase',tareaje:'tareaje'
};

const ACTION_MAP={
  savePersonal:'personal',saveSocial:'social',saveResidencia:'residencia',
  saveAlimentacion:'alimentacion',saveHospedaje:'hospedaje',saveLavanderia:'lavanderia',
  saveAlmacen:'almacen',saveSupervision:'supervision',saveIncidente:'incidentes',
  savePetar:'petar',saveAmbiental:'ambiental',saveEquipo:'equipos',
  saveMantenimiento:'mantenimientos',saveCombustible:'combustible',
  saveParte:'partes',saveFactura:'facturas',saveCosto:'costos',
  savePlanner:'planner',saveFrenteTrabajo:'frentesTrabajo',
  saveTipoMaterial:'tipoMaterial',saveTramo:'tramos',
  saveCatalogo:'catalogoItems',saveRequerimiento:'requerimientos',
  saveFacturaPago:'facturasPago',saveAsistencia:'asistencia',saveProyecto:'proyectos',
  saveAuxMec:'auxiliosMecanicos',saveAuxMecInsumo:'auxMecInsumos',saveEngrase:'engrase',saveTareaje:'tareaje'
};

async function supaUpsert(dbKey,record){
  const table=SUPA_TABLES[dbKey];if(!table)return;
  try{
    const {error}=await supa.from(table).upsert(toSnake(record));
    if(error){console.warn('[Supabase upsert]',table,error.message);toast('Error al guardar: '+error.message,true);}
  }catch(e){console.warn('[Supabase]',e);toast('Error de conexión con Supabase',true);}
}

async function supaDelete(dbKey,id){
  const table=SUPA_TABLES[dbKey];if(!table)return;
  try{
    const {data,error}=await supa.from(table).delete().eq('id',+id).select();
    if(error){toast('Error al eliminar: '+error.message,true);return;}
    if(!data||data.length===0){toast('No se encontró en BD (ID:'+id+')',true);}
  }catch(e){toast('Error al eliminar: '+e.message,true);}
}

function syncSheet(action,data){
  const dbKey=ACTION_MAP[action];
  if(dbKey)supaUpsert(dbKey,data);
}

async function supaGuardarRequerimiento(req){
  try{
    const reqData={
      id:req.id, num:req.num, fecha:req.fecha||null,
      proyecto:req.proyecto||null, cod_proy:req.codProy||null,
      solicitante:req.solicitante, area:req.area,
      fecha_ent:req.fechaEnt||null, prioridad:req.prioridad,
      est:req.est, obs:req.obs||'',
      user_email:CU?CU.nombre:'',
      created_at:new Date().toISOString()
    };
    const {data:ret,error:re}=await supa.from('requerimientos').upsert(reqData).select();
    if(re){console.warn('[Req]',re.message);return;}
    const reqId=ret[0].id;
    const localReq=DB.requerimientos.find(r=>r.num===req.num);
    if(localReq)localReq.id=reqId;
    // Borrar ítems anteriores antes de reinsertar para evitar duplicados
    await supa.from('requerimiento_materiales').delete().eq('req_id',reqId);
    for(const item of (req.items||[])){
      if(!item.desc||!item.desc.trim())continue;
      let matId;
      const {data:ex}=await supa.from('materiales').select('id').eq('cod',item.cod).maybeSingle();
      if(ex){
        matId=ex.id;
      }else{
        const {data:nm}=await supa.from('materiales').insert({
          tipo:item.tipo,cod:item.cod,descripcion:item.desc,und:item.und
        }).select();
        if(nm&&nm[0])matId=nm[0].id;
      }
      if(matId){
        await supa.from('requerimiento_materiales').insert({
          req_id:reqId,material_id:matId,cant:item.cant,obs:item.obs||'',tcosto:item.tcosto||''
        });
      }
    }
  }catch(e){console.warn('[Req]',e);}
}

// ══ ACTUALIZAR DATOS SIN CERRAR SESIÓN ══
async function refreshData(){
  const btn=document.getElementById('btnRefresh');
  if(btn){btn.classList.add('spinning');btn.disabled=true;}
  try{await loadSheetsData();}finally{
    if(btn){btn.classList.remove('spinning');btn.disabled=false;}
  }
}

// ══ CARGA INICIAL DESDE SUPABASE ══
async function loadSheetsData(){
  try{
    const simpleKeys=Object.keys(SUPA_TABLES).filter(k=>k!=='requerimientos'&&k!=='catalogoItems'&&k!=='asistencia'&&k!=='almacen');
    const results=await Promise.all(
      simpleKeys.map(dbKey=>
        supa.from(SUPA_TABLES[dbKey]).select('*')
          .then(({data,error})=>({dbKey,data,error}))
      )
    );
    // Carga paginada de materiales (puede superar las 1000 filas)
    {
      let allMat=[],from=0,pageSize=1000,done=false;
      while(!done){
        const{data,error}=await supa.from('materiales').select('*').range(from,from+pageSize-1).order('id');
        if(error||!data||data.length===0){done=true;break;}
        allMat=allMat.concat(data);
        if(data.length<pageSize)done=true;else from+=pageSize;
      }
      if(allMat.length>0)results.push({dbKey:'catalogoItems',data:allMat,error:null});
    }
    const nxMap={personal:'personal',social:'social',residencia:'res',
      alimentacion:'ali',hospedaje:'hosp',lavanderia:'lav',almacen:'alm',
      combustible:'comb',supervision:'super',incidentes:'inc',petar:'pet',
      ambiental:'amb',equipos:'eq',mantenimientos:'mant',planner:'plan',
      facturas:'fact',costos:'cost',frentesTrabajo:'ft',tipoMaterial:'tm',
      tramos:'tr',catalogoItems:'cat',facturasPago:'fpago',proyectos:'proy',auxiliosMecanicos:'auxMec',auxMecInsumos:'auxMecIns',engrase:'eng',tareaje:'tar'};
    let loaded=false;
    results.forEach(({dbKey,data,error})=>{
      if(!error&&data&&data.length>0){
        DB[dbKey]=data.map(toCamel);
        const nk=nxMap[dbKey];
        if(nk&&DB.nx[nk]!==undefined)
          DB.nx[nk]=Math.max(...DB[dbKey].map(r=>+r.id||0))+1;
        loaded=true;
      }
    });
    const {data:reqs,error:reqErr}=await supa
      .from('requerimientos').select('*, requerimiento_materiales(id,cant,obs,tcosto,materiales(id,tipo,cod,descripcion,und))');
    if(!reqErr&&reqs&&reqs.length>0){
      DB.requerimientos=reqs.map(r=>{
        const rec=toCamel(r);
        rec.items=(r.requerimiento_materiales||[]).map(rm=>({
          id:rm.id, materialId:rm.material_id||rm.materiales?.id,
          tipo:rm.materiales?.tipo||'', cod:rm.materiales?.cod||'',
          desc:rm.materiales?.descripcion||'', und:rm.materiales?.und||'',
          cant:rm.cant, obs:rm.obs||'', tcosto:rm.tcosto||''
        }));
        delete rec.requerimientoMateriales;
        return rec;
      });
      DB.nx.req=Math.max(...DB.requerimientos.map(r=>+r.id||0))+1;
      loaded=true;
    }
    // Carga inicial almacén: últimos 60 días
    await cargarAlmacen(false);
    if(loaded){renderPage(AP);recalcularEstadosRQ();toast('✓ Datos cargados');}
  }catch(e){console.warn('Supabase load error:',e);}
}
async function cargarAlmacen(rerender=true){
  const sel=document.getElementById('almPeriodoSel');
  const dias=sel?+sel.value:60;
  const lbl=document.getElementById('almPeriodoLbl');
  if(lbl)lbl.textContent='⏳ Cargando...';
  try{
    let q=supa.from('almacen').select('*').order('fecha',{ascending:false}).order('id',{ascending:false});
    if(dias>0){
      const desde=new Date();desde.setDate(desde.getDate()-dias);
      const desdeStr=desde.toISOString().slice(0,10);
      q=q.gte('fecha',desdeStr);
    }
    // paginación para traer todos los registros del período
    let all=[],from=0,done=false;
    while(!done){
      const{data,error}=await q.range(from,from+999);
      if(error||!data||data.length===0){done=true;break;}
      all=all.concat(data);
      if(data.length<1000)done=true;else from+=1000;
    }
    DB.almacen=all.map(toCamel);
    DB.nx.alm=DB.almacen.length?Math.max(...DB.almacen.map(r=>+r.id||0))+1:1;
    if(lbl){
      const txt=dias===0?'Todo el historial':`Últimos ${dias} días · ${DB.almacen.length} registros`;
      lbl.textContent=txt;
    }
    if(rerender)rAlm();
  }catch(e){
    console.warn('Error cargando almacén:',e);
    if(lbl)lbl.textContent='⚠ Error al cargar';
  }
}
// ══ SEED DEMO DATA TO SUPABASE (ejecutar una sola vez desde consola) ══
async function seedSupabase(){
  console.log('[Seed] Iniciando carga de datos demo...');
  async function ins(dbKey){
    const records=DB[dbKey];
    if(!records||!records.length){console.log('[Seed] Vacío:',dbKey);return;}
    const {error}=await supa.from(SUPA_TABLES[dbKey]).upsert(records.map(toSnake));
    if(error)console.warn('[Seed]',dbKey,error.message);
    else console.log('[Seed] OK:',dbKey,'→',records.length,'registros');
  }
  // 1° tablas sin dependencias
  for(const k of ['personal','social','residencia','alimentacion','hospedaje',
    'lavanderia','almacen','supervision','incidentes','petar','ambiental',
    'equipos','planner','facturas','costos','frentesTrabajo','tipoMaterial','tramos']) await ins(k);
  // 2° catálogo maestro de materiales
  await ins('catalogoItems');
  // 3° requerimientos + requerimiento_materiales
  for(const req of DB.requerimientos){
    const reqData={id:req.id,num:req.num,fecha:req.fecha||null,
      proyecto:req.proyecto||null,
      solicitante:req.solicitante,area:req.area,fecha_ent:req.fechaEnt||null,
      prioridad:req.prioridad,est:req.est,obs:req.obs||'',
      user_email:'Seed inicial',created_at:new Date().toISOString()};
    const {error:re}=await supa.from('requerimientos').upsert(reqData);
    if(re){console.warn('[Seed] requerimientos',re.message);continue;}
    for(let i=0;i<(req.items||[]).length;i++){
      const it=req.items[i];
      if(!it.desc||!it.desc.trim())continue;
      let matId;
      const {data:ex}=await supa.from('materiales').select('id').eq('cod',it.cod).maybeSingle();
      if(ex){matId=ex.id;}
      else{
        const {data:nm}=await supa.from('materiales').insert({
          tipo:it.tipo,cod:it.cod,descripcion:it.desc,und:it.und
        }).select();
        if(nm&&nm[0])matId=nm[0].id;
      }
      if(matId){
        await supa.from('requerimiento_materiales').upsert({
          id:req.id*100+i+1,req_id:req.id,material_id:matId,cant:it.cant,obs:it.obs||'',tcosto:it.tcosto||''
        });
      }
    }
    console.log('[Seed] OK: req',req.id,'→',req.items?.length||0,'materiales');
  }
  // 4° tablas con FK a equipos o requerimientos
  for(const k of ['combustible','mantenimientos','partes','facturasPago']) await ins(k);
  console.log('[Seed] ✓ Completado');
  toast('✓ Datos demo cargados en Supabase');
}

// ══ DB ══
const DB={
  personal:[],social:[],residencia:[],alimentacion:[],hospedaje:[],lavanderia:[],
  almacen:[],requerimientos:[],facturasPago:[],combustible:[],supervision:[],
  incidentes:[],petar:[],ambiental:[],equipos:[],partes:[],mantenimientos:[],
  planner:[],facturas:[],costos:[],frentesTrabajo:[],tipoMaterial:[],tramos:[],
  catalogoItems:[],unidades:[],asistencia:[],proyectos:[],auxiliosMecanicos:[],auxMecInsumos:[],engrase:[],tareaje:[],
  nx:{personal:1,social:1,res:1,ali:1,hosp:1,lav:1,alm:1,comb:1,super:1,inc:1,pet:1,amb:1,eq:1,mant:1,plan:1,fact:1,cost:1,ft:1,tm:1,tr:1,req:1,fpago:1,cat:1,und:1,proy:1,auxMec:1,auxMecIns:1,eng:1,tar:1}
};

// ══ STATE ══
let CU=null,AP='dashboard';

