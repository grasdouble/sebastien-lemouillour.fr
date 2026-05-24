import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Container, Stack, Text } from '@grasdouble/lufa_design-system';

import { LangSwitcher } from '../LangSwitcher';
import { ThemeSelector } from '../ThemeSelector';
import styles from './NavBar.module.css';

type NavItem = {
  href: string;
  labelKey: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/experience', labelKey: 'nav.experience' },
  { href: '/tutorials', labelKey: 'nav.tutorials' },
];

export function NavBar() {
  const { t } = useTranslation('header-bar');
  const [activePath, setActivePath] = useState(window.location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      setActivePath(window.location.pathname);
      setMenuOpen(false);
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('single-spa:routing-event', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('single-spa:routing-event', onPopState);
    };
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.history.pushState(null, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setActivePath(href);
    setMenuOpen(false);
  };

  const navLinks = NAV_ITEMS.map(({ href, labelKey }) => (
    <a
      key={href}
      href={href}
      className={[styles['nav-link'], activePath === href ? styles['nav-link-active'] : ''].join(' ').trim()}
      onClick={(e) => handleNav(e, href)}
    >
      {t(labelKey)}
    </a>
  ));

  return (
    <div>
      <Container paddingBlock="compact">
        <div className={styles['nav-bar']}>
          <Text as="span" variant="body" weight="bold" color="primary">
            SL
          </Text>

          {/* Desktop nav */}
          <nav className={styles.nav}>{navLinks}</nav>

          {/* Right controls */}
          <Stack direction="horizontal" spacing="compact" align="center">
            <ThemeSelector />
            <span className={styles.separator} />
            <LangSwitcher />
            {/* Hamburger — mobile only */}
            <button
              className={styles.hamburger}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={[styles['hamburger-bar'], menuOpen ? styles['bar-top-open'] : ''].join(' ').trim()} />
              <span className={[styles['hamburger-bar'], menuOpen ? styles['bar-mid-open'] : ''].join(' ').trim()} />
              <span className={[styles['hamburger-bar'], menuOpen ? styles['bar-bot-open'] : ''].join(' ').trim()} />
            </button>
          </Stack>
        </div>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles['mobile-menu']}>
          <Container>
            <nav className={styles['mobile-nav']}>{navLinks}</nav>
          </Container>
        </div>
      )}
    </div>
  );
}
