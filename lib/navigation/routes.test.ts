import { describe, expect, it } from 'bun:test';

import {
  APP_TABS,
  PUBLIC_EMPTY_STATES,
  TAB_LAYOUT_SCREENS,
  getVisibleTabLayoutScreens,
  getVisibleTabs,
  isAdminTabLayoutScreen,
} from './routes';

describe('navigation routes', () => {
  it('keeps public route order matching frontend', () => {
    expect(APP_TABS.filter((tab) => tab.isPublic).map((tab) => tab.key)).toEqual([
      'index',
      'pasien',
      'berita',
      'video-edukasi',
    ]);
  });

  it('hides admin when not authorized', () => {
    expect(getVisibleTabs(false).some((tab) => tab.key === 'admin')).toBe(false);
  });

  it('exposes tab layout metadata for current screens', () => {
    expect(TAB_LAYOUT_SCREENS).toEqual([
      { name: 'index', tabKey: 'index', title: 'Beranda', icon: 'house.fill' },
      { name: 'pasien', tabKey: 'pasien', title: 'Pasien', icon: 'person.2.fill' },
      { name: 'berita', tabKey: 'berita', title: 'Berita', icon: 'newspaper.fill' },
      {
        name: 'video-edukasi',
        tabKey: 'video-edukasi',
        title: 'Video Edukasi',
        icon: 'play.square.fill',
      },
      { name: 'admin/index', tabKey: 'admin', title: 'Admin', icon: 'lock.shield.fill' },
    ]);
  });

  it('derives tab layout labels and icons from app tab metadata', () => {
    const tabByKey = new Map(APP_TABS.map((tab) => [tab.key, tab]));

    for (const screen of TAB_LAYOUT_SCREENS) {
      const tab = tabByKey.get(screen.tabKey);
      expect(Boolean(tab)).toBe(true);

      if (!tab) {
        throw new Error(`Missing tab metadata for ${screen.tabKey}`);
      }

      expect(screen.title).toBe(tab.label);
      expect(screen.icon).toBe(tab.icon);
    }
  });

  it('has public empty-state metadata for mirrored tabs', () => {
    expect(PUBLIC_EMPTY_STATES.pasien.eyebrow).toBe('Data pasien');
    expect(PUBLIC_EMPTY_STATES.berita.eyebrow).toBe('Informasi terbaru');
    expect(PUBLIC_EMPTY_STATES['video-edukasi'].eyebrow).toBe('Pusat pembelajaran');
  });

  it('covers all tabs marked with empty-state metadata', () => {
    const expectedKeys = APP_TABS.filter((tab) => tab.hasEmptyState).map((tab) => tab.key);
    expect(Object.keys(PUBLIC_EMPTY_STATES).sort()).toEqual(expectedKeys.sort());
  });

  it('hides admin layout screen by stable tab key', () => {
    const adminLikeScreen = {
      name: 'admin/index',
      tabKey: 'admin',
      title: 'Ops Console',
      icon: 'lock.shield.fill',
    } as const;

    expect(isAdminTabLayoutScreen(adminLikeScreen)).toBe(true);
    expect(getVisibleTabLayoutScreens(false).some((screen) => screen.tabKey === 'admin')).toBe(false);
    expect(getVisibleTabLayoutScreens(true).some((screen) => screen.tabKey === 'admin')).toBe(true);
  });
});
