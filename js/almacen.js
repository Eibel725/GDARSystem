// ══ ALMACÉN ══
function getStock(){
  const s={};
  DB.almacen.forEach(r=>{
    if(!s[r.codigo])s[r.codigo]={nombre:r.nombre,unidad:r.unidad,stock:0};
    s[r.codigo].stock+=(r.tipo==='E'?1:-1)*r.cant;
  });
  return s;
}
let _almFiltTipo='',_almFiltProy='',_almFiltMat='',_almFiltFecha='',_almFiltText='',_almEditId=null,_almPage=0;
const ALM_PAGE_SIZE=20;

async function _autoUpdateRqEstForRq(rq){
  if(!rq||rq.est==='Anulado')return;
  const rqNumT=String(rq.num).trim();
  const items=(rq.items||[]).filter(i=>i.cod&&String(i.cod).trim()&&+i.cant>0);
  if(items.length===0)return;
  const entradas=DB.almacen.filter(e=>{
    if(e.tipo!=='E')return false;
    if(String(e.rqRef).trim()!==rqNumT)return false;
    if(rq.codProy&&e.codProy&&String(e.codProy).trim()!==String(rq.codProy).trim())return false;
    return true;
  });
  let newEst, fulfilledCount=0;
  if(entradas.length===0){
    newEst='En Proceso';
  }else{
    for(const item of items){
      const cod=String(item.cod).trim();
      const ingresado=entradas.filter(e=>String(e.codigo).trim()===cod).reduce((s,e)=>s+(+e.cant||0),0);
      const ok=ingresado>=+item.cant;
      console.log(`[RQ ${rqNumT}|${rq.codProy}] item cod="${cod}" cant=${item.cant} ingresado=${ingresado} ok=${ok}`);
      if(ok)fulfilledCount++;
    }
    console.log(`[RQ ${rqNumT}|${rq.codProy}] fulfilledCount=${fulfilledCount} / items=${items.length} | entradas=${entradas.length}`);
    if(fulfilledCount===items.length)     newEst='Atendido';
    else if(fulfilledCount>0)             newEst='Atendido Parcial';
    else                                  newEst='En Proceso';
  }
  if(rq.est!==newEst){
    rq.est=newEst;
    const {error}=await supa.from('requerimientos').update({est:newEst}).eq('id',rq.id);
    if(error){
      toast('Error '+rqNumT+': '+error.message,true);
    }else{
      toast('✓ '+rqNumT+' → '+newEst);
    }
    rReq&&rReq();
  }
}

async function _autoUpdateRqEst(rqNum){
  if(!rqNum)return;
  const matches=DB.requerimientos.filter(r=>String(r.num).trim()===String(rqNum).trim());
  for(const rq of matches) await _autoUpdateRqEstForRq(rq);
}

async function recalcularEstadosRQ(){
  for(const rq of DB.requerimientos) await _autoUpdateRqEstForRq(rq);
}

