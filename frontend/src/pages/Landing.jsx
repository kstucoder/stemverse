import { Link } from 'react-router-dom';
import { Zap, Cpu, Gamepad2, Trophy, Sparkles, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-game-gradient">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl" />
        </div>
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-game text-xl text-white">STEM<span className="text-gradient">VERSE</span></span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/auth/login" className="btn-secondary text-sm px-5 py-2">Kirish</Link>
              <Link to="/auth/register" className="btn-primary text-sm px-5 py-2">Boshlash</Link>
            </div>
          </div>
        </nav>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-neon-yellow" />
              <span className="text-sm text-brand-300 font-semibold">Digital Twin — Real va Virtual olam birlashmasi</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-game text-white leading-tight mb-6">
              Haqiqiy sxemalarni yig'ing.<br />
              <span className="text-gradient">Virtual o'yinlarda sinang.</span>
            </h1>
            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10">
              Arduino bilan elektronika va dasturlashni o'rganing. Real qurilmalarni virtual o'yinlarga ulang va kodlaringizni jonli ko'ring!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Boshlash <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/auth/login" className="btn-secondary text-lg px-8 py-4">Hisobim bor</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-game text-white mb-4">Qanday <span className="text-gradient">ishlaydi</span></h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Cpu, title: '1. Sxema yig\'ing', desc: 'Komponentlarni breadboardga ulang' },
            { icon: Zap, title: '2. Kod yozing', desc: 'Arduino\'ni dasturlang' },
            { icon: Gamepad2, title: '3. Ulang va o\'ynang', desc: 'Qurilmalaringizni o\'yinda jonli ko\'ring!' },
            { icon: Trophy, title: '4. Mukofot oling', desc: 'Darslarni tugating, XP va yutuqlarni qo\'lga kiriting' },
          ].map((f, i) => (
            <div key={i} className="card-glow text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="font-game text-white text-lg mb-2">{f.title}</h3>
              <p className="text-dark-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <footer className="border-t border-dark-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-brand-400" />
            <span className="font-game text-white">STEM<span className="text-gradient">VERSE</span></span>
          </div>
          <p className="text-dark-500 text-sm">Digital Twin — Ta'lim Platformasi</p>
        </div>
      </footer>
    </div>
  );
}
