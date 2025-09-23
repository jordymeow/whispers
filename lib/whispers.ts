export const ICON_COLORS = [
  { name: 'blue', label: 'Blue Hour', iconBg: 'rgba(33, 66, 255, 0.18)', iconBorder: 'rgba(92, 116, 255, 0.65)', iconColor: '#7c87ff' },
  { name: 'indigo', label: 'Indigo Night', iconBg: 'rgba(67, 56, 202, 0.22)', iconBorder: 'rgba(129, 140, 248, 0.65)', iconColor: '#a5b4fc' },
  { name: 'purple', label: 'Purple Dusk', iconBg: 'rgba(111, 46, 140, 0.22)', iconBorder: 'rgba(192, 132, 252, 0.6)', iconColor: '#d8b4fe' },
  { name: 'pink', label: 'Pink Dawn', iconBg: 'rgba(190, 24, 93, 0.18)', iconBorder: 'rgba(244, 114, 182, 0.55)', iconColor: '#fbcfe8' },
  { name: 'red', label: 'Crimson Spark', iconBg: 'rgba(220, 38, 38, 0.18)', iconBorder: 'rgba(248, 113, 113, 0.55)', iconColor: '#fecaca' },
  { name: 'orange', label: 'Amber Glow', iconBg: 'rgba(249, 115, 22, 0.18)', iconBorder: 'rgba(251, 146, 60, 0.55)', iconColor: '#fed7aa' },
  { name: 'yellow', label: 'Golden Lantern', iconBg: 'rgba(234, 179, 8, 0.18)', iconBorder: 'rgba(253, 224, 71, 0.55)', iconColor: '#fef3c7' },
  { name: 'green', label: 'Emerald Calm', iconBg: 'rgba(16, 185, 129, 0.18)', iconBorder: 'rgba(52, 211, 153, 0.55)', iconColor: '#bbf7d0' },
] as const;

export type IconColorName = (typeof ICON_COLORS)[number]['name'];

export const DEFAULT_ICON_COLOR: IconColorName = 'blue';

export function isValidIconColor(color?: string | null): color is IconColorName {
  if (!color) return false;
  return ICON_COLORS.some(({ name }) => name === color);
}

export function getIconColorStyles(color?: string | null) {
  const preset = ICON_COLORS.find(({ name }) => name === color) ?? ICON_COLORS[0];
  return preset;
}
