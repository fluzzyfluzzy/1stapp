import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Thermometer, Home, TrendingUp, User, PieChart, RefreshCw } from 'lucide-react';

const API_KEY = process.env.REACT_APP_FRED_API_KEY;

const MacroDashboard = () => {
  const [data, setData] = useState({ treasury: [], oil: [], sp500: [], housing: [], loading: true });
  const [vitals, setVitals] = useState({ sentiment: "...", cpi: "...", affordability: "..." });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchSeries = async (id) => {
          const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json`);
          const json = await res.json();
          // Filter out any "empty" dots so the chart doesn't break
          return (json.observations || [])
            .filter(o => o.value !== ".")
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .slice(-40);
        };

        const fetchLatest = async (id) => {
          const res = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=5`);
          const json = await res.json();
          // Find the first actual number in the last 5 days (skips weekends/holidays)
          const validEntry = json.observations.find(o => o.value !== ".");
          return validEntry ? validEntry.value : "N/A";
        };

        // We pull everything at once
        const [tData, oData, sData, hData, sent, cpiVal, affVal] = await Promise.all([
          fetchSeries('DGS10'), 
          fetchSeries('DCOILWTICO'), 
          fetchSeries('SP500'), 
          fetchSeries('HOUST'),
          fetchLatest('UMCSENT'),
          fetchLatest('CPIAUCSL'),
          fetchLatest('FIXHAI')
        ]);

        setData({ treasury: tData, oil: oData, sp500: sData, housing: hData, loading: false });
        setVitals({ sentiment: sent, cpi: cpiVal, affordability: affVal });

      } catch (e) {
        console.error("Dashboard Error:", e);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    if (API_KEY) fetchData();
  }, []);

  if (data.loading) return (
    <div className="min-h-screen bg-black text-slate-500 flex items-center justify-center font-mono uppercase tracking-widest text-xs">
      <RefreshCw className="animate-spin mr-3" size={16} /> Initializing Andrew's Terminal...
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 font-sans">
      <div className="mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Andrew's US Macro Terminal</h1>
        <p className="text-slate-500 text-xs font-mono mt-2 tracking-widest">REAL-TIME DATA STREAM // ST. LOUIS FED</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <VitalCard title="Consumer Sentiment" value={vitals.sentiment} icon={<User size={14}/>} color="text-emerald-400" />
        <VitalCard title="CPI (Inflation)" value={vitals.cpi} icon={<PieChart size={14}/>} color="text-rose-500" />
        <VitalCard title="Housing Affordability" value={vitals.affordability} icon={<Home size={14}/>} color="text-blue-400" />
        <VitalCard title="S&P 500 Index" value={data.sp500.length > 0 ? data.sp500[data.sp500.length - 1].value.toLocaleString() : "..."} icon={<TrendingUp size={14}/>} color="text-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartBox title="10Y Treasury Yield" data={data.treasury} color="#3b82f6" icon={<Thermometer size={16}/>} type="line" />
        <ChartBox title="WTI Crude Oil" data={data.oil} color="#10b981" icon={<Activity size={16}/>} type="area" />
        <ChartBox title="S&P 500 Performance" data={data.sp500} color="#ffffff" icon={<TrendingUp size={16}/>} type="line" />
        <ChartBox title="New Housing Starts" data={data.housing} color="#fb923c" icon={<Home size={16}/>} type="bar" />
      </div>
    </div>
  );
};

// Simplified components to keep code clean and prevent "Unterminated String" errors
const VitalCard = ({ title, value, icon, color }) => (
  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
    <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold mb-1">{icon} {title}</div>
    <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
  </div>
);

const ChartBox = ({ title, data, color, icon, type }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl">
    <h3 className={`text-[10px] font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.2em]`} style={{color: color}}>
      {icon} {title}
    </h3>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #334155'}} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart data={data}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.1} />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>
);

export default MacroDashboard;
