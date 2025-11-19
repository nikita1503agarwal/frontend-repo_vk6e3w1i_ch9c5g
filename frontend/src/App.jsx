import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function HouseBar({ houses }){
  const total = houses.reduce((a,h)=>a+(h.total_points||0),0) || 1
  const color = (name)=>({
    Gryffindor:'from-red-600 to-yellow-600',
    Slytherin:'from-emerald-600 to-green-800',
    Hufflepuff:'from-yellow-500 to-amber-700',
    Ravenclaw:'from-blue-600 to-indigo-800'
  }[name]||'from-slate-600 to-slate-800')
  return (
    <div className="space-y-3">
      {houses.map(h=>{
        const pct = Math.max(5, Math.round(((h.total_points||0)/total)*100))
        return (
          <div key={h.name} className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>{h.name}</span>
              <span>{h.total_points||0} pts</span>
            </div>
            <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${color(h.name)}`} style={{width: pct+"%"}} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Landing({ onStudent, onAdmin, onLeaderboard }){
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] to-[#0d0f1a] text-slate-100 font-[inter]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl tracking-widest font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow">Shadow Enchanters</h1>
          <nav className="space-x-3 text-sm">
            <button onClick={onStudent} className="px-3 py-1.5 rounded bg-slate-800/60 hover:bg-slate-700/60">Student Login</button>
            <button onClick={onAdmin} className="px-3 py-1.5 rounded bg-slate-800/60 hover:bg-slate-700/60">Admin Login</button>
            <button onClick={onLeaderboard} className="px-3 py-1.5 rounded bg-amber-500/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20">Leaderboard</button>
          </nav>
        </header>
        <section className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl mb-4 text-slate-200">A house-points realm for modern wizards</h2>
            <p className="text-slate-400 leading-relaxed">Join your destined house through a short magical quiz, earn glory with contributions, and watch your house rise. Admins bestow and retract points with reasons, while students track their legacy.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={onStudent} className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-violet-700 hover:to-violet-600">Begin Your Journey</button>
              <button onClick={onLeaderboard} className="px-4 py-2 rounded border border-slate-700 hover:bg-slate-800">View Leaderboard</button>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-3">House Standings</p>
            <HouseBar houses={[{name:'Gryffindor',total_points:120},{name:'Slytherin',total_points:110},{name:'Hufflepuff',total_points:95},{name:'Ravenclaw',total_points:130}]} />
            <p className="mt-4 text-xs text-slate-500">Live standings appear after setup.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function AuthView({ mode, onBack, onSignedIn }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [name,setName]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  async function submit(e){
    e.preventDefault()
    setLoading(true); setError('')
    try{
      if(mode==='student'){
        const res = await fetch(`${API_BASE}/auth/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,name})})
        const data = await res.json()
        if(!res.ok) throw new Error(data.detail||'Signup failed')
        onSignedIn({user_id:data.user_id})
      } else {
        // Admin login: rely on Supabase UI externally; for demo, show bootstrap
        const r = await fetch(`${API_BASE}/admin/bootstrap`,{method:'POST'})
        if(!r.ok){
          const d = await r.json(); throw new Error(d.detail||'Admin setup failed')
        }
        alert('Admin bootstrap attempted. Use your Supabase auth for admin.')
      }
    }catch(err){ setError(err.message)}
    finally{ setLoading(false)}
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] to-[#0d0f1a] text-slate-100">
      <div className="max-w-md mx-auto px-6 py-16">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-200 text-sm">← Back</button>
        <h2 className="mt-6 text-2xl font-semibold">{mode==='student'?'Student Sign Up':'Admin Login'}</h2>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode==='student' && (
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" required />
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" required />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" required />
          <button disabled={loading} className="w-full py-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-60">{loading?'Please wait...':(mode==='student'?'Create Account':'Admin Setup')}</button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  )
}

