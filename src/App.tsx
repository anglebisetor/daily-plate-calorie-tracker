import { useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Apple, Search, Plus, Minus, Trash2, Pencil, Check, X, ChevronLeft,
  ChevronRight, Settings2, Cloud, CloudOff, LogIn, LogOut, Leaf, Flame,
  Beef, CalendarDays, Utensils, History, Info, Download, RotateCcw
} from 'lucide-react';

type Food = {
  id: string; name: string; category: string; kcal: number; protein: number;
  unit: 'g' | 'ml' | 'piece'; basis: string; aliases?: string[];
};
type Entry = {
  id: string; date: string; foodId: string; name: string; quantity: number;
  kcal: number; protein: number; meal: string; createdAt: number;
};
type CustomFood = Food;
const TARGET_DEFAULT = 1500;
const foods: Food[] = [
  {id:'rice-cooked',name:'White rice, cooked',category:'Rice & grains',kcal:130,protein:2.7,unit:'g',basis:'per 100 g',aliases:['cooked rice','rice cooked','bhaat','boiled rice']},
  {id:'rice-raw',name:'White rice, raw/dry',category:'Rice & grains',kcal:365,protein:7.1,unit:'g',basis:'per 100 g',aliases:['raw rice','uncooked rice','dry rice']},
  {id:'rice-basmati-raw',name:'Basmati rice, raw/dry',category:'Rice & grains',kcal:356,protein:7.5,unit:'g',basis:'per 100 g',aliases:['raw basmati rice']},
  {id:'rice-basmati-cooked',name:'Basmati rice, cooked',category:'Rice & grains',kcal:121,protein:3.5,unit:'g',basis:'per 100 g',aliases:['cooked basmati']},
  {id:'atta',name:'Wheat flour (atta)',category:'Rice & grains',kcal:364,protein:10.3,unit:'g',basis:'per 100 g',aliases:['atta','flour']},
  {id:'roti',name:'Roti / chapati, plain',category:'Rice & grains',kcal:120,protein:3.5,unit:'piece',basis:'per medium piece (~40 g)',aliases:['chapati','roti']},
  {id:'poha',name:'Poha, dry',category:'Rice & grains',kcal:350,protein:6.7,unit:'g',basis:'per 100 g',aliases:['flattened rice']},
  {id:'oats',name:'Oats, dry',category:'Rice & grains',kcal:389,protein:16.9,unit:'g',basis:'per 100 g'},
  {id:'masoor-dry',name:'Masoor dal, dry',category:'Dal & pulses',kcal:352,protein:24.6,unit:'g',basis:'per 100 g',aliases:['raw masoor dal','red lentils dry']},
  {id:'masoor-cooked',name:'Masoor dal, cooked plain',category:'Dal & pulses',kcal:116,protein:9,unit:'g',basis:'per 100 g',aliases:['cooked masoor','red lentil dal']},
  {id:'moong-dry',name:'Moong dal, dry',category:'Dal & pulses',kcal:347,protein:24,unit:'g',basis:'per 100 g',aliases:['raw moong dal']},
  {id:'moong-cooked',name:'Moong dal, cooked',category:'Dal & pulses',kcal:105,protein:7,unit:'g',basis:'per 100 g'},
  {id:'toor-dry',name:'Toor / arhar dal, dry',category:'Dal & pulses',kcal:343,protein:22.3,unit:'g',basis:'per 100 g',aliases:['raw toor dal','arhar dal']},
  {id:'toor-cooked',name:'Toor / arhar dal, cooked',category:'Dal & pulses',kcal:121,protein:6.8,unit:'g',basis:'per 100 g'},
  {id:'chana-dry',name:'Chana dal, dry',category:'Dal & pulses',kcal:360,protein:20.5,unit:'g',basis:'per 100 g'},
  {id:'chana-boiled',name:'Black chana, boiled',category:'Dal & pulses',kcal:164,protein:8.9,unit:'g',basis:'per 100 g',aliases:['boiled kala chana','black chickpeas']},
  {id:'chickpeas-boiled',name:'Chickpeas, boiled',category:'Dal & pulses',kcal:164,protein:8.9,unit:'g',basis:'per 100 g',aliases:['boiled chole','kabuli chana']},
  {id:'rajma-boiled',name:'Rajma, boiled',category:'Dal & pulses',kcal:127,protein:8.7,unit:'g',basis:'per 100 g'},
  {id:'soya-dry',name:'Soya chunks, dry',category:'Protein',kcal:345,protein:52,unit:'g',basis:'per 100 g',aliases:['dry soya chunks','raw soya chunks','soya']},
  {id:'soya-cooked',name:'Soya chunks, rehydrated',category:'Protein',kcal:120,protein:18,unit:'g',basis:'per 100 g cooked (water absorbed varies)',aliases:['cooked soya chunks','boiled soya chunks']},
  {id:'egg',name:'Egg, whole',category:'Protein',kcal:72,protein:6.3,unit:'piece',basis:'per large egg',aliases:['egg','whole egg','boiled egg']},
  {id:'egg-white',name:'Egg white',category:'Protein',kcal:17,protein:3.6,unit:'piece',basis:'per large egg white'},
  {id:'chicken-raw',name:'Chicken, raw (skinless)',category:'Protein',kcal:120,protein:22.5,unit:'g',basis:'per 100 g'},
  {id:'chicken-cooked',name:'Chicken, cooked (skinless)',category:'Protein',kcal:165,protein:31,unit:'g',basis:'per 100 g'},
  {id:'fish',name:'Fish, cooked (generic)',category:'Protein',kcal:128,protein:26,unit:'g',basis:'per 100 g (varies by fish)'},
  {id:'paneer',name:'Paneer',category:'Protein',kcal:265,protein:18.3,unit:'g',basis:'per 100 g (varies by brand)'},
  {id:'milk',name:'Milk, whole',category:'Dairy',kcal:61,protein:3.2,unit:'ml',basis:'per 100 ml'},
  {id:'curd',name:'Curd / plain yogurt',category:'Dairy',kcal:61,protein:3.5,unit:'g',basis:'per 100 g'},
  {id:'oil-refined',name:'Refined cooking oil',category:'Oils & fats',kcal:884,protein:0,unit:'g',basis:'per 100 g',aliases:['oil','sunflower oil','vegetable oil']},
  {id:'mustard-oil',name:'Mustard oil',category:'Oils & fats',kcal:884,protein:0,unit:'g',basis:'per 100 g'},
  {id:'ghee',name:'Ghee',category:'Oils & fats',kcal:900,protein:0,unit:'g',basis:'per 100 g'},
  {id:'butter',name:'Butter',category:'Oils & fats',kcal:717,protein:0.9,unit:'g',basis:'per 100 g'},
  {id:'sugar',name:'Sugar',category:'Basics',kcal:387,protein:0,unit:'g',basis:'per 100 g'},
  {id:'potato-raw',name:'Potato, raw',category:'Vegetables',kcal:77,protein:2,unit:'g',basis:'per 100 g'},
  {id:'potato-boiled',name:'Potato, boiled',category:'Vegetables',kcal:87,protein:1.9,unit:'g',basis:'per 100 g'},
  {id:'tomato',name:'Tomato, raw',category:'Vegetables',kcal:18,protein:0.9,unit:'g',basis:'per 100 g'},
  {id:'onion',name:'Onion, raw',category:'Vegetables',kcal:40,protein:1.1,unit:'g',basis:'per 100 g'},
  {id:'spinach',name:'Spinach, cooked',category:'Vegetables',kcal:23,protein:3,unit:'g',basis:'per 100 g'},
  {id:'brinjal',name:'Brinjal / eggplant, cooked plain',category:'Vegetables',kcal:35,protein:1,unit:'g',basis:'per 100 g',aliases:['baingan']},
  {id:'cauliflower',name:'Cauliflower, cooked plain',category:'Vegetables',kcal:23,protein:1.8,unit:'g',basis:'per 100 g'},
  {id:'cabbage',name:'Cabbage, cooked plain',category:'Vegetables',kcal:23,protein:1.3,unit:'g',basis:'per 100 g'},
  {id:'bhindi',name:'Bhindi / okra, cooked plain',category:'Vegetables',kcal:22,protein:1.9,unit:'g',basis:'per 100 g'},
  {id:'lauki',name:'Lauki / bottle gourd, cooked plain',category:'Vegetables',kcal:15,protein:0.6,unit:'g',basis:'per 100 g'},
  {id:'mixed-sabzi',name:'Mixed sabzi, home-cooked (estimate)',category:'Indian dishes',kcal:90,protein:2.5,unit:'g',basis:'per 100 g; oil varies',aliases:['mix sabzi','mixed vegetables sabzi','sabji']},
  {id:'aloo-sabzi',name:'Aloo sabzi / potato bhaji (estimate)',category:'Indian dishes',kcal:130,protein:2.2,unit:'g',basis:'per 100 g; oil varies',aliases:['aloo bhaji','potato sabzi']},
  {id:'dal-tadka',name:'Dal tadka (estimate)',category:'Indian dishes',kcal:140,protein:7,unit:'g',basis:'per 100 g; recipe varies'},
  {id:'egg-curry',name:'Egg curry (estimate)',category:'Indian dishes',kcal:160,protein:9,unit:'g',basis:'per 100 g; recipe varies'},
  {id:'fish-curry',name:'Fish curry (estimate)',category:'Indian dishes',kcal:150,protein:15,unit:'g',basis:'per 100 g; recipe varies'},
  {id:'chicken-curry',name:'Chicken curry (estimate)',category:'Indian dishes',kcal:180,protein:16,unit:'g',basis:'per 100 g; recipe varies'},
  {id:'khichdi',name:'Khichdi (estimate)',category:'Indian dishes',kcal:120,protein:4,unit:'g',basis:'per 100 g; recipe varies'},
  {id:'banana',name:'Banana',category:'Fruit',kcal:89,protein:1.1,unit:'g',basis:'per 100 g'},
  {id:'apple',name:'Apple',category:'Fruit',kcal:52,protein:0.3,unit:'g',basis:'per 100 g'},
  {id:'orange',name:'Orange',category:'Fruit',kcal:47,protein:0.9,unit:'g',basis:'per 100 g'}
];
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const shiftDate = (date: string, amount: number) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+amount); return localDate(d); };
const prettyDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const kcalFor = (food: Food, qty: number) => food.unit === 'piece' ? food.kcal * qty : food.kcal * qty / 100;
const proteinFor = (food: Food, qty: number) => food.unit === 'piece' ? food.protein * qty : food.protein * qty / 100;
const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
const safeRead = <T,>(key: string, fallback: T): T => { try { const s=localStorage.getItem(key); return s ? JSON.parse(s) as T : fallback; } catch { return fallback; } };
const sbUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase: SupabaseClient | null = sbUrl && sbKey ? createClient(sbUrl,sbKey) : null;

