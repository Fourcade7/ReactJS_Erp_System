import { unitPrice } from './pricing'

/**
 * Savatni PNG rasm qilib chizadi va clipboard ga yozadi — mijozga
 * messenjer orqali yuborish uchun (Ctrl+V bilan qoʻyiladi).
 * Rasm doim oq fonda: qaysi mavzuda koʻchirilganidan qatʼi nazar bir xil koʻrinadi.
 */

const WIDTH = 560
const PAD = 24
const SCALE = 2 // retina ekranlarda ham tiniq boʻlishi uchun

const INDEX_W = 28
const AMOUNT_W = 170
const NAME_W = WIDTH - PAD * 2 - INDEX_W - AMOUNT_W - 12
const LINE_H = 19

const COLORS = {
  bg: '#ffffff',
  fg: '#111827',
  muted: '#6b7280',
  line: '#e5e7eb',
  accent: '#4f46e5',
}

const money = (value) => `${Number(value || 0).toLocaleString('uz')} So'm`

function fontFamily() {
  return getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
}

/** Matnni berilgan kenglikka soʻzma-soʻz boʻladi; juda uzun soʻz harfma-harf boʻlinadi. */
function wrapText(ctx, text, maxWidth) {
  const lines = []
  let current = ''

  for (const word of `${text ?? ''}`.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
      continue
    }
    if (current) lines.push(current)

    current = ''
    for (const char of word) {
      if (ctx.measureText(current + char).width > maxWidth && current) {
        lines.push(current)
        current = ''
      }
      current += char
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['—']
}

function renderCartImage(orderList, priceField) {
  const family = fontFamily()
  const font = (weight, size) => `${weight} ${size}px ${family}`

  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = font(500, 14)

  const rows = orderList.map((item) => {
    const price = Number(unitPrice(item, priceField) || 0)
    return {
      item,
      price,
      sum: price * item.quantity,
      lines: wrapText(ctx, item.name, NAME_W),
    }
  })

  const total = rows.reduce((sum, row) => sum + row.sum, 0)
  const count = orderList.reduce((sum, item) => sum + item.quantity, 0)

  const HEADER_H = 74
  const FOOTER_H = 90
  const rowHeight = (row) => Math.max(row.lines.length * LINE_H, LINE_H * 2) + 20
  const height = HEADER_H + rows.reduce((sum, row) => sum + rowHeight(row), 0) + FOOTER_H

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH * SCALE
  canvas.height = height * SCALE
  const g = canvas.getContext('2d')
  g.scale(SCALE, SCALE)
  g.textBaseline = 'top'

  g.fillStyle = COLORS.bg
  g.fillRect(0, 0, WIDTH, height)

  // Sarlavha
  g.fillStyle = COLORS.fg
  g.font = font(700, 20)
  g.fillText('Список товаров', PAD, PAD)
  g.fillStyle = COLORS.muted
  g.font = font(400, 13)
  g.fillText(new Date().toLocaleString('ru-RU'), PAD, PAD + 28)

  let y = HEADER_H
  const divider = (atY) => {
    g.fillStyle = COLORS.line
    g.fillRect(PAD, atY, WIDTH - PAD * 2, 1)
  }
  divider(y)

  // Qatorlar
  rows.forEach((row, index) => {
    const top = y + 10
    const right = WIDTH - PAD

    g.textAlign = 'left'
    g.fillStyle = COLORS.muted
    g.font = font(600, 13)
    g.fillText(`${index + 1}.`, PAD, top + 1)

    g.fillStyle = COLORS.fg
    g.font = font(500, 14)
    row.lines.forEach((line, i) => g.fillText(line, PAD + INDEX_W, top + i * LINE_H))

    g.textAlign = 'right'
    g.font = font(700, 14)
    g.fillText(money(row.sum), right, top)
    g.fillStyle = COLORS.muted
    g.font = font(400, 12)
    const wholesale = row.item.checkPrice ? ' (опт)' : ''
    g.fillText(
      `${row.item.quantity} × ${Number(row.price).toLocaleString('uz')}${wholesale}`,
      right,
      top + LINE_H + 1,
    )

    y += rowHeight(row)
    divider(y)
  })

  // Jami
  g.textAlign = 'left'
  g.fillStyle = COLORS.muted
  g.font = font(400, 13)
  g.fillText(`Товаров: ${rows.length} · Всего: ${count} шт.`, PAD, y + 16)
  g.fillStyle = COLORS.fg
  g.font = font(700, 16)
  g.fillText('ИТОГО', PAD, y + 46)

  g.textAlign = 'right'
  g.fillStyle = COLORS.accent
  g.font = font(800, 22)
  g.fillText(money(total), WIDTH - PAD, y + 42)

  return canvas
}

async function copyCartImage(orderList, priceField) {
  const canvas = renderCartImage(orderList, priceField)
  // Blob ni Promise sifatida berish — `toBlob` kutilayotganda ham bosish
  // (user activation) yoʻqolmasligi uchun.
  const blob = new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  )
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

export { copyCartImage }
