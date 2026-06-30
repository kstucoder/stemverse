import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useMediaQuery from '../hooks/useMediaQuery';
import useBoot from '../hooks/useBoot';
import useReveal from '../hooks/useReveal';
import useCounters from '../hooks/useCounters';
import useParallax from '../hooks/useParallax';
import useParticles from '../hooks/useParticles';

import BootScreen from '../components/landing/BootScreen';
import LandingNav from '../components/landing/LandingNav';
import HeroSection from '../components/landing/HeroSection';
import ParentsSection from '../components/landing/ParentsSection';
import StatsSection from '../components/landing/StatsSection';
import MissionsSection from '../components/landing/MissionsSection';
import HardwareSection from '../components/landing/HardwareSection';
import HowItWorks from '../components/landing/HowItWorks';
import LearningPath from '../components/landing/LearningPath';
import ProjectsSection from '../components/landing/ProjectsSection';
import AchievementsSection from '../components/landing/AchievementsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CommunitySection from '../components/landing/CommunitySection';
import FaqSection from '../components/landing/FaqSection';
import FinalCta from '../components/landing/FinalCta';
import LandingFooter from '../components/landing/LandingFooter';
import StickyBuyBar from '../components/landing/StickyBuyBar';
import MobileModal from '../components/landing/MobileModal';

import '../landing.css';

export default function VoltraLanding() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { booting, bootDone, skipBoot } = useBoot(reduceMotion);
  const revealRef = useReveal();
  const countersRef = useCounters();
  const sceneRef = useParallax(reduceMotion, isMobile);
  const canvasRef = useParticles(reduceMotion);

  // Clean up body classes on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Toast notification for buy buttons
  useEffect(() => {
    const showToast = () => {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = "🛒 To'plam savatga qo'shildi — to'lov sahifasi tez orada (demo).";
        toast.classList.add('show');
        clearTimeout(toast._h);
        toast._h = setTimeout(() => toast.classList.remove('show'), 3400);
      }
    };
    const btns = document.querySelectorAll('[data-buy]');
    btns.forEach(b => b.addEventListener('click', showToast));
    return () => btns.forEach(b => b.removeEventListener('click', showToast));
  }, []);

  // Sticky buy bar - show when hero is scrolled past
  useEffect(() => {
    const buybar = document.getElementById('buybar');
    const hero = document.getElementById('top');
    const onScroll = () => {
      if (hero && buybar) {
        buybar.classList.toggle('show', hero.getBoundingClientRect().bottom < -40);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Learning path bars animation
  useEffect(() => {
    const pathEl = document.querySelector('.path');
    if (!pathEl) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.lbar i').forEach((bar) => {
              bar.style.width = bar.dataset.w + '%';
            });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(pathEl);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`voltra-landing${isMobile ? ' is-mobile' : ''}`}>
      {/* Boot screen overlays content until animation completes */}
      {booting && <BootScreen onSkip={skipBoot} done={bootDone} />}

      <canvas id="fx" ref={canvasRef}></canvas>
      <div className="vignette"></div>
      <div className="app">
        <a href="#missions" className="skip-link">Asosiy kontentga o'tish</a>
        <LandingNav />
        <HeroSection sceneRef={sceneRef} />
        
        {/* Device banner - only visible on mobile */}
        <div className="device-banner">
          <div className="inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flex: '0 0 22px', color: 'var(--energy)' }}>
              <rect x="4" y="2" width="16" height="20" rx="3"/><path d="M10 18h4"/>
            </svg>
            <div>
              <b>Siz telefondasiz — bu yerda hammasini ko'rishingiz mumkin.</b>
              <p>Missiyalar kompyuterda, USB orqali ulangan to'plam bilan o'ynaladi. O'ynash uchun saytni noutbuk yoki kompyuterda oching.</p>
            </div>
          </div>
        </div>

        <div ref={revealRef}>
          <ParentsSection />
          <StatsSection countersRef={countersRef} />
        </div>

        <div className="wrap"><div className="divider"></div></div>

        <div ref={revealRef}>
          <MissionsSection />
          <HardwareSection />
          <HowItWorks />
        </div>

        <div className="wrap"><div className="divider"></div></div>

        <div ref={revealRef}>
          <LearningPath />
          <ProjectsSection />
          <AchievementsSection />
          <TestimonialsSection />
          <CommunitySection />
          <FaqSection />
        </div>

        <FinalCta />
        <LandingFooter />
      </div>
      <StickyBuyBar />
      <MobileModal />
      <div className="toast" id="toast" role="status" aria-live="polite"></div>
    </div>
  );
}
