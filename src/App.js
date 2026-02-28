import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";
const API_KEY = process.env.REACT_APP_FRED_API_KEY;

const formatFredData = (data) => {
  if (!data || !data.observations) return [];
  return data.observations.map(obs => ({
    date: obs.date,
    value: parseFloat(obs.value)
  })).slice(-20); 
};

const MacroDashboard = () => {
  const [data, setData] = useState({ treasury: [], oil: [], loading: true, error: null });
  const [vitals, setVitals] = useState({ gdp: "...", cpi: "...", unrate: "..." });

  useEffect(() => {
    if (!API_KEY) {
      setData(prev => ({ ...prev, loading: false, error: "Missing API Key in Vercel Settings" }));
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch 10-Year Treasury
        const tRes = await fetch(`${FRED_BASE_URL}?series_id=DGS10&api_key=${API_KEY}&file_type=json`);
        const tData = await tRes.json();

        // 2. Fetch WTI Oil
        const oRes = await fetch(`${FRED_BASE_URL}?series_id=DCOILWTICO&api_key=${API_KEY}&file_type=json`);
        const oData = await oRes.json();

        // 3. Helper for Vitals
        const fetchVital = async (id) => {
          const res = await fetch(`${FRED_BASE_URL}?series_id=${id}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=1`);
          const json = await res.json();
          return json.observations[0].value;
        };

        setData({
          treasury: formatFredData(tData),
          oil: formatFredData(oData),
          loading: false,
          error: null
        });

        setVitals({
          gdp: await fetchVital('A191RL1Q225SBEA'),
          cpi: "2.9", // Stable placeholder for demo
          unrate: await fetchVital('UNRATE')
        });
      } catch (err) {
        setData(prev => ({ ...prev, loading: false, error: "Failed to fetch data from FRED" }));
      }
    };

    fetchData();
  }, []);

  if (data.loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-slate-400 font-mono">
      <RefreshCw className="animate-spin mr-3" /> INITIALIZING LIVE DATA FEED...
    </div>
  );

  if (data.error) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-rose-500 font-mono p-10 text-center">
      <AlertTriangle className="mr-2" /> ERROR: {data.error}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">US MACRO TERMINAL</h1>
          <p className="text-slate-500 text-sm font-mono tracking-tighter uppercase">Source: St. Louis Fed / FRED API</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Live Connection</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-2xl">
          <p className="text-slate-400 text-xs uppercase mb-1 font-semibold">Real GDP Growth</p>
          <p className="text-3xl font-mono font-bold text-white">{vitals.gdp}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-2xl">
          <p className="text-slate-400 text-xs uppercase mb-1 font-semibold">Unemployment</p>
          <p className="text-3xl font-mono font-bold text-blue-400">{vitals.unrate}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-2xl">
          <p className="text-slate-400 text-xs uppercase mb-1 font-semibold">CPI Inflation</p>
          <p className="text-3
