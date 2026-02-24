export const PrimaPalette = {
  primaryStart: '#2f76df',
  primaryEnd: '#255fc2',
  backgroundWashStart: '#f6f8fc',
  backgroundWashEnd: '#eef4ff',
  surface: '#ffffff',
  border: '#dce6f7',
  textPrimary: '#102542',
  textMuted: '#5c6f8f',
  success: '#2e8b57',
  warning: '#b7791f',
  danger: '#b83232',
  statusPrimarySurface: '#eaf1ff',
  statusPrimaryBorder: '#c4d7fb',
  statusSuccessSurface: '#e8f6ee',
  statusSuccessBorder: '#c7ebd6',
  statusWarningSurface: '#fff6e8',
  statusWarningBorder: '#f6dfba',
  statusDangerSurface: '#fdeceb',
  statusDangerBorder: '#f7cbc7',
  panelShadow: '#173364',
} as const;

export const PrimaSemantic = {
  statusPill: {
    neutral: {
      backgroundColor: PrimaPalette.surface,
      borderColor: PrimaPalette.border,
      color: PrimaPalette.textMuted,
    },
    primary: {
      backgroundColor: PrimaPalette.statusPrimarySurface,
      borderColor: PrimaPalette.statusPrimaryBorder,
      color: PrimaPalette.primaryEnd,
    },
    success: {
      backgroundColor: PrimaPalette.statusSuccessSurface,
      borderColor: PrimaPalette.statusSuccessBorder,
      color: PrimaPalette.success,
    },
    warning: {
      backgroundColor: PrimaPalette.statusWarningSurface,
      borderColor: PrimaPalette.statusWarningBorder,
      color: PrimaPalette.warning,
    },
    danger: {
      backgroundColor: PrimaPalette.statusDangerSurface,
      borderColor: PrimaPalette.statusDangerBorder,
      color: PrimaPalette.danger,
    },
  },
  panel: {
    shadowColor: PrimaPalette.panelShadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
} as const;

export const PrimaSpacing = {
  screenHorizontal: 20,
  screenVertical: 16,
  cardPadding: 16,
} as const;

export const PrimaRadius = {
  card: 18,
  pill: 999,
} as const;
