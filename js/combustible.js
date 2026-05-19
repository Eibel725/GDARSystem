// ══ COMBUSTIBLE ══
function rComb(){
  // Poblar filtro por N° Pedido/Atendido preservando selección
  const pfEl=document.getElementById('cbKardexFilter');
  const prevFilt=pfEl?pfEl.value:'';
  if(pfEl){
    const pedSet=new Set();
    DB.combustible.filter(r=>r.tipoMov==='Ingreso'&&r.numAtendido).forEach(r=>pedSet.add(r.numAtendido));
    pfEl.innerHTML='<option value="">— Todos —</option>'
      +[...pedSet].sort().map(v=>`<option value="${v}">${v}</option>`).join('');
    pfEl.value=prevFilt;
  }
  const filtVal=pfEl?pfEl.value:'';

  // Subconjunto filtrado para KPIs
  const listaFilt=filtVal
    ?DB.combustible.filter(r=>r.tipoMov==='Ingreso'
        ?r.numAtendido===filtVal
        :r.refPedido===filtVal)
    :DB.combustible;
  const ingFilt=listaFilt.filter(r=>r.tipoMov==='Ingreso');
  const despFilt=listaFilt.filter(r=>r.tipoMov!=='Ingreso');
  const totEntrada=ingFilt.reduce((a,c)=>a+c.gal,0);
  const totSalida=despFilt.reduce((a,c)=>a+c.gal,0);
  const saldoAct=totEntrada-totSalida;
  const totCost=despFilt.reduce((a,c)=>a+(c.gal*(c.precio||0)),0);
  document.getElementById('combKpis').innerHTML=[
    {l:'Total Ingresado',v:totEntrada.toFixed(1)+' gal',c:'#3b82f6'},
    {l:'Total Despachado',v:totSalida.toFixed(1)+' gal',c:'#f97316'},
    {l:filtVal?'Saldo del Pedido':'Saldo Actual',v:saldoAct.toFixed(1)+' gal',c:saldoAct<0?'#ef4444':'#10b981'},
    {l:'Costo Total',v:fmt(totCost),c:'#ef4444'}
  ].map(k=>`<div class="kpi" style="--kc:${k.c}"><div class="kpi-lbl">${k.l}</div><div class="kpi-val" style="font-size:${k.v.toString().length>9?'1.1rem':'1.6rem'}">${k.v}</div></div>`).join('');

  // Saldo acumulado GLOBAL (todos los registros en orden cronológico)
  const sorted=[...DB.combustible].sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.id-b.id);
  let saldoAcum=0;
  const saldoMap={};
  sorted.forEach(r=>{
    if(r.tipoMov==='Ingreso') saldoAcum+=r.gal;
    else saldoAcum-=r.gal;
    saldoMap[r.id]=saldoAcum;
  });

  const filtSet=filtVal?new Set(listaFilt.map(r=>r.id)):null;
  document.getElementById('tbComb').innerHTML=sorted.filter(r=>!filtSet||filtSet.has(r.id)).map(r=>{
    const eq=DB.equipos.find(e=>e.id===r.eqId);
    const mu=s=>s?s:`<span style="color:var(--muted)">—</span>`;
    const esIngreso=r.tipoMov==='Ingreso';
    const cerrado=r.estado==='Cerrado';
    const tipoBadge=esIngreso
      ?`<span class="badge b-green" style="font-size:.65rem">⬆ Ingreso</span>`
      :`<span class="badge b-orange" style="font-size:.65rem">⬇ Despacho</span>`;
    const referencia=esIngreso?(r.proveedor||'—'):(eq?`${eq.codigo} – ${eq.nombre.split(' ').slice(0,2).join(' ')}`:(r.op||'—'));
    const entradaCell=esIngreso?`<td class="tr mono" style="color:#10b981;font-weight:700">+${r.gal}</td><td class="tr mono" style="color:var(--muted)">—</td>`
                               :`<td class="tr mono" style="color:var(--muted)">—</td><td class="tr mono" style="color:#ef4444;font-weight:700">-${r.gal}</td>`;
    const saldoColor=(saldoMap[r.id]||0)<0?'#ef4444':'#10b981';
    const costoCell=esIngreso?`<span style="color:var(--muted);font-size:.72rem">—</span>`:fmt((r.gal||0)*(r.precio||0));
    const estBadge=cerrado?`<span class="badge b-green">Cerrado</span>`:`<span class="badge b-orange">Ingresado</span>`;
    const btns=cerrado
      ?`<button class="btn btn-out btn-sm" onclick="verComb(${r.id})" style="color:#3b82f6;border-color:#3b82f640">👁 Ver</button>`
      :`<button class="btn btn-out btn-sm" onclick="editComb(${r.id})" style="color:#f59e0b;border-color:#f59e0b40">✏️</button>
        <button class="btn btn-del btn-sm" onclick="del('combustible',${r.id})">🗑</button>`;
    const pedRef=esIngreso
      ?[(r.numReserva?`<span style="font-size:.68rem;color:var(--alm)">Res: ${r.numReserva}</span>`:''),
        (r.numAtendido?`<span style="font-size:.68rem;color:#10b981">Atn: ${r.numAtendido}</span>`:'')]
        .filter(Boolean).join('<br>')||`<span style="color:var(--muted)">—</span>`
      :(r.refPedido?`<span style="font-size:.68rem;color:#3b82f6">Ref: ${r.refPedido}</span>`:`<span style="color:var(--muted)">—</span>`);
    return`<tr>
      <td class="mono">${r.fecha}</td>
      <td>${tipoBadge}</td>
      <td style="font-size:.78rem">${referencia}</td>
      <td>${pedRef}</td>
      <td><span class="badge b-orange" style="font-size:.65rem">${r.tipo||'—'}</span></td>
      ${entradaCell}
      <td class="tr mono" style="color:${saldoColor};font-weight:700">${(saldoMap[r.id]||0).toFixed(1)}</td>
      <td class="tr mono" style="font-size:.78rem">${costoCell}</td>
      <td class="mono" style="font-size:.75rem">${mu(r.numFormato)}</td>
      <td>${estBadge}</td>
      <td style="display:flex;gap:.3rem">${btns}</td>
    </tr>`;
  }).join('');
}
let _combEditId=null;
let _combMode='despacho';
function _combSetFormMode(mode){
  const ing=mode==='ingreso';
  ['cbProvRow','cbNumResRow','cbNumAtnRow'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=ing?'':'none';});
  ['cbRefPedRow','cbEqRow','cbOpRow','cbPrcRow','cbTcRow','cbFmtRow','cbPlacaRow','cbDespRow'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=ing?'none':'';});
}
function _combPopulateRefPed(selVal){
  const sel=document.getElementById('cbRefPed');if(!sel)return;
  const ingresos=DB.combustible.filter(r=>r.tipoMov==='Ingreso'&&r.numAtendido);
  sel.innerHTML='<option value="">— Sin vinculación —</option>'
    +ingresos.map(r=>`<option value="${r.numAtendido}">${r.numAtendido} · ${r.fecha} (${r.gal} gal)</option>`).join('');
  if(selVal)sel.value=selVal;
}
function openCombModal(mode){
  _combMode=mode; _combEditId=null;
  const ing=mode==='ingreso';
  const ttl=document.querySelector('#mComb .mttl');
  if(ttl)ttl.textContent=ing?'⬆ Ingreso de Combustible':'⬇ Despacho de Combustible';
  _combSetFormMode(mode);
  document.getElementById('cbF').value=today();
  document.getElementById('cbGal').value='';
  document.getElementById('cbHr').value='';
  document.getElementById('cbFmt').value='';
  document.getElementById('cbEst').value='Ingresado';
  if(ing){
    document.getElementById('cbProv').value='';
    document.getElementById('cbNumRes').value='';
    document.getElementById('cbNumAtn').value='';
  }else{
    _combPopulateRefPed('');
    const eqSel=document.getElementById('cbEq');if(eqSel)eqSel.value='';
    document.getElementById('cbPrc').value='6.30';
    document.getElementById('cbPlaca').value='';
    document.getElementById('cbDesp').value='';
  }
  openM('mComb');
}
function gComb(){
  const gal=+document.getElementById('cbGal').value||0;
  if(!gal){toast('Ingrese la cantidad de galones',true);return;}
  const ing=_combMode==='ingreso';
  const eqId=ing?null:+document.getElementById('cbEq').value;
  if(!ing&&!eqId){toast('Seleccione equipo',true);return;}
  const fields={
    tipoMov:ing?'Ingreso':'Despacho',
    fecha:document.getElementById('cbF').value||today(),
    tipo:document.getElementById('cbTi').value,
    gal,
    hr:+document.getElementById('cbHr').value||0,
    numFormato:document.getElementById('cbFmt').value.trim(),
    estado:document.getElementById('cbEst').value,
    proveedor:ing?document.getElementById('cbProv').value.trim():'',
    numReserva:ing?document.getElementById('cbNumRes').value.trim():'',
    numAtendido:ing?document.getElementById('cbNumAtn').value.trim():'',
    refPedido:ing?'':document.getElementById('cbRefPed').value,
    eqId:ing?null:eqId,
    op:ing?'':document.getElementById('cbOp').value,
    precio:ing?0:+document.getElementById('cbPrc').value||6.30,
    tipoCosto:ing?'':document.getElementById('cbTc').value,
    placaSerie:ing?'':document.getElementById('cbPlaca').value.trim(),
    despachador:ing?'':document.getElementById('cbDesp').value.trim()
  };
  if(_combEditId!==null){
    const idx=DB.combustible.findIndex(x=>x.id===_combEditId);
    if(idx>-1){DB.combustible[idx]={...DB.combustible[idx],...fields};syncSheet('saveCombustible',DB.combustible[idx]);}
    _combEditId=null;
    closeM('mComb');rComb();toast(ing?'Ingreso actualizado':'Atención actualizada');
  }else{
    const rec={id:nid('comb'),...fields};
    DB.combustible.push(rec);syncSheet('saveCombustible',rec);
    closeM('mComb');rComb();toast(ing?'Ingreso registrado':'Atención registrada');
  }
}
function editComb(id){
  const r=DB.combustible.find(x=>x.id===id);if(!r)return;
  _combEditId=id;
  _combMode=r.tipoMov==='Ingreso'?'ingreso':'despacho';
  _combSetFormMode(_combMode);
  const ing=_combMode==='ingreso';
  const ttl=document.querySelector('#mComb .mttl');
  if(ttl)ttl.textContent=ing?'✏️ Editar Ingreso':'✏️ Editar Atención';
  document.getElementById('cbF').value=r.fecha||'';
  document.getElementById('cbTi').value=r.tipo||'Petróleo D2';
  document.getElementById('cbGal').value=r.gal||0;
  document.getElementById('cbHr').value=r.hr||0;
  document.getElementById('cbFmt').value=r.numFormato||'';
  document.getElementById('cbEst').value=r.estado||'Ingresado';
  if(ing){
    document.getElementById('cbProv').value=r.proveedor||'';
    document.getElementById('cbNumRes').value=r.numReserva||'';
    document.getElementById('cbNumAtn').value=r.numAtendido||'';
  }else{
    _combPopulateRefPed(r.refPedido||'');
    const eqSel=document.getElementById('cbEq');if(eqSel)eqSel.value=r.eqId||'';
    const opSel=document.getElementById('cbOp');
    if(opSel){opSel.value=r.op||'';if(!opSel.value&&r.op){const o=document.createElement('option');o.value=r.op;o.textContent=r.op;opSel.appendChild(o);opSel.value=r.op;}}
    document.getElementById('cbPrc').value=r.precio||6.30;
    document.getElementById('cbTc').value=r.tipoCosto||'Costo Directo';
    document.getElementById('cbPlaca').value=r.placaSerie||'';
    document.getElementById('cbDesp').value=r.despachador||'';
  }
  openM('mComb');
}
function verComb(id){
  const r=DB.combustible.find(x=>x.id===id);if(!r)return;
  const eq=DB.equipos.find(e=>e.id===r.eqId);
  const eqNombre=eq?`${eq.codigo} – ${eq.nombre}`:(r.eqId||'—');
  const mu=s=>s||'—';
  const win=window.open('','_blank');
  if(!win){toast('Active ventanas emergentes para imprimir',true);return;}
  const S='<'+'/';
  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Despacho de Combustible – ${r.numFormato||r.id}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Arial',sans-serif;background:#fff;color:#0a1330;font-size:11pt;padding:1.5cm;}
  .header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #f97316;padding-bottom:.7rem;margin-bottom:1rem;}
  .logo-area{display:flex;align-items:center;gap:.7rem;}
  .logo-area img{width:70px;height:70px;object-fit:contain;}
  .brand{font-size:1.1rem;font-weight:900;color:#0a1330;letter-spacing:.08em;}
  .brand-sub{font-size:.62rem;color:#555;letter-spacing:.12em;text-transform:uppercase;margin-top:2px;}
  .doc-title{text-align:right;}
  .doc-title h2{font-size:1.2rem;font-weight:900;color:#f97316;text-transform:uppercase;letter-spacing:.06em;}
  .doc-title .fmt{font-size:.85rem;font-family:monospace;color:#333;margin-top:3px;}
  .estado-badge{display:inline-block;background:#10b98122;color:#10b981;border:1px solid #10b981;border-radius:4px;padding:2px 10px;font-size:.75rem;font-weight:700;letter-spacing:.08em;margin-top:4px;}
  .section-title{font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:#f97316;font-weight:700;margin:1rem 0 .4rem;border-bottom:1px solid #f9731622;padding-bottom:3px;}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem .8rem;margin-bottom:.5rem;}
  .grid2{grid-template-columns:repeat(2,1fr);}
  .field label{font-size:.58rem;text-transform:uppercase;letter-spacing:.1em;color:#666;display:block;margin-bottom:2px;}
  .field span{font-size:.88rem;font-weight:600;color:#0a1330;}
  .field span.mono{font-family:monospace;}
  table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:.4rem;}
  th{background:#f97316;color:#fff;padding:.3rem .6rem;text-align:left;font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;}
  td{padding:.3rem .6rem;border-bottom:1px solid #e5e7eb;}
  tr:last-child td{border-bottom:none;}
  .footer{margin-top:2rem;display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;}
  .firma{border-top:1px solid #999;text-align:center;padding-top:.3rem;font-size:.7rem;color:#555;margin-top:2rem;}
  @media print{body{padding:.8cm;}@page{size:A4;margin:1.2cm;}}
</style></head><body>
<div class="header">
  <div class="logo-area">
    <img src="09.-ERP/Imagenes/GDAR-LOGO_2.png" alt="GDAR Logo">
    <div>
      <div class="brand">GDAR – ECOSERMO</div>
      <div class="brand-sub">Sistema de Gestión Operativa · Oyón / Uchuchacua</div>
    </div>
  </div>
  <div class="doc-title">
    <h2>Despacho de Combustible</h2>
    <div class="fmt">N° Formato: ${mu(r.numFormato)}</div>
    <span class="estado-badge">CERRADO</span>
  </div>
</div>
<div class="section-title">Información del Despacho</div>
<div class="grid">
  <div class="field"><label>Fecha</label><span class="mono">${mu(r.fecha)}</span></div>
  <div class="field"><label>Equipo</label><span>${eqNombre}</span></div>
  <div class="field"><label>Operador / Conductor</label><span>${mu(r.op)}</span></div>
  <div class="field"><label>Tipo de Combustible</label><span>${mu(r.tipo)}</span></div>
  <div class="field"><label>Galones</label><span class="mono">${r.gal} gal</span></div>
  <div class="field"><label>Horómetro / Km</label><span class="mono">${r.hr||'—'}</span></div>
</div>
<div class="grid">
  <div class="field"><label>Precio S/ / gal</label><span class="mono">S/ ${r.precio||'—'}</span></div>
  <div class="field"><label>Costo Total S/</label><span class="mono" style="color:#dc2626;font-weight:900">S/ ${(r.gal*r.precio).toFixed(2)}</span></div>
  <div class="field"><label>Tipo de Costo</label><span>${mu(r.tipoCosto)}</span></div>
</div>
<div class="section-title">Datos Adicionales</div>
<div class="grid">
  <div class="field"><label>Placa / Serie</label><span class="mono">${mu(r.placaSerie)}</span></div>
  <div class="field"><label>Despachador</label><span>${mu(r.despachador)}</span></div>
  <div class="field"><label>N° Formato</label><span class="mono">${mu(r.numFormato)}</span></div>
</div>
<div class="footer">
  <div class="firma">Firma Operador / Conductor</div>
  <div class="firma">Firma Despachador</div>
  <div class="firma">V°B° Jefe de Almacén</div>
</div>
<div style="text-align:center;margin-top:1.5rem;font-size:.65rem;color:#aaa">
  Generado por GDAR – ECOSERMO · Sistema de Gestión Operativa · ${new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'})}
</div>
<script>window.onload=function(){window.print();}<${'/'}script>
${S}body>${S}html>`;
  win.document.write(html);win.document.close();
}

