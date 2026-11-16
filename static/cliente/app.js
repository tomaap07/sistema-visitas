(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const embedded = location.pathname.startsWith('/static/cliente/');
  const base = (embedded ? location.origin : window.HALLOW_CONFIG.apiBase).replace(/\/$/, '');
  document.querySelector('[data-site-link]').href = base + '/visitas/';
  let access = null, refresh = null, refreshing = null, version = 0;
  let resource = 'personas', records = {personas:[],visitas:[]}, permissions = {}, editing = null, deleting = null;
  let loading = false, writing = false;
  const model = () => resource === 'personas' ? 'persona' : 'visita';
  const allowed = action => !!permissions[model()]?.[action];
  const notice = (message, kind = 'success') => {
    $('notice').textContent = message; $('notice').className = 'alert alert-' + kind; $('notice').hidden = !message;
  };
  const reset = () => {
    version++; access = refresh = refreshing = null; permissions = {}; records = {personas:[],visitas:[]};
    $('workspace').hidden = $('logout').hidden = true; $('login-panel').hidden = false; $('identity').textContent = '';
    $('table-body').replaceChildren(); $('fields').replaceChildren(); $('editor').close(); $('delete-dialog').close();
    $('password').value = ''; editing = deleting = null;
  };
  const explain = data => typeof data === 'string' ? data : Object.entries(data || {}).map(([key,value]) => key === 'detail' ? String(value) : key + ': ' + (Array.isArray(value) ? value.join(' ') : String(value))).join('\n');
  async function request(path, {method = 'GET', data, authenticated = true, retry = true} = {}) {
    const current = version;
    let response;
    try {
      response = await fetch(base + path, {method, credentials:'omit', cache:'no-store', headers:{Accept:'application/json', ...(data ? {'Content-Type':'application/json'} : {}), ...(authenticated && access ? {Authorization:'Bearer ' + access} : {})}, body:data ? JSON.stringify(data) : undefined, signal:AbortSignal.timeout(15000)});
    } catch (_) { throw new Error('No se pudo conectar. Revisa la conexión y actualiza el registro antes de repetir una operación.'); }
    if (current !== version) throw new Error('La sesión cambió. Vuelve a iniciar sesión.');
    if (response.status === 401 && authenticated && refresh && retry) {
      if (!refreshing) refreshing = request('/api/token/refresh/', {method:'POST',data:{refresh},authenticated:false,retry:false}).then(tokens => {access = tokens.access;}).finally(() => {refreshing = null;});
      try {await refreshing;} catch (_) {reset(); throw new Error('La sesión venció. Inicia sesión nuevamente.');}
      return request(path, {method,data,authenticated,retry:false});
    }
    const payload = response.status === 204 ? null : await response.json().catch(() => ({detail:'El servidor no pudo procesar la solicitud.'}));
    if (!response.ok) {
      if (response.status === 401 && authenticated) reset();
      throw new Error(response.status === 403 ? 'Tu cuenta no tiene permiso para esta operación.' : explain(payload));
    }
    return payload;
  }
  const personName = rut => {
    const person = records.personas.find(row => row.rut === rut);
    return person ? person.nombre + ' ' + person.apellido : rut;
  };
  const dateTime = value => value ? new Intl.DateTimeFormat('es-CL',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)) : 'Pendiente';
  function button(label, action, style = 'outline-light') {
    const b=document.createElement('button'); b.type='button'; b.className='btn btn-sm btn-'+style; b.textContent=label; b.addEventListener('click',action); return b;
  }
  function render() {
    $('create').textContent = 'Añadir ' + model(); $('create').hidden = !allowed('add');
    for (const b of document.querySelectorAll('[data-resource]')) {
      const selected = b.dataset.resource === resource; b.className = 'btn btn-' + (selected?'primary':'outline-light'); b.setAttribute('aria-pressed',String(selected));
    }
    const headings=resource === 'personas' ? ['RUT','Nombre','Apellido','Acciones'] : ['Persona','Motivo','Fecha','Entrada','Salida','Acciones'];
    const tr=document.createElement('tr');
    headings.forEach(text => {const th=document.createElement('th');th.scope='col';th.textContent=text;tr.append(th);});
    $('table-head').replaceChildren(tr); $('table-body').replaceChildren();
    const query=$('search').value.trim().toLocaleLowerCase('es');
    const rows=records[resource].filter(row => (Object.values(row).join(' ')+' '+personName(row.persona)).toLocaleLowerCase('es').includes(query));
    for (const row of rows) {
      const tr=document.createElement('tr');
      const values=resource === 'personas' ? [row.rut,row.nombre,row.apellido] : [personName(row.persona),row.motivo_visita,row.fecha,dateTime(row.hora_entrada),dateTime(row.hora_salida)];
      values.forEach(value => {const td=document.createElement('td');td.textContent=value;tr.append(td);});
      const td=document.createElement('td'), actions=document.createElement('div'); actions.className='actions';
      actions.append(button('Ver',()=>openRecord(row,true)));
      if(allowed('change')) actions.append(button('Editar',()=>openRecord(row)));
      if(allowed('delete')) actions.append(button('Eliminar',()=>askDelete(row),'outline-danger'));
      td.append(actions);tr.append(td);$('table-body').append(tr);
    }
    if (!rows.length) {
      const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=headings.length;td.className='p-4';
      td.textContent=allowed('view') ? 'No hay registros para mostrar.' : 'Tu cuenta no tiene permiso para consultar este recurso.';
      tr.append(td);$('table-body').append(tr);
    }
    $('count').textContent=rows.length+' registros visibles';
  }
  async function load() {
    if(loading) return;
    loading=true; const current=version; $('loader').hidden=false; $('refresh').disabled=true; $('workspace').setAttribute('aria-busy','true');
    try {
      const entries=await Promise.all(['personas','visitas'].map(async key => {
        const single=key==='personas'?'persona':'visita';
        return [key,permissions[single]?.view ? await request('/api/'+key+'/') : []];
      }));
      if(current!==version) return;
      records=Object.fromEntries(entries);render();
    } catch(error) {notice(error.message,'danger');}
    finally {loading=false;$('loader').hidden=true;$('refresh').disabled=false;$('workspace').removeAttribute('aria-busy');}
  }
  $('login-form').addEventListener('submit',async event => {
    event.preventDefault();const submit=event.submitter;submit.disabled=true;submit.textContent='Ingresando…';notice('');
    try {
      const tokens=await request('/api/token/',{method:'POST',data:{username:$('username').value.trim(),password:$('password').value},authenticated:false});
      access=tokens.access;refresh=tokens.refresh;$('password').value='';
      const me=await request('/api/me/');permissions=me.permissions;$('identity').textContent=me.username;
      $('login-panel').hidden=true;$('workspace').hidden=$('logout').hidden=false;await load();
    } catch(error) {reset();notice(error.message,'danger');}
    finally {submit.disabled=false;submit.textContent='Iniciar sesión';}
  });
  $('logout').addEventListener('click',()=>{reset();notice('Sesión cerrada en este cliente.');});
  $('refresh').addEventListener('click',()=>{notice('');load();});
  $('search').addEventListener('input',render);
  document.querySelectorAll('[data-resource]').forEach(b=>b.addEventListener('click',()=>{resource=b.dataset.resource;$('search').value='';render();}));
  const localInput = value => {
    if(!value) return '';
    const date=new Date(value);return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
  };
  function field(name,label,type,value='',required=true) {
    const box=document.createElement('div');box.className='mb-3';
    const text=document.createElement('label');text.htmlFor='field-'+name;text.className='form-label';text.textContent=label;
    const input=document.createElement(type==='select'?'select':type==='textarea'?'textarea':'input');input.id='field-'+name;input.name=name;input.className=type==='select'?'form-select':'form-control';input.required=required;
    if(type==='select') {
      const empty=document.createElement('option');empty.value='';empty.textContent='Selecciona una persona';input.append(empty);
      for(const person of records.personas) {const option=document.createElement('option');option.value=person.rut;option.textContent=person.nombre+' '+person.apellido+' · '+person.rut;input.append(option);}
      if(value && !records.personas.some(p=>p.rut===value)) {const option=document.createElement('option');option.value=value;option.textContent=value;input.append(option);}
    } else if(type!=='textarea') input.type=type;
    input.value=value ?? '';
    if(name==='motivo_visita') input.maxLength=320;
    if(['nombre','apellido'].includes(name)) input.maxLength=50;
    box.append(text,input);$('fields').append(box);return input;
  }
  function openRecord(row=null,readonly=false) {
    editing=row;$('fields').replaceChildren();$('form-error').hidden=true;$('save').hidden=readonly;
    $('editor-title').textContent=(readonly?'Detalle de ':row?'Editar ':'Añadir ')+model();
    if(resource==='personas') {
      field('rut','RUT','text',row?.rut).readOnly=!!row;
      field('nombre','Nombre','text',row?.nombre);field('apellido','Apellido','text',row?.apellido);
    } else {
      field('persona','Persona','select',row?.persona);field('motivo_visita','Motivo de la visita','textarea',row?.motivo_visita);
      field('fecha','Fecha solicitada','date',row?.fecha);field('hora_entrada','Hora de entrada (hora local)','datetime-local',localInput(row?.hora_entrada));
      field('hora_salida','Hora de salida (opcional, hora local)','datetime-local',localInput(row?.hora_salida),false);
    }
    if(readonly) $('fields').querySelectorAll('input,textarea,select').forEach(input=>input.disabled=true);
    $('editor').showModal();
  }
  $('create').addEventListener('click',()=>openRecord());$('cancel').addEventListener('click',()=>$('editor').close());
  $('editor').addEventListener('cancel',event=>{if(writing)event.preventDefault();});
  $('record-form').addEventListener('submit',async event=>{
    event.preventDefault();if(writing)return;writing=true;$('save').disabled=$('cancel').disabled=true;$('form-error').hidden=true;
    const data=Object.fromEntries(new FormData(event.target));
    if(resource==='visitas') for(const name of ['hora_entrada','hora_salida']) data[name]=data[name]?new Date(data[name]).toISOString():null;
    const path='/api/'+resource+'/'+(editing?encodeURIComponent(editing.rut??editing.id)+'/':'');
    try {await request(path,{method:editing?'PATCH':'POST',data});$('editor').close();notice('Registro guardado.');await load();}
    catch(error){$('form-error').textContent=error.message;$('form-error').hidden=false;}
    finally{writing=false;$('save').disabled=$('cancel').disabled=false;}
  });
  function askDelete(row) {deleting={resource,id:row.rut??row.id};$('delete-description').textContent='Se eliminará '+(row.nombre?row.nombre+' '+row.apellido:row.motivo_visita)+'.';$('delete-dialog').showModal();}
  $('delete-cancel').addEventListener('click',()=>$('delete-dialog').close());
  $('delete-dialog').addEventListener('cancel',event=>{if(writing)event.preventDefault();});
  $('delete-confirm').addEventListener('click',async()=>{
    if(writing||!deleting)return;writing=true;$('delete-confirm').disabled=$('delete-cancel').disabled=true;
    try{await request('/api/'+deleting.resource+'/'+encodeURIComponent(deleting.id)+'/',{method:'DELETE'});$('delete-dialog').close();notice('Registro eliminado.');await load();}
    catch(error){$('delete-dialog').close();notice(error.message,'danger');}
    finally{writing=false;$('delete-confirm').disabled=$('delete-cancel').disabled=false;}
  });
})();
