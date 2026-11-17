(()=> {
  const routes={
    reports:'Analytics _ Reports snapshot.html',
    realtime:'Realtime overview.html',
    realtimePages:'Realtime pages.html',
    import:'Campaign data import validation.html',
    userOverview:'User attributes overview.html',
    demographics:'Demographic details_ Country.html',
    audiences:'Audiences.html',
    techOverview:'Tech overview.html',
    tech:'Tech details_ Device category.html',
    library:'Library.html',
    campaigns:'Reports snapshot with campaigns and cohorts.html',
    acquisition:'Traffic acquisition.html',
    events:'Events.html',
    pages:'Pages and screens.html'
  };
  const page=document.body.dataset.page||'';
  let progressTimer;

  const progress={
    el:null,v:0,
    start(){
      if(!this.el){this.el=document.createElement('div');this.el.className='ga-progress';document.body.appendChild(this.el)}
      clearInterval(progressTimer);this.v=8;this.el.className='ga-progress show';this.el.style.width='8%';
      progressTimer=setInterval(()=>{this.v=Math.min(82,this.v+Math.max(1,(84-this.v)*.08));this.el.style.width=this.v+'%';if(this.v>=82)clearInterval(progressTimer)},110);
    },
    done(){
      if(!this.el)return;clearInterval(progressTimer);this.el.classList.add('done');this.el.style.width='100%';
      setTimeout(()=>{this.el.className='ga-progress';this.el.style.width='0%'},420);
    },
    pulse(ms=500){this.start();setTimeout(()=>this.done(),ms)}
  };
  window.GAProgress=progress;

  function toast(msg){
    let t=document.querySelector('.ga-toast');
    if(!t){t=document.createElement('div');t.className='ga-toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1600);
  }
  window.GAToast=toast;

  function top(){
    const h=document.createElement('header');
    h.className='ga-top';
    h.innerHTML=
      '<div class="ga-brand"><div class="ga-logo"><i></i><i></i><i></i></div><div class="ga-word">Analytics</div>'+
      '<div class="ga-prop"><div class="ga-crumb">All accounts › rieng254.com</div><div class="ga-prop-name">rieng254.com⌄</div></div></div>'+
      '<div class="ga-search-wrap"><input class="ga-search" placeholder="Try searching reports"></div>'+
      '<div class="ga-top-actions"><button class="ga-icon">▦</button><button class="ga-icon">?</button><div class="ga-avatar">R</div></div>';
    document.body.appendChild(h);
    h.querySelector('.ga-search').addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      const q=e.target.value.trim().toLowerCase();
      if(!q)return;
      const all=[
        ['reports','Reports snapshot'],['realtime','Realtime overview'],['realtimePages','Realtime pages'],
        ['import','Campaign data import validation'],['userOverview','User attributes overview'],
        ['demographics','Demographic details'],['audiences','Audiences'],['techOverview','Tech overview'],
        ['tech','Tech details'],['library','Library'],['campaigns','Campaigns & cohorts'],
        ['acquisition','Traffic acquisition'],['events','Events'],['pages','Pages and screens']
      ];
      const m=all.find(x=>x[1].toLowerCase().includes(q));
      if(m){progress.start();location.href=routes[m[0]]}else toast('No matching report');
    });
  }

  const state=(key,def=true)=>{const v=localStorage.getItem('gaNav:'+key);return v===null?def:v==='1'};
  const setState=(key,open)=>localStorage.setItem('gaNav:'+key,open?'1':'0');

  function link(key,label,cls='',icon=''){
    const active=page===key;
    return '<a class="pnav-link '+cls+' '+(active?'active':'')+'" href="'+routes[key]+'" data-real="'+key+'"'+(active?' aria-current="page"':'')+'>'+
      '<span class="picon">'+icon+'</span><span class="ptext">'+label+'</span></a>';
  }

  function nav(){
    const n=document.createElement('nav');
    n.className='portal-nav';
    n.setAttribute('aria-label','Analytics portal navigation');
    n.innerHTML=
      '<button class="pcreate" type="button" data-create><span class="pcreate-plus">＋</span><span>Create</span><span class="pcreate-caret">▼</span></button>'+
      link('reports','Reports snapshot','','⌂')+
      link('realtime','Realtime overview')+
      link('realtimePages','Realtime pages')+
      '<div class="pnav-divider"></div>'+
      '<div class="pnav-group" data-group="import">'+
        '<button class="pnav-section" type="button" data-toggle="import"><span class="pnav-caret">⌄</span><span class="ptext">Data import</span></button>'+
        '<div class="pnav-children">'+link('import','Campaign data import validation','pnav-child')+'</div>'+
      '</div>'+
      '<div class="pnav-divider"></div>'+
      '<div class="pnav-group" data-group="user">'+
        '<button class="pnav-section" type="button" data-toggle="user"><span class="pnav-caret">⌄</span><span class="ptext">User</span></button>'+
        '<div class="pnav-children">'+
          '<button class="pnav-subsection pnav-child" type="button" data-subtoggle="userattrs"><span class="pnav-caret">⌄</span><span class="ptext">User attributes</span></button>'+
          '<div class="pnav-children" data-subchildren="userattrs">'+
            link('userOverview','Overview','pnav-child2')+
            link('demographics','Demographic details','pnav-child2','◉')+
            link('audiences','Audiences','pnav-child2')+
          '</div>'+
          '<button class="pnav-subsection pnav-child" type="button" data-subtoggle="techgroup"><span class="pnav-caret">⌄</span><span class="ptext">Tech</span></button>'+
          '<div class="pnav-children" data-subchildren="techgroup">'+
            link('techOverview','Overview','pnav-child2')+
            link('tech','Tech details','pnav-child2','▣')+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="pnav-bottom">'+link('library','Library','','▭')+'</div>';
    document.body.appendChild(n);

    const applyGroup=(key,open)=>{
      const g=n.querySelector('[data-group="'+key+'"]');if(!g)return;
      g.classList.toggle('collapsed',!open);
      g.querySelector(':scope > [data-toggle] .pnav-caret')?.classList.toggle('right',!open);
    };
    ['import','user'].forEach(k=>applyGroup(k,state(k,true)));

    ['userattrs','techgroup'].forEach(k=>{
      const open=state('sub:'+k,true),ch=n.querySelector('[data-subchildren="'+k+'"]'),btn=n.querySelector('[data-subtoggle="'+k+'"]');
      if(ch)ch.style.display=open?'block':'none';
      btn?.querySelector('.pnav-caret')?.classList.toggle('right',!open);
    });

    n.querySelectorAll('[data-toggle]').forEach(btn=>btn.addEventListener('click',e=>{
      const k=btn.dataset.toggle;
      if(e.target.closest('.ptext')&&k==='import'){progress.start();location.href=routes.import;return}
      const g=n.querySelector('[data-group="'+k+'"]'),open=g.classList.contains('collapsed');
      applyGroup(k,open);setState(k,open);progress.pulse(280);
    }));
    n.querySelectorAll('[data-subtoggle]').forEach(btn=>btn.addEventListener('click',e=>{
      const k=btn.dataset.subtoggle,dest={userattrs:routes.userOverview,techgroup:routes.techOverview}[k];
      if(e.target.closest('.ptext')&&dest){progress.start();location.href=dest;return}
      const ch=n.querySelector('[data-subchildren="'+k+'"]'),open=ch.style.display==='none';
      ch.style.display=open?'block':'none';btn.querySelector('.pnav-caret')?.classList.toggle('right',!open);setState('sub:'+k,open);progress.pulse(260);
    }));
    n.querySelectorAll('[data-real]').forEach(a=>a.addEventListener('click',()=>progress.start()));

    n.querySelector('[data-create]')?.addEventListener('click',()=>{
      document.querySelector('.nav-create-menu')?.remove();
      const m=document.createElement('div');m.className='panel-menu nav-create-menu';m.style.cssText='left:12px;top:106px';
      [['Reports snapshot',routes.reports],['Realtime overview',routes.realtime],['Demographic details',routes.demographics],['Tech details',routes.tech]].forEach(([label,url])=>{
        const b=document.createElement('button');b.textContent=label;b.onclick=()=>{progress.start();location.href=url};m.appendChild(b);
      });
      document.body.appendChild(m);progress.pulse(260);
    });
  }

  function slower(){
    let target=scrollY,raf=0,internal=false;
    const clamp=v=>Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,v));
    function step(){
      const d=target-scrollY;
      if(Math.abs(d)<.5){internal=true;scrollTo(0,target);internal=false;raf=0;return}
      internal=true;scrollTo(0,scrollY+d*.22);internal=false;raf=requestAnimationFrame(step);
    }
    addEventListener('wheel',e=>{
      if(e.ctrlKey||e.metaKey||e.target.closest('.portal-nav,.ga-top,.panel-menu'))return;
      e.preventDefault();target=clamp((raf?target:scrollY)+e.deltaY*.55);if(!raf)raf=requestAnimationFrame(step);
    },{passive:false});
    addEventListener('scroll',()=>{if(!internal&&!raf)target=scrollY},{passive:true});
  }

  top();nav();slower();progress.start();
  addEventListener('pageshow',()=>setTimeout(()=>progress.done(),330),{once:true});
  addEventListener('click',e=>{if(!e.target.closest('[data-create],.nav-create-menu'))document.querySelector('.nav-create-menu')?.remove()});
})();