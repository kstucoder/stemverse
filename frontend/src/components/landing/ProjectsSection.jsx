import { Link } from 'react-router-dom';

// SVG icons for each project type — no emoji
const PrjIcons = {
  svetofor: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="7" r="2" fill="#ff5f5f" stroke="none"/><circle cx="12" cy="12" r="2" fill="#ffc400" stroke="none"/><circle cx="12" cy="17" r="2" fill="#4ade80" stroke="none"/></svg>,
  robot:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="8" y="8" width="8" height="10" rx="2"/><path d="M12 2v6M9 8l-3 2m9-2 3 2M8 14H5m11 0h3"/><circle cx="10" cy="12" r="1" fill="currentColor"/><circle cx="14" cy="12" r="1" fill="currentColor"/></svg>,
  house:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  weather:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>,
  plant:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22V12m0 0C12 7 7 4 3 6c2 4 5 6 9 6zm0 0c0-5 5-8 9-6-2 4-5 6-9 6z"/></svg>,
  alarm:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  car:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h12l4 4 2 2v4h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  custom:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
};

export default function ProjectsSection() {
  const projects = [
    { icon: 'svetofor', title: 'Svetofor',          tag: 'LED · Mantiq',       bg: 'radial-gradient(120% 120% at 30% 0,#3a2a0f,#05101c)',   color: '#ffc400' },
    { icon: 'robot',    title: "Robot qo'l",         tag: 'Servo · Boshqaruv',  bg: 'radial-gradient(120% 120% at 70% 0,#0f2d33,#05101c)',   color: '#19e3ff' },
    { icon: 'house',    title: 'Aqlli uy',           tag: 'Sensor · Rele',      bg: 'radial-gradient(120% 120% at 30% 100%,#1a1f3d,#05101c)', color: '#7b8aff' },
    { icon: 'weather',  title: "Ob-havo stansiyasi", tag: 'Harorat · LCD',      bg: 'radial-gradient(120% 120% at 70% 100%,#0a2a3d,#05101c)', color: '#19e3ff' },
    { icon: 'plant',    title: 'Issiqxona',          tag: 'Tuproq · Nasos',     bg: 'radial-gradient(120% 120% at 30% 0,#0f3320,#05101c)',   color: '#4ade80' },
    { icon: 'alarm',    title: 'Signalizatsiya',     tag: 'PIR · Zummer',       bg: 'radial-gradient(120% 120% at 70% 0,#3a1510,#05101c)',   color: '#ff7a2c' },
    { icon: 'car',      title: 'Robot mashina',      tag: 'Motor · Ultratovush', bg: 'radial-gradient(120% 120% at 30% 100%,#23304f,#05101c)', color: '#7b8aff' },
    { icon: 'custom',   title: "O'zing qur",         tag: 'Erkin rejim',        bg: 'radial-gradient(120% 120% at 70% 100%,#2a0f33,#05101c)', color: '#cc7aff' },
  ];
  return (
    <section className="section-pad" id="projects">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="eyebrow">Haqiqatda qur</span>
            <h2>Loyihalar ko'rgazmasi</h2>
          </div>
          <Link to="/auth/register" className="link">Barcha loyihalar →</Link>
        </div>
        <div className="proj-grid">
          {projects.map((p, i) => (
            <Link to="/auth/register" key={i} className="prj reveal" style={{ '--reveal-delay': `${i * 60}ms` }}>
              <div className="prj-art" style={{ background: p.bg, color: p.color }}>
                <span className="prj-ico">{PrjIcons[p.icon]}</span>
              </div>
              <div className="prj-body"><h3>{p.title}</h3><span>{p.tag}</span></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
