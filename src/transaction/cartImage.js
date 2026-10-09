import { priceChange, unitPrice } from './pricing'
import { locale, t } from '../i18n'

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
const signed = (value) => `${value < 0 ? '−' : '+'}${Math.abs(value).toLocaleString('uz')}`

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
      sum: Math.round(price * item.quantity),
      // Savatda qoʻlda oʻzgartirilgan narxning odatiy narxdan farqi (1 dona uchun).
      change: priceChange(item, priceField),
      lines: wrapText(ctx, item.name, NAME_W),
    }
  })

  const total = rows.reduce((sum, row) => sum + row.sum, 0)
  const count = Math.round(orderList.reduce((sum, item) => sum + item.quantity, 0) * 1000) / 1000
  const changeTotal = Math.round(rows.reduce((sum, row) => sum + row.change * row.item.quantity, 0))

  const HEADER_H = 74
  const CHANGE_H = changeTotal !== 0 ? 24 : 0
  const FOOTER_H = 90 + CHANGE_H
  // Oʻng ustun: summa, «son × narx» va (oʻzgargan boʻlsa) «было … · farq».
  const rowHeight = (row) => Math.max(row.lines.length, row.change !== 0 ? 3 : 2) * LINE_H + 20
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
  g.fillText(t('Список товаров'), PAD, PAD)
  g.fillStyle = COLORS.muted
  g.font = font(400, 13)
  g.fillText(new Date().toLocaleString(locale), PAD, PAD + 28)

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
    const wholesale = row.item.checkPrice ? t(' (опт)') : ''
    g.fillText(
      `${row.item.quantity} × ${Number(row.price).toLocaleString('uz')}${wholesale}`,
      right,
      top + LINE_H + 1,
    )
    if (row.change !== 0) {
      // Yuqoridagi «son × narx» qatori bilan bir xil rangda, biroz kichikroq.
      g.font = font(400, 11)
      g.fillText(
        t('было {price} · {change}', { price: Number(row.item[priceField]).toLocaleString('uz'), change: signed(Math.round(row.change * row.item.quantity)) }),
        right,
        top + LINE_H * 2 + 1,
      )
    }

    y += rowHeight(row)
    divider(y)
  })

  // Jami
  g.textAlign = 'left'
  g.fillStyle = COLORS.muted
  g.font = font(400, 13)
  g.fillText(t('Товаров: {length} · Всего: {count} шт.', { length: rows.length, count }), PAD, y + 16)

  if (changeTotal !== 0) {
    g.fillText(t('Изменение цены'), PAD, y + 40)
    g.textAlign = 'right'
    g.fillText(`${signed(changeTotal)} So'm`, WIDTH - PAD, y + 40)
    g.textAlign = 'left'
  }

  g.fillStyle = COLORS.fg
  g.font = font(700, 16)
  g.fillText(t('ИТОГО'), PAD, y + 46 + CHANGE_H)

  g.textAlign = 'right'
  g.fillStyle = COLORS.accent
  g.font = font(800, 22)
  g.fillText(money(total), WIDTH - PAD, y + 42 + CHANGE_H)

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