function _almCancelEdit(modalId){
  _almEditId=null;
  if(modalId==='mAlmE'){
    document.querySelector('#mAlmE .mttl').textContent='⬆ Entrada de Material / EPP';
    document.querySelector('#mAlmE .mf .btn-green').textContent='⬆ Registrar Entrada';
  }else{
    document.querySelector('#mAlmS .mttl').textContent='⬇ Salida de Material / EPP';
    document.querySelector('#mAlmS .mf .btn-del').textContent='⬇ Registrar Salida';
  }
  closeM(modalId);
}
function _almChangeFilt(){
  _almFiltTipo=(document.getElementById('almFiltTipo')||{}).value||'';
  _almFiltProy=(document.getElementById('almFiltProy')||{}).value||'';
  _almFiltMat=(document.getElementById('almFiltMat')||{}).value||'';
  _almFiltFecha=(document.getElementById('almFiltFecha')||{}).value||'';
  _almFiltText=((document.getElementById('almFiltBuscar')||{}).value||'').trim().toLowerCase();
  _almPage=0;
  rAlm();
}
function editAlm(id){
  const r=DB.almacen.find(x=>x.id===id);if(!r)return;
  _almEditId=id;
  if(r.tipo==='E'){
    // Pre-llenar modal Entrada
    openAlmE();
    setTimeout(()=>{
      document.getElementById('aeF').value=r.fecha||'';
      // Proyecto
      const ps=document.getElementById('aeProyecto');
      if(ps&&r.proyecto){ps.value=r.proyecto;_aeFilterRq();}
      // RQ
      const rs=document.getElementById('aeRqRef');
      if(rs&&r.rqRef){rs.value=r.rqRef;_aeOnRqChange();}
      document.getElementById('aeCod').value=r.codigo||'';
      document.getElementById('aeNom').value=r.nombre||'';
      document.getElementById('aeUnd').value=r.unidad||'';
      document.getElementById('aeCant').value=r.cant||0;
      document.getElementById('aeProv').value=r.proveedor||'';
      document.getElementById('aeTc').value=r.tipoCosto||'Costo Directo';
      const persEl=document.getElementById('aePers');if(persEl)persEl.value=r.para||'';
      document.getElementById('aeObs').value=r.obs||'';
      // Cambiar título y botón a modo edición
      document.querySelector('#mAlmE .mttl').textContent='✏️ Editar Entrada';
      document.querySelector('#mAlmE .mf .btn-green').textContent='💾 Guardar Cambios';
    },50);
  }else{
    // Pre-llenar modal Salida
    openAlmS();
    setTimeout(()=>{
      document.getElementById('asF').value=r.fecha||'';
      const itemEl=document.getElementById('asItem');if(itemEl)itemEl.value=r.codigo||'';
      document.getElementById('asCant').value=r.cant||0;
      document.getElementById('asTc').value=r.tipoCosto||'Costo Directo';
      // para = "Persona – Destino"
      const paraParts=(r.para||'').split(' – ');
      const persEl=document.getElementById('asPers');if(persEl)persEl.value=paraParts[0]||'';
      document.getElementById('asDest').value=paraParts.slice(1).join(' – ')||'';
      // Nuevos campos
      const sps=document.getElementById('asProyecto');
      if(sps&&r.proyecto)sps.value=r.proyecto;
      document.getElementById('asObs').value=r.obs||'';
      document.getElementById('asVale').value=r.numVale||'';
      document.querySelector('#mAlmS .mttl').textContent='✏️ Editar Salida';
      document.querySelector('#mAlmS .mf .btn-del').textContent='💾 Guardar Cambios';
    },50);
  }
}
function openAlmE(){
  const ps=document.getElementById('aeProyecto');
  if(ps){
    ps.innerHTML='<option value="">— Sin Proyecto —</option>'
      +DB.proyectos.map(p=>`<option value="${p.nombre}" data-cod="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');
    ps.value='';
  }
  _aeFilterRq();
  refreshProvDatalist();
  openM('mAlmE');
}
function openAlmS(){
  const ps=document.getElementById('asProyecto');
  if(ps){
    ps.innerHTML='<option value="">— Sin Proyecto —</option>'
      +DB.proyectos.map(p=>`<option value="${p.nombre}" data-cod="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');
    ps.value='';
  }
  document.getElementById('asObs').value='';
  document.getElementById('asVale').value='';
  openM('mAlmS');
}
// ══ ENTRADA MÚLTIPLE ══
let emItemsArr=[];
function openAlmEM(){
  emItemsArr=[];
  const ps=document.getElementById('emProyecto');
  if(ps){ps.innerHTML='<option value="">— Sin Proyecto —</option>'+DB.proyectos.map(p=>`<option value="${p.nombre}" data-cod="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');ps.value='';}
  document.getElementById('emRqRef').innerHTML='<option value="">— Sin Requerimiento —</option>';
  document.getElementById('emF').value=today();
  document.getElementById('emProv').value='';
  refreshProvDatalist();
  document.getElementById('emObs').value='';
  document.getElementById('emItemsBody').innerHTML='';
  openM('mAlmEM');
}
function _emFilterRq(){
  const ps=document.getElementById('emProyecto');
  const pNom=ps?ps.value:'';
  const pCod=ps&&ps.selectedIndex>0?ps.options[ps.selectedIndex].dataset.cod:'';
  const rqs=DB.requerimientos.filter(r=>r.est!=='Atendido'&&(!pNom||(r.proyecto===pNom||r.codProy===pCod)));
  const sel=document.getElementById('emRqRef');
  if(sel){sel.innerHTML='<option value="">— Sin Requerimiento —</option>'+rqs.map(r=>`<option value="${r.num}" data-id="${r.id}">${r.num} – ${r.solicitante||''} [${r.est||''}]</option>`).join('');sel.value='';}
  emItemsArr=[];renderEMItems();
}
function _emOnRqChange(){
  const sel=document.getElementById('emRqRef');
  if(!sel||!sel.value){emItemsArr=[];renderEMItems();return;}
  const opt=sel.options[sel.selectedIndex];
  const rqId=opt?+opt.dataset.id:null;
  const rq=rqId?DB.requerimientos.find(r=>r.id===rqId):DB.requerimientos.find(r=>r.num===sel.value);
  if(!rq){emItemsArr=[];renderEMItems();return;}
  // Auto-fill proyecto
  const proyEl=document.getElementById('emProyecto');
  if(proyEl&&rq.proyecto){const mo=[...proyEl.options].find(o=>o.value===rq.proyecto);if(mo)proyEl.value=rq.proyecto;}
  const rqNumT=String(rq.num).trim();
  const rqCodProy=String(rq.codProy||'').trim();
  emItemsArr=(rq.items||[]).filter(i=>i.cod&&String(i.cod).trim()&&+i.cant>0).map(i=>{
    const cod=String(i.cod).trim();
    const yaIngresado=DB.almacen.filter(e=>e.tipo==='E'&&String(e.rqRef).trim()===rqNumT&&String(e.codigo).trim()===cod&&(!rqCodProy||!e.codProy||String(e.codProy).trim()===rqCodProy)).reduce((s,e)=>s+(+e.cant||0),0);
    const pendiente=Math.max(0,+i.cant-yaIngresado);
    return{cod,nom:i.desc||'',und:i.und||'und',requerido:+i.cant,yaIngresado,cant:pendiente,esRq:true};
  }).filter(i=>i.pendiente!==0||(i.requerido-i.yaIngresado)>0||true);
  renderEMItems();
}
function addEMItem(){emItemsArr.push({cod:'',nom:'',und:'und',requerido:null,yaIngresado:0,cant:1,esRq:false});renderEMItems();}
function removeEMItem(i){emItemsArr.splice(i,1);renderEMItems();}
function renderEMItems(){
  const b=document.getElementById('emItemsBody');if(!b)return;
  b.innerHTML=emItemsArr.map((it,i)=>{
    const maxCant=it.esRq?Math.max(0,it.requerido-it.yaIngresado):99999;
    const yaColor=it.yaIngresado>0?'#f59e0b':'#64748b';
    const pendiente=it.esRq?it.requerido-it.yaIngresado:null;
    const cantColor=it.esRq&&it.cant>maxCant?'border-color:#ef4444':'';
    if(it.esRq){
      return`<tr style="background:rgba(16,185,129,.04)">
        <td style="padding:.3rem .4rem;color:var(--muted2);font-size:.7rem;text-align:center">${i+1}</td>
        <td style="padding:.3rem .4rem;font-family:'Roboto Mono',monospace;font-size:.75rem;color:var(--alm);font-weight:700">${it.cod}</td>
        <td style="padding:.3rem .4rem;font-size:.78rem"><strong>${it.nom}</strong></td>
        <td style="padding:.3rem .4rem;text-align:center;font-size:.75rem">${it.und}</td>
        <td style="padding:.3rem .4rem;text-align:right;font-size:.78rem;color:#94a3b8">${it.requerido} ${it.und}</td>
        <td style="padding:.3rem .4rem;text-align:right;font-size:.78rem;font-weight:600;color:${yaColor}">${it.yaIngresado} ${it.und}</td>
        <td style="padding:.3rem .4rem">
          <input type="number" value="${it.cant}" min="0" max="${maxCant}" step="0.01"
            oninput="emItemsArr[${i}].cant=Math.min(+this.value,${maxCant});if(+this.value>${maxCant}){this.value=${maxCant};toast('Máx permitido: ${maxCant} ${it.und}',true)}"
            style="${ISS};width:80px;text-align:right;${cantColor}">
        </td>
        <td style="padding:.3rem .4rem"><button class="btn btn-del btn-sm" onclick="removeEMItem(${i})">✕</button></td>
      </tr>`;
    }else{
      return`<tr>
        <td style="padding:.3rem .4rem;color:var(--muted2);font-size:.7rem;text-align:center">${i+1}</td>
        <td colspan="2" style="padding:.3rem .4rem">
          <input id="emAcInp${i}" type="text" autocomplete="off"
            value="${it.cod?it.cod+' – '+it.nom:''}"
            placeholder="Buscar por nombre o código..."
            oninput="showEmAc(${i},this.value)"
            onblur="setTimeout(()=>hideEmAc(),200)"
            style="${ISS};min-width:280px">
        </td>
        <td style="padding:.3rem .4rem"><input id="emAcUnd${i}" list="undDatalist" value="${it.und}" oninput="emItemsArr[${i}].und=this.value" style="${ISS};width:60px"></td>
        <td style="padding:.3rem .4rem;text-align:right;color:#64748b;font-size:.75rem">—</td>
        <td style="padding:.3rem .4rem;text-align:right;color:#64748b;font-size:.75rem">—</td>
        <td style="padding:.3rem .4rem">
          <input type="number" value="${it.cant}" min="0.01" step="0.01" oninput="emItemsArr[${i}].cant=+this.value" style="${ISS};width:80px;text-align:right">
        </td>
        <td style="padding:.3rem .4rem"><button class="btn btn-del btn-sm" onclick="removeEMItem(${i})">✕</button></td>
      </tr>`;
    }
  }).join('');
}
function gAlmEM(){
  const emProyEl=document.getElementById('emProyecto');
  const emProyOpt=emProyEl&&emProyEl.selectedIndex>0?emProyEl.options[emProyEl.selectedIndex]:null;
  const proy=emProyEl?emProyEl.value:'';
  const codProy=emProyOpt&&emProyOpt.dataset.cod?emProyOpt.dataset.cod:'';
  const rqRef=document.getElementById('emRqRef').value||'';
  const fecha=document.getElementById('emF').value||today();
  const prov=document.getElementById('emProv').value;
  const tc=document.getElementById('emTc').value;
  const para=document.getElementById('emPers').value;
  const obs=document.getElementById('emObs').value;
  const validos=emItemsArr.filter(it=>it.cod&&+it.cant>0);
  if(!validos.length){toast('Agregue al menos un material con cantidad',true);return;}
  for(const it of validos){
    if(it.esRq){
      const max=it.requerido-it.yaIngresado;
      if(it.cant>max){toast(`${it.cod}: máx permitido ${max} ${it.und}`,true);return;}
    }
  }
  for(const it of validos){
    const cat=DB.catalogoItems.find(c=>c.cod===it.cod);
    const rec={id:nid('alm'),fecha,proyecto:proy,codProy,rqRef,codigo:it.cod,nombre:it.nom||(cat?cat.desc:''),unidad:it.und||(cat?cat.und:'und'),tipo:'E',cant:it.cant,stock:0,tipoCosto:tc,para,proveedor:prov,obs};
    DB.almacen.push(rec);
    syncSheet('saveAlmacen',rec);
  }
  if(rqRef)_autoUpdateRqEst(rqRef);
  closeM('mAlmEM');rAlm();
  toast('✓ '+validos.length+' entrada(s) registradas'+(rqRef?' – RQ: '+rqRef:''));
}
// ══ SALIDA MÚLTIPLE ══
let smItemsArr=[];
function _nextValeNum(codProy){
  const all=DB.almacen.filter(r=>r.tipo==='S'&&r.numVale&&/^VAL-\d+$/i.test(String(r.numVale).trim()));
  const vales=codProy?all.filter(r=>(r.codProy||'')===codProy):all;
  if(!vales.length)return'VAL-0001';
  const maxN=Math.max(...vales.map(r=>+String(r.numVale).trim().toUpperCase().replace('VAL-','')));
  return'VAL-'+String(maxN+1).padStart(4,'0');
}
function openAlmSM(){
  smItemsArr=[];
  const ps=document.getElementById('smProyecto');
  if(ps){ps.innerHTML='<option value="">— Sin Proyecto —</option>'+DB.proyectos.map(p=>`<option value="${p.nombre}" data-cod="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');ps.value='';}
  document.getElementById('smF').value=today();
  document.getElementById('smVale').value=_nextValeNum();
  document.getElementById('smDest').value='';
  document.getElementById('smObs').value='';
  addSMItem();
  openM('mAlmSM');
}
function addSMItem(){smItemsArr.push({cod:'',cant:1});renderSMItems();}
function removeSMItem(i){smItemsArr.splice(i,1);renderSMItems();}
function _getStockProy(codProy,proyNom){
  const movs=DB.almacen.filter(r=>(codProy&&(r.codProy||'').trim()===codProy)||(proyNom&&(r.proyecto||'').trim()===proyNom));
  const map={};
  movs.forEach(r=>{
    if(!map[r.codigo])map[r.codigo]={stock:0,nombre:r.nombre,unidad:r.unidad};
    map[r.codigo].stock+=(r.tipo==='E'?1:-1)*(+r.cant||0);
  });
  return map;
}
function renderSMItems(){
  const smProyEl=document.getElementById('smProyecto');
  const smProyNom=smProyEl?smProyEl.value:'';
  const smProy=smProyNom?DB.proyectos.find(p=>p.nombre===smProyNom):null;
  const smCodProy=smProy?smProy.codigo:'';
  const valeEl=document.getElementById('smVale');
  if(valeEl)valeEl.value=_nextValeNum(smCodProy);
  const todoAlmacen=document.getElementById('smTodoAlmacen')?.checked;
  const st=todoAlmacen?getStock():(smProyNom?_getStockProy(smCodProy,smProyNom):getStock());
  const allStock=Object.entries(st).filter(([,v])=>v.stock>0)
    .sort((a,b)=>todoAlmacen?(a[1].nombre||'').localeCompare(b[1].nombre||''):0);
  const b=document.getElementById('smItemsBody');if(!b)return;
  b.innerHTML=smItemsArr.map((it,i)=>{
    const sv=st[it.cod];
    const otherCods=new Set(smItemsArr.filter((_,j)=>j!==i&&_.cod).map(x=>x.cod));
    const opts='<option value="">— Seleccionar material —</option>'+
      allStock.filter(([cod])=>!otherCods.has(cod)||cod===it.cod)
        .map(([cod,v])=>`<option value="${cod}"${cod===it.cod?' selected':''}>${cod} – ${v.nombre} (Stock: ${fmtN(v.stock)} ${v.unidad})</option>`)
        .join('');
    return`<tr>
      <td style="padding:.28rem .4rem;color:var(--muted2);font-size:.7rem;text-align:center">${i+1}</td>
      <td style="padding:.28rem .4rem"><select onchange="smItemsArr[${i}].cod=this.value;renderSMItems()" style="${ISS};width:100%;min-width:280px">${opts}</select></td>
      <td style="padding:.28rem .4rem;text-align:center;font-size:.78rem;font-weight:600;color:${sv&&sv.stock<5?'#ef4444':sv?'#10b981':'#64748b'}">${sv?fmtN(sv.stock)+' '+sv.unidad:'—'}</td>
      <td style="padding:.28rem .4rem"><input type="number" value="${it.cant}" min="0.01" step="0.01" oninput="smItemsArr[${i}].cant=+this.value" style="${ISS};width:80px;text-align:right"></td>
      <td style="padding:.28rem .4rem"><button class="btn btn-del btn-sm" onclick="removeSMItem(${i})">✕</button></td>
    </tr>`;
  }).join('');
}
function gAlmSM(){
  const vale=document.getElementById('smVale').value.trim();
  if(!vale){toast('Ingrese N° de Vale',true);return;}
  const smProyEl=document.getElementById('smProyecto');
  const smProyOpt=smProyEl&&smProyEl.selectedIndex>0?smProyEl.options[smProyEl.selectedIndex]:null;
  const proy=smProyEl?smProyEl.value:'';
  const smProyObj=proy?DB.proyectos.find(p=>p.nombre===proy):null;
  const codProy=smProyObj?smProyObj.codigo:(smProyOpt&&smProyOpt.dataset.cod?smProyOpt.dataset.cod:'');
  const fecha=document.getElementById('smF').value||today();
  const para=document.getElementById('smPers').value+(document.getElementById('smDest').value?' – '+document.getElementById('smDest').value:'');
  const tc=document.getElementById('smTc').value;
  const obs=document.getElementById('smObs').value;
  const st=proy?_getStockProy(codProy,proy):getStock();
  const validos=smItemsArr.filter(it=>it.cod&&+it.cant>0);
  if(!validos.length){toast('Agregue al menos un material',true);return;}
  for(const it of validos){
    if(!st[it.cod]){toast('Sin stock: '+it.cod,true);return;}
    if(it.cant>st[it.cod].stock){toast('Stock insuficiente: '+it.cod+' (disponible: '+fmtN(st[it.cod].stock)+')',true);return;}
  }
  for(const it of validos){
    const m=st[it.cod];
    const rec={id:nid('alm'),fecha,proyecto:proy,codProy,rqRef:'',codigo:it.cod,nombre:m.nombre,unidad:m.unidad,tipo:'S',cant:it.cant,stock:0,tipoCosto:tc,para,obs,numVale:vale};
    DB.almacen.push(rec);
    syncSheet('saveAlmacen',rec);
  }
  closeM('mAlmSM');rAlm();
  toast('✓ '+validos.length+' salida(s) registradas – Vale: '+vale);
}
function openPrintVale(){
  if(!DB.almacen.some(r=>r.tipo==='S'&&r.numVale)){toast('No hay vales registrados',true);return;}
  const pSel=document.getElementById('printValeProy');
  if(pSel){pSel.innerHTML='<option value="">— Todos los proyectos —</option>'+DB.proyectos.map(p=>`<option value="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');pSel.value='';}
  _printValeFiltrar();
  openM('mPrintVale');
}
function _printValeFiltrar(){
  const codProy=(document.getElementById('printValeProy')||{}).value||'';
  const movs=DB.almacen.filter(r=>r.tipo==='S'&&r.numVale&&String(r.numVale).trim()&&(!codProy||(r.codProy||'').trim()===codProy));
  const vales=[...new Set(movs.map(r=>String(r.numVale).trim()))].sort();
  const sel=document.getElementById('printValeSel');
  if(sel)sel.innerHTML=vales.length?vales.map(v=>`<option value="${v}">${v}</option>`).join(''):'<option value="">— Sin vales para este proyecto —</option>';
}
function printVale(){
  const vale=document.getElementById('printValeSel').value;if(!vale)return;
  const codProy=(document.getElementById('printValeProy')||{}).value||'';
  const rows=DB.almacen.filter(r=>r.tipo==='S'&&String(r.numVale||'').trim()===vale&&(!codProy||(r.codProy||'').trim()===codProy));
  if(!rows.length){toast('Sin registros para ese vale',true);return;}
  const h=rows[0];
  const _logoUrl=window.location.href.replace(/[^\/\\]+$/,'')+'09.-ERP/Imagenes/ECOSERMO-LOGO.png';
  const w=window.open('','_blank','width=850,height=650');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Vale ${vale}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:2rem;color:#111;font-size:13px}
    .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;border-bottom:2px solid #1e293b;padding-bottom:.8rem;gap:1rem}
    .header-logo{flex:0 0 auto}.header-logo img{height:48px;object-fit:contain}
    .header-title{flex:1;text-align:center}.header-title h2{font-size:20px;color:#1e293b;margin-bottom:.15rem}.header-title p{color:#64748b;font-size:11px}
    .vale-num{flex:0 0 auto;font-size:22px;font-weight:700;font-family:monospace;color:#ef4444;background:#fef2f2;border:2px solid #ef4444;padding:.3rem .9rem;border-radius:6px}
    .info{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem 1rem;margin-bottom:1.2rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:.8rem}
    .info div strong{display:block;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}
    .info div span{font-size:12px;font-weight:600;color:#1e293b}
    table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
    th{background:#1e293b;color:#fff;padding:.45rem .6rem;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
    td{padding:.45rem .6rem;border-bottom:1px solid #e2e8f0;font-size:12px}tr:last-child td{border-bottom:none}
    .tr{text-align:right}.mono{font-family:monospace}
    .signs{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem;border-top:1px solid #ddd;padding-top:1rem}
    .sign{text-align:center}
    .sign .sp{height:42px}
    .sign .ln{border-top:1.5px solid #333;margin:0 8px 5px}
    .sign .lb{font-size:9.5px;text-transform:uppercase;font-weight:700;color:#1e293b;letter-spacing:.06em}
    .sign .sb{font-size:8.5px;color:#aaa;margin-top:2px}
    @media print{body{padding:1cm}button{display:none}}
  </style></head><body>
  <div class="header">
    <div class="header-logo"><img src="${_logoUrl}" alt="Ecosermo"></div>
    <div class="header-title"><h2>VALE DE SALIDA DE MATERIALES</h2><p>ECOSERMO – Sistema de Control de Almacén – GDAR</p></div>
    <div class="vale-num">${vale}</div>
  </div>
  <div class="info">
    <div><strong>Fecha</strong><span>${h.fecha||'—'}</span></div>
    <div><strong>Proyecto</strong><span>${h.proyecto||'—'}</span></div>
    <div><strong>Cód. Proyecto</strong><span>${h.codProy||'—'}</span></div>
    <div style="grid-column:1/span 2"><strong>Entregado a</strong><span>${h.para||'—'}</span></div>
    <div><strong>Tipo de Costo</strong><span>${h.tipoCosto||'—'}</span></div>
    ${h.obs?`<div style="grid-column:1/-1"><strong>Observaciones</strong><span>${h.obs}</span></div>`:''}
  </div>
  <table>
    <thead><tr><th style="width:36px">#</th><th style="width:100px">Código</th><th>Descripción del Material / EPP / Insumo</th><th style="width:70px">Unidad</th><th class="tr" style="width:80px">Cantidad</th></tr></thead>
    <tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td class="mono">${r.codigo}</td><td><strong>${r.nombre}</strong></td><td>${r.unidad}</td><td class="tr"><strong>${fmtN(r.cant)}</strong></td></tr>`).join('')}</tbody>
  </table>
  <div class="signs">
    <div class="sign"><div class="sp"></div><div class="ln"></div><div class="lb">Entregado por / Almacenero</div><div class="sb">Firma y sello</div></div>
    <div class="sign"><div class="sp"></div><div class="ln"></div><div class="lb">Recibido por: ${(rows[0].para||'Receptor').split(' – ')[0]}</div><div class="sb">Firma y sello</div></div>
    <div class="sign"><div class="sp"></div><div class="ln"></div><div class="lb">Área Autorizada</div><div class="sb">Firma y sello</div></div>
  </div>
  <script>window.onload=()=>{window.print();}<\/script></body></html>`);
  w.document.close();closeM('mPrintVale');
}
function _aeFilterRq(){
  const ps=document.getElementById('aeProyecto');
  const pNom=ps?ps.value:'';
  const pCod=ps&&ps.selectedIndex>0?ps.options[ps.selectedIndex].dataset.cod:'';
  const rqs=DB.requerimientos.filter(r=>r.est!=='Atendido'&&(!pNom||(r.proyecto===pNom||r.codProy===pCod)));
  const sel=document.getElementById('aeRqRef');
  if(sel){
    sel.innerHTML='<option value="">— Sin Requerimiento —</option>'
      +rqs.map(r=>`<option value="${r.num}" data-id="${r.id}">${r.num} – ${r.solicitante||''} [${r.est||''}]</option>`).join('');
    sel.value='';
  }
  _aeOnRqChange();
}
function _aeOnRqChange(){
  const sel=document.getElementById('aeRqRef');
  const matRow=document.getElementById('aeRqMatRow');
  const matSel=document.getElementById('aeRqMat');
  if(!sel||!sel.value||!matRow||!matSel){if(matRow)matRow.style.display='none';return;}
  const opt=sel.options[sel.selectedIndex];
  const rqId=opt?+opt.dataset.id:null;
  const rq=rqId?DB.requerimientos.find(r=>r.id===rqId):DB.requerimientos.find(r=>r.num===sel.value);
  if(!rq){matRow.style.display='none';return;}
  // Auto-rellenar proyecto desde el RQ seleccionado
  const proyEl=document.getElementById('aeProyecto');
  if(proyEl&&rq.proyecto){
    const matchOpt=[...proyEl.options].find(o=>o.value===rq.proyecto);
    if(matchOpt) proyEl.value=rq.proyecto;
  }
  const rqNumT=String(rq.num).trim();
  const rqCodProy=String(rq.codProy||'').trim();
  const allItems=rq.items?rq.items.filter(i=>i.desc&&i.desc.trim()):[];
  const items=allItems.filter(i=>{
    if(!i.cod||!+i.cant)return true;
    const cod=String(i.cod).trim();
    const ingresado=DB.almacen.filter(e=>e.tipo==='E'&&String(e.rqRef).trim()===rqNumT&&String(e.codigo).trim()===cod&&(!rqCodProy||!e.codProy||String(e.codProy).trim()===rqCodProy)).reduce((s,e)=>s+(+e.cant||0),0);
    return ingresado<+i.cant;
  });
  if(items.length===0){matRow.style.display='none';return;}
  matSel.innerHTML='<option value="">— Elige un material del RQ —</option>'
    +items.map((it,idx)=>{
      const cod=String(it.cod||'').trim();
      const ingresado=cod&&+it.cant?DB.almacen.filter(e=>e.tipo==='E'&&String(e.rqRef).trim()===rqNumT&&String(e.codigo).trim()===cod&&(!rqCodProy||!e.codProy||String(e.codProy).trim()===rqCodProy)).reduce((s,e)=>s+(+e.cant||0),0):0;
      const falta=+it.cant-ingresado;
      return`<option value="${idx}" data-cod="${it.cod||''}" data-nom="${it.desc}" data-und="${it.und||''}" data-falta="${falta}">${it.cod?'['+it.cod+'] ':''}${it.desc} · falta: ${falta}/${it.cant} ${it.und||''}</option>`;
    }).join('');
  matSel.value='';
  matRow.style.display='';
}
function _aePickRqMat(){
  const matSel=document.getElementById('aeRqMat');
  if(!matSel||!matSel.value)return;
  const opt=matSel.options[matSel.selectedIndex];
  document.getElementById('aeCod').value=opt.dataset.cod||'';
  document.getElementById('aeNom').value=opt.dataset.nom||'';
  document.getElementById('aeUnd').value=opt.dataset.und||'';
  if(opt.dataset.falta&&+opt.dataset.falta>0)document.getElementById('aeCant').value=opt.dataset.falta;
}
function rAlm(){
  const st=getStock(),items=Object.entries(st);
  document.getElementById('almKpis').innerHTML=[
    {l:'Tipos de Materiales',v:items.length,c:'#3b82f6'},
    {l:'Mov. Entradas',v:DB.almacen.filter(r=>r.tipo==='E').length,c:'#10b981'},
    {l:'Mov. Salidas',v:DB.almacen.filter(r=>r.tipo==='S').length,c:'#ef4444'},
    {l:'Stock Cero',v:items.filter(([,v])=>v.stock<=0).length,c:'#f97316'}
  ].map(k=>`<div style="background:#94a3b8;border:1px solid #78909c;border-top:3px solid ${k.c};border-radius:9px;padding:.9rem 1.1rem;flex:1;min-width:150px">
    <div style="font-size:.62rem;letter-spacing:.12em;color:#1e293b;text-transform:uppercase;font-weight:700;margin-bottom:.35rem">${k.l}</div>
    <div style="font-family:'Barlow Condensed',sans-serif;font-size:1.85rem;font-weight:800;color:#1e293b;line-height:1">${k.v}</div>
  </div>`).join('');
  // Poblar filtro de proyectos
  const fpEl=document.getElementById('almFiltProy');
  if(fpEl){const sv=_almFiltProy;fpEl.innerHTML='<option value="">— Todos los proyectos —</option>'+DB.proyectos.map(p=>`<option value="${p.codigo}">[${p.codigo}] ${p.nombre}</option>`).join('');fpEl.value=sv;}
  // Poblar filtro de tipo de material (prefijos de código)
  const fmEl=document.getElementById('almFiltMat');
  if(fmEl){
    const sv=_almFiltMat;
    const pref=[...new Set(DB.almacen.map(r=>r.codigo?r.codigo.split('-')[0]:'').filter(Boolean))].sort();
    const _reqNom=Object.fromEntries(Object.entries(REQ_PREFIXES).map(([nom,pre])=>[pre.replace('-','').toUpperCase(),nom]));
    const _getAbrev=t=>(t.abrev||t.abreviatura||'').trim().toUpperCase();
    fmEl.innerHTML='<option value="">— Todos —</option>'+pref.map(p=>{
      const pU=p.trim().toUpperCase();
      const tm=DB.tipoMaterial.find(t=>_getAbrev(t)===pU);
      const nombre=tm?tm.nombre:(_reqNom[pU]||'');
      return`<option value="${p}">${p}${nombre?' – '+nombre:''}</option>`;
    }).join('');
    fmEl.value=sv;
  }
  // Restaurar filtros
  const ftEl=document.getElementById('almFiltTipo');if(ftEl&&ftEl.value!==_almFiltTipo)ftEl.value=_almFiltTipo;
  const fdEl=document.getElementById('almFiltFecha');if(fdEl&&fdEl.value!==_almFiltFecha)fdEl.value=_almFiltFecha;
  // Ordenar por fecha y luego por id para Kardex cronológico
  const filas=[...DB.almacen].sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id-b.id);
  // Pre-calcular saldo acumulado por código sobre TODAS las filas (running balance correcto)
  const saldoMap={},saldos={};
  filas.forEach(r=>{
    if(saldos[r.codigo]===undefined)saldos[r.codigo]=0;
    saldos[r.codigo]+=(r.tipo==='E'?1:-1)*r.cant;
    saldoMap[r.id]=saldos[r.codigo];
  });
  // Aplicar todos los filtros
  let filasMostrar=_almFiltTipo?filas.filter(r=>r.tipo===_almFiltTipo):filas;
  if(_almFiltProy)filasMostrar=filasMostrar.filter(r=>(r.codProy||'').trim()===_almFiltProy);
  if(_almFiltMat)filasMostrar=filasMostrar.filter(r=>r.codigo&&r.codigo.toUpperCase().startsWith(_almFiltMat.toUpperCase()+'-'));
  if(_almFiltFecha)filasMostrar=filasMostrar.filter(r=>r.fecha===_almFiltFecha);
  if(_almFiltText)filasMostrar=filasMostrar.filter(r=>[r.codigo,r.nombre,r.proyecto,r.rqRef,r.numVale,r.para,r.tipoCosto,r.proveedor].some(v=>String(v||'').toLowerCase().includes(_almFiltText)));
  // Paginación
  const _almTotal=filasMostrar.length;
  const _almTotalPags=Math.max(1,Math.ceil(_almTotal/ALM_PAGE_SIZE));
  if(_almPage>=_almTotalPags)_almPage=_almTotalPags-1;
  const _almDesde=_almPage*ALM_PAGE_SIZE;
  const _almHasta=Math.min(_almDesde+ALM_PAGE_SIZE,_almTotal);
  const pagNav=document.getElementById('almPagNav');
  if(pagNav){
    if(_almTotal===0){pagNav.innerHTML='';}
    else{const tp=_almTotalPags;pagNav.innerHTML=
      `<span>Mostrando <strong>${_almDesde+1}–${_almHasta}</strong> de <strong>${_almTotal}</strong> registros</span>`+
      `<div style="display:flex;align-items:center;gap:.4rem">`+
        `<button class="btn btn-out btn-sm" style="padding:.25rem .65rem;font-size:.75rem" onclick="_almPage=Math.max(0,_almPage-1);rAlm()" ${_almPage===0?'disabled':''}>← Ant.</button>`+
        `<span style="color:var(--text);font-weight:600;font-size:.8rem">Pág. ${_almPage+1} / ${tp}</span>`+
        `<button class="btn btn-out btn-sm" style="padding:.25rem .65rem;font-size:.75rem" onclick="_almPage=Math.min(${tp-1},_almPage+1);rAlm()" ${_almPage===tp-1?'disabled':''}>Sig. →</button>`+
      `</div>`;
    }
  }
  document.getElementById('tbAlm').innerHTML=filasMostrar.slice(_almDesde,_almHasta).map(r=>{
    const saldo=saldoMap[r.id];
    return`<tr><td class="mono">${r.fecha}</td>
      <td style="font-size:.78rem;color:var(--muted2)">${r.proyecto||'—'}</td>
      <td class="mono" style="font-size:.78rem;color:${r.tipo==='S'?'#3b82f6':'#d97706'}">${r.tipo==='S'?(r.numVale||'—'):(r.rqRef||'—')}</td>
      <td class="mono">${r.codigo}</td><td><strong>${r.nombre}</strong></td><td>${r.unidad}</td>
      <td>${r.tipo==='E'?'<span class="badge b-green">⬆ ENT</span>':'<span class="badge b-red">⬇ SAL</span>'}</td>
      <td class="tr mono">${fmtN(r.cant)}</td>
      <td class="tr mono" style="font-weight:600;color:${saldo<=0?'#ef4444':'#10b981'}">${fmtN(saldo)}</td>
      <td>${bge(r.tipoCosto)}</td><td>${r.para||'—'}</td>
      <td style="font-size:.75rem;color:var(--muted2)">${r.proveedor||'—'}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-out btn-sm" onclick="editAlm(${r.id})" title="Editar">✏️</button>
        <button class="btn btn-del btn-sm" onclick="del('almacen',${r.id})">🗑</button>
      </td></tr>`;
  }).join('');
  // refresh salida select
  const as=document.getElementById('asItem');
  if(as){const s2=getStock();as.innerHTML=Object.entries(s2).map(([cod,v])=>`<option value="${cod}">${cod} – ${v.nombre} (Stock: ${fmtN(v.stock)} ${v.unidad})</option>`).join('');}
}
function gAlm(tipo){
  if(tipo==='E'){
    const cod=document.getElementById('aeCod').value.trim();if(!cod){toast('Ingrese código',true);return;}
    const aeProyEl=document.getElementById('aeProyecto');
    const aeProyOpt=aeProyEl?aeProyEl.options[aeProyEl.selectedIndex]:null;
    const aeProy=aeProyEl?aeProyEl.value:'';
    const aeCodProy=aeProyOpt&&aeProyOpt.dataset.cod?aeProyOpt.dataset.cod:'';
    const aeRqRef=document.getElementById('aeRqRef')?document.getElementById('aeRqRef').value:'';
    const rec={fecha:document.getElementById('aeF').value||today(),proyecto:aeProy,codProy:aeCodProy,rqRef:aeRqRef,codigo:cod,nombre:document.getElementById('aeNom').value,unidad:document.getElementById('aeUnd').value,tipo:'E',cant:+document.getElementById('aeCant').value||0,stock:0,tipoCosto:document.getElementById('aeTc').value,para:document.getElementById('aePers').value,proveedor:document.getElementById('aeProv').value,obs:document.getElementById('aeObs').value};
    if(_almEditId!==null){
      const idx=DB.almacen.findIndex(x=>x.id===_almEditId);
      if(idx!==-1){Object.assign(DB.almacen[idx],rec);syncSheet('saveAlmacen',DB.almacen[idx]);}
      _almEditId=null;
    }else{
      rec.id=nid('alm');DB.almacen.push(rec);syncSheet('saveAlmacen',DB.almacen[DB.almacen.length-1]);
    }
    // Auto-actualizar estado del RQ vinculado
    if(aeRqRef)_autoUpdateRqEst(aeRqRef);
    // Restaurar título/botón modal
    document.querySelector('#mAlmE .mttl').textContent='⬆ Entrada de Material / EPP';
    document.querySelector('#mAlmE .mf .btn-green').textContent='⬆ Registrar Entrada';
    closeM('mAlmE');
  }else{
    const sel=document.getElementById('asItem').value,cant=+document.getElementById('asCant').value||0;
    const st=getStock();if(!sel||!st[sel]){toast('Seleccione material',true);return;}
    const m=st[sel];
    const asProyEl=document.getElementById('asProyecto');
    const asProyOpt=asProyEl?asProyEl.options[asProyEl.selectedIndex]:null;
    const asProy=asProyEl?asProyEl.value:'';
    const asCodProy=asProyOpt&&asProyOpt.dataset.cod?asProyOpt.dataset.cod:'';
    const rec={fecha:document.getElementById('asF').value||today(),proyecto:asProy,codProy:asCodProy,codigo:sel,nombre:m.nombre,unidad:m.unidad,tipo:'S',cant,stock:0,tipoCosto:document.getElementById('asTc').value,para:document.getElementById('asPers').value+' – '+document.getElementById('asDest').value,obs:document.getElementById('asObs').value,numVale:document.getElementById('asVale').value.trim()};
    if(_almEditId!==null){
      const idx=DB.almacen.findIndex(x=>x.id===_almEditId);
      if(idx!==-1){Object.assign(DB.almacen[idx],rec);syncSheet('saveAlmacen',DB.almacen[idx]);}
      _almEditId=null;
    }else{
      if(cant>st[sel].stock){toast('Stock insuficiente',true);return;}
      rec.id=nid('alm');DB.almacen.push(rec);syncSheet('saveAlmacen',DB.almacen[DB.almacen.length-1]);
    }
    document.querySelector('#mAlmS .mttl').textContent='⬇ Salida de Material / EPP';
    document.querySelector('#mAlmS .mf .btn-del').textContent='⬇ Registrar Salida';
    closeM('mAlmS');
  }
  rAlm();toast('Guardado');
}

