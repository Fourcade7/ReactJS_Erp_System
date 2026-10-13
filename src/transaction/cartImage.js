import { priceChange, unitPrice } from './pricing'
import { locale, t, td } from '../i18n'

/**
 * Savatni yoki savdo tafsilotini PNG rasm qilib chizadi va clipboard ga yozadi — mijozga
 * messenjer orqali yuborish uchun (Ctrl+V bilan qoʻyiladi).
 * Rasm doim oq fonda: qaysi mavzuda koʻchirilganidan qatʼi nazar bir xil koʻrinadi.
 *
 * Rasm "spec" dan chiziladi:
 *  - `title`, `subtitle` — sarlavha va uning ostidagi satr;
 *  - `rows` — tovarlar: `{ name, quantity, unit?, price, sum, wholesale, change, was }`;
 *  - `extras` — jami ustidagi qoʻshimcha qatorlar: `[{ label, value }]` (chegirma, qarz ...);
 *  - `total` — «ИТОГО» summasi.
 * Savat va savdo tafsiloti faqat spec yasashda farq qiladi.
 */

const WIDTH = 560
const PAD = 24
const SCALE = 2 // retina ekranlarda ham tiniq boʻlishi uchun

const INDEX_W = 28
const AMOUNT_W = 170
const NAME_W = WIDTH - PAD * 2 - INDEX_W - AMOUNT_W - 12
const LINE_H = 19
const EXTRA_H = 24

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

