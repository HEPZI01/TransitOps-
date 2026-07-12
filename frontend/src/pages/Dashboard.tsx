// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api';
import { Calendar, ChevronDown, Check, X, BarChart3, AlertTriangle, Activity, MapPin, Truck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// --- ROLE: ADMIN / FINANCIAL ANALYST ---
const AdminFinancialView = ({ dashboard, conversionData }: any) => {
  return (
    <div className="space-y-6 text-white font-sans max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight">System overview</h1>
          <div className="flex items-center gap-2 bg-[#16161A] px-3 py-1.5 rounded-full border border-white/5 text-sm font-medium">
             <Calendar size={14} className="text-gray-400" />
             <span>Today, July 8, 2024</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-gray-400 text-sm">Choose platform:</span>
           <button className="bg-[#16161A] border border-white/10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors">
             <div className="w-4 h-4 bg-blue-500 rounded-full" /> TransitOps <ChevronDown size={14}/>
           </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="bg-[#16161A] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Custom scroll/drag indicator on left */}
        <div className="absolute left-6 top-8 bottom-8 w-1.5 bg-red-500/20 rounded-full">
           <div className="w-full h-12 bg-[#FF3333] rounded-full shadow-[0_0_10px_rgba(255,51,51,0.5)] absolute top-4 left-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-white rounded-full"></div>
           </div>
        </div>
        
        <div className="ml-12 grid grid-cols-3 gap-8">
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Revenue</p>
            <div className="flex items-start gap-2">
               <span className="text-5xl font-light text-white">$</span>
               <span className="text-[5.5rem] leading-[1] font-normal tracking-tight text-white">33,846</span>
               <div className="mt-4"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg></div>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Expenses</p>
            <div className="flex items-start gap-2">
               <span className="text-5xl font-light text-white">$</span>
               <span className="text-[5.5rem] leading-[1] font-normal tracking-tight text-white">12,582</span>
               <div className="mt-4"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg></div>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Total Active Units</p>
            <div className="flex items-start gap-2">
               <span className="text-[5.5rem] leading-[1] font-normal tracking-tight text-white">245,214</span>
               <div className="mt-4"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg></div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Conversion (Stacked Pill Chart) */}
        <div className="bg-[#16161A] rounded-3xl p-6 border border-white/5 shadow-2xl col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-normal">Revenue & Profit</h2>
            <button className="bg-[#0B0B0F] border border-white/5 px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-white/5">
               <Calendar size={14}/> July, 2024 <ChevronDown size={14}/>
            </button>
          </div>
          
          <div className="flex-1 flex">
             {/* Y Axis */}
             <div className="flex flex-col justify-between text-gray-500 text-xs py-4 pr-6">
                <span>$30K</span>
                <span>$15K</span>
                <span>$10K</span>
                <span>$5K</span>
                <span>0</span>
             </div>
             
             {/* Chart Area */}
             <div className="flex-1 flex justify-around items-end pb-8 relative border-b border-white/5">
                
                {conversionData.map((d, idx) => (
                  <div key={idx} className="w-12 h-[85%] flex flex-col justify-end items-center relative z-10">
                     {/* Background pill */}
                     <div className="absolute inset-0 mx-auto w-10 h-full rounded-full bg-[#1A1A24] shadow-inner border border-white/5 opacity-40 pointer-events-none -z-10"></div>

                     {/* Labels on top of some bars */}
                     {(idx === 1 || idx === 3 || idx === 4) && (
                       <span className="absolute -top-8 text-xs font-semibold tracking-wider text-white whitespace-nowrap">{d.day}</span>
                     )}
                     
                     <div className="w-10 h-full flex flex-col-reverse justify-start gap-1 p-1 pb-1.5">
                       {/* Stacked segments from bottom to top */}
                       {d.yellow > 0 && <div className="w-full rounded-full bg-[#FFD60A]" style={{height: `${d.yellow}%`}}></div>}
                       {d.red > 0 && <div className="w-full rounded-full bg-[#FF3333]" style={{height: `${d.red}%`}}></div>}
                       {d.hatch > 0 && <div className="w-full rounded-full bg-hatch-purple" style={{height: `${d.hatch}%`}}></div>}
                     </div>
                  </div>
                ))}
             </div>
             
             {/* Right Legend Card */}
             <div className="w-48 ml-6 bg-[#0B0B0F] rounded-2xl p-4 border border-white/5 flex flex-col justify-center gap-6">
                <div className="flex items-start gap-3">
                   <div className="w-4 h-4 rounded-md bg-[#FFD60A] shrink-0 mt-1"></div>
                   <div>
                     <p className="text-xs text-gray-400 mb-1">Passenger Fares</p>
                     <p className="text-lg font-medium text-white">$12,582.20</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-4 h-4 rounded-md bg-[#FF3333] shrink-0 mt-1"></div>
                   <div>
                     <p className="text-xs text-gray-400 mb-1">Logistics & Freight</p>
                     <p className="text-lg font-medium text-white">$33,846.09</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-4 h-4 rounded-md bg-hatch-purple shrink-0 mt-1"></div>
                   <div>
                     <p className="text-xs text-gray-400 mb-1">State Subsidies</p>
                     <p className="text-lg font-medium text-white">$8,582.13</p>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="mt-4 bg-[#0B0B0F] rounded-xl p-4 flex items-center gap-4 border border-white/5">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
               <span className="text-white text-xs">$</span>
             </div>
             <p className="text-sm text-gray-300">July, 15 is the most profitable day in this month. <span className="font-bold text-white">Good job!</span></p>
          </div>
        </div>

        {/* Right: Bubble Chart (Leads) */}
        <div className="bg-[#16161A] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col">
           <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-normal">Trip Status</h2>
            <button className="bg-[#0B0B0F] border border-white/5 px-3 py-1.5 rounded-full text-xs flex items-center gap-1 hover:bg-white/5">
               <Calendar size={12}/> 1 Jul - 8 Jul <ChevronDown size={12}/>
            </button>
          </div>
          
          <div className="flex-1 flex">
             {/* Bubble Area */}
             <div className="flex-1 relative min-h-[250px]">
                {/* Yellow Bubble */}
                <div className="absolute top-[10%] left-[20%] w-[140px] h-[140px] rounded-full bg-[#FFD60A] flex flex-col items-center justify-center shadow-lg z-10">
                   <span className="text-3xl font-light text-black">177</span>
                   <div className="absolute -top-5 -left-10 bg-white rounded-full px-2 py-1 flex items-center gap-1.5 shadow-md">
                      <div className="w-2 h-2 rounded-full bg-[#FFD60A]"></div>
                      <span className="text-[9px] font-extrabold text-black uppercase tracking-wider">Completed</span>
                   </div>
                </div>
                {/* Red Bubble */}
                <div className="absolute bottom-[10%] left-[10%] w-[90px] h-[90px] rounded-full bg-[#FF3333] flex flex-col items-center justify-center shadow-lg z-20 mix-blend-screen">
                   <span className="text-2xl font-light text-white">87</span>
                   <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white rounded-full px-2 py-1 flex items-center gap-1.5 shadow-md z-50">
                      <div className="w-2 h-2 rounded-full bg-[#FF3333]"></div>
                      <span className="text-[9px] font-extrabold text-black uppercase tracking-wider">Ongoing</span>
                   </div>
                </div>
                {/* Purple Bubble */}
                <div className="absolute bottom-[5%] right-[20%] w-[60px] h-[60px] rounded-full bg-hatch-purple flex flex-col items-center justify-center shadow-lg z-30">
                   <span className="text-lg font-light text-white">23</span>
                   <div className="absolute -right-8 -bottom-6 bg-white rounded-full px-2 py-1 flex items-center gap-1.5 shadow-md z-50">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-[9px] font-extrabold text-black uppercase tracking-wider">Awaiting</span>
                   </div>
                </div>
             </div>
             
             {/* Right Progress Bars */}
             <div className="w-32 bg-[#0B0B0F] rounded-2xl p-4 border border-white/5 flex flex-col justify-center gap-6">
                <div>
                   <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Completed</p>
                   <p className="text-sm font-medium text-white mb-2">177 (67%)</p>
                   <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-[#FFD60A]" style={{width: '67%'}}></div>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Ongoing</p>
                   <p className="text-sm font-medium text-white mb-2">87 (21%)</p>
                   <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-[#FF3333]" style={{width: '21%'}}></div>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Awaiting</p>
                   <p className="text-sm font-medium text-white mb-2">23 (12%)</p>
                   <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-hatch-purple" style={{width: '12%'}}></div>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="mt-4 bg-[#0B0B0F] rounded-xl p-3 flex items-center justify-between border border-white/5">
             <div className="flex items-center gap-3">
               <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-[#16161A] flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=11" alt=""/></div>
                 <div className="w-8 h-8 rounded-full bg-white text-black text-xs font-bold border-2 border-[#16161A] flex items-center justify-center">+14</div>
               </div>
               <p className="text-xs text-gray-400">users signed in less than a minute!</p>
             </div>
             <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white">
               <X size={12}/>
             </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Allocation Performance */}
        <div className="bg-[#16161A] rounded-3xl p-6 border border-white/5 shadow-2xl col-span-2">
           <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-normal">Allocation Performance</h2>
            <div className="flex gap-2">
              <button className="bg-[#0B0B0F] border border-white/5 px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-white/5">
                 Asset class <ChevronDown size={14}/>
              </button>
              <button className="bg-[#0B0B0F] border border-white/5 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5">
                 <BarChart3 size={16}/>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 h-48">
             {/* Bonds (Red) */}
             <div className="bg-hatch-gray rounded-2xl relative overflow-hidden flex flex-col justify-end">
                <div className="absolute bottom-0 w-full bg-[#FF3333] rounded-2xl p-4 transition-all duration-500" style={{height: '45%'}}>
                  <span className="text-white font-medium">45%</span>
                </div>
                <p className="absolute -bottom-8 w-full text-center text-sm text-gray-400">Bonds</p>
             </div>
             
             {/* Stocks (Yellow) */}
             <div className="bg-hatch-gray rounded-2xl relative overflow-hidden flex flex-col justify-end">
                <div className="absolute bottom-0 w-full bg-[#FFD60A] rounded-2xl p-4 transition-all duration-500" style={{height: '85%'}}>
                  <span className="text-black font-medium">85%</span>
                </div>
                <p className="absolute -bottom-8 w-full text-center text-sm text-gray-400">Stocks</p>
             </div>
             
             {/* ETFs (White) */}
             <div className="bg-hatch-gray rounded-2xl relative overflow-hidden flex flex-col justify-end">
                <div className="absolute bottom-0 w-full bg-white rounded-2xl p-4 transition-all duration-500" style={{height: '48%'}}>
                  <span className="text-black font-medium">48%</span>
                </div>
                <p className="absolute -bottom-8 w-full text-center text-sm text-gray-400">ETFs</p>
             </div>
             
             {/* Crypto (Gray) */}
             <div className="bg-hatch-gray rounded-2xl relative overflow-hidden flex flex-col justify-end">
                <div className="absolute bottom-0 w-full bg-[#2A2A2E] rounded-2xl p-4 transition-all duration-500" style={{height: '10%'}}>
                  
                </div>
                <p className="absolute -bottom-8 w-full text-center text-sm text-gray-400">Crypto</p>
             </div>
          </div>
        </div>
        
        {/* Risk Score */}
        <div className="bg-[#16161A] rounded-3xl p-6 border border-white/5 shadow-2xl relative">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-sm text-gray-400 mb-1">Risk Score</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-normal text-white tracking-tight">72</span>
                  <span className="text-xl text-gray-500">/100</span>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-[#0B0B0F] border border-white/5 flex items-center justify-center text-white hover:bg-white/5">
                <Check size={16}/>
              </button>
           </div>
           
           {/* Custom SVG Semi-circle Gauge */}
           <div className="relative mt-12 mb-8 flex justify-center">
              <svg width="200" height="100" viewBox="0 0 200 100" className="overflow-visible">
                 {/* Track Background */}
                 <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#2A2A2E" strokeWidth="20" strokeLinecap="round" />
                 {/* Track Foreground (Green) */}
                 <path d="M 10 100 A 90 90 0 0 1 100 10" fill="none" stroke="#10B981" strokeWidth="20" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="56" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                 
                 {/* Start Dot */}
                 <circle cx="10" cy="100" r="4" fill="#000" />
                 {/* End Dot (Current Value) */}
                 <circle cx="100" cy="10" r="6" fill="#fff" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
              </svg>
           </div>
           
           <p className="text-center text-sm text-gray-400">Stability improved by <span className="text-white">+4%</span></p>
        </div>
        
      </div>
    </div>
  );
};

// --- ROLE: FLEET MANAGER ---
const FleetHealthView = () => {
  return (
    <div className="space-y-6 text-white font-sans max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Fleet Health</h1>
          <div className="flex items-center gap-2 bg-[#16161A] px-3 py-1.5 rounded-full border border-white/5 text-sm font-medium">
             <Activity size={14} className="text-[#FFD60A]" />
             <span>Status: Critical Monitoring</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Status */}
        <div className="bg-[#16161A] rounded-3xl p-8 border border-white/5 shadow-2xl col-span-2 relative overflow-hidden">
           <div className="absolute -right-20 -top-20 opacity-10">
              <Truck size={300} />
           </div>
           <h2 className="text-xl font-normal mb-8">Asset Readiness</h2>
           <div className="flex items-end gap-12">
              <div>
                <p className="text-gray-400 text-sm mb-2">Active Vehicles</p>
                <p className="text-[5rem] leading-[1] font-normal tracking-tight text-white">412</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-[#0B0B0F] rounded-2xl p-4 border border-white/5 w-32">
                   <p className="text-xs text-gray-500 mb-2">In Shop</p>
                   <p className="text-3xl text-[#FFD60A] font-light">48</p>
                </div>
                <div className="bg-[#0B0B0F] rounded-2xl p-4 border border-white/5 w-32">
                   <p className="text-xs text-gray-500 mb-2">Out of Service</p>
                   <p className="text-3xl text-[#FF3333] font-light">12</p>
                </div>
              </div>
           </div>
           
           {/* Timeline */}
           <div className="mt-12">
              <p className="text-sm text-gray-400 mb-4">Upcoming Maintenance Schedule</p>
              <div className="flex flex-col gap-3">
                 <div className="bg-[#0B0B0F] rounded-xl p-4 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-[#FFD60A]/20 flex items-center justify-center text-[#FFD60A]"><AlertTriangle size={18}/></div>
                       <div>
                         <p className="font-bold">BUS-892 (Brake Pad Replacement)</p>
                         <p className="text-xs text-gray-400">Scheduled for Today, 14:00</p>
                       </div>
                    </div>
                    <button className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold">Acknowledge</button>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Fleet Risk Gauge */}
        <div className="bg-[#16161A] rounded-3xl p-6 border border-white/5 shadow-2xl relative">
           <h2 className="text-xl font-normal mb-8">Fleet Risk Index</h2>
           <div className="relative mt-8 mb-8 flex justify-center">
              <svg width="200" height="100" viewBox="0 0 200 100" className="overflow-visible">
                 <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#2A2A2E" strokeWidth="20" strokeLinecap="round" />
                 <path d="M 10 100 A 90 90 0 0 1 100 10" fill="none" stroke="#FFD60A" strokeWidth="20" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="120" className="drop-shadow-[0_0_15px_rgba(255,214,10,0.4)]" />
                 <circle cx="10" cy="100" r="4" fill="#000" />
                 <circle cx="100" cy="10" r="6" fill="#fff" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
              </svg>
           </div>
           <p className="text-center text-sm text-gray-400">Risk elevated due to pending inspections.</p>
        </div>
      </div>
    </div>
  );
};

// --- ROLE: DISPATCHER ---
const LiveOperationsView = () => {
  return (
    <div className="space-y-6 text-white font-sans max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Live Operations</h1>
          <div className="flex items-center gap-2 bg-[#16161A] px-3 py-1.5 rounded-full border border-white/5 text-sm font-medium">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span>System Online</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#16161A] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
           <h2 className="text-xl font-normal mb-8">Active Routes</h2>
           {/* Abstract Route Map */}
           <div className="relative h-48 bg-[#0B0B0F] rounded-2xl border border-white/5 p-4 overflow-hidden flex flex-col justify-center">
              <div className="flex items-center justify-between relative px-8 z-10">
                 <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-green-500 via-gray-700 to-gray-700 -z-10 border-dashed border-t-2 border-gray-700"></div>
                 <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-4 border-[#0B0B0F] shadow-[0_0_15px_rgba(16,185,129,0.5)]"><MapPin size={10} color="black"/></div>
                    <span className="text-[10px] mt-2 font-bold uppercase tracking-widest text-green-500">Origin</span>
                 </div>
                 <div className="flex flex-col items-center absolute left-1/3 -top-6">
                    <div className="bg-white text-black px-2 py-1 rounded-full text-[9px] font-bold shadow-lg flex gap-1 items-center">
                       <Truck size={10}/> TRK-104
                    </div>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center border-4 border-[#0B0B0F]"><MapPin size={10} color="white"/></div>
                    <span className="text-[10px] mt-2 font-bold uppercase tracking-widest text-gray-500">Destination</span>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="bg-[#16161A] rounded-3xl p-8 border border-white/5 shadow-2xl">
           <h2 className="text-xl font-normal mb-8">Dispatch Queue</h2>
           <div className="flex flex-col gap-4">
              <div className="bg-[#0B0B0F] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                 <div>
                    <p className="font-bold">Trip #9082 - Airport Shuttle</p>
                    <p className="text-xs text-gray-400">Driver: Pending Assignment</p>
                 </div>
                 <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">Assign</button>
              </div>
              <div className="bg-[#0B0B0F] p-4 rounded-2xl border border-white/5 flex justify-between items-center opacity-50">
                 <div>
                    <p className="font-bold">Trip #9081 - Downtown Loop</p>
                    <p className="text-xs text-gray-400">Driver: John Doe (Active)</p>
                 </div>
                 <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">En Route</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};


export default function Dashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportApi.getDashboard,
  });
  
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!dashboard) return null;

  const conversionData = [
    { day: '12 Jul', red: 20, yellow: 15, hatch: 0, total: 35 },
    { day: '15 Jul', red: 30, yellow: 0, hatch: 40, total: 70 },
    { day: '17 Jul', red: 25, yellow: 10, hatch: 20, total: 55 },
    { day: '19 Jul', red: 35, yellow: 15, hatch: 15, total: 65 },
    { day: '21 Jul', red: 20, yellow: 15, hatch: 0, total: 35 },
  ];
  
  if (user?.role === 'FLEET_MANAGER') {
    return <FleetHealthView />;
  }
  
  if (user?.role === 'DISPATCHER') {
    return <LiveOperationsView />;
  }

  // Default for Admin, Financial Analyst, Safety Officer
  return <AdminFinancialView dashboard={dashboard} conversionData={conversionData} />;
}
