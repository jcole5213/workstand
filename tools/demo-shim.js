/* Workstand demo garage: an in-memory stand-in for the artifact runtime.
   Nothing is saved and nothing reaches Strava. The bikes and art are Hunter's (shared with his OK); rides are made up and generated relative to today,
   so the demo always looks current. Used by tools/build-demo.sh to make demo.html. */
(() => {
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  const ago = (days, h = 8, m = 0) => { const d = new Date(); d.setDate(d.getDate() - days); d.setHours(h, m, 0, 0); return iso(d); };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const START = 70; // days ago tracking started
  function rides(prefix, plan){
    const out = []; let n = 1;
    for (let day = START; day >= 1; day--){
      const dow = new Date(Date.now() - day*864e5).getDay();
      const p = plan[dow]; if (!p || rnd() < p.skip) continue;
      const hrs = p.h * (0.75 + rnd()*0.5), mph = p.mph * (0.9 + rnd()*0.2);
      out.push([`${prefix}${n++}`, ago(day, p.at, Math.floor(rnd()*50)), +(hrs*mph).toFixed(1), Math.round(hrs*3600), Math.round(hrs*mph*p.climb), 'Ride']);
    }
    return out.sort((a, b) => a[1] < b[1] ? 1 : -1);
  }
  const gravel = rides('g', {2:{h:1.2, mph:14, climb:45, at:6, skip:.25}, 4:{h:1.1, mph:14, climb:40, at:6, skip:.3}, 6:{h:2.8, mph:13, climb:60, at:8, skip:.15}});
  const trail  = rides('t', {3:{h:1.3, mph:8, climb:140, at:17, skip:.3}, 0:{h:2.2, mph:7.5, climb:150, at:9, skip:.2}});
  gravel[1].push('Great loop. Chain getting noisy, needs wax soon.');
  const sum = r => +r.reduce((a, x) => a + x[2], 0).toFixed(1);

  const at0 = ago(START, 0);
  const data = {
    'garage': {onboarded:true, startDate: at0.slice(0,10), defaults:{lube:'immersion', rewaxHrs:10, qlMax:5, sealantDays:90}, createdAt: at0},
    'bikes': {
      'demo-gravel': {name:'Crux 5', frameType:'Gravel', type:'gravel', color:'lime', distanceMi: 2140 + sum(gravel), retired:false, hidden:false, settings:{},
        art:{kind:'asset', asset:'crux', w:3, h:2, spots:{chain:[.30,.63], 'tire:rear':[.218,.36], 'tire:front':[.788,.36], pads:[.73,.62]}}, syncedAt: new Date().toISOString(), createdAt: at0},
      'demo-trail':  {name:'S-Works Epic 9', frameType:'Mtb', type:'mtb', color:'obsidian', distanceMi: 860 + sum(trail), retired:false, hidden:false, settings:{},
        art:{kind:'asset', asset:'epic', w:2, h:1, spots:{chain:[.31,.62], 'tire:rear':[.223,.34], 'tire:front':[.795,.34], pads:[.82,.64], fork:[.76,.52], shock:[.47,.39]}}, syncedAt: new Date().toISOString(), createdAt: at0}
    },
    'rides': { 'demo-gravel': {rides: gravel}, 'demo-trail': {rides: trail} },
    'components': {
      gc: {bikeId:'demo-gravel', kind:'chain', label:'12-speed', installedAt: at0, waxedAtInstall:true, priorHrs:31},
      gq: {bikeId:'demo-gravel', kind:'quicklink', installedAt: at0, priorUses:1},
      gf: {bikeId:'demo-gravel', kind:'tire', pos:'front', label:'45 mm all-road', installedAt: at0, sealantAtInstall:true, priorHrs:52},
      gr: {bikeId:'demo-gravel', kind:'tire', pos:'rear', label:'45 mm all-road', installedAt: at0, sealantAtInstall:true, priorHrs:71},
      gp: {bikeId:'demo-gravel', kind:'pads', installedAt: at0, label:'Resin'},
      tc: {bikeId:'demo-trail', kind:'chain', installedAt: at0, waxedAtInstall:true, priorHrs:12},
      tq: {bikeId:'demo-trail', kind:'quicklink', installedAt: at0, priorUses:2},
      tf: {bikeId:'demo-trail', kind:'tire', pos:'front', label:'2.4 in trail', installedAt: at0, sealantAtInstall:true},
      tr: {bikeId:'demo-trail', kind:'tire', pos:'rear', label:'2.35 in trail', installedAt: at0, sealantAtInstall:true},
      tp: {bikeId:'demo-trail', kind:'pads', installedAt: at0, label:'Sintered'},
      tk: {bikeId:'demo-trail', kind:'fork', installedAt: at0},
      ts: {bikeId:'demo-trail', kind:'shock', installedAt: at0}
    },
    'events': {
      e1: {bikeId:'demo-gravel', componentId:'gc', type:'rewax', at: ago(40, 20), meta:{qlId:'gq'}},
      e2: {bikeId:'demo-gravel', componentId:'gc', type:'rewax', at: ago(19, 20), meta:{qlId:'gq'}},
      e3: {bikeId:'demo-trail', componentId:'tc', type:'rewax', at: ago(24, 20), meta:{qlId:'tq'}},
      e4: {bikeId:'demo-trail', componentId:'tr', type:'sealant_add', at: ago(30, 19)},
      e5: {bikeId:'demo-gravel', componentId:'gc', type:'wear', at: ago(19, 20), meta:{wear:0.25}}
    },
    'todos': { td1: {bikeId:'demo-trail', title:'Swap to a wider rear tire for winter', act:'newtire', pos:'rear', label:'2.5 in mud tire', createdAt: ago(5, 12)} }
  };

  // Minimal Firestore-like store over `data`, live listeners included.
  const listeners = new Map(); // key -> Set(fn)
  const clone = v => v == null ? v : JSON.parse(JSON.stringify(v));
  const emit = key => setTimeout(() => (listeners.get(key) || []).forEach(fn => fn()), 0);
  const listen = (key, fn) => { if (!listeners.has(key)) listeners.set(key, new Set()); listeners.get(key).add(fn); setTimeout(fn, 0); return () => listeners.get(key).delete(fn); };
  let auto = 0;
  function docRef(col, id){
    const get = () => col ? (data[col] || {})[id] : data.garage;
    const put = v => { if (col){ (data[col] = data[col] || {}); if (v === undefined) delete data[col][id]; else data[col][id] = v; emit(col); } else { data.garage = v; emit('garage'); } };
    return {
      id,
      collection: n => colRef(n),
      onSnapshot(cb){ return listen(col || 'garage', () => { const v = get(); cb({exists: v != null, id, data: () => clone(v), metadata:{fromCache:false}}); }); },
      async get(){ const v = get(); return {exists: v != null, id, data: () => clone(v)}; },
      async set(v){ put(clone(v)); },
      async update(v){ const cur = clone(get()) || {}; for (const [k, x] of Object.entries(v)){ const parts = k.split('.'); let o = cur; while (parts.length > 1){ const p = parts.shift(); o = o[p] = o[p] || {}; } o[parts[0]] = clone(x); } put(cur); },
      async delete(){ put(undefined); }
    };
  }
  function colRef(n){
    return {
      doc: id => docRef(n, id == null ? `demo${Date.now().toString(36)}${auto++}` : String(id)),
      onSnapshot(cb){ return listen(n, () => cb({docs: Object.entries(data[n] || {}).map(([id, v]) => ({id, data: () => clone(v)})), metadata:{fromCache:false}})); }
    };
  }
  const db = { doc: () => docRef(null, 'garage'), collection: n => colRef(n) };
  const user = { id: async () => 'demo' };
  window.__workstandDemo = { use: async n => n === 'db' ? db : n === 'user' ? user : null,
    blob: id => (window.__workstandDemoArt || {})[id] || '' };

  document.addEventListener('DOMContentLoaded', () => {
    const tag = document.createElement('div');
    tag.className = 'demo-tag';
    tag.textContent = 'Demo garage · sample rides · changes reset on reload';
    document.body.prepend(tag);
  });
})();