function QuizView({ user, onDone }){
  const questions = [
    {id:1, q:'In a challenge, you rely on...', options:['Bravery','Ambition','Loyalty','Wisdom']},
    {id:2, q:'A symbol you resonate with...', options:['Sword','Serpent','Badger','Eagle']},
    {id:3, q:'Pick a path...', options:['Daring','Power','Kindness','Knowledge']},
  ]
  const [answers,setAnswers]=useState({})
  const [loading,setLoading]=useState(false)
  async function submit(){
    const payload = {answers: Object.entries(answers).map(([qid,idx])=>({question_id: Number(qid), answer_value: idx}))}
    setLoading(true)
    const res = await fetch(`${API_BASE}/quiz/submit/${user.user_id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    const data = await res.json()
    setLoading(false)
    if(!res.ok) return alert(data.detail||'Quiz submit failed')
    onDone({house:data.assigned_house})
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] to-[#0d0f1a] text-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">The Sorting Trial</h2>
        <div className="space-y-6">
          {questions.map((it)=> (
            <div key={it.id} className="bg-slate-900/50 border border-slate-800 rounded p-4">
              <p className="mb-3 text-slate-200">{it.q}</p>
              <div className="grid grid-cols-2 gap-2">
                {it.options.map((opt,idx)=> (
                  <button key={idx} onClick={()=>setAnswers(a=>({...a,[it.id]:idx}))} className={`px-3 py-2 rounded border ${answers[it.id]===idx?'border-amber-400 bg-amber-500/10':'border-slate-800 bg-slate-900/40'} hover:border-amber-300`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button disabled={loading || Object.keys(answers).length!==questions.length} onClick={submit} className="mt-6 px-5 py-2 rounded bg-gradient-to-r from-amber-600 to-yellow-600 disabled:opacity-60">Finish</button>
      </div>
    </div>
  )
}

function StudentDashboard({ user }){
  const [data,setData]=useState(null)
  useEffect(()=>{
    (async()=>{
      const r = await fetch(`${API_BASE}/student/dashboard/${user.user_id}`)
      const d = await r.json(); if(r.ok) setData(d)
    })()
  },[user])
  if(!data) return <div className="min-h-screen grid place-items-center bg-[#0b0e17] text-slate-300">Loading...</div>
  const crest = (h)=>({Gryffindor:'🛡️',Slytherin:'🐍',Hufflepuff:'🦡',Ravenclaw:'🦅'}[h]||'⭐')
  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold">Welcome, {data.student.name}</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Your House</p>
                <p className="text-xl">{crest(data.student.assigned_house)} {data.student.assigned_house||'Unassigned'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">House Total</p>
                <p className="text-xl">{(data.houses.find(h=>h.name===data.student.assigned_house)?.total_points)||0}</p>
              </div>
            </div>
            <div className="mt-6">
              <HouseBar houses={data.houses} />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">Your Contribution</p>
            <p className="text-3xl mt-1">{data.student.total_points||0}</p>
          </div>
        </div>
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm mb-3">Recent Activity</p>
          <div className="space-y-2">
            {data.transactions.length===0 && <p className="text-slate-500 text-sm">No activity yet.</p>}
            {data.transactions.map((t,i)=> (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{t.reason}</span>
                <span className={t.delta>=0?"text-emerald-400":"text-rose-400"}>{t.delta>0?`+${t.delta}`:t.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Leaderboard(){
  const [data,setData]=useState({houses:[],top:[]})
  useEffect(()=>{(async()=>{const r=await fetch(`${API_BASE}/admin/overview`); const d=await r.json(); if(r.ok) setData(d)})()},[])
  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold">Leaderboard</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm mb-3">House Standings</p>
            <HouseBar houses={data.houses} />
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm mb-3">Top Performers</p>
            <div className="space-y-2 text-sm">
              {data.top.map(s=> (
                <div key={s.id} className="flex items-center justify-between">
                  <span>{s.name} <span className="text-slate-500">({s.assigned_house||'—'})</span></span>
                  <span className="text-amber-300">{s.total_points||0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App(){
  const [route,setRoute]=useState('home')
  const [user,setUser]=useState(null)
  const [sorted,setSorted]=useState(null)
  if(route==='home') return <Landing onStudent={()=>setRoute('student')} onAdmin={()=>setRoute('admin')} onLeaderboard={()=>setRoute('leaderboard')} />
  if(route==='student') return user? (sorted? <StudentDashboard user={user} /> : <QuizView user={user} onDone={(s)=>{setSorted(s); setRoute('dashboard')}} />) : <AuthView mode="student" onBack={()=>setRoute('home')} onSignedIn={(u)=>setUser(u)} />
  if(route==='admin') return <AuthView mode="admin" onBack={()=>setRoute('home')} onSignedIn={()=>{}} />
  if(route==='leaderboard') return <Leaderboard />
  if(route==='dashboard') return <StudentDashboard user={user} />
  return null
}