function renderImage(spec) {
  const family = fontFamily()
  const font = (weight, size) => `${weight} ${size}px ${family}`

  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = font(500, 14)

  const rows = spec.rows.map((row) => ({ ...row, lines: wrapText(ctx, row.name, NAME_W) }))
  const extras = spec.extras ?? []
  const count = Math.round(rows.reduce((sum, row) => sum + row.quantity, 0) * 1000) / 1000

  const HEADER_H = 74
  const EXTRAS_H = extras.length * EXTRA_H
  const FOOTER_H = 90 + EXTRAS_H
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
  g.fillText(spec.title, PAD, PAD)
  g.fillStyle = COLORS.muted
  g.font = font(400, 13)
  g.fillText(spec.subtitle, PAD, PAD + 28)

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
    const unit = row.unit ? ` ${row.unit}` : ''
    const wholesale = row.wholesale ? t(' (опт)') : ''
    g.fillText(
      `${row.quantity}${unit} × ${Number(row.price).toLocaleString('uz')}${wholesale}`,
      right,
      top + LINE_H + 1,
    )
    if (row.change !== 0) {
      // Yuqoridagi «son × narx» qatori bilan bir xil rangda, biroz kichikroq.
      g.font = font(400, 11)
      g.fillText(
        t('было {price} · {change}', {
          price: Number(row.was).toLocaleString('uz'),
          change: signed(Math.round(row.change * row.quantity)),
        }),
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

  extras.forEach((extra, index) => {
    const top = y + 40 + index * EXTRA_H
    g.textAlign = 'left'
    g.fillText(extra.label, PAD, top)
    g.textAlign = 'right'
    g.fillText(extra.value, WIDTH - PAD, top)
  })
  g.textAlign = 'left'

  g.fillStyle = COLORS.fg
  g.font = font(700, 16)
  g.fillText(t('ИТОГО'), PAD, y + 46 + EXTRAS_H)

  g.textAlign = 'right'
  g.fillStyle = COLORS.accent
  g.font = font(800, 22)
  g.fillText(money(spec.total), WIDTH - PAD, y + 42 + EXTRAS_H)

  return canvas
}

/** Savat: narx oʻzgartirilgan boʻlsa «было … · farq» qatori va «Изменение цены» chiqadi. */
function cartSpec(orderList, priceField) {
  const rows = orderList.map((item) => {
    const price = Number(unitPrice(item, priceField) || 0)
    return {
      name: item.name,
      quantity: item.quantity,
      price,
      sum: Math.round(price * item.quantity),
      wholesale: Boolean(item.checkPrice),
      // Savatda qoʻlda oʻzgartirilgan narxning odatiy narxdan farqi (1 dona uchun).
      change: priceChange(item, priceField),
      was: Number(item[priceField]),
    }
  })
  const changeTotal = Math.round(rows.reduce((sum, row) => sum + row.change * row.quantity, 0))

  return {
    title: t('Список товаров'),
    subtitle: new Date().toLocaleString(locale),
    rows,
    extras: changeTotal !== 0 ? [{ label: t('Изменение цены'), value: `${signed(changeTotal)} So'm` }] : [],
    total: rows.reduce((sum, row) => sum + row.sum, 0),
  }
}

/**
 * Savdo (kirim, qaytarish) tafsiloti. Raqamlar ekrandagi "Оплата" kartasi bilan bir xil:
 * jami = summa − chegirma − qaytarilgan; qarz qolgan bo'lsa «Оплачено» va «Остаток долга» ham chiqadi.
 */
function saleSpec(sale, label) {
  const rows = sale.items.map((item) => {
    const price = Number(item.price || 0)
    return {
      name: item.product?.name ?? t('Товар удалён'),
      quantity: item.quantity,
      unit: item.product?.unit ? td(item.product.unit) : '',
      price,
      sum: Math.round(price * item.quantity),
      wholesale: Boolean(item.checkPrice),
      change: 0,
      was: price,
    }
  })

  const discount = sale.discount ?? 0
  const returned = sale.returnedTotal ?? 0
  const paid = sale.payments.reduce((sum, item) => sum + item.amount, 0)
  const remaining = sale.total - (paid + discount)

  const extras = []
  if (discount > 0) extras.push({ label: t('Скидка'), value: `−${money(discount)}` })
  if (returned > 0) extras.push({ label: t('Возвращено'), value: `−${money(returned)}` })
  if (remaining > 0) {
    extras.push({ label: t('Оплачено'), value: money(paid) })
    extras.push({ label: t('Остаток долга'), value: money(remaining) })
  }

  return {
    title: t('Список товаров'),
    subtitle: `${label} #${sale.id} · ${new Date(sale.date).toLocaleString(locale)}`,
    rows,
    extras,
    total: sale.total - discount - returned,
  }
}

/**
 * Brauzer rasmni clipboard ga yozishga ruxsat bermaydi: Async Clipboard API faqat xavfsiz saytda
 * (https:// yoki http://localhost) bor. Oddiy `http://IP` da u umuman yo'q va rasmni boshqa yo'l bilan
 * (bitmap sifatida) clipboard ga qo'yib bo'lmaydi. Yuklab olmaymiz: tayyor rasm (`image`, data URL)
 * xatoga biriktiriladi — chaqiruvchi uni oynada ko'rsatadi, foydalanuvchi o'ng tugma → «Копировать
 * изображение» bilan nusxalaydi (`CopyImageModal`).
 */
class ClipboardUnavailableError extends Error {
  constructor(image) {
    super('Clipboard API unavailable (insecure context)')
    this.name = 'ClipboardUnavailableError'
    this.image = image
  }
}

async function deliver(canvas) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new ClipboardUnavailableError(canvas.toDataURL('image/png'))
  }
  // Blob ni Promise sifatida berish — `toBlob` kutilayotganda ham bosish
  // (user activation) yoʻqolmasligi uchun.
  const blob = new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  )
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

/** Savatni rasm qilib clipboard ga yozadi. Imkon bo'lmasa `ClipboardUnavailableError` otadi. */
async function copyCartImage(orderList, priceField) {
  return deliver(renderImage(cartSpec(orderList, priceField)))
}

/** Savdo (kirim, qaytarish) tafsilotini rasm qilib clipboard ga yozadi. */
async function copySaleImage(sale, label) {
  return deliver(renderImage(saleSpec(sale, label)))
}

export { ClipboardUnavailableError, copyCartImage, copySaleImage }
