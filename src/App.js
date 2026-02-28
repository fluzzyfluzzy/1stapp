import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, RefreshCw } from 'lucide-react';

const API_KEY = process.env.REACT_APP_FRED_API_KEY;

const MacroDashboard = () => {
  const [data, setData] = useState({ treasury: [], oil: [], loading: true });
  const [vitals, setVitals] = useState({ gdp: "2.1", unrate: "3.9", cpi: "2.9" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tRes = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${API_KEY}&file_type=json`);
        const tJson = await tRes.json();
        const oRes = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=DCOILWTICO&api_key=${API_KEY}&file_type=json`);
        const oJson = await oRes.json();

        setData({
          treasury: tJson.observations.map(o => ({ date: o.date, value: parseFloat(o.value) })).slice(-30),
          oil: oJson.observations.map(o => ({ date: o.date, value: parseFloat(o.value) })).slice(-30),
          loading: false
        });
      } catch (e) {
        console.error(e);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    if (API_KEY) fetchData();
  }, []);

  if (data.loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">LOADING DATA...</div>;

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 font-sans">
      <div className="mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white">US MACRO TERMINAL</h1>
        <p className="text-slate-500 text-sm font-mono">LIVE FEED: ST. LOUIS FED</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase mb-1">Real GDP</div>
          <div className="text-3xl font-mono font-bold">{vitals.gdp}%</div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase mb-1">Unemployment</div>
          <div className="text-3xl font-mono font-bold text-blue-400">{vitals.unrate}%</div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase mb-1">Inflation (CPI)</div>
          <div className="text-3xl font-mono font-bold text-rose-400">{vitals.cpi}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><Thermometer size={16}/> 10Y TREASURY</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.treasury}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{backgroundColor:'#000', border:'none'}} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2"><Activity size={16}/> WTI CRUDE OIL</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.oil}>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroDashboard;
