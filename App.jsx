import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ScrollTrigger } from './lib/gsap';
import { lockScroll, scrollToId } from './lib/scroll';
import { useReducedMotion } from './hooks/useReducedMotion';
import { getProperty } from './data/properties';
import { NAV_ITEMS } from './components/layout/nav';

import Loader from './components/layout/Loader';
import Navbar from './components/layout/Navbar';
import MenuOverlay from './components/layout/MenuOverlay';
import Footer from './components/layout/Footer';
import Cursor from './components/ui/Cursor';

import Hero from './sections/Hero';
import Residences from './sections/Residences';
import PropertyDetail from './sections/PropertyDetail';
import Experience from './sections/Experience';
import About from './sections/About';
import Amenities from './sections/Amenities';
import Gallery from './sections/Gallery';
import Location from './sections/Location';
import Contact from './sections/Contact';

const DETAIL_HASH = /^#residence\/([a-z-]+)$/;
const detailFromHash = () => {
  const m = window.location.hash.match(DETAIL_HASH);
  return m && getProperty(m[1]) ? m[1] : null;
};

export default function App() {
  const reduced = useReducedMotion();
  const [sceneReady, setSceneReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [preferred, setPreferred] = useState(null);

  const markReady = useCallback(() => setSceneReady(true), []);
  const clearPreferred = useCallback(() => setPreferred(null), []);

  // Never hold the loader hostage to a slow or failing 3D chunk.
  useEffect(() => {
    const t = setTimeout(markReady, 6000);
    return () => clearTimeout(t);
  }, [markReady]);

  // Scroll lock while the loader, menu or a residence is covering the page.
  useEffect(() => {
    lockScroll(!revealed || menuOpen || Boolean(detailId));
  }, [revealed, menuOpen, detailId]);

  // Keep ScrollTrigger measurements accurate once fonts and layout settle.
  useEffect(() => {
    if (!revealed) return undefined;
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 300);
    document.fonts?.ready?.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener('load', refresh);
    };
  }, [revealed]);

  // Highlight the nav item for the section in view.
  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Residence detail is addressable (#residence/azure) and works with the back button.
  useEffect(() => {
    const onPop = () => setDetailId(detailFromHash());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (revealed) {
      const initial = detailFromHash();
      if (initial) setDetailId(initial);
    }
  }, [revealed]);

  const openProperty = useCallback((id) => {
    const hash = `#residence/${id}`;
    if (window.location.hash !== hash) {
      const method = DETAIL_HASH.test(window.location.hash) ? 'replaceState' : 'pushState';
      window.history[method]({ nova: id }, '', hash);
    }
    setDetailId(id);
  }, []);

  const closeProperty = useCallback(() => {
    if (window.history.state?.nova) {
      window.history.back();
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setDetailId(null);
    }
  }, []);

  const navigate = useCallback(
    (id) => {
      const wasCovered = menuOpen || Boolean(detailId);
      setMenuOpen(false);
      if (detailId) closeProperty();
      // Wait for overlays to release the page before scrolling.
      setTimeout(() => scrollToId(id, { reduced }), wasCovered ? (reduced ? 50 : 650) : 0);
    },
    [menuOpen, detailId, closeProperty, reduced]
  );

  const bookProperty = useCallback(
    (id) => {
      setPreferred(id);
      closeProperty();
      setTimeout(() => scrollToId('contact', { reduced }), reduced ? 50 : 800);
    },
    [closeProperty, reduced]
  );

  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#residences"
        onClick={(e) => {
          e.preventDefault();
          navigate('residences');
        }}
        className="fixed left-4 top-4 z-[130] -translate-y-24 rounded-full bg-champagne px-4 py-2 text-[0.875rem] text-night focus:translate-y-0"
      >
        Skip to residences
      </a>

      <Loader ready={sceneReady} reduced={reduced} onReveal={() => setRevealed(true)} />
      <Cursor />
      <div className="grain" aria-hidden="true" />

      <Navbar active={active} onNavigate={navigate} menuOpen={menuOpen} onToggleMenu={toggleMenu} revealed={revealed} />
      <MenuOverlay open={menuOpen} onClose={closeMenu} onNavigate={navigate} active={active} reduced={reduced} />

      <main>
        <Hero revealed={revealed} reduced={reduced} onSceneReady={markReady} onNavigate={navigate} />
        <Residences onOpen={openProperty} onNavigate={navigate} reduced={reduced} />
        <Experience reduced={reduced} />
        <About reduced={reduced} />
        <Amenities />
        <Gallery reduced={reduced} />
        <Location reduced={reduced} />
        <Contact preferred={preferred} onPreferredUsed={clearPreferred} />
      </main>

      <Footer onNavigate={navigate} />

      <PropertyDetail id={detailId} onClose={closeProperty} onOpen={openProperty} onBook={bookProperty} reduced={reduced} />
    </MotionConfig>
  );
}
