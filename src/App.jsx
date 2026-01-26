import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  MessageSquare,
  Users,
  Cpu,
  FileCheck,
  TrendingUp,
  Smartphone,
  Monitor,
  Zap,
  CheckCircle2,
  Database,
  ArrowDown,
  Loader2,
  Send,
  Layers,
  Layout,
  User,
  Clock,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Bot,
  ArrowRight,
  Mail,
  Instagram,
  Facebook,
  AtSign,
  Search,
  MoreVertical,
  Globe,
  Plus,
  Rocket,
  Check,
  Shield,
  SmartphoneIcon
} from 'lucide-react';

const apiKey = "AIzaSyBQL-t09g8h7f9a4K3u5_OASEmE2lSZmQE";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const App = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrolled / maxScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const callGemini = async (prompt) => {
    setIsAiLoading(true);
    setAiResponse("");
    const systemInstruction = "Tu nombre es Noe. Eres la Asistente Inteligente de una inmobiliaria de Río Grande, Tierra del Fuego, desarrollada por Howenh Labs. Tu tono es profesional pero muy cálido y humano. Responde de forma MUY CONCISA (máximo 3 oraciones). Utiliza emojis profesionales (🏠, ✨, 📍, 🤝, ✅) para dar cercanía. Conoces el mercado local y transmites confianza inmediata.";
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener respuesta.");
      setIsAiLoading(false);
    } catch (error) {
      setAiResponse("Error de conexión.");
      setIsAiLoading(false);
    }
  };

  const handleAiTest = (e) => {
    e.preventDefault();
    if (aiInput.trim()) callGemini(aiInput);
  };

  // Ajuste para 9 secciones (0 a 8)
  const activeDot = Math.min(8, Math.floor(scrollProgress * 9.01));
  const isCrisis = scrollProgress < 0.11;
  const themeColor = isCrisis ? 'bg-red-950' : 'bg-slate-950';

  return (
    <div ref={containerRef} className={`min-h-screen ${themeColor} text-white transition-colors duration-1000 font-sans selection:bg-cyan-500/30 overflow-x-hidden`}>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-0 left-0 w-full h-full opacity-10 transition-opacity duration-1000`} style={{ background: isCrisis ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%)' : 'radial-gradient(circle at center, rgba(6, 182, 212, 0.2) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      {/* Acto 1: El Punto de Quiebre */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className={`transition-all duration-700 transform ${scrollProgress > 0.08 ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
          <div className="relative mb-8 md:mb-12 flex items-end justify-center gap-2 md:gap-4 text-white">
            <div className="relative text-red-600/80">
              <Monitor className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56" />
              <div className="absolute top-0 left-0 w-full h-[82%] flex items-center justify-center">
                <div className="relative w-20 h-20 md:w-32 md:h-32">
                  <div className="w-full h-1 bg-red-600 rotate-45 absolute top-1/2 left-0 -translate-y-1/2 opacity-80" />
                  <div className="w-full h-1 bg-red-600 -rotate-45 absolute top-1/2 left-0 -translate-y-1/2 opacity-80" />
                </div>
              </div>
              <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-lg text-white">WEB BANNED</p>
            </div>
            <Smartphone className="w-16 h-16 md:w-24 md:h-24 text-red-600 mb-4 opacity-80" />
            <AlertTriangle className="absolute -top-4 md:-top-6 -right-4 md:-right-6 w-12 h-12 md:w-16 md:h-16 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-center mb-8 tracking-tighter leading-none"><span className="text-white">EL PUNTO DE</span> <br className="md:hidden" /><span className="text-red-600 italic">QUIEBRE</span></h1>
          <div className="space-y-6 text-center max-w-4xl mx-auto px-4">
            <p className="text-lg md:text-2xl text-red-100/70 font-light italic text-balance">"Un mensaje bloqueado es una oportunidad perdida. Una cuenta suspendida es un negocio que se detiene."</p>
            <div className="h-px w-24 md:w-32 bg-red-500/30 mx-auto my-4 text-white" />
            <p className="text-xl md:text-3xl lg:text-4xl text-red-400 font-semibold text-balance leading-tight text-white">"El baneo de WhatsApp no fue un error aleatorio; fue el sistema avisando que la estructura actual ya no es suficiente para el volumen de tu éxito."</p>
          </div>
          <div className="mt-12 md:mt-16 flex flex-col items-center gap-2 animate-bounce text-red-400/50"><span className="text-[10px] font-bold tracking-widest uppercase text-white">Desliza para la solución</span><ArrowDown size={24} /></div>
        </div>
      </section>

      {/* Acto 2: Metamorfosis */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden text-white">
        <div className={`relative z-10 max-w-6xl transition-all duration-1000 transform ${scrollProgress > 0.08 && scrollProgress < 0.19 ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}`}>
          <div className="flex flex-col items-center lg:items-start gap-8 md:gap-12">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 group">
              <div className="relative p-6 md:p-8 bg-slate-900/80 backdrop-blur-md rounded-[2rem] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)]"><Zap className="w-12 h-12 md:w-20 md:h-20 text-cyan-400 animate-pulse" /><div className="absolute top-0 right-0 p-1.5 bg-cyan-500 rounded-bl-xl"><Layers size={14} className="text-slate-950" /></div></div>
              <div className="text-center md:text-left"><h2 className="text-5xl md:text-8xl font-black tracking-tight leading-none text-white">Howenh <span className="text-cyan-400">Labs</span></h2><div className="h-1.5 w-32 bg-cyan-500 mt-3 mx-auto md:mx-0 rounded-full text-white" /></div>
            </div>
            <div className="space-y-8 max-w-4xl text-center lg:text-left text-white"><h3 className="text-3xl md:text-5xl lg:text-6xl font-light text-slate-100 leading-tight text-balance text-white">Transformamos la <span className="text-cyan-400 font-semibold italic text-white">crisis</span> en el primer paso hacia tu digitalización total.</h3><div className="relative mt-8 py-8 md:py-12 px-6 md:px-12 bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] backdrop-blur-sm shadow-2xl"><p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-snug tracking-tight text-balance text-white">"No buscamos parches, buscamos <span className="text-cyan-400 italic font-black text-white">arquitectura profesional.</span>"</p></div></div>
          </div>
        </div>
      </section>

      {/* Acto 3: Panel Unificado */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-8 text-white">
        <div className={`w-full max-w-7xl transition-all duration-1000 transform ${scrollProgress > 0.19 && scrollProgress < 0.30 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center text-white">
            <div className="lg:col-span-4 space-y-8 text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white text-balance text-white">Un solo <br className="hidden lg:block" /><span className="text-cyan-400 underline decoration-2 underline-offset-8">Panel</span></h2>
              <p className="text-lg md:text-xl text-slate-400 text-balance font-light text-white">Unificamos <span className="text-white font-bold text-white">WhatsApp, Instagram, Web y Email</span> en un solo lugar. Escalabilidad: <span className="text-white font-bold italic underline decoration-cyan-500/30 text-white">usuarios ilimitados.</span></p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl flex flex-col items-center lg:items-start gap-3 group transition-all shadow-xl text-white"><div className="flex gap-2 flex-wrap justify-center lg:justify-start text-white"><MessageSquare className="text-green-500" size={18} /><Instagram className="text-pink-500" size={18} /><Globe className="text-blue-400" size={18} /></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Omnicanal</span></div>
                <div className="p-4 bg-slate-800/40 border border-cyan-500/30 rounded-2xl flex flex-col items-center lg:items-start gap-3 group hover:border-cyan-500 transition-all shadow-xl text-white"><div className="flex items-center gap-1.5 text-cyan-400"><Users size={20} /><span className="text-xl font-black text-white">∞</span></div><span className="text-[10px] font-black uppercase tracking-widest text-cyan-200">Ilimitados</span></div>
              </div>
            </div>
            <div className="lg:col-span-8 flex flex-col items-center relative py-4 text-white">
              <div className="w-full bg-slate-900 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_100px_rgba(6,182,212,0.1)] overflow-hidden relative z-10 flex flex-col md:flex-row h-[400px] md:h-[450px]">
                <div className="w-16 md:w-20 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-8 gap-8"><div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-lg"><Layout size={20} /></div><div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><MessageSquare size={18} /></div><div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500"><Instagram size={18} /></div></div>
                <div className="flex-grow flex flex-col bg-slate-950/20 text-white"><div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 text-white"><div className="flex items-center gap-4 text-white"><div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shadow-lg text-white">W</div><div><p className="font-bold text-sm md:text-base text-white">Usuario Web</p><div className="flex items-center gap-1.5 text-white"><Globe size={10} className="text-blue-400" /><span className="text-[9px] text-slate-400 uppercase font-black tracking-widest text-white">Live from Web</span></div></div></div></div><div className="flex-grow p-6 flex flex-col gap-6 overflow-hidden text-white"><div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-xl text-white"><p className="text-xs md:text-sm text-slate-200">¿Qué requisitos piden para tasar un depto en RG? 🏠</p></div><div className="flex flex-col gap-1 items-end self-end max-w-[85%] text-white"><div className="bg-cyan-600 border border-cyan-400 p-4 rounded-2xl rounded-tr-none shadow-[0_0_30px_rgba(6,182,212,0.2)] text-white"><p className="text-xs md:text-sm text-white font-medium italic">"¡Hola! Recibido. Te paso la documentación técnica ahora mismo..."</p></div></div></div></div>
              </div>
              <div className="w-full max-w-2xl h-24 md:h-28 relative z-0 -mt-2 -mb-2 text-white"><svg className="w-full h-full text-white" viewBox="0 0 500 100" preserveAspectRatio="none"><path d="M62,100 C62,50 250,50 250,0" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" /><path d="M250,100 L250,0" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_25s_linear_infinite]" /><path d="M438,100 C438,50 250,50 250,0" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" /></svg></div>
              <div className="w-full flex justify-around max-w-2xl px-4 text-white">{[...Array(4)].map((_, i) => (<div key={i} className="flex flex-col items-center gap-3 relative group"><div className={`w-12 h-12 md:w-16 md:h-16 bg-slate-900 border ${i === 2 ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-700'} rounded-2xl flex items-center justify-center text-slate-500 shadow-2xl group-hover:border-cyan-500 group-hover:text-cyan-400 transition-all`}><User size={28} className={i === 2 ? 'text-cyan-400' : 'text-white'} /></div><p className={`text-[8px] font-black uppercase ${i === 2 ? 'text-cyan-400' : 'text-slate-500'} tracking-widest`}>Agent 0{i + 1}</p></div>))}<div className="flex flex-col items-center gap-3 relative group text-white"><div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 border border-cyan-500/20 border-dashed rounded-2xl flex items-center justify-center text-cyan-500/50 shadow-2xl transition-all"><Plus size={28} /></div><p className="text-[8px] font-black uppercase text-cyan-600/60 tracking-widest animate-pulse">Ilimitados</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Acto 4: Demo Noe */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-900/30 text-white">
        <div className={`w-full max-w-7xl transition-all duration-1000 transform ${scrollProgress > 0.30 && scrollProgress < 0.42 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <div className="text-center mb-12 md:mb-16 px-4 text-white"><h2 className="text-4xl md:text-7xl font-bold mb-4 tracking-tight">Inteligencia <span className="text-cyan-400">Interactiva</span></h2><p className="text-lg md:text-2xl text-slate-400">Noe responde con el tono ideal de tu inmobiliaria en tiempo real.</p></div>
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-stretch text-white"><div className="bg-slate-800/80 backdrop-blur-md p-6 md:p-12 rounded-[2.5rem] border border-slate-700 shadow-2xl flex flex-col justify-between"><div><h4 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-white"><Cpu className="text-cyan-400" /> Desafía a Noe</h4><textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="¿Hacen permutas?" className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl p-5 md:p-6 text-base md:text-lg focus:border-cyan-500 outline-none h-40 md:h-48 resize-none shadow-inner text-white" /><button onClick={handleAiTest} disabled={isAiLoading || !aiInput} className="mt-6 w-full bg-cyan-500 hover:bg-cyan-400 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 text-slate-950 transition-all active:scale-95 text-white">{isAiLoading ? <Loader2 className="animate-spin text-white" /> : <><Send size={20} className="text-white" /> Probar ahora</>}</button></div></div><div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-hidden flex flex-col h-full min-h-[350px] shadow-2xl text-white"><div className="bg-slate-700/30 p-6 border-b border-slate-700 flex items-center justify-between text-white"><div className="flex items-center gap-4 text-white"><div className="w-12 h-12 bg-cyan-500 rounded-[1rem] flex items-center justify-center text-white shadow-lg"><MessageSquare size={24} /></div><div><p className="font-black text-lg uppercase leading-none">Noe</p><p className="text-[10px] text-cyan-400 font-black tracking-widest mt-1">ASISTENTE INTELIGENTE</p></div></div></div><div className="p-8 flex-grow flex flex-col justify-center overflow-y-auto text-white">{aiResponse ? (<div className="bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-500/20 rounded-3xl rounded-tl-none p-6 md:p-8 text-xl md:text-2xl leading-relaxed text-cyan-50 shadow-xl animate-in zoom-in-95 duration-500">{aiResponse}</div>) : (<div className="text-center opacity-50 px-4 text-white">{isAiLoading ? <Loader2 className="animate-spin w-16 h-16 mx-auto text-cyan-500" /> : (<div className="bg-slate-700/20 p-6 rounded-3xl rounded-tl-none text-lg md:text-xl italic text-slate-300 italic text-white">"¡Hola! Soy Noe. ✨ ¿En qué puedo ayudarte hoy?"</div>)}</div>)}</div></div></div>
        </div>
      </section>

      {/* Acto 5: OCR Oficina Administrativa */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className={`w-full max-w-7xl transition-all duration-1000 transform ${scrollProgress > 0.42 && scrollProgress < 0.54 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center text-white">
            <div className="relative group mx-auto lg:mx-0 w-full max-w-md md:max-w-lg">
              <div className="bg-white/95 rounded-[2rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.5)] rotate-2 relative overflow-hidden transition-transform group-hover:rotate-0 duration-700">
                <div className="space-y-6 font-mono text-xs md:text-sm text-slate-900">
                  <div className="border-b-2 border-slate-200 pb-3 flex justify-between font-black text-cyan-700 uppercase"><span>Comprobante</span><span>15/01/26</span></div>
                  <div className="py-4 space-y-4"><p className="font-black border-b-2 border-slate-100 text-lg md:text-xl text-slate-900 uppercase">FERNANDEZ, LUCIA B.</p><p className="text-3xl md:text-4xl font-black mt-4 text-slate-950">$ 145.000,00</p></div>
                  <div className="bg-slate-100 p-4 rounded-xl text-center font-bold text-slate-900 uppercase tracking-widest">PROCESADO ✅</div>
                </div>
                <div className={`absolute left-0 w-full h-2 bg-cyan-500 shadow-[0_0_20px_#22d3ee] z-20 transition-all duration-[4000ms] ${scrollProgress > 0.46 ? 'top-full' : 'top-0'}`} />
              </div>
              <div className="absolute -bottom-8 -right-4 md:-right-8 bg-slate-900 p-8 rounded-[2.5rem] border-2 border-cyan-500/30 shadow-2xl z-30 transition-transform hover:scale-110 text-white"><p className="text-5xl md:text-7xl font-black text-cyan-400 italic leading-none">70%</p><p className="text-[10px] md:text-xs uppercase font-black text-slate-400 tracking-[0.4em] mt-2 text-white">Ahorro Operativo</p></div>
            </div>
            <div className="space-y-8 text-center lg:text-left text-white text-white text-white text-white text-white text-white"><h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter">La oficina que<br /><span className="text-cyan-400 italic font-light underline decoration-cyan-500/20 underline-offset-8">no duerme</span></h2><p className="text-xl md:text-3xl text-slate-300 italic font-light leading-relaxed text-balance text-white text-white">"El sistema lee, valida y organiza tus comprobantes de pago de forma autónoma las 24 horas del día."</p></div>
          </div>
        </div>
      </section>

      {/* Acto 6 (NUEVA POSICIÓN): El Cierre de la Narrativa / NUEVA ERA */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&format=auto&fit=crop')] bg-cover bg-fixed text-white">
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-lg" />
        <div className={`relative z-10 text-center max-w-6xl transition-all duration-1000 transform ${scrollProgress > 0.54 && scrollProgress < 0.66 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}>
          <div className="mb-8 md:mb-12 inline-block p-3 px-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] shadow-xl text-white">Visión Río Grande 2026</div>
          <h2 className="text-5xl md:text-8xl lg:text-9xl font-black mb-12 tracking-tighter leading-[0.85] text-balance text-white text-white">Esta adversidad es el <span className="text-cyan-400 italic text-white">nacimiento</span> de una ventaja <span className="underline decoration-cyan-500/40 text-white">imparable.</span></h2>
          <div className="pt-16 border-t border-white/10 mt-12 max-w-4xl mx-auto text-white">
            <div className="text-2xl md:text-4xl lg:text-5xl font-light text-slate-400 tracking-tight leading-relaxed text-balance text-white">
              Bienvenidos a la NUEVA ERA de <span className="text-white font-black text-white text-white">Soluciones Inmobiliarias</span>,<br className="hidden md:block" />
              <span className="text-white font-black italic relative inline-block mt-4 md:mt-0 text-white">
                de la mano de HOWENH LABS
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-cyan-500/40 blur-[2px] block text-white" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Acto 7: Etapa 1 */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-900/20 text-white">
        <div className={`w-full max-w-7xl transition-all duration-1000 transform ${scrollProgress > 0.66 && scrollProgress < 0.77 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start text-white">
            <div className="space-y-8 md:space-y-12 text-white">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full shadow-lg"><span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse text-white" /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-400 text-white text-white">Implementación: Etapa 1</span></div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">Validación e <br /><span className="text-cyan-400 italic">Infraestructura</span></h2>
              </div>
              <div className="space-y-6 bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-700/50">
                <h4 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3 text-white"><Rocket size={16} className="text-cyan-400" /> Alcance Técnico</h4>
                <div className="grid gap-5 text-white">
                  {["Verificación oficial del sistema", "Configuración de canal corporativo", "Despliegue de Panel de Control", "Integración de usuarios ilimitados", "Seguimiento personal de la implementación"].map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-base md:text-lg text-white"><CheckCircle2 size={20} className="text-cyan-400 flex-shrink-0 mt-1" /> <span className="font-light text-slate-200">{item}</span></div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 text-white">
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-800/40 border border-slate-700 rounded-2xl shadow-xl"><Clock className="text-cyan-400" size={24} /><div><p className="text-[10px] uppercase font-black text-slate-500 leading-none mb-1">Ejecución</p><p className="text-lg font-bold leading-none text-white">1 Semana</p></div></div>
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-800/40 border border-slate-700 rounded-2xl shadow-xl"><ShieldCheck className="text-cyan-400" size={24} /><div><p className="text-[10px] uppercase font-black text-slate-500 leading-none mb-1 text-white">Garantía</p><p className="text-lg font-bold leading-none text-white">99.5% Up</p></div></div>
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/20 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col h-full self-stretch text-white">
              <div className="p-8 md:p-12 flex-grow space-y-12 flex flex-col justify-center">
                <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400/70 border-l-2 border-cyan-400/50 pl-4">Inversión Inicial de Fase</p>
                  <div className="flex items-baseline gap-2"><span className="text-4xl font-bold text-cyan-500/30">$</span><h3 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none">800.000</h3><span className="text-2xl font-black text-slate-500 ml-1 text-white">ARS</span></div>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-[11px] font-bold text-green-400 uppercase tracking-widest text-white"><Zap size={14} className="fill-green-400 text-white" /> Mantenimiento primer mes bonificado</div>
                </div>
                <div className="h-px bg-slate-700/50 w-full text-white" />
                <div className="space-y-6">
                  <div className="bg-slate-900/60 border border-slate-700/50 rounded-[2rem] p-8 space-y-4 shadow-inner relative overflow-hidden text-white"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-white text-white">Abono Recurrente (Desde 2º Mes)</p><div className="flex items-baseline gap-2 text-white text-white"><span className="text-2xl font-bold text-cyan-400">$</span><p className="text-5xl font-black text-cyan-400 tracking-tighter leading-none">100.000</p><span className="text-lg font-bold text-slate-500 ml-1 uppercase">ARS/Mes</span></div></div>
                  <div className="flex items-center gap-5 p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl group hover:border-cyan-400/40 transition-colors text-white">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-400 flex items-center justify-center text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex-shrink-0 group-hover:scale-110 transition-transform"><MessageSquare size={28} /></div>
                    <p className="text-sm md:text-base font-light text-cyan-50 italic leading-snug">"Propuesta integral: incluye <span className="text-white font-bold">respuesta inmediata</span> mediante la integración de canales oficiales."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acto 8: Etapa 2 */}
      <section className="relative min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-900/10 text-white">
        <div className={`w-full max-w-7xl transition-all duration-1000 transform ${scrollProgress > 0.77 && scrollProgress < 0.88 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start text-white text-white text-white text-white">
            <div className="space-y-8 md:space-y-12 text-white">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full shadow-lg text-white"><span className="w-3 h-3 bg-cyan-400 rounded-full text-white" /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-400 text-white">Implementación: Etapa 2</span></div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none">Cerebro Digital e <br /><span className="text-cyan-400 italic">Integración CRM</span></h2>
              <div className="space-y-6 pt-4 text-white"><div className="p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 group shadow-2xl text-white"><div className="p-5 bg-cyan-400 rounded-2xl shadow-[0_0_30px_#22d3ee]"><Bot className="text-slate-950 group-hover:scale-110 transition-transform text-white" size={48} /></div><div className="text-center md:text-left text-white"><h4 className="font-black text-2xl mb-1 uppercase text-white text-white text-white">Noe 24/7</h4><p className="text-lg text-slate-400 italic font-light">Resolución automática del 80% de consultas comerciales.</p></div></div></div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-[3rem] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.4)] space-y-10 text-white text-white">
              <div className="space-y-6 text-white text-white text-white"><h4 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 border-b border-slate-700/50 pb-4 text-white text-white"><ArrowRight size={18} className="text-cyan-400" /> Alcance Detallado</h4><div className="grid gap-4 text-white text-white">{[{ text: "Noe intercepta mensajes entrantes 24/7", bold: true }, { text: "Menú interactivo: Alquilar, Comprar, Pagos, Reclamos" }, { text: "Calificación automática inteligente de leads", bold: true }, { text: "Enrutamiento directo al departamento asignado" }, { text: "Transferencia humana en cualquier momento", bold: true }, { text: "Respuestas pre-configuradas (FAQs)" }, { text: "Gestión de horarios de atención automáticos" }].map((item, idx) => (<div key={idx} className="flex gap-4 items-start text-base md:text-lg leading-tight text-white"><CheckCircle2 size={20} className="text-cyan-400 flex-shrink-0" /><span className={`${item.bold ? 'text-white font-bold text-white' : 'text-slate-300 font-light'}`}>{item.text}</span></div>))}</div></div>
              <div className="pt-10 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center md:items-end gap-8 text-white"><div className="text-center md:text-left text-white text-white text-white"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 text-white text-white">Presupuesto de Fase</p><div className="flex items-baseline gap-2 text-white"><span className="text-2xl font-bold text-cyan-500/30">$</span><p className="text-5xl md:text-6xl font-black text-white leading-none text-white text-white">1.800.000</p><span className="text-base text-slate-400 font-normal text-white">ARS</span></div></div><div className="text-center md:text-right px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-full w-full md:w-auto text-white"><p className="text-lg font-black text-cyan-400 italic">S/ Costo Adicional</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Acto 9: Cierre Final / Llamada a la acción */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-slate-950 text-white">
        <div className={`text-center max-w-4xl transition-all duration-1000 transform ${scrollProgress > 0.88 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter">¿Comenzamos el <span className="text-cyan-400 italic">despliegue?</span></h2>
          <p className="text-xl text-slate-400 mb-12">Estamos listos para transformar tu operación inmobiliaria en una semana.</p>
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-cyan-500 rounded-2xl text-slate-950 font-black text-xl hover:bg-cyan-400 transition-all cursor-pointer">
            <MessageSquare size={24} />
            Contactar con Howenh Labs
          </div>
        </div>
      </section>

      {/* Navigation */}
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 md:gap-6 z-50 text-white">
        {[...Array(9)].map((_, i) => (
          <div key={i} className={`w-1 transition-all duration-500 rounded-full ${activeDot === i ? 'h-8 md:h-12 bg-cyan-400 shadow-[0_0_20px_#22d3ee]' : 'h-1.5 bg-slate-800'}`} />
        ))}
      </div>

      <style>{`
        @keyframes dash { to { stroke-dashoffset: -100; } }
        .text-balance { text-wrap: balance; }
      `}</style>
    </div>
  );
};

export default App;
