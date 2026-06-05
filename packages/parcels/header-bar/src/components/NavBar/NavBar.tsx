import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Cluster, Container, Divider, Flex, Text } from '@grasdouble/lufa_design-system';
import { LangSwitcher } from '@grasdouble/slm_shared';

import { ThemeSelector } from '../ThemeSelector';
import styles from './NavBar.module.css';

type NavItem = {
  href: string;
  labelKey: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/experience', labelKey: 'nav.experience' },
  { href: '/learn', labelKey: 'nav.learn' },
  { href: '/ai/chat', labelKey: 'nav.aiChat' },
];

export function NavBar() {
  const { t } = useTranslation('header-bar');
  const [activePath, setActivePath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      setActivePath(window.location.pathname);
      setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('single-spa:routing-event', onPopState);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('single-spa:routing-event', onPopState);
      window.removeEventListener('keydown', onKeyDown);
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
        <Flex justify="between" align="center" gap="default">
          <div className={styles['nav-left']}>
            <Text as="span" variant="body" weight="bold" color="primary">
              SL
            </Text>
          </div>

          <nav className={styles.nav} aria-label={t('aria.mainNav')}>
            {navLinks}
          </nav>

          <Cluster spacing="compact" align="center" className={styles['nav-right']}>
            <ThemeSelector />
            <Divider orientation="vertical" emphasis="subtle" spacing="compact" />
            <LangSwitcher />
            <Button
              className={styles.hamburger}
              type="ghost"
              variant="neutral"
              size="sm"
              radius="full"
              iconLeft={menuOpen ? 'x' : 'menu'}
              aria-label={menuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            />
          </Cluster>
        </Flex>
      </Container>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className={styles['mobile-menu']}>
          <Container>
            <nav className={styles['mobile-nav']} aria-label={t('aria.mobileNav')}>
              {navLinks}
            </nav>
          </Container>
        </div>
      )}
    </div>
  );
}
