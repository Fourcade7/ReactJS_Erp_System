import { useTheme } from '../theme/ThemeProvider'

/*
 * Seriya ranglari validator bilan tekshirilgan (dataviz/validate_palette.js):
 * yorug' rejim karta sirti #ffffff, qorong'i — #15171c; CVD va oddiy ko'rishda
 * qo'shni juftliklar farqi o'tadi. Yorug' rejimdagi aqua 2.82:1 — shuning uchun
 * har grafikda legenda va jadval ko'rinishi bor. Recharts SVG atributlariga CSS
 * o'zgaruvchisi bera olmaydi, shuning uchun aniq qiymatlar temaga qarab tanlanadi.
 */
const PALETTE = {
  // `parts` — donut segmentlari ketma-ketligi (5 ta + aylana: 5→1 ham qo'shni), validatordan o'tgan.
  // Yorug' rejimda aqua/sariq/pushti 3:1 dan past — donut yonida qiymatli jadval bor. `other` — "Другие" uchun neytral.
  light: {
    series: ['#4F5DE9', '#eb6834', '#1baf7a'],
    parts: ['#4F5DE9', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'],
    other: '#B4B7BE',
    grid: '#E2E3E7',
    axis: '#8A8E95',
    baseline: '#CFD1D6',
    surface: '#FFFFFF',
    primaryRgb: '79 93 233',
  },
  dark: {
    series: ['#6C81FF', '#d95926', '#199e70'],
    parts: ['#6C81FF', '#d95926', '#199e70', '#c98500', '#d55181'],
    other: '#4E535D',
    grid: '#282B32',
    axis: '#7C8089',
    baseline: '#393D45',
    surface: '#15171C',
    primaryRgb: '108 129 255',
  },
}

export function useChartColors() {
  const { resolvedTheme } = useTheme()
  return PALETTE[resolvedTheme === 'dark' ? 'dark' : 'light']
}
