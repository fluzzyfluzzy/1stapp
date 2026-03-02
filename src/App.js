import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Thermometer, Home, TrendingUp, User, PieChart, RefreshCw, Calendar } from 'lucide-react';

const API_KEY = process.env.REACT_APP_FRED_API_KEY;
const PROXY_URL = "https://corsproxy.io/?";

const MacroDashboard = () => {
  const [data, setData] = useState({ treasury: [], oil: [], sp500: [], housing: [], loading: true });
  const [vitals, setVitals] = useState({ sentiment: "...", cpi: "...", affordability: "...", date: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Helper to fetch and clean Chart data
        const fetchSeries = async (id) => {
          const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json`;
          const res = await fetch(PROXY_URL + encodeURIComponent(fredUrl));
          const json = await res.json();
          return (json.observations || [])
            .filter(o => o.value !== ".")
            .map(o => ({ date: o.date, value: parseFloat(o.value) }))
            .slice(-50);
        };

        // Helper to fetch and clean Vital Card data (Smarter Weekend logic)
        const fetchLatest = async (id) => {
          const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=15`;
          const res = await fetch(PROXY_URL + encodeURIComponent(fredUrl));
          const json = await res.json();
          const validEntry = json.observations.find(o => o.value && o.value !== ".");
          
          if (!validEntry) return { val: "N/A", date: "" };
          
          const num = parseFloat(validEntry.value);
          const formatted = num > 1000 ? num.toLocaleString(undefined, {maximumFractionDigits:0}) : num.toFixed(1);
          return { val: formatted, date: validEntry.date };
        };

        // Execute all fetches through the proxy
        const [tData, oData, sData, hData] = await Promise.all([
          fetchSeries('DGS10'), fetchSeries('DCOILWTICO'), fetchSeries('SP500'), fetchSeries('HOUST')
        ]);

        const sent = await fetchLatest('UMCSENT');
        const cpiVal = await fetchLatest('CPIAUCSL');
        const affVal = await fetchLatest('FIXHAI');

        setData({ treasury: tData, oil: oData, sp500: sData, housing: hData, loading: false });
        setVitals({ 
          sentiment: sent.val, 
          cpi: cpiVal.val, 
          affordability: affVal.val,
          date: sData[sData.length - 1]?.date || "" 
        });

      } catch (e) {
        console.error("Fetch Error:", e);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    if (API_KEY) {
      fetchData();
    } else {
      console.error("API Key missing from Environment Variables");
    }
  }, []);

  if (data.loading) return (
    <div className="min-h-screen bg-black text-slate-500 flex flex-col items-center justify-center font-mono uppercase tracking-[0.3em] text-[10px]">
      <RefreshCw className="animate-spin mb-4 text-blue-500" size={24} /> 
      Bypassing CORS & Initializing Andrew's Terminal...
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 font-sans">
      {/* Header Area */}
      <div className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Andrew's US Macro Terminal</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Data Stream
            </span>
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} /> Latest Close: {vitals.date}
            </span>
          </div>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <VitalCard title="Consumer Sentiment" value={vitals.sentiment} icon={<User size={14}/>} color="text-emerald-400" />
        <VitalCard title="CPI (Inflation Index)" value={vitals.cpi} icon={<PieChart size={14}/>} color="text-rose-500" />
        <VitalCard title="Housing Affordability" value={vitals.affordability} icon={<Home size={14}/>} color="text-blue-400" />
        <VitalCard title="S&P 500 Index" value={data.sp500.length > 0 ? data.sp500[data.sp500.length - 1].value.toLocaleString() : "..."} icon={<TrendingUp size={14}/>} color="text-white" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartBox title="10Y Treasury Yield" data={data.treasury} color="#3b8
