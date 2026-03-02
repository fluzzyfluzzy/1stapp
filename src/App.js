import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Thermometer, Home, TrendingUp, User, PieChart, RefreshCw } from 'lucide-react';

const API_KEY = process.env.REACT_APP_FRED_API_KEY;
const PROXY = "https://corsproxy.io/?";

const MacroDashboard = () => {
  const [data, setData] = useState({ treasury: [], oil: [], sp500: [], housing: [], loading: true });
  const [vitals, setVitals] = useState({ sentiment: "...", cpi: "...", affordability: "...", date: "" });

  useEffect(() => {
    const getData = async () => {
      try {
        const fetchSeries = async (id) => {
          const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json`;
          const res = await fetch(PROXY + encodeURIComponent(url));
          const json = await res.json();
          return (json.observations || []).filter(o => o.value !== ".").map(o => ({ date: o.date, value: parseFloat(o.value) })).slice(-50);
        };

        const fetchLatest = async (id) => {
          const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=15`;
          const res = await fetch(PROXY + encodeURIComponent(url));
          const json = await res.json();
          const entry = (json.observations || []).find(o => o.value && o.value !== ".");
          if (!entry) return "N/A";
          const n = parseFloat(entry.value);
          return n > 1000 ? n.toLocaleString() : n.toFixed(1);
        };

        const [t, o, s, h] = await Promise.all([fetchSeries('DGS10'), fetchSeries('DCOILWTICO'), fetchSeries('SP500'), fetchSeries('HOUST')]);
        const [sent, cpi, aff] = await Promise.all([fetchLatest('UMCSENT'), fetchLatest('CPIAUCSL'), fetchLatest('FIXHAI')]);

        setData({ treasury: t, oil: o, sp500: s, housing: h, loading: false });
        setVitals({ sentiment: sent, cpi: cpi, affordability: aff, date: s[s.length-1]?.date || "" });
      } catch (err) {
        console.error(err);
        setData(d => ({ ...d, loading: false }));
      }
    };
    if (API_KEY) getData();
  }, []);

  if (data.loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">INITIALIZING ANDREW'S TERMINAL...</div>;

  return (
    <div className="min-h-screen bg-black text-slate-300 p-8 font-sans">
      <div className="mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tighter">ANDREW'S US MACRO TERMINAL</h1>
        <p className="text-slate-600 text-[10px] font-mono mt-1 uppercase tracking-widest leading-none">Last Market Date: {vitals.date}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Sentiment</p><p className="text-2xl font-mono font-bold text-emerald-400">{vitals.sentiment}</p></div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><p className="text-slate-500 text-[10px] font-bold uppercase mb-2">CPI Index</p><p className="text-2xl font-mono font-bold text-rose-500">{vitals.cpi}</p></div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Housing Affordability</p><p className="text-2xl font-mono font-bold text-blue-400">{vitals.affordability}</p></div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><p className="text-slate-500 text-[10px] font-bold uppercase mb-2">S&P 500</p><p className="text-2xl font-mono font-bold text-white">{data.sp500.length > 0 ? data.sp500[data.sp500.length-1].value.toLocaleString() : "..."}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
           <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-4">10Y Treasury Yield</p>
           <div className="h-48"><ResponsiveContainer><LineChart data={data.treasury}><CartesianGrid stroke="#1e293b" vertical={false}/><XAxis dataKey="date" hide/><YAxis hide domain={['auto','auto']}/><Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
           <p className="text-[10px] text-white font-bold uppercase tracking-widest mb-4">S&P 500 Trend</p>
           <div className="h-48"><ResponsiveContainer><LineChart data={data.sp500}><CartesianGrid stroke="#1e293b" vertical={false}/><XAxis dataKey="date" hide/><YAxis hide domain={['auto','auto']}/><Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
           <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-4">WTI Crude Oil</p>
           <div className="h-48"><ResponsiveContainer><AreaChart data={data.oil}><XAxis dataKey="date" hide/><YAxis hide domain={['auto','auto']}/><Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.1}/></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
           <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-4">Housing Starts</p>
           <div className="h-48"><ResponsiveContainer><BarChart data={data.housing}><Bar dataKey="value" fill="#fb923c"/></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
};

export default MacroDashboard;
