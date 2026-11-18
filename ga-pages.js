(()=>{const main=document.getElementById('app');if(!main)return;const key=document.body.dataset.page;const P='Analytics | ';const dates='Last 90 days   Aug 12 - Nov 9, 2026';const channels=[['Organic Search',242000],['Direct',195000],['Referral',84000],['Organic Social',61000],['Paid Search',66000],['Email',39000]];const pages=[['Nicoo Furniture Hub – Home (/)',249000],['Nicoo Furniture Hub – Collection (/collection)',161000],['Nicoo Furniture Hub – About (/about)',131000],['Nicoo Furniture Hub – Visit (/visit)',73000],['Nicoo Furniture Hub – Checkout (/checkout)',57000],['Nicoo Furniture Hub – Account (/account)',42000],['Nicoo Furniture Hub – Sign in (/sign-in)',29000]];const countries=[['Kenya',153000],['Tanzania',41000],['Uganda',38000],['United Kingdom',33500],['South Africa',30000],['United States',28000],['Rwanda',14000]];const events=[['page_view',742000,309000],['user_engagement',598000,281000],['first_visit',430000,430000],['session_start',386000,312000],['scroll',302000,169000],['click',86000,52000],['form_start',18400,9700],['form_submit',8400,6100]];function fmt(v){return v>=1e6?(v/1e6).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'M':v>=1000?(v/1000).toFixed(v>=100000?0:1).replace('.0','')+'K':String(v)}function head(title,date=dates){const initial=window.PortalSession?.initial?.()||'R';return '<div class="report-head"><div class="report-badge">'+initial+'</div><div class="report-title">'+title+'</div><button class="quality-pill" type="button" data-quality><span class="quality-dot">✓</span><span>Data quality</span></button><div class="report-spacer"></div><button class="date-pill" type="button"><b>'+date+'</b><span class="muted">Compare: preceding period</span></button><button class="report-action" type="button" data-share aria-label="Share report">↗</button><button class="report-action" type="button" data-more aria-label="More report actions">⋮</button></div>'}function path(vals,w=650,h=190,pad=12){const max=Math.max(...vals),min=Math.min(...vals);return vals.map((v,i)=>{const x=pad+i*(w-2*pad)/(vals.length-1),y=pad+(max-v)/(max-min||1)*(h-2*pad);return(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ')}function line(vals,label='Active users',h=210){return '<svg class="chart" viewBox="0 0 650 '+h+'" preserveAspectRatio="none"><g stroke="#e8eaed"><path d="M12 42H638M12 84H638M12 126H638M12 168H638"/></g><path d="'+path(vals,650,h)+'" fill="none" stroke="#1a73e8" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="legend"><span><i class="dot" style="background:#1a73e8"></i>'+label+'</span></div>'}function bars(rows){const m=Math.max(...rows.map(r=>r[1]));return '<div class="bars">'+rows.map(r=>'<div class="bar-row"><span>'+r[0]+'</span><div class="bar-track"><div class="bar-fill" style="width:'+(r[1]/m*100).toFixed(1)+'%"></div></div><b>'+fmt(r[1])+'</b></div>').join('')+'</div>'}function table(headers,rows,first='Dimension'){return '<div class="ga-table-wrap"><div class="table-tools">⌕ <input class="table-search" placeholder="Search..."><span class="right">Rows per page: 10    1-'+Math.min(10,rows.length)+' of '+rows.length+'</span></div><table class="ga-table"><thead><tr><th>'+first+'</th>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map((r,i)=>'<tr><td><span class="rank">'+(i+1)+'</span> '+r[0]+'</td>'+r.slice(1).map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}function minuteBars(vals){const m=Math.max(...vals);return '<div class="minute-bars">'+vals.map(v=>'<i style="height:'+(v/m*100)+'%"></i>').join('')+'</div>'}function world(){return '<img class="world" src="ga-world-map.webp" alt="Active users by country map" style="object-fit:contain;background:#fff">'}function closeReportMenus(){document.querySelectorAll('.report-menu').forEach(x=>x.remove())}
function reportMenu(anchor,title,items){
  closeReportMenus();
  const r=anchor.getBoundingClientRect(),m=document.createElement('div');m.className='panel-menu report-menu';
  m.style.cssText='top:'+(r.bottom+6)+'px;right:'+Math.max(10,innerWidth-r.right)+'px;left:auto;min-width:250px';
  if(title){const h=document.createElement('div');h.style.cssText='padding:7px 10px 6px;font-size:11px;color:#5f6368;font-weight:700;text-transform:uppercase';h.textContent=title;m.appendChild(h)}
  items.forEach(item=>{
    if(item==='---'){const d=document.createElement('div');d.style.cssText='height:1px;background:#e8eaed;margin:5px 2px';m.appendChild(d);return}
    const b=document.createElement('button');b.type='button';b.innerHTML=(item.icon?'<span style="display:inline-block;width:22px">'+item.icon+'</span>':'')+'<span>'+item.label+'</span>';
    b.onclick=()=>{m.remove();item.action?.()};m.appendChild(b);
  });
  document.body.appendChild(m);
  setTimeout(()=>document.addEventListener('click',function close(e){if(!m.contains(e.target)&&e.target!==anchor){m.remove();document.removeEventListener('click',close)}},true),0);
}
function simpleModal(title,html,actions=[]){
  const back=document.createElement('div');back.className='import-modal-backdrop';
  back.innerHTML='<div class="import-modal" style="width:min(560px,calc(100vw - 40px))"><div class="import-modal-head"><h2>'+title+'</h2><button class="import-modal-close" type="button">×</button></div><div class="import-modal-body">'+html+'</div><div class="import-modal-foot"></div></div>';
  document.body.appendChild(back);const close=()=>back.remove();
  back.querySelector('.import-modal-close').onclick=close;back.addEventListener('click',e=>{if(e.target===back)close()});
  const foot=back.querySelector('.import-modal-foot');
  actions.forEach(a=>{const b=document.createElement('button');b.type='button';b.className=a.primary?'primary':'btn-secondary';b.textContent=a.label;b.onclick=()=>a.action?.(close,back);foot.appendChild(b)});
  return back;
}
function shareCurrent(){
  const data={title:document.title,text:'Nicoo Furniture Analytics report',url:location.href};
  if(navigator.share)navigator.share(data).catch(()=>{});
  else if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(()=>GAToast('Report link copied')).catch(()=>GAToast('Copy the URL from the address bar'));
  else GAToast('Copy the URL from the address bar');
}
function exportCurrentTable(){
  const table=document.querySelector('.ga-table');let rows=[];
  if(table){
    rows=[...table.querySelectorAll('tr')].filter(r=>r.style.display!=='none').map(r=>[...r.children].map(c=>'"'+c.textContent.trim().replace(/"/g,'""')+'"').join(','));
  }else{
    rows.push('"Metric","Value"');
    document.querySelectorAll('.kpi').forEach(k=>{const label=k.querySelector('small')?.textContent.trim(),value=k.querySelector('strong')?.textContent.trim();if(label&&value)rows.push('"'+label.replace(/"/g,'""')+'","'+value.replace(/"/g,'""')+'"')});
    document.querySelectorAll('.bar-row').forEach(r=>{const parts=[...r.children];const label=parts[0]?.textContent.trim(),value=parts[2]?.textContent.trim();if(label&&value)rows.push('"'+label.replace(/"/g,'""')+'","'+value.replace(/"/g,'""')+'"')});
    const metric=document.querySelector('.metric,.metric-sm');if(rows.length===1&&metric)rows.push('"Report value","'+metric.textContent.trim().replace(/"/g,'""')+'"');
  }
  if(rows.length<=1){GAToast('No exportable report data found');return}
  const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(document.title.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'analytics-report')+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);GAToast('CSV download started');
}
function bind(){
  document.querySelectorAll('[data-quality]').forEach(b=>b.onclick=()=>simpleModal('Data quality','<div style="display:flex;gap:12px;align-items:flex-start"><div class="status-orb">✓</div><div><b>Report data is available</b><div class="sub" style="margin-top:5px">This portal is using the saved Nicoo Furniture Hub report snapshot. No sampling or threshold warning is active for this view.</div></div></div>',[{label:'Close',primary:true,action:c=>c()}]));
  document.querySelectorAll('[data-share]').forEach(b=>b.onclick=shareCurrent);
  document.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>reportMenu(b,'Report actions',[
    {label:'Share report',icon:'↗',action:shareCurrent},
    {label:'Download CSV',icon:'⇩',action:exportCurrentTable},
    {label:'Print / Save as PDF',icon:'▣',action:()=>window.print()},
    '---',
    {label:'Refresh report',icon:'↻',action:()=>{GAProgress?.pulse?.(650);document.querySelectorAll('.bar-fill').forEach(x=>{x.style.animation='none';void x.offsetWidth;x.style.animation='barIn .55s ease both'});GAToast('Report refreshed')}}
  ]));
  document.querySelectorAll('.date-pill').forEach(b=>b.onclick=()=>{
    const realtime=/minutes/i.test(b.textContent);
    const ranges=realtime?[
      ['Last 5 minutes','Realtime window changed to 5 minutes'],
      ['Last 30 minutes','Realtime window changed to 30 minutes'],
      ['Last 60 minutes','Realtime window changed to 60 minutes']
    ]:[
      ['Last 7 days','Nov 12 - Nov 18, 2026'],
      ['Last 30 days','Oct 20 - Nov 18, 2026'],
      ['Last 90 days','Aug 21 - Nov 18, 2026']
    ];
    reportMenu(b,'Date range',ranges.map(([label,dates])=>({label,icon:b.querySelector('b')?.textContent.includes(label)?'✓':'',action:()=>{
      if(realtime && window.RealtimeSim){
        const mins=Number((label.match(/\d+/)||['30'])[0]);
        window.RealtimeSim.setWindow(mins);
        GAProgress?.pulse?.(420);
        GAToast(label+' applied');
      }else{
        b.querySelector('b').textContent=label+'   '+dates;
        const muted=b.querySelector('.muted');if(muted)muted.textContent='Compare: preceding period';
        localStorage.setItem('gaSharedRange:'+location.pathname,label);
        GAProgress?.pulse?.(500);
        GAToast(label+' applied');
      }
    }})));
  });
  document.querySelectorAll('.table-search').forEach(inp=>inp.addEventListener('input',()=>{const q=inp.value.toLowerCase(),tbody=inp.closest('.ga-table-wrap').querySelector('tbody');[...tbody.rows].forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?'':'none')}));
  document.querySelectorAll('[data-event-name]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();const name=a.dataset.eventName,row=events.find(x=>x[0]===name);
    if(!row)return;
    simpleModal('Event: '+name,'<div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)"><div class="kpi"><small>Event count</small><strong>'+fmt(row[1])+'</strong></div><div class="kpi"><small>Total users</small><strong>'+fmt(row[2])+'</strong></div><div class="kpi"><small>Events / user</small><strong>'+(row[1]/row[2]).toFixed(2)+'</strong></div></div><div class="sub" style="margin-top:14px">This is the saved event snapshot for '+name+'.</div>',[{label:'Close',primary:true,action:c=>c()}]);
  }));
}
const RealtimeSim={
  minutes:30,
  tick:0,
  timer:null,
  base:{
    5:{active:28,source:[['google',12],['(direct)',7],['facebook.com',4],['instagram.com',3],['bing',2]],page:[['Nicoo Furniture Hub – Home (/)',47],['Nicoo Furniture Hub – Collection (/collection)',31],['Nicoo Furniture Hub – About (/about)',24],['Nicoo Furniture Hub – Visit (/visit)',13],['Nicoo Furniture Hub – Checkout (/checkout)',9]],event:[['page_view',128],['user_engagement',103],['first_visit',73],['session_start',65],['scroll',50]]},
    30:{active:96,source:[['google',39],['(direct)',24],['facebook.com',13],['instagram.com',9],['bing',6]],page:[['Nicoo Furniture Hub – Home (/)',249],['Nicoo Furniture Hub – Collection (/collection)',161],['Nicoo Furniture Hub – About (/about)',131],['Nicoo Furniture Hub – Visit (/visit)',73],['Nicoo Furniture Hub – Checkout (/checkout)',57]],event:[['page_view',742],['user_engagement',598],['first_visit',430],['session_start',386],['scroll',302]]},
    60:{active:176,source:[['google',73],['(direct)',45],['facebook.com',25],['instagram.com',17],['bing',11]],page:[['Nicoo Furniture Hub – Home (/)',474],['Nicoo Furniture Hub – Collection (/collection)',307],['Nicoo Furniture Hub – About (/about)',248],['Nicoo Furniture Hub – Visit (/visit)',139],['Nicoo Furniture Hub – Checkout (/checkout)',109]],event:[['page_view',1406],['user_engagement',1131],['first_visit',816],['session_start',733],['scroll',572]]}
  },
  drift(value,index){
    const wave=Math.sin((this.tick+index*1.7)*0.65)*0.045+Math.sin((this.tick+index)*0.23+0.7)*0.02;
    return Math.max(1,Math.round(value*(1+wave)));
  },
  series(){
    const count=this.minutes;
    const base=this.minutes===5?7:(this.minutes===30?9:8);
    const out=[];
    for(let i=0;i<count;i++){
      const wave=Math.sin((i+this.tick)*0.55)*2.1+Math.sin((i+this.tick)*0.18+1.2)*1.5;
      out.push(Math.max(2,Math.round(base+wave+((i+this.tick)%9===0?2:0))));
    }
    return out;
  },
  rows(rows){
    return rows.map((r,i)=>[r[0],this.drift(r[1],i+2)]);
  },
  paint(){
    const cfg=this.base[this.minutes]||this.base[30];
    const active=this.drift(cfg.active,0);
    const pill=document.querySelector('.date-pill');
    if(pill){
      const strong=pill.querySelector('b');if(strong)strong.textContent='Last '+this.minutes+' minutes';
      const muted=pill.querySelector('.muted');if(muted)muted.textContent='Simulated realtime window';
    }
    const title=document.querySelector('[data-rt-title]');if(title)title.textContent='Active users in last '+this.minutes+' minutes';
    const metric=document.querySelector('[data-rt-active]');if(metric)metric.textContent=String(active);
    const minute=document.querySelector('[data-rt-minutes]');if(minute)minute.innerHTML=minuteBars(this.series());
    const source=document.querySelector('[data-rt-source]');if(source)source.innerHTML=bars(this.rows(cfg.source));
    const page=document.querySelector('[data-rt-page]');if(page)page.innerHTML=bars(this.rows(cfg.page));
    const event=document.querySelector('[data-rt-event]');if(event)event.innerHTML=bars(this.rows(cfg.event));
  },
  setWindow(minutes){
    if(minutes!==5&&minutes!==30&&minutes!==60)minutes=30;
    this.minutes=minutes;
    this.tick++;
    localStorage.setItem('gaRealtimeWindow',String(minutes));
    localStorage.setItem('gaSharedRange:'+location.pathname,'Last '+minutes+' minutes');
    this.paint();
  },
  mount(){
    const saved=Number(localStorage.getItem('gaRealtimeWindow')||30);
    this.minutes=(saved===5||saved===30||saved===60)?saved:30;
    const m=this.minutes;
    main.innerHTML=head('Realtime overview','Last '+m+' minutes')+
      '<div class="content"><div class="hero-grid">'+
      '<div class="card realtime-card"><h3 data-rt-title>Active users in last '+m+' minutes</h3><div class="metric" data-rt-active>96</div><div class="sub">Users per minute · Simulated</div><div data-rt-minutes></div></div>'+
      '<div class="card realtime-card"><h3>Active users by Country</h3>'+world()+'<div class="sub" style="margin-top:5px">Simulated realtime activity</div></div>'+
      '</div><div class="grid" style="margin-top:14px">'+
      '<div class="card" style="grid-column:span 4"><h3>Active users by First user source</h3><div data-rt-source></div></div>'+
      '<div class="card" style="grid-column:span 4"><h3>Views by Page title</h3><div data-rt-page></div></div>'+
      '<div class="card" style="grid-column:span 4"><h3>Event count by Event name</h3><div data-rt-event></div></div>'+
      '</div></div>';
    bind();
    this.paint();
    clearInterval(this.timer);
    this.timer=setInterval(()=>{this.tick++;this.paint()},5000);
  }
};
window.RealtimeSim=RealtimeSim;
function realtime(){RealtimeSim.mount()}
function realtimePages(){const rows=pages.map((r,i)=>[r[0],fmt(Math.round(r[1]/210)),fmt(Math.max(3,Math.round(r[1]/4300)))]);main.innerHTML=head('Realtime pages','Last 30 minutes')+'<div class="content"><div class="kpi-grid"><div class="kpi"><small>Views</small><strong>3.5K</strong></div><div class="kpi"><small>Active users</small><strong>96</strong></div><div class="kpi" style="grid-column:span 2"><small>Active users per minute</small>'+minuteBars([4,5,7,6,8,10,9,11,13,12,15,14,12,11,10,9,8,10,12,14,13,12,11,9,8,7,9,11,10,8])+'</div></div><div style="margin-top:14px">'+table(['Views','Active users'],rows,'Page path and screen class')+'</div></div>';bind()}function objective(title,type){const isLead=type==='lead';main.innerHTML=head(title)+'<div class="content"><div class="objective-head">WHAT ARE YOUR TOP RESULTS?</div><div class="grid"><div class="card" style="grid-column:span 6"><h3>Sessions by Session primary channel group</h3>'+bars(channels)+'</div><div class="card" style="grid-column:span 6"><h3>'+(isLead?'Lead events':'Purchase activity')+'</h3>'+(isLead?'<div class="no-data"><div><div class="circle">◇</div><b>No lead key events configured</b><div class="sub">Configure a key event to populate lead performance.</div></div></div>':'<div class="no-data"><div><div class="circle">▣</div><b>No ecommerce purchase data</b><div class="sub">Purchase metrics will appear after ecommerce events are collected.</div></div></div>')+'</div><div class="card" style="grid-column:span 6"><h3>New users by First user primary channel group</h3>'+bars([['Organic Search',190000],['Direct',99000],['Organic Social',55000],['Referral',51000],['Paid Search',38000]])+'</div><div class="card" style="grid-column:span 6"><h3>'+(isLead?'Landing pages':'Purchase journey')+'</h3>'+(isLead?bars(pages.slice(0,5).map(r=>[r[0],Math.round(r[1]*.42)])):'<div class="funnel"><div class="funnel-step" style="height:100%">Session start</div><div class="funnel-step" style="height:64%">View item</div><div class="funnel-step" style="height:22%">Add to cart</div><div class="funnel-step" style="height:8%">Purchase</div></div>')+'</div></div></div>';bind()}function behavior(){main.innerHTML=head('Understand web and/or app performance')+'<div class="content"><div class="grid"><div class="card" style="grid-column:span 7"><h3>Views over time</h3>'+line([62,67,70,68,74,79,81,78,85,89,92,88,94,101,96,92,99,105,101,108,103,111,106,114,109,112,118,116,121,119])+'</div><div class="card" style="grid-column:span 5"><h3>Views by Page title and screen class</h3>'+bars(pages)+'</div><div class="card" style="grid-column:span 6"><h3>Event count by Event name</h3>'+bars(events.slice(0,6).map(r=>[r[0],r[1]]))+'</div><div class="card" style="grid-column:span 6"><h3>User activity over time</h3>'+line([18,19,20,19,22,23,24,25,27,28,29,28,31,33,34,33,35,37,38,37,39,40,41,39,42,43,42,44,45,46],'30 days')+'</div></div></div>';bind()}function engagement(){main.innerHTML=head('Engagement overview')+'<div class="content"><div class="grid"><div class="card" style="grid-column:span 7"><h3>Average engagement time per active user</h3><div class="metric-sm">1m 38s</div>'+line([61,64,63,66,68,67,71,72,74,73,77,76,80,82,81,85,84,86,88,87,90,91,89,93,94,95,96,95,98,99],'Engagement time')+'</div><div class="card" style="grid-column:span 5"><h3>Views by Page title</h3>'+bars(pages.slice(0,6))+'</div><div class="card" style="grid-column:span 6"><h3>Event count by Event name</h3>'+bars(events.slice(0,6).map(r=>[r[0],r[1]]))+'</div><div class="card" style="grid-column:span 6"><h3>Active users by Country</h3>'+bars(countries.slice(0,6))+'</div></div></div>';bind()}function eventsPage(){const rows=events.map(r=>['<a class="event-link" href="#event-'+encodeURIComponent(r[0])+'" data-event-name="'+r[0]+'">'+r[0]+'</a>',fmt(r[1]),fmt(r[2]),(r[1]/r[2]).toFixed(2),'KES 0.00']);main.innerHTML=head('Events: Event name')+'<div class="content"><div class="card" style="margin-bottom:14px"><h3>Event count by Event name over time</h3>'+line([42,45,44,51,49,53,59,57,62,68,66,73,70,75,79,77,83,86,84,91,88,94,96,93,98,102,99,105,107,104],'Event count')+'</div>'+table(['Event count','Total users','Event count per user','Total revenue'],rows,'Event name')+'</div>';bind()}function pagesPage(){const rows=pages.map((r,i)=>['<span class="page-cell"><span class="rank">'+(i+1)+'</span><span>'+r[0]+'</span></span>',fmt(r[1]),fmt(Math.round(r[1]*.58)),(1.2+i*.06).toFixed(2),(78-i*5)+'s']);main.innerHTML=head('Pages and screens: Page title and screen class')+'<div class="content"><div class="grid" style="margin-bottom:14px"><div class="card" style="grid-column:span 8"><h3>Views by Page title and screen class over time</h3>'+line([33,36,35,42,41,39,43,45,44,52,49,47,61,48,45,46,50,52,51,58,54,53,57,60,58,62,64,61,66,65],'Views')+'</div><div class="card" style="grid-column:span 4"><h3>Views by Page title</h3>'+bars(pages)+'</div></div>'+table(['Views','Active users','Views per active user','Average engagement time'],rows,'Page title and screen class')+'</div>';bind()}
function importPage(){
  const TYPES={
    'CSV':{desc:'Upload a .csv or .tsv file',fields:[['name','Data source name','Rieng campaign costs'],['file','Campaign file','file'],['schedule','Import schedule','select:Manual|Daily|Weekly']]},
    'Google Sheets':{desc:'Connect a Google Sheets campaign table',fields:[['name','Data source name','Campaign sheet'],['sheetUrl','Google Sheets URL','https://docs.google.com/spreadsheets/...'],['range','Sheet / range','Campaigns!A:I'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'BigQuery':{desc:'Read campaign data from a BigQuery table',fields:[['name','Data source name','Campaign BigQuery'],['project','Project ID','my-project'],['dataset','Dataset','marketing'],['table','Table','campaign_costs'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'Amazon S3':{desc:'Import a CSV/TSV object from Amazon S3',fields:[['name','Data source name','Campaign S3'],['bucket','Bucket','my-campaign-data'],['object','Object path','imports/campaigns.csv'],['region','AWS region','eu-west-1'],['access','Access key ID','AKIA...'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'PostgreSQL':{desc:'Read campaign data from a PostgreSQL table',fields:[['name','Data source name','Campaign PostgreSQL'],['host','Host','db.example.com'],['port','Port','5432'],['database','Database','analytics'],['table','Schema.table','public.campaign_costs'],['username','Username','analytics_reader'],['password','Password','password'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'SFTP':{desc:'Import a CSV/TSV file over SFTP',fields:[['name','Data source name','Campaign SFTP'],['host','Host','sftp.example.com'],['port','Port','22'],['username','Username','analytics'],['password','Password','password'],['path','File path','/exports/campaigns.csv'],['schedule','Import schedule','select:Daily|Weekly|Manual']]}
  };
  const sourceKey='gaCampaignSourcesV2',historyKey='gaCampaignImportHistoryV2';
  const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const when=()=>new Date().toLocaleString([], {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const baseHeaders=['utm_id','utm_campaign','utm_source','utm_medium','date','impressions','clicks','cost','currency'];
  const validateHeaders=(headers)=>{
    const h=headers.map(x=>String(x).trim().toLowerCase());
    const errors=[],warnings=[];
    ['utm_source','utm_medium','date'].forEach(x=>{if(!h.includes(x))errors.push('Missing required field: '+x)});
    if(!['impressions','clicks','cost'].some(x=>h.includes(x)))errors.push('Include at least one metric: impressions, clicks, or cost');
    if(h.includes('cost')&&!h.includes('currency'))warnings.push('Cost is present without a currency column. A static currency will be required.');
    if(!h.includes('utm_id'))warnings.push('utm_id is recommended for more reliable campaign matching.');
    if(!h.includes('utm_campaign'))warnings.push('utm_campaign is recommended for readable campaign names.');
    return {errors,warnings};
  };

  function historyHtml(history){
    if(!history.length)return '<div class="empty"><div><div class="empty-icon">▤</div><b>No import history</b><div class="sub">Validation runs will appear here.</div></div></div>';
    return '<table class="ga-table"><thead><tr><th>Run</th><th>Data source</th><th>Source</th><th>Rows</th><th>Errors</th><th>Status</th></tr></thead><tbody>'+
      history.slice(0,12).map(h=>'<tr><td>'+esc(h.time)+'</td><td>'+esc(h.sourceName)+'</td><td>'+esc(h.type)+'</td><td>'+esc(h.rows)+'</td><td>'+esc(h.errors)+'</td><td><span class="history-status '+(h.status==='Success'?'ok':h.status==='Running'?'running':'bad')+'">'+(h.status==='Success'?'●':'●')+' '+esc(h.status)+'</span></td></tr>').join('')+
      '</tbody></table>';
  }

  function render(){
    const sources=read(sourceKey),history=read(historyKey),latest=sources[0];
    const counts=Object.fromEntries(Object.keys(TYPES).map(t=>[t,sources.filter(s=>s.type===t).length]));
    const sourceCards=Object.entries(TYPES).map(([type,m])=>
      '<button class="source-pill" data-source="'+esc(type)+'"><b>'+esc(type)+'</b><small>'+esc(m.desc)+(counts[type]?' · '+counts[type]+' connected':'')+'</small></button>'
    ).join('');
    const status=latest
      ? '<div class="import-status"><div class="status-orb">✓</div><div class="status-copy"><b>'+esc(latest.name)+'</b><div class="status-meta">'+esc(latest.type)+' · '+esc(latest.schedule||'Manual')+'<br>Last validated '+esc(latest.lastValidated)+'</div><span class="status">✓ Ready for import</span></div></div>'+
        '<div class="source-summary"><div><strong>Campaign schema</strong><small>'+latest.headers.length+' mapped fields · '+(latest.rows||0)+' sampled rows</small></div><span class="source-badge">'+esc(latest.type)+'</span></div>'+
        '<div class="import-actions"><button class="primary" data-run="'+latest.id+'">Run validation</button><button class="btn-secondary" data-edit="'+latest.id+'">Edit</button><button class="btn-danger" data-delete="'+latest.id+'">Delete</button></div>'
      : '<div class="empty"><div><div class="empty-icon">⇧</div><b>No campaign data imports configured</b><div class="sub">Create a data source to validate campaign fields before importing.</div><button class="empty-action" data-create style="margin-top:14px">Create data source</button></div></div>';
    main.innerHTML=head('Campaign data import validation')+
      '<div class="content"><div class="import-panel"><div class="card"><h3>Campaign data sources</h3><div class="sub">Connect an import source to validate campaign data before it is joined with Analytics.</div><div class="source-list" style="margin-top:16px">'+sourceCards+'</div></div>'+
      '<div class="card"><h3>Validation status</h3>'+status+'</div></div>'+
      '<div class="ga-table-wrap" style="margin-top:14px"><div class="table-tools"><b>Import history</b><span class="right">Last 90 days · '+history.length+' runs</span></div>'+historyHtml(history)+'</div></div>';
    bind();
    main.querySelector('[data-create]')?.addEventListener('click',()=>openWizard());
    main.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>openWizard(b.dataset.source)));
    main.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openWizard('',b.dataset.edit)));
    main.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{
      const list=read(sourceKey),s=list.find(x=>x.id===b.dataset.delete);
      if(!s)return;
      if(confirm('Delete '+s.name+'?')){write(sourceKey,list.filter(x=>x.id!==s.id));GAToast('Data source deleted');render()}
    }));
    main.querySelectorAll('[data-run]').forEach(b=>b.addEventListener('click',()=>runValidation(b.dataset.run)));
  }

  function fieldsFor(type,values={}){
    return TYPES[type].fields.map(([key,label,kind])=>{
      if(kind==='file')return '<div class="field full"><label>'+label+'</label><input type="file" data-field="'+key+'" accept=".csv,.tsv,text/csv,text/tab-separated-values"><small class="muted" data-file-note>'+(values.fileName?esc(values.fileName):'CSV or TSV with a header row')+'</small></div>';
      if(kind.startsWith('select:')){
        const opts=kind.slice(7).split('|');
        return '<div class="field"><label>'+label+'</label><select data-field="'+key+'">'+opts.map(o=>'<option '+((values[key]||'')===o?'selected':'')+'>'+o+'</option>').join('')+'</select></div>';
      }
      const pass=key==='password'?'password':'text';
      return '<div class="field '+(['sheetUrl','object','table','path'].includes(key)?'full':'')+'"><label>'+label+'</label><input type="'+pass+'" data-field="'+key+'" value="'+esc(values[key]||'')+'" placeholder="'+esc(kind)+'"></div>';
    }).join('');
  }

  function openWizard(preselected='',editId=''){
    const sources=read(sourceKey),editing=sources.find(x=>x.id===editId);
    const st={step:1,type:preselected||editing?.type||'',values:{...(editing?.config||{}),name:editing?.name||''},headers:editing?.headers?.slice()||[],rows:editing?.rows||0,fileName:editing?.config?.fileName||'',editId};
    const back=document.createElement('div');back.className='import-modal-backdrop';document.body.appendChild(back);
    const close=()=>back.remove();

    function collect(){
      back.querySelectorAll('[data-field]').forEach(el=>{
        if(el.type==='file')return;
        st.values[el.dataset.field]=el.value.trim();
      });
    }
    function body(){
      if(st.step===1)return '<h3 style="margin:0 0 6px">Choose an import source</h3><div class="sub" style="margin-bottom:14px">Campaign data import can connect to a file, sheet, warehouse, database, or secure file server.</div><div class="import-source-grid">'+Object.entries(TYPES).map(([t,m])=>'<button class="import-source-choice '+(st.type===t?'selected':'')+'" data-choice="'+esc(t)+'">'+esc(t)+'<small>'+esc(m.desc)+'</small></button>').join('')+'</div>';
      if(st.step===2)return '<h3 style="margin:0 0 6px">Configure '+esc(st.type)+'</h3><div class="sub" style="margin-bottom:14px">Enter the connection details Analytics would use to read your campaign data.</div><div class="field-grid">'+fieldsFor(st.type,{...st.values,fileName:st.fileName})+'</div>';
      const check=validateHeaders(st.headers.length?st.headers:baseHeaders);
      const rows=(st.headers.length?st.headers:baseHeaders).map(h=>'<div class="schema-row"><span>'+esc(h)+'</span><span>'+esc(h)+'</span><span class="'+(check.errors.some(e=>e.includes(h))?'schema-warn':'schema-ok')+'">'+(check.errors.some(e=>e.includes(h))?'Check':'Mapped')+'</span></div>').join('');
      return '<h3 style="margin:0 0 6px">Review field mapping</h3><div class="sub">Campaign source, medium and date are required. At least one campaign metric must be included.</div><div class="schema-box"><div class="schema-row head"><span>Source field</span><span>Analytics field</span><span>Status</span></div>'+rows+'</div>'+
        (check.errors.length?'<div style="margin-top:12px;color:#d93025;font-size:12px"><b>Fix before saving:</b><br>'+check.errors.map(esc).join('<br>')+'</div>':'')+
        (check.warnings.length?'<div style="margin-top:10px;color:#b06000;font-size:12px"><b>Recommendations:</b><br>'+check.warnings.map(esc).join('<br>')+'</div>':'');
    }
    function draw(){
      back.innerHTML='<div class="import-modal"><div class="import-modal-head"><h2>'+(st.editId?'Edit':'Create')+' campaign data source</h2><button class="import-modal-close">×</button></div><div class="import-steps"><i class="import-step on"></i><i class="import-step '+(st.step>=2?'on':'')+'"></i><i class="import-step '+(st.step>=3?'on':'')+'"></i></div><div class="import-modal-body">'+body()+'</div><div class="import-modal-foot">'+(st.step>1?'<button class="btn-secondary" data-back>Back</button>':'')+'<button class="btn-secondary" data-cancel>Cancel</button><button class="primary" data-next>'+(st.step===3?'Validate & save':'Next')+'</button></div></div>';
      back.querySelector('.import-modal-close').onclick=close;back.querySelector('[data-cancel]').onclick=close;
      back.querySelector('[data-back]')?.addEventListener('click',()=>{collect();st.step--;draw()});
      back.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{st.type=b.dataset.choice;draw()}));
      const file=back.querySelector('[data-field="file"]');
      if(file)file.addEventListener('change',()=>{
        const picked=file.files?.[0];if(!picked)return;
        st.fileName=picked.name;st.values.fileName=picked.name;
        const reader=new FileReader();
        reader.onload=()=>{
          const text=String(reader.result||'');
          const first=(text.split(/\r?\n/)[0]||'').trim();
          const sep=first.includes('\t')?'\t':',';
          st.headers=first.split(sep).map(x=>x.trim().replace(/^"|"$/g,'')).filter(Boolean);
          st.rows=Math.max(0,text.split(/\r?\n/).filter(Boolean).length-1);
          const note=back.querySelector('[data-file-note]');if(note)note.textContent=picked.name+' · '+st.rows+' data rows';
        };
        reader.readAsText(picked);
      });
      back.querySelector('[data-next]').onclick=()=>{
        collect();
        if(st.step===1){if(!st.type){GAToast('Choose a data source');return}st.step=2;draw();return}
        if(st.step===2){
          if(!st.values.name){GAToast('Enter a data source name');return}
          if(st.type==='CSV'&&!st.fileName&&!st.editId){GAToast('Choose a CSV or TSV file');return}
          const required={ 'Google Sheets':['sheetUrl','range'],'BigQuery':['project','dataset','table'],'Amazon S3':['bucket','object','region'],'PostgreSQL':['host','database','table','username'],'SFTP':['host','username','path'] }[st.type]||[];
          if(required.some(k=>!st.values[k])){GAToast('Complete the required connection fields');return}
          if(!st.headers.length)st.headers=baseHeaders.slice();
          st.step=3;draw();return;
        }
        const check=validateHeaders(st.headers);
        if(check.errors.length){GAToast('Schema has '+check.errors.length+' blocking issue'+(check.errors.length>1?'s':''));return}
        validateAndSave();
      };
    }
    function validateAndSave(){
      const modal=back.querySelector('.import-modal-body');
      const foot=back.querySelector('.import-modal-foot');
      foot.innerHTML='<button class="btn-secondary" disabled>Validating…</button>';
      const steps=['Connecting to '+st.type,'Reading column headers','Validating campaign schema','Checking campaign keys'];
      modal.innerHTML='<h3 style="margin:0">Validating data source</h3><div class="validation-log">'+steps.map((s,i)=>'<div data-v="'+i+'"><i class="'+(i===0?'spin':'')+'">'+(i===0?'↻':'')+'</i><span>'+esc(s)+'</span></div>').join('')+'</div>';
      let i=0;
      const tick=()=>{
        const row=modal.querySelector('[data-v="'+i+'"]');if(row){row.querySelector('i').className='';row.querySelector('i').textContent='✓'}
        i++;
        if(i<steps.length){const n=modal.querySelector('[data-v="'+i+'"] i');n.className='spin';n.textContent='↻';setTimeout(tick,360);return}
        setTimeout(()=>{
          const list=read(sourceKey),old=list.find(x=>x.id===st.editId);
          const item={id:old?.id||uid(),type:st.type,name:st.values.name,config:{...st.values,fileName:st.fileName},schedule:st.values.schedule||'Manual',status:'Ready',headers:st.headers,lastValidated:when(),rows:st.rows||old?.rows||24};
          const next=[item,...list.filter(x=>x.id!==item.id)];write(sourceKey,next);
          const hist=read(historyKey);hist.unshift({id:uid(),sourceId:item.id,sourceName:item.name,type:item.type,time:item.lastValidated,status:'Success',rows:item.rows,errors:0});write(historyKey,hist.slice(0,50));
          close();GAToast('Data source validated and saved');render();
        },420);
      };
      setTimeout(tick,360);
    }
    draw();
  }

  function runValidation(id){
    const list=read(sourceKey),s=list.find(x=>x.id===id);if(!s)return;
    window.GAProgress?.start();GAToast('Validating '+s.name+'…');
    setTimeout(()=>{
      s.lastValidated=when();write(sourceKey,[s,...list.filter(x=>x.id!==id)]);
      const hist=read(historyKey);hist.unshift({id:uid(),sourceId:s.id,sourceName:s.name,type:s.type,time:s.lastValidated,status:'Success',rows:s.rows||24,errors:0});write(historyKey,hist.slice(0,50));
      window.GAProgress?.done();GAToast('Validation successful');render();
    },900);
  }

  render();
}
function userOverview(){main.innerHTML=head('User attributes overview')+'<div class="content"><div class="grid"><div class="card" style="grid-column:span 6"><h3>Active users by Country</h3>'+bars(countries)+'</div><div class="card" style="grid-column:span 6"><h3>Active users in last 30 minutes</h3><div class="metric">96</div>'+minuteBars([4,5,7,6,8,10,9,11,13,12,15,14,12,11,10,9,8,10,12,14,13,12,11,9,8,7,9,11,10,8])+'</div><div class="card" style="grid-column:span 4"><h3>Active users by City</h3>'+bars([['Nairobi',82000],['Mombasa',21000],['Kampala',17000],['Dar es Salaam',15000],['Kigali',7000]])+'</div><div class="card" style="grid-column:span 4"><h3>Active users by Age</h3>'+bars([['18-24',87000],['25-34',72000],['35-44',38000],['45-54',18000],['55-64',6000]])+'</div><div class="card" style="grid-column:span 4"><h3>Active users by Language</h3>'+bars([['English',168000],['Swahili',69000],['French',12000],['Other',8000]])+'</div></div></div>';bind()}
function audiences(){
  const COLORS={primary:'#4292c6',compare:'#e37400',green:'#69b34c'};
  const metricMeta={
    'Users':{total:'445K',scale:1},
    'New Users':{total:'430K',scale:.91},
    'Sessions':{total:'700K',scale:1.34},
    'Pageviews':{total:'742K',scale:1.52}
  };
  const periodBase={
    'Hourly':{labels:['12a','3a','6a','9a','12p','3p','6p','9p'],vals:[12.2,9.4,11.1,18.5,23.4,21.6,25.8,19.7]},
    'Day':{labels:['Nov 3','Nov 4','Nov 5','Nov 6','Nov 7','Nov 8','Nov 9'],vals:[20.8,15.2,15.8,22.4,23.7,26.4,25.7]},
    'Week':{labels:['Sep 21','Sep 28','Oct 5','Oct 12','Oct 19','Oct 26','Nov 2','Nov 9'],vals:[18.4,19.7,21.1,20.5,22.8,24.0,25.2,26.1]},
    'Month':{labels:['Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'],vals:[14.2,15.1,14.8,16.5,17.9,18.4,19.7,20.6,21.9,23.8,24.9,26.1]}
  };
  const dims={
    Language:[['en-us',280000,62.92],['sw',104000,23.37],['en-gb',22000,4.94],['fr',12000,2.70],['en-ca',8400,1.89],['de',6100,1.37],['es',5200,1.17]],
    Country:[['Kenya',153000,34.38],['Tanzania',41000,9.21],['Uganda',38000,8.54],['United Kingdom',33500,7.53],['South Africa',30000,6.74],['United States',28000,6.29],['Rwanda',14000,3.15]],
    City:[['Nairobi',82000,18.43],['Mombasa',21000,4.72],['Kampala',17000,3.82],['Dar es Salaam',15000,3.37],['Kigali',7000,1.57],['Kisumu',6100,1.37],['Nakuru',5200,1.17]],
    Browser:[['Chrome',276000,62.02],['Safari',71000,15.96],['Edge',32000,7.19],['Firefox',23000,5.17],['Opera',18000,4.04],['Samsung Internet',13000,2.92],['Other',12000,2.70]],
    'Operating System':[['Android',246000,55.28],['Windows',76000,17.08],['iOS',71000,15.96],['macOS',26000,5.84],['Linux',15000,3.37],['Chrome OS',6400,1.44],['Other',4600,1.03]],
    'Service Provider':[['Safaricom',172000,38.65],['Airtel Kenya',61000,13.71],['Telkom Kenya',21000,4.72],['MTN Uganda',18000,4.04],['Vodacom Tanzania',16000,3.60],['Other / unknown',157000,35.28]]
  };
  const kpis=[
    ['Users','445K'],['New Users','430K'],['Sessions','700K'],['Sessions / User','1.57'],
    ['Pageviews','742K'],['Pages / Session','1.66'],['Avg. Session Duration','00:01:38'],['Bounce Rate','41.20%']
  ];
  let state={
    metric:localStorage.getItem('audMetric')||'Users',
    compare:localStorage.getItem('audCompare')||'',
    period:localStorage.getItem('audPeriod')||'Day',
    dim:localStorage.getItem('audDim')||'Language',
    sort:'users',dir:-1
  };
  const fmt=v=>v>=1000000?(v/1e6).toFixed(1)+'M':v>=1000?(v/1000).toFixed(v>=100000?0:1).replace('.0','')+'K':String(Math.round(v));
  const scaled=(metric,period)=>{
    const m=metricMeta[metric]||metricMeta.Users,b=periodBase[period];
    return b.vals.map((v,i)=>Math.max(1,v*m.scale*(1+Math.sin(i*.91+metric.length)*.035)));
  };
  const spark=(seed=1)=>{
    const vals=Array.from({length:12},(_,i)=>18+Math.sin(i*.75+seed)*4+i*.18);
    const max=Math.max(...vals),min=Math.min(...vals);
    const pts=vals.map((v,i)=>(i*10)+','+(24-(v-min)/(max-min||1)*18)).join(' ');
    return '<svg class="aud-spark" viewBox="0 0 110 28" preserveAspectRatio="none"><polygon points="0,28 '+pts+' 110,28" fill="#e7f2f8"/><polyline points="'+pts+'" fill="none" stroke="#4292c6" stroke-width="1.4"/></svg>';
  };
  const chartSvg=()=>{
    const vals=scaled(state.metric,state.period),cmp=state.compare?scaled(state.compare,state.period):null;
    const all=cmp?vals.concat(cmp):vals,max=Math.max(...all)*1.12,min=0,w=1000,h=205,pl=42,pr=12,pt=10,pb=28;
    const x=i=>pl+(w-pl-pr)*(i/Math.max(1,vals.length-1));
    const y=v=>pt+(h-pt-pb)*(1-v/max);
    const path=a=>a.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
    const area=path(vals)+' L'+x(vals.length-1).toFixed(1)+' '+(h-pb)+' L'+x(0).toFixed(1)+' '+(h-pb)+' Z';
    const grid=Array.from({length:4},(_,i)=>{const yy=pt+(h-pt-pb)*(i/3);const val=max*(1-i/3);return '<path d="M'+pl+' '+yy+'H'+(w-pr)+'" stroke="#e6e6e6"/><text x="'+(pl+2)+'" y="'+(yy-4)+'" font-size="10" fill="#666">'+fmt(val*10000)+'</text>'}).join('');
    const labels=periodBase[state.period].labels.map((l,i)=>'<text x="'+x(i)+'" y="'+(h-8)+'" text-anchor="middle" font-size="10" fill="#666">'+l+'</text>').join('');
    const dots=vals.map((v,i)=>'<circle cx="'+x(i)+'" cy="'+y(v)+'" r="3.3" fill="'+COLORS.primary+'" data-aud-point="'+i+'"/>').join('');
    const cmpPath=cmp?'<path d="'+path(cmp)+'" fill="none" stroke="'+COLORS.compare+'" stroke-width="2" vector-effect="non-scaling-stroke"/>':'';
    return '<svg class="aud-main-chart" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none">'+grid+'<path d="'+area+'" fill="#e7f2f8"/><path d="'+path(vals)+'" fill="none" stroke="'+COLORS.primary+'" stroke-width="2.6" vector-effect="non-scaling-stroke"/>'+cmpPath+dots+labels+'</svg>';
  };
  const renderTable=()=>{
    const rows=(dims[state.dim]||[]).slice();
    rows.sort((a,b)=>state.dir*((state.sort==='pct'?a[2]-b[2]:a[1]-b[1])));
    const q=(document.querySelector('.aud-table-search')?.value||'').toLowerCase();
    const filtered=rows.filter(r=>r[0].toLowerCase().includes(q));
    const body=document.querySelector('[data-aud-table-body]');if(!body)return;
    body.innerHTML=filtered.map((r,i)=>'<tr><td><span class="aud-rank">'+(i+1)+'.</span><span class="aud-dim-link">'+r[0]+'</span></td><td>'+fmt(r[1])+'</td><td><div class="aud-percent"><div class="aud-percent-bar" style="width:'+Math.max(2,r[2]*1.55)+'px"></div><span>'+r[2].toFixed(2)+'%</span></div></td></tr>').join('');
    const title=document.querySelector('[data-aud-table-title]');if(title)title.textContent=state.dim;
    const firstHead=document.querySelector('.aud-table thead th:first-child');if(firstHead)firstHead.textContent=state.dim;
  };
  const renderChart=()=>{
    const host=document.querySelector('[data-aud-chart]');if(!host)return;
    host.innerHTML='<div class="aud-legend" data-aud-legend></div>'+chartSvg()+'<div class="aud-chart-cursor"></div><div class="aud-chart-tooltip"></div><div class="aud-chart-hit"></div>';
    host.querySelector('[data-aud-legend]').innerHTML='<i></i><span>'+state.metric+'</span>'+(state.compare?'<span class="aud-compare-chip">vs. '+state.compare+'</span>':'');
    const hit=host.querySelector('.aud-chart-hit'),tip=host.querySelector('.aud-chart-tooltip'),cur=host.querySelector('.aud-chart-cursor');
    const vals=scaled(state.metric,state.period),cmp=state.compare?scaled(state.compare,state.period):null,labels=periodBase[state.period].labels;
    hit.onmousemove=e=>{
      const r=hit.getBoundingClientRect(),p=Math.max(0,Math.min(.999,(e.clientX-r.left)/r.width)),i=Math.min(vals.length-1,Math.round(p*(vals.length-1)));
      cur.style.left=(e.clientX-r.left)+'px';cur.style.display='block';
      tip.style.left=Math.min(r.width-160,e.clientX-r.left+10)+'px';tip.style.top=Math.max(36,e.clientY-r.top)+'px';
      tip.innerHTML='<b>'+labels[i]+'</b><br>'+state.metric+': '+fmt(vals[i]*10000)+(cmp?'<br>'+state.compare+': '+fmt(cmp[i]*10000):'');tip.style.display='block';
    };
    hit.onmouseleave=()=>{tip.style.display='none';cur.style.display='none'};
  };
  const applyMetric=metric=>{
    state.metric=metric;localStorage.setItem('audMetric',metric);
    document.querySelector('.aud-select[data-metric]').value=metric;
    document.querySelectorAll('.aud-kpi').forEach(b=>b.classList.toggle('active',b.dataset.metric===metric));
    renderChart();
  };
  main.innerHTML=
    '<div class="aud-page">'+
      '<div class="aud-toolbar">'+
        '<select class="aud-select" data-metric><option>Users</option><option>New Users</option><option>Sessions</option><option>Pageviews</option></select>'+
        '<span class="aud-vs">vs.</span>'+
        '<select class="aud-select" data-compare style="border:0;color:#2b78b7;padding-left:4px"><option value="">Select a metric</option><option>Users</option><option>New Users</option><option>Sessions</option><option>Pageviews</option></select>'+
        '<div class="aud-periods">'+['Hourly','Day','Week','Month'].map(p=>'<button data-period="'+p+'" class="'+(state.period===p?'active':'')+'">'+p+'</button>').join('')+'</div>'+
      '</div>'+
      '<div class="aud-chart-wrap" data-aud-chart><div class="aud-legend" data-aud-legend></div></div>'+
      '<div class="aud-mid">'+
        '<div class="aud-kpis">'+kpis.map((k,i)=>'<button class="aud-kpi '+(state.metric===k[0]?'active':'')+'" data-metric="'+k[0]+'"><div class="aud-kpi-label">'+k[0]+'</div><div class="aud-kpi-value">'+k[1]+'</div>'+spark(i+1)+'</button>').join('')+'</div>'+
        '<div class="aud-pie-panel"><div class="aud-pie-legend"><button data-visitor="new"><i style="background:#4292c6"></i>New Visitor</button><button data-visitor="return"><i style="background:#69b34c"></i>Returning Visitor</button></div><div class="aud-pie"><span class="aud-pie-label new">77.4%</span><span class="aud-pie-label return">22.6%</span></div></div>'+
      '</div>'+
      '<div class="aud-bottom">'+
        '<div>'+
          '<div class="aud-dim-title">Demographics</div>'+
          '<div class="aud-dim-grid">'+['Language','Country','City'].map(d=>'<button class="aud-dim-button '+(state.dim===d?'active':'')+'" data-dim="'+d+'">'+d+'</button>').join('')+'</div>'+
          '<div class="aud-dim-title aud-system-title">System</div>'+
          '<div class="aud-dim-grid">'+['Browser','Operating System','Service Provider'].map(d=>'<button class="aud-dim-button '+(state.dim===d?'active':'')+'" data-dim="'+d+'">'+d+'</button>').join('')+'</div>'+
        '</div>'+
        '<div>'+
          '<div class="aud-table-head"><span data-aud-table-title>'+state.dim+'</span><div class="aud-table-controls"><input class="aud-table-search" placeholder="Search"><span>Users</span><span>% Users</span></div></div>'+
          '<table class="aud-table"><thead><tr><th>'+state.dim+'</th><th data-sort="users" style="cursor:pointer">Users</th><th data-sort="pct" style="cursor:pointer">% Users</th></tr></thead><tbody data-aud-table-body></tbody></table>'+
        '</div>'+
      '</div>'+
    '</div>';
  document.querySelector('[data-metric]').value=state.metric;
  document.querySelector('[data-compare]').value=state.compare;
  renderChart();renderTable();
  document.querySelector('[data-metric]').addEventListener('change',e=>applyMetric(e.target.value));
  document.querySelector('[data-compare]').addEventListener('change',e=>{state.compare=e.target.value;localStorage.setItem('audCompare',state.compare);renderChart()});
  document.querySelectorAll('[data-period]').forEach(b=>b.addEventListener('click',()=>{
    state.period=b.dataset.period;localStorage.setItem('audPeriod',state.period);
    document.querySelectorAll('[data-period]').forEach(x=>x.classList.toggle('active',x===b));renderChart();
  }));
  document.querySelectorAll('.aud-kpi[data-metric]').forEach(b=>b.addEventListener('click',()=>{if(metricMeta[b.dataset.metric])applyMetric(b.dataset.metric);else GAToast(b.dataset.metric+' is a derived metric')}));
  document.querySelectorAll('[data-dim]').forEach(b=>b.addEventListener('click',()=>{
    state.dim=b.dataset.dim;localStorage.setItem('audDim',state.dim);
    document.querySelectorAll('[data-dim]').forEach(x=>x.classList.toggle('active',x===b));renderTable();
  }));
  document.querySelector('.aud-table-search').addEventListener('input',renderTable);
  document.querySelectorAll('[data-sort]').forEach(th=>th.addEventListener('click',()=>{
    const k=th.dataset.sort;if(state.sort===k)state.dir*=-1;else{state.sort=k;state.dir=-1}renderTable();
  }));
  document.querySelectorAll('[data-visitor]').forEach(b=>b.addEventListener('click',()=>GAToast(b.dataset.visitor==='new'?'New visitors: 77.4%':'Returning visitors: 22.6%')));
}
function techOverview(){main.innerHTML=head('Tech overview')+'<div class="content"><div class="grid"><div class="card" style="grid-column:span 6"><h3>Active users by Browser</h3>'+bars([['Chrome',62800],['Safari',12100],['Edge',7400],['Firefox',4100],['Opera',2600],['Samsung Internet',1800]])+'</div><div class="card" style="grid-column:span 6"><h3>Active users by Device category</h3><div class="donut-wrap"><div class="donut"></div><div class="donut-legend"><span><i class="dot" style="background:#1a73e8"></i>mobile <b>83.6%</b></span><span><i class="dot" style="background:#4054d6"></i>tablet <b>11.2%</b></span><span><i class="dot" style="background:#7b2fd6"></i>desktop <b>5.3%</b></span></div></div><a class="section-link" href="Tech details_ Device category.html">View device categories →</a></div><div class="card" style="grid-column:span 6"><h3>Active users by Screen resolution</h3>'+bars([['1920×1080',20800],['1366×768',17400],['1536×864',13200],['1280×720',8900],['1440×900',6100]])+'</div><div class="card" style="grid-column:span 6"><h3>Active users by App version</h3><div class="no-data"><div><div class="circle">▣</div>No app-version data available</div></div></div></div></div>';bind()}function library(){
  const collectionKey='gaCustomCollectionsV1',reportKey='gaCustomReportsV1';
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const customCollections=read(collectionKey),customReports=read(reportKey);
  const customCollectionCards=customCollections.map(x=>'<div class="library-card"><div class="collection-title"><h3>'+esc(x.name)+'</h3><span class="published">✓ Custom</span></div><div class="collection-items">'+esc(x.description||'Custom collection')+'</div></div>').join('');
  const customReportLines=customReports.length?customReports.map(x=>'<div style="padding:5px 0;border-bottom:1px solid #eee">'+esc(x.name)+' <span class="muted">· '+esc(x.type)+'</span></div>').join(''):'<div class="empty" style="min-height:110px"><div>No custom reports yet</div></div>';
  main.innerHTML=head('Library')+
    '<div class="content"><div class="lib-toolbar"><h2>Collections</h2><button class="primary" data-new-collection>Create new collection</button></div>'+
    '<div class="library-grid"><div class="library-card"><div class="collection-title"><h3>Business objectives</h3><span class="published">✓ Published</span></div><div class="collection-items">Generate leads<br>Drive sales<br>Understand web and/or app performance<br>View user engagement and retention</div></div>'+
    '<div class="library-card"><div class="collection-title"><h3>User</h3><span class="published">✓ Published</span></div><div class="collection-items">User attributes overview<br>Demographic details<br>Audiences<br>Tech overview<br>Tech details</div></div>'+
    '<div class="library-card"><div class="collection-title"><h3>App developer</h3><span class="published">✓ Published</span></div><div class="collection-items">Reports snapshot<br>Realtime overview<br>Realtime pages<br>Events<br>Pages and screens</div></div>'+customCollectionCards+'</div>'+
    '<div class="lib-toolbar" style="margin-top:24px"><h2>Reports</h2><button class="primary" data-new-report>Create new report</button></div>'+
    '<div class="library-grid"><div class="library-card"><h3>Detail reports</h3><div class="collection-items">Events<br>Pages and screens<br>Demographic details<br>Audiences<br>Tech details<br>Traffic acquisition</div></div>'+
    '<div class="library-card"><h3>Overview reports</h3><div class="collection-items">Reports snapshot<br>Realtime overview<br>Engagement overview<br>User attributes overview<br>Tech overview</div></div>'+
    '<div class="library-card"><h3>Custom reports</h3><div class="collection-items">'+customReportLines+'</div></div></div></div>';
  bind();
  document.querySelector('[data-new-collection]').onclick=()=>simpleModal('Create collection','<div class="field-grid"><div class="field full"><label>Collection name</label><input id="libCollectionName" placeholder="e.g. Marketing"></div><div class="field full"><label>Description</label><textarea id="libCollectionDesc" placeholder="What reports belong in this collection?"></textarea></div></div>',[
    {label:'Cancel',action:c=>c()},
    {label:'Create',primary:true,action:(close,bg)=>{const name=bg.querySelector('#libCollectionName').value.trim();if(!name){GAToast('Enter a collection name');return}const arr=read(collectionKey);arr.push({id:Date.now(),name,description:bg.querySelector('#libCollectionDesc').value.trim()});save(collectionKey,arr);close();GAToast('Collection created');library()}}
  ]);
  document.querySelector('[data-new-report]').onclick=()=>simpleModal('Create report','<div class="field-grid"><div class="field full"><label>Report name</label><input id="libReportName" placeholder="e.g. Campaign performance"></div><div class="field"><label>Report type</label><select id="libReportType"><option>Detail report</option><option>Overview report</option></select></div></div>',[
    {label:'Cancel',action:c=>c()},
    {label:'Create',primary:true,action:(close,bg)=>{const name=bg.querySelector('#libReportName').value.trim();if(!name){GAToast('Enter a report name');return}const arr=read(reportKey);arr.push({id:Date.now(),name,type:bg.querySelector('#libReportType').value});save(reportKey,arr);close();GAToast('Report created');library()}}
  ]);
}
switch(key){case'realtime':realtime();break;case'realtimePages':realtimePages();break;case'leads':objective('Generate leads','lead');break;case'sales':objective('Drive sales','sales');break;case'behavior':behavior();break;case'engagement':engagement();break;case'events':eventsPage();break;case'pages':pagesPage();break;case'import':importPage();break;case'userOverview':userOverview();break;case'audiences':audiences();break;case'techOverview':techOverview();break;case'library':library();break;default:main.innerHTML=head('Report')+'<div class="content"><div class="card">Unknown report</div></div>';bind()}})();