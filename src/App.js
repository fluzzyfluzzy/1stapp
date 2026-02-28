import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Thermometer, Home, TrendingUp, User, PieChart } from 'lucide-react';

const API_KEY = process.env.REACT_APP_FRED_API_KEY;

const MacroDashboard = () => {
  const [data, setData] = useState({ treasury: [], oil: [], sp500: [], housing: [], loading: true });
  const [vitals, setVitals] = useState({ sentiment: "...", cpi: "...", affordability: "..." });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charts Data
        const fetchSeries = async (id) => {
          const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json`);
          const json = await res.json();
          return json.observations.map(o => ({ date: o.date, value: parseFloat(o.value) })).slice(-50);
        };

        // Vitals Data (Latest single point)
        const fetchLatest = async (id) => {
          const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=1`);
          const json = await res.json();
          return json.observations[0].value;
        };

        const [tData, oData, sData, hData] = await Promise.all([
          fetchSeries('DGS10'), fetchSeries('DCOILWTICO'), fetchSeries('SP500'), fetchSeries('HOUST')
        ]);

        setData({ treasury: tData, oil: oData, sp500: sData, housing: hData, loading: false });
        
        setVitals({
          sentiment: await fetchLatest('UMCSENT'),
          cpi: await fetchLatest('CPIAUCSL'),
          affordability: await fetchLatest('FIXHAI')
        });
      } catch (e) {
        console.error(e);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    if (API_KEY) fetchData();
  }, []);

  if (data.loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono uppercase tracking-widest">Updating Andrew's Terminal...</div>;

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 font-sans">
      {/* Header Rebrand */}
      <div className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ANDREW'S US MACRO TERMINAL</h1>
          <p className="text-slate-500 text-sm font-mono mt-1 underline decoration-blue-500">REAL-TIME ECONOMIC SURVEILLANCE // 2026</p>
        </div>
      </div>

      {/* Expanded Vitals Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1"><User size={14}/> Consumer Sentiment</div>
          <div className="text-3xl font-mono font-bold text-emerald-400">{vitals.sentiment}</div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1"><PieChart size={14}/> CPI (Inflation Index)</div>
          <div className="text-3xl font-mono font-bold text-rose-500">{vitals.cpi}</div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1"><Home size={14}/> Housing Affordability</div>
          <div className="text-3xl font-mono font-bold text-blue-400">{vitals.affordability}</div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1"><TrendingUp size={14}/> S&P 500 Index</div>
          <div className="text-3xl font-mono font-bold text-white">{(data.sp500[data.sp500.length - 1]?.value).toLocaleString()}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><Thermometer size={16}/> 10Y Treasury Yield</h3>
          <div className="h-64"><ResponsiveContainer><LineChart data={data.treasury}><CartesianGrid stroke="#1e293b" vertical={false} /><XAxis dataKey="date" hide /><YAxis hide domain={['auto', 'auto']} /><Tooltip contentStyle={{backgroundColor:'#000', border:'none'}} /><Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>
        </div>
        
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><Activity size={16}/> WTI Crude Oil</h3>
          <div className="h-64"><ResponsiveContainer><AreaChart data={data.oil}><XAxis dataKey="date" hide /><YAxis hide domain={['auto', 'auto']} /><Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><TrendingUp size={16}/> S&P 500 Performance</h3>
          <div className="h-64"><ResponsiveContainer><LineChart data={data.sp500}><CartesianGrid stroke="#1e293b" vertical={false} /><XAxis dataKey="date" hide /><YAxis hide domain={['auto', 'auto']} /><Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><Home size={16}/> New Housing Starts</h3>
          <div className="h-64"><ResponsiveContainer><BarChart data={data.housing}><Bar dataKey="value" fill="#fb923c" /></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
};

export default MacroDashboard;
