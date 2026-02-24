export type AppTabKey = 'index' | 'pasien' | 'berita' | 'video-edukasi' | 'admin';

export type AppTab = {
  key: AppTabKey;
  label: string;
  icon: 'house.fill' | 'person.2.fill' | 'newspaper.fill' | 'play.square.fill' | 'lock.shield.fill';
  isPublic: boolean;
  hasEmptyState: boolean;
};

export type PublicEmptyStateMetadata = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
};

export type TabLayoutScreenName = AppTabKey | 'admin/index';

export type TabLayoutScreen = {
  name: TabLayoutScreenName;
  tabKey: AppTabKey;
  title: string;
  icon: AppTab['icon'];
};

export const APP_TABS = [
  { key: 'index', label: 'Beranda', icon: 'house.fill', isPublic: true, hasEmptyState: false },
  { key: 'pasien', label: 'Pasien', icon: 'person.2.fill', isPublic: true, hasEmptyState: true },
  { key: 'berita', label: 'Berita', icon: 'newspaper.fill', isPublic: true, hasEmptyState: true },
  { key: 'video-edukasi', label: 'Video Edukasi', icon: 'play.square.fill', isPublic: true, hasEmptyState: true },
  { key: 'admin', label: 'Admin', icon: 'lock.shield.fill', isPublic: false, hasEmptyState: false },
] as const satisfies readonly AppTab[];

type AppTabWithEmptyState = Extract<(typeof APP_TABS)[number], { hasEmptyState: true }>;

export type PublicEmptyStateKey = AppTabWithEmptyState['key'];
export type PublicEmptyStateIcon = AppTabWithEmptyState['icon'];

export const PUBLIC_EMPTY_STATES: Record<PublicEmptyStateKey, PublicEmptyStateMetadata> = {
  pasien: {
    eyebrow: 'Data pasien',
    title: 'Halaman pasien sedang disiapkan',
    description:
      'Kami sedang merapikan alur daftar pasien agar sinkron dengan layanan backend dan hak akses pengguna.',
    note: 'Saat ini belum ada data yang ditampilkan.',
  },
  berita: {
    eyebrow: 'Informasi terbaru',
    title: 'Konten berita akan hadir segera',
    description:
      'Kurasi berita kesehatan sedang difinalkan agar informasi yang muncul lebih relevan dan konsisten.',
    note: 'Belum ada artikel yang dipublikasikan di aplikasi.',
  },
  'video-edukasi': {
    eyebrow: 'Pusat pembelajaran',
    title: 'Video edukasi sedang diproduksi',
    description:
      'Tim konten sedang menyiapkan video singkat dengan materi yang mudah dipahami untuk semua pengguna.',
    note: 'Perpustakaan video akan tampil pada pembaruan berikutnya.',
  },
};

const TAB_LAYOUT_NAME_BY_KEY: Record<AppTabKey, TabLayoutScreenName> = {
  index: 'index',
  pasien: 'pasien',
  berita: 'berita',
  'video-edukasi': 'video-edukasi',
  admin: 'admin/index',
};

export const TAB_LAYOUT_SCREENS = APP_TABS.map((tab) => ({
  name: TAB_LAYOUT_NAME_BY_KEY[tab.key],
  tabKey: tab.key,
  title: tab.label,
  icon: tab.icon,
})) satisfies readonly TabLayoutScreen[];

export function isAdminTabLayoutScreen(screen: Pick<TabLayoutScreen, 'tabKey'>) {
  return screen.tabKey === 'admin';
}

export function getVisibleTabLayoutScreens(isAdmin: boolean) {
  return TAB_LAYOUT_SCREENS.filter((screen) => !isAdminTabLayoutScreen(screen) || isAdmin);
}

export function getVisibleTabs(isAdmin: boolean) {
  return APP_TABS.filter((tab) => tab.isPublic || isAdmin);
}