export default function App() {
  const [date,setDate] = useState(localDate());
  const [target,setTarget] = useState<number>(()=>safeRead('dp-target',TARGET_DEFAULT));
  const [entries,setEntries] = useState<Entry[]>(()=>safeRead('dp-entries',[]));
  const [customFoods,setCustomFoods] = useState<CustomFood[]>(()=>safeRead('dp-custom-foods',[]));
  const [query,setQuery] = useState('');
  const [selected,setSelected] = useState<Food | null>(null);
  const [qty,setQty] = useState('100');
  const [meal,setMeal] = useState('Lunch');
  const [editId,setEditId] = useState<string|null>(null);
  const [editQty,setEditQty] = useState('100');
  const [showSettings,setShowSettings] = useState(false);
  const [showCustom,setShowCustom] = useState(false);
  const [customName,setCustomName] = useState('');
  const [customKcal,setCustomKcal] = useState('100');
  const [customProtein,setCustomProtein] = useState('0');
  const [customUnit,setCustomUnit] = useState<'g'|'ml'|'piece'>('g');
  const [userEmail,setUserEmail] = useState<string|null>(null);
  const [syncMode,setSyncMode] = useState<'local'|'cloud'|'loading'>('loading');
  const [authBusy,setAuthBusy] = useState(false);
  const [authMessage,setAuthMessage] = useState('');
  const [showAuth,setShowAuth] = useState(false);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [recipeName,setRecipeName] = useState('');
  const [recipeIngredients,setRecipeIngredients] = useState<{foodId:string;qty:number}[]>([]);
  const [recipeQty,setRecipeQty] = useState('100');
  const [showRecipe,setShowRecipe] = useState(false);

  const allFoods = useMemo(()=>[...foods,...customFoods], [customFoods]);
  const dayEntries = useMemo(()=>entries.filter(e=>e.date===date).sort((a,b)=>a.createdAt-b.createdAt),[entries,date]);
  const consumed = dayEntries.reduce((s,e)=>s+e.kcal,0);
  const protein = dayEntries.reduce((s,e)=>s+e.protein,0);
  const remaining = target-consumed;
  const progress = Math.min(100, consumed/Math.max(1,target)*100);
  const filteredFoods = useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return allFoods.slice(0,8);
    return allFoods.filter(f=>[f.name,f.category,...(f.aliases||[])].some(s=>s.toLowerCase().includes(q))).slice(0,12);
  },[query,allFoods]);

  useEffect(()=>{localStorage.setItem('dp-target',JSON.stringify(target));},[target]);
  useEffect(()=>{localStorage.setItem('dp-entries',JSON.stringify(entries));},[entries]);
  useEffect(()=>{localStorage.setItem('dp-custom-foods',JSON.stringify(customFoods));},[customFoods]);

  useEffect(()=>{
    let alive=true;
    if(!supabase){setSyncMode('local');return;}
    supabase.auth.getSession().then(async ({data})=>{
      if(!alive)return;
      const session=data.session;
      setUserEmail(session?.user.email??null);
      if(session?.user){
        await loadCloud(session.user.id);
        if(alive)setSyncMode('cloud');
      } else setSyncMode('local');
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      setUserEmail(session?.user.email??null);
      if(!session?.user){setSyncMode('local');return;}
      setSyncMode('loading');
      setTimeout(()=>{if(alive)loadCloud(session.user.id).then(()=>{if(alive)setSyncMode('cloud')})},0);
    });
    return ()=>{alive=false;subscription.unsubscribe()};
  },[]);

  async function loadCloud(userId:string){
    if(!supabase)return;
    const [{data:rows,error:rowErr},{data:settings,error:settingsErr},{data:cf,error:cfErr}] = await Promise.all([
      supabase.from('food_entries').select('*').eq('user_id',userId),
      supabase.from('user_settings').select('*').eq('user_id',userId).maybeSingle(),
      supabase.from('custom_foods').select('*').eq('user_id',userId)
    ]);
    if(rowErr||settingsErr||cfErr){setAuthMessage('Cloud setup may be incomplete. Check the SQL setup instructions.');return;}
    if(rows) setEntries(rows.map((r:any)=>({id:r.id,date:r.entry_date,foodId:r.food_id,name:r.food_name,quantity:Number(r.quantity),kcal:Number(r.kcal),protein:Number(r.protein),meal:r.meal,createdAt:Number(r.created_at_ms)})));
    if(settings?.daily_target) setTarget(settings.daily_target);
    if(cf) setCustomFoods(cf.map((r:any)=>({id:r.food_id,name:r.name,category:r.category,kcal:Number(r.kcal_per_100),protein:Number(r.protein_per_100),unit:r.unit,basis:r.basis,aliases:r.aliases||[]})));
    supabase.channel('daily-plate-'+userId).on('postgres_changes',{event:'*',schema:'public',table:'food_entries',filter:`user_id=eq.${userId}`},async()=>{const {data}=await supabase!.from('food_entries').select('*').eq('user_id',userId);if(data)setEntries(data.map((r:any)=>({id:r.id,date:r.entry_date,foodId:r.food_id,name:r.food_name,quantity:Number(r.quantity),kcal:Number(r.kcal),protein:Number(r.protein),meal:r.meal,createdAt:Number(r.created_at_ms)})));}).subscribe();
  }

  async function persistEntry(entry:Entry, action:'upsert'|'delete'='upsert'){
    if(!supabase||!userEmail)return;
    const {data:{user}}=await supabase.auth.getUser(); if(!user)return;
    if(action==='delete'){await supabase.from('food_entries').delete().eq('id',entry.id).eq('user_id',user.id);return;}
    await supabase.from('food_entries').upsert({id:entry.id,user_id:user.id,entry_date:entry.date,food_id:entry.foodId,food_name:entry.name,quantity:entry.quantity,kcal:entry.kcal,protein:entry.protein,meal:entry.meal,created_at_ms:entry.createdAt});
  }
  async function persistTarget(value:number){
    if(!supabase||!userEmail)return;
    const {data:{user}}=await supabase.auth.getUser();if(!user)return;
    await supabase.from('user_settings').upsert({user_id:user.id,daily_target:value,updated_at:new Date().toISOString()});
  }
  async function persistCustom(food:Food){
    if(!supabase||!userEmail)return;
    const {data:{user}}=await supabase.auth.getUser();if(!user)return;
    await supabase.from('custom_foods').upsert({user_id:user.id,food_id:food.id,name:food.name,category:food.category,kcal_per_100:food.kcal,protein_per_100:food.protein,unit:food.unit,basis:food.basis,aliases:food.aliases||[]});
  }
  async function signInGoogle(){
    if(!supabase){setAuthMessage('Add Supabase environment variables first.');return;}
    setAuthBusy(true);setAuthMessage('');
    const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
    if(error)setAuthMessage(error.message);
    setAuthBusy(false);
  }
  async function signInEmail(){
    if(!supabase)return;
    setAuthBusy(true);setAuthMessage('');
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error){
      const signup=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin}});
      setAuthMessage(signup.error ? error.message : 'If email confirmation is enabled, confirm your email and then sign in.');
    }else if(data.user){setShowAuth(false);setPassword('');}
    setAuthBusy(false);
  }
  async function signOut(){if(supabase)await supabase.auth.signOut();setUserEmail(null);setSyncMode('local');}

  function addFood(food:Food, quantity=Number(qty), chosenMeal=meal){
    if(!Number.isFinite(quantity)||quantity<=0)return;
    const e:Entry={id:uid(),date,foodId:food.id,name:food.name,quantity,kcal:Math.round(kcalFor(food,quantity)*10)/10,protein:Math.round(proteinFor(food,quantity)*10)/10,meal:chosenMeal,createdAt:Date.now()};
    setEntries(prev=>[...prev,e]);void persistEntry(e);setQuery('');setSelected(null);setQty('100');
  }
  function deleteEntry(e:Entry){setEntries(prev=>prev.filter(x=>x.id!==e.id));void persistEntry(e,'delete');}
  function saveEdit(e:Entry){
    const q=Number(editQty);if(!q||q<=0)return;
    const food=allFoods.find(f=>f.id===e.foodId);
    const updated={...e,quantity:q,kcal:food?Math.round(kcalFor(food,q)*10)/10:e.kcal*q/e.quantity,protein:food?Math.round(proteinFor(food,q)*10)/10:e.protein*q/e.quantity};
    setEntries(prev=>prev.map(x=>x.id===e.id?updated:x));void persistEntry(updated);setEditId(null);
  }
  function addCustomFood(){
    if(!customName.trim()||!Number.isFinite(Number(customKcal))||Number(customKcal)<0)return;
    const f:Food={id:'custom-'+uid(),name:customName.trim(),category:'My foods',kcal:Number(customKcal),protein:Number(customProtein)||0,unit:customUnit,basis:customUnit==='piece'?'per piece':`per 100 ${customUnit}`};
    setCustomFoods(prev=>[...prev,f]);void persistCustom(f);setCustomName('');setCustomKcal('100');setCustomProtein('0');setShowCustom(false);setSelected(f);setQuery(f.name);setQty('100');
  }
  function exportCsv(){
    const rows=[['Date','Food','Quantity','Meal','Calories kcal','Protein g'],...entries.map(e=>[e.date,e.name,String(e.quantity),e.meal,String(e.kcal),String(e.protein)])];
    const csv=rows.map(r=>r.map(v=>`"${v.replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='daily-plate-food-log.csv';a.click();URL.revokeObjectURL(a.href);
  }
  const mealNames=['Breakfast','Lunch','Dinner','Snacks'];
  const weekly=Array.from({length:7},(_,i)=>{const d=shiftDate(date,i-6);return {date:d,short:new Date(d+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short'}),total:entries.filter(e=>e.date===d).reduce((s,e)=>s+e.kcal,0)}});
  const recentEntries=dayEntries.slice().reverse();

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e=>e.preventDefault()}><span className="brand-mark"><Leaf size={20}/></span><span>daily<span className="brand-light">plate</span><small>INDIAN CALORIE TRACKER</small></span></a>
      <div className="top-actions">
        <span className={`sync-status ${syncMode}`}><span className="sync-dot"/>{syncMode==='cloud'?'Synced to cloud':syncMode==='loading'?'Connecting…':'Saved on this device'}</span>
        <button className="icon-btn" title="Settings" onClick={()=>setShowSettings(true)}><Settings2 size={19}/></button>
        {userEmail ? <button className="profile-pill" onClick={signOut}><span className="avatar">{userEmail[0].toUpperCase()}</span><span className="profile-email">{userEmail}</span><LogOut size={15}/></button> : <button className="sign-in-btn" onClick={()=>setShowAuth(true)}><LogIn size={16}/> Sync devices</button>}
      </div>
    </header>

    <main className="main-content">
      <section className="welcome-row">
        <div><p className="eyebrow">YOUR DAILY CHECK-IN</p><h1>Eat well. <span>Stay on track.</span></h1><p className="subheading">A little awareness goes a long way.</p></div>
        <div className="date-switcher"><button className="icon-btn" onClick={()=>setDate(shiftDate(date,-1))} aria-label="Previous day"><ChevronLeft size={19}/></button><div><CalendarDays size={16}/><span>{date===localDate()?'Today':prettyDate(date)}</span></div><button className="icon-btn" onClick={()=>setDate(shiftDate(date,1))} aria-label="Next day" disabled={date>=localDate()}><ChevronRight size={19}/></button></div>
      </section>

      <section className="summary-grid">
        <div className="summary-card main-summary">
          <div className="card-top"><span className="card-label">Calories remaining</span><span className="soft-icon"><Flame size={18}/></span></div>
          <div className="big-number">{fmt(remaining)} <span>kcal</span></div>
          <p className={`remaining-note ${remaining<0?'over':''}`}>{remaining<0?`${fmt(Math.abs(remaining))} kcal over your target`:'You’ve got this — keep going'}</p>
          <div className="progress-track"><div className={`progress-fill ${progress>=100?'full':''}`} style={{width:`${progress}%`}}/></div>
          <div className="progress-meta"><span>{fmt(consumed)} consumed</span><span>{fmt(target)} kcal goal</span></div>
        </div>
        <div className="summary-card">
          <div className="card-top"><span className="card-label">Calories eaten</span><span className="soft-icon peach"><Apple size={18}/></span></div>
          <div className="metric-number">{fmt(consumed)} <small>kcal</small></div>
          <p className="metric-foot">{dayEntries.length} {dayEntries.length===1?'food entry':'food entries'} logged</p>
          <div className="mini-bar"><div style={{width:`${progress}%`}}/></div>
        </div>
        <div className="summary-card">
          <div className="card-top"><span className="card-label">Protein eaten</span><span className="soft-icon blue"><Beef size={18}/></span></div>
          <div className="metric-number">{Math.round(protein)} <small>g</small></div>
          <p className="metric-foot">Estimated from logged foods</p>
          <div className="protein-pips"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>
      </section>

      <div className="content-grid">
        <section className="panel add-panel">
          <div className="section-heading"><div><p className="eyebrow">FOOD DIARY</p><h2>Add what you ate</h2></div><span className="heading-icon"><Plus size={20}/></span></div>
          <div className="search-wrap"><Search size={19}/><input value={query} onChange={e=>{setQuery(e.target.value);setSelected(null)}} placeholder="Search rice, dal, soya chunks…" aria-label="Search foods"/><kbd>/</kbd></div>
          <div className="search-hint">Try “cooked rice”, “raw rice”, “soya chunks” or “oil”</div>
          {query.trim() && !filteredFoods.length && <div className="no-results"><Search size={20}/><div><b>No matching food found</b><p>Try another name, or create your own food.</p></div></div>}
          <div className="food-results">
            {(query.trim()?filteredFoods:filteredFoods.slice(0,6)).map(f=><button key={f.id} className={`food-result ${selected?.id===f.id?'selected':''}`} onClick={()=>{setSelected(f);setQty(f.unit==='piece'?'1':'100')}}>
              <span className={`food-emoji ${f.category==='Oils & fats'?'oil':f.category==='Protein'?'protein':f.category==='Rice & grains'?'grain':'veg'}`}>{f.category==='Oils & fats'?'◒':f.category==='Protein'?'✳':f.category==='Rice & grains'?'◉':'❋'}</span>
              <span className="food-result-name"><b>{f.name}</b><small>{f.category} · {f.basis}</small></span>
              <span className="food-result-cal">{fmt(f.kcal)}<small>kcal{f.unit==='piece'?'/piece':'/100 '+f.unit}</small></span>
              {selected?.id===f.id&&<Check size={17} className="selected-check"/>}
            </button>)}
          </div>
          <button className="text-action" onClick={()=>setShowCustom(v=>!v)}><Plus size={16}/> Create a custom food</button>
          {showCustom&&<div className="custom-food-form">
            <div className="field"><label>Food name</label><input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="e.g. Homemade fish curry"/></div>
            <div className="form-row"><div className="field"><label>Calories {customUnit==='piece'?'per piece':'per 100 '+customUnit}</label><input type="number" min="0" value={customKcal} onChange={e=>setCustomKcal(e.target.value)}/></div><div className="field"><label>Protein (g)</label><input type="number" min="0" value={customProtein} onChange={e=>setCustomProtein(e.target.value)}/></div></div>
            <div className="field"><label>Measurement basis</label><select value={customUnit} onChange={e=>setCustomUnit(e.target.value as any)}><option value="g">Per 100 grams</option><option value="ml">Per 100 ml</option><option value="piece">Per piece</option></select></div>
            <div className="form-actions"><button className="btn-quiet" onClick={()=>setShowCustom(false)}>Cancel</button><button className="btn-primary" onClick={addCustomFood}>Save food</button></div>
          </div>}
          {selected&&<div className="quantity-card">
            <div className="quantity-head"><div><span className="tiny-label">SELECTED FOOD</span><h3>{selected.name}</h3><p>{selected.basis} · approximate values</p></div><button className="icon-btn" onClick={()=>setSelected(null)}><X size={17}/></button></div>
            <div className="quantity-controls"><button className="step-btn" onClick={()=>setQty(String(Math.max(selected.unit==='piece'?1:1,Number(qty||0)-(selected.unit==='piece'?1:10))))}><Minus size={16}/></button><div className="quantity-input"><input type="number" min="0.1" step={selected.unit==='piece'?1:1} value={qty} onChange={e=>setQty(e.target.value)}/><span>{selected.unit}</span></div><button className="step-btn" onClick={()=>setQty(String(Number(qty||0)+(selected.unit==='piece'?1:10)))}><Plus size={16}/></button></div>
            <div className="calculation-row"><span>Estimated calories</span><b>{fmt(kcalFor(selected,Number(qty)||0))} <small>kcal</small></b></div>
            <div className="calculation-row protein-row"><span>Estimated protein</span><b>{proteinFor(selected,Number(qty)||0).toFixed(1)} g</b></div>
            <div className="field meal-field"><label>Add to</label><select value={meal} onChange={e=>setMeal(e.target.value)}>{mealNames.map(m=><option key={m}>{m}</option>)}<option>Custom meal</option></select></div>
            <button className="btn-primary add-food-btn" disabled={!Number(qty)||Number(qty)<=0} onClick={()=>addFood(selected)}><Plus size={17}/> Add to food diary <span>· {fmt(kcalFor(selected,Number(qty)||0))} kcal</span></button>
          </div>}
          <div className="food-note"><Info size={16}/><span>Nutrition values are estimates. Home-cooked dishes vary with ingredients and oil.</span></div>
        </section>

        <section className="panel diary-panel">
          <div className="section-heading"><div><p className="eyebrow">{date===localDate()?"TODAY'S INTAKE":'DAILY INTAKE'}</p><h2>Your food diary</h2></div><button className="icon-btn" title="Export CSV" onClick={exportCsv}><Download size={18}/></button></div>
          {dayEntries.length===0?<div className="empty-state"><div className="empty-illustration"><Utensils size={28}/></div><h3>Your diary is looking fresh</h3><p>Foods you add will show up here. Start by searching for your first meal.</p><button className="btn-quiet" onClick={()=>document.querySelector<HTMLInputElement>('.search-wrap input')?.focus()}><Plus size={16}/> Add your first food</button></div>:<div className="diary-list">
            {mealNames.concat(Array.from(new Set(dayEntries.map(e=>e.meal).filter(m=>!mealNames.includes(m))))).filter(m=>dayEntries.some(e=>e.meal===m)).map(m=><div className="meal-group" key={m}>
              <div className="meal-group-heading"><span>{m}</span><span>{fmt(dayEntries.filter(e=>e.meal===m).reduce((s,e)=>s+e.kcal,0))} kcal</span></div>
              {dayEntries.filter(e=>e.meal===m).map(e=><div className="diary-entry" key={e.id}>
                <span className="entry-dot"><Leaf size={15}/></span>
                <div className="entry-details"><b>{e.name}</b>{editId===e.id?<div className="inline-edit"><input type="number" min="0.1" value={editQty} onChange={ev=>setEditQty(ev.target.value)}/><span>{allFoods.find(f=>f.id===e.foodId)?.unit||'g'}</span><button onClick={()=>saveEdit(e)} title="Save"><Check size={15}/></button><button onClick={()=>setEditId(null)} title="Cancel"><X size={15}/></button></div>:<small>{e.quantity} {allFoods.find(f=>f.id===e.foodId)?.unit||'g'} · {e.protein.toFixed(1)} g protein</small>}</div>
                <div className="entry-right"><b>{fmt(e.kcal)} <small>kcal</small></b><div className="entry-actions"><button title="Edit quantity" onClick={()=>{setEditId(e.id);setEditQty(String(e.quantity))}}><Pencil size={14}/></button><button title="Delete entry" onClick={()=>deleteEntry(e)}><Trash2 size={14}/></button></div></div>
              </div>)}
            </div>)}
            <div className="diary-total"><span>Total for {date===localDate()?'today':prettyDate(date)}</span><b>{fmt(consumed)} <small>kcal</small></b></div>
          </div>}
          <div className="diary-footer"><span><span className="footer-dot"/> {syncMode==='cloud'?'Cloud sync is on': 'Saved locally on this device'}</span><button onClick={()=>setShowRecipe(true)}><Plus size={14}/> Build a recipe</button></div>
        </section>
      </div>

      <section className="weekly-section">
        <div className="weekly-head"><div><p className="eyebrow">ZOOM OUT A LITTLE</p><h2>Your recent rhythm</h2></div><span className="weekly-subtitle">7-day calorie overview</span></div>
        <div className="weekly-card"><div className="weekly-chart">{weekly.map(d=><div className="chart-day" key={d.date}><div className="bar-area"><div className={`chart-bar ${d.date===date?'active':''}`} style={{height:`${Math.max(3,Math.min(100,d.total/Math.max(1,target)*100))}%`}} title={`${fmt(d.total)} kcal`}/></div><span className="chart-label">{d.short}</span><small>{d.total?fmt(d.total):'—'}</small></div>)}</div><div className="chart-legend"><span><i className="legend-dot"/>Calories logged</span><span className="target-legend"><i/>Daily target {fmt(target)} kcal</span></div></div>
      </section>

      <footer className="app-footer"><span>Made for everyday Indian meals <span className="footer-heart">♥</span></span><span>Values are estimates, not medical advice.</span></footer>
    </main>

    {showSettings&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowSettings(false)}}><div className="modal">
      <div className="modal-heading"><div><p className="eyebrow">YOUR PREFERENCES</p><h2>Settings</h2></div><button className="icon-btn" onClick={()=>setShowSettings(false)}><X size={19}/></button></div>
      <div className="field"><label>Daily calorie target (kcal)</label><input type="number" min="500" max="10000" value={target} onChange={e=>{const v=Number(e.target.value);if(v>=500&&v<=10000){setTarget(v);void persistTarget(v)}}}/><small>Default is 1,500 kcal. Set a target that is appropriate for you.</small></div>
      <div className="settings-status"><Cloud size={18}/><div><b>{userEmail?'Cloud sync enabled':'Using this device only'}</b><p>{userEmail?`Signed in as ${userEmail}`:'Sign in with the same account on both devices to sync your diary.'}</p></div></div>
      <button className="btn-secondary full-btn" onClick={exportCsv}><Download size={16}/> Export food log as CSV</button>
      <button className="btn-quiet full-btn" onClick={()=>{if(confirm('Clear all locally saved food logs on this device? This cannot be undone.')){setEntries([]);localStorage.removeItem('dp-entries')}}}><RotateCcw size={16}/> Clear local food log</button>
      <p className="modal-note">Nutrition figures are approximate, especially for recipes and home-cooked dishes. Custom foods are stored in this browser and, after cloud setup, saved to your account.</p>
    </div></div>}

    {showAuth&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAuth(false)}}><div className="modal">
      <div className="modal-heading"><div><p className="eyebrow">YOUR DATA, EVERYWHERE</p><h2>Sync your devices</h2></div><button className="icon-btn" onClick={()=>setShowAuth(false)}><X size={19}/></button></div>
      <p className="modal-intro">Sign in with the same account on your phone and laptop to access your food diary from anywhere.</p>
      {!supabase&&<div className="setup-alert"><Info size={18}/><span>Cloud sync isn't configured yet. The tracker works locally now. Follow the README to connect a free Supabase project.</span></div>}
      <button className="google-btn" disabled={!supabase||authBusy} onClick={signInGoogle}><span className="google-g">G</span> Continue with Google</button>
      <div className="or-divider"><span>or use email</span></div>
      <div className="field"><label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></div>
      <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="current-password"/></div>
      <button className="btn-primary full-btn" disabled={!supabase||authBusy||!email||password.length<6} onClick={signInEmail}>{authBusy?'Please wait…':'Sign in / create account'}</button>
      {authMessage&&<p className="auth-message">{authMessage}</p>}
      <p className="modal-note">For email sign-up, check your inbox if email confirmation is enabled in Supabase. Your account's cloud data is private when the supplied database policies are installed.</p>
    </div></div>}

    {showRecipe&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowRecipe(false)}}><div className="modal recipe-modal">
      <div className="modal-heading"><div><p className="eyebrow">HOME-COOKED FOOD</p><h2>Build a recipe</h2></div><button className="icon-btn" onClick={()=>setShowRecipe(false)}><X size={19}/></button></div>
      <p className="modal-intro">Add ingredients and their raw/dry quantities. Enter the final cooked weight to estimate calories per 100 g.</p>
      <div className="field"><label>Recipe name</label><input value={recipeName} onChange={e=>setRecipeName(e.target.value)} placeholder="e.g. My masoor dal"/></div>
      <div className="recipe-ingredient-list">{recipeIngredients.map((ing,i)=>{const f=allFoods.find(x=>x.id===ing.foodId);return <div className="recipe-ingredient" key={i}><span>{f?.name||'Food'}</span><span>{ing.qty} {f?.unit||'g'}</span><button onClick={()=>setRecipeIngredients(prev=>prev.filter((_,j)=>j!==i))}><X size={14}/></button></div>})}</div>
      <RecipeAdder foods={allFoods} onAdd={(food,amount)=>setRecipeIngredients(prev=>[...prev,{foodId:food.id,qty:amount}])}/>
      <div className="field"><label>Final cooked recipe weight (g)</label><input type="number" min="1" value={recipeQty} onChange={e=>setRecipeQty(e.target.value)}/></div>
      <div className="recipe-totals"><span>Total recipe calories</span><b>{fmt(recipeIngredients.reduce((s,i)=>{const f=allFoods.find(x=>x.id===i.foodId);return s+(f?kcalFor(f,i.qty):0)},0))} kcal</b></div>
      <div className="recipe-totals"><span>Calories per 100 g cooked</span><b>{fmt(recipeIngredients.reduce((s,i)=>{const f=allFoods.find(x=>x.id===i.foodId);return s+(f?kcalFor(f,i.qty):0)},0)/Math.max(1,Number(recipeQty))*100)} kcal</b></div>
      <button className="btn-primary full-btn" disabled={!recipeName.trim()||!recipeIngredients.length||Number(recipeQty)<=0} onClick={()=>{
        const totalKcal=recipeIngredients.reduce((s,i)=>{const f=allFoods.find(x=>x.id===i.foodId);return s+(f?kcalFor(f,i.qty):0)},0);
        const totalProtein=recipeIngredients.reduce((s,i)=>{const f=allFoods.find(x=>x.id===i.foodId);return s+(f?proteinFor(f,i.qty):0)},0);
        const f:Food={id:'recipe-'+uid(),name:recipeName.trim(),category:'My recipes',kcal:totalKcal/Number(recipeQty)*100,protein:totalProtein/Number(recipeQty)*100,unit:'g',basis:'per 100 g cooked (your recipe)'};
        setCustomFoods(prev=>[...prev,f]);void persistCustom(f);setShowRecipe(false);setRecipeIngredients([]);setRecipeName('');setSelected(f);setQuery(f.name);setQty('100');
      }}>Save recipe to my foods</button>
      <p className="modal-note">Remember to add oil, ghee and other calorie-containing ingredients. Water adds weight but no calories.</p>
    </div></div>}
  </div>;
}

function RecipeAdder({foods,onAdd}:{foods:Food[];onAdd:(food:Food,qty:number)=>void}){
  const [q,setQ]=useState('');const [amount,setAmount]=useState('100');const [id,setId]=useState('');
  const matches=foods.filter(f=>[f.name,...(f.aliases||[])].some(s=>s.toLowerCase().includes(q.toLowerCase()))).slice(0,5);
  const chosen=foods.find(f=>f.id===id);
  return <div className="recipe-adder"><div className="field"><label>Find an ingredient</label><input value={q} onChange={e=>{setQ(e.target.value);setId('')}} placeholder="Search ingredient…"/></div>
    {q&&matches.length>0&&<div className="recipe-matches">{matches.map(f=><button key={f.id} onClick={()=>{setId(f.id);setQ(f.name);setAmount(f.unit==='piece'?'1':'100')}}>{f.name}<small>{f.basis}</small></button>)}</div>}
    {chosen&&<div className="recipe-add-row"><input aria-label="Ingredient quantity" type="number" min="0.1" value={amount} onChange={e=>setAmount(e.target.value)}/><span>{chosen.unit}</span><button className="btn-secondary" onClick={()=>{if(Number(amount)>0){onAdd(chosen,Number(amount));setQ('');setId('')}}}><Plus size={15}/> Add ingredient</button></div>}
  </div>;
}