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
  strongLine: '#d1d5db',
  accent: '#4f46e5',
  danger: '#dc2626',
}

const money = (value) => `${Number(value || 0).toLocaleString('uz')} So'm`
const signed = (value) => `${value < 0 ? '−' : '+'}${Math.abs(value).toLocaleString('uz')}`

function fontFamily() {
  return getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
}

/** `font(600, 14)` → canvas uchun shrift satri (sahifa shrifti bilan). */
function makeFont() {
  const family = fontFamily()
  return (weight, size) => `${weight} ${size}px ${family}`
}

/** Bir qatorga sig'masa — oxiri «…» bilan qirqiladi. */
function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let out = text
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1)
  return `${out}…`
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

// Oʻng ustun: summa, «son × narx» va (oʻzgargan boʻlsa) «было … · farq».
const rowHeight = (row) => Math.max(row.lines.length, row.change !== 0 ? 3 : 2) * LINE_H + 20

/** Bitta tovar qatori (`row.lines` — oʻralgan nom): tartib raqami, nom, oʻngda summa va «son × narx». Pastki chiziq yangi `y`. */
function drawItemRow(g, font, row, index, y) {
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

  const next = y + rowHeight(row)
  g.fillStyle = COLORS.line
  g.fillRect(PAD, next, WIDTH - PAD * 2, 1)
  return next
}

function renderImage(spec) {
  const font = makeFont()

  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = font(500, 14)

  const rows = spec.rows.map((row) => ({ ...row, lines: wrapText(ctx, row.name, NAME_W) }))
  const extras = spec.extras ?? []
  const count = Math.round(rows.reduce((sum, row) => sum + row.quantity, 0) * 1000) / 1000

  const HEADER_H = 74
  const EXTRAS_H = extras.length * EXTRA_H
  const FOOTER_H = 90 + EXTRAS_H
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
    y = drawItemRow(g, font, row, index, y)
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

/**
 * Bir nechta savdo bitta rasmda (mijozning qarzlari): har savdo — alohida bo'lim (sarlavha va o'ngda shu savdo qarzi,
 * tovarlar, ostida summa/to'langan izohi), oxirida umumiy jami. Spec: `{ title, subtitle, sections: [{ heading, rows,
 * note, debt }], countLabel, totalLabel, total }`.
 */
function renderDebtsImage(spec) {
  const font = makeFont()
  const ctx = document.createElement('canvas').getContext('2d')
  const FULL_W = WIDTH - PAD * 2
  const SECTION_HEAD_H = 36
  const NOTE_LINE_H = 17

  const sections = spec.sections.map((section) => {
    ctx.font = font(500, 14)
    const rows = section.rows.map((row) => ({ ...row, lines: wrapText(ctx, row.name, NAME_W) }))
    ctx.font = font(400, 12)
    return { ...section, rows, noteLines: section.note ? wrapText(ctx, section.note, FULL_W) : [] }
  })
  ctx.font = font(400, 13)
  const subtitle = fitText(ctx, spec.subtitle, FULL_W)

  const HEADER_H = 74
  const FOOTER_H = 90
  const sectionHeight = (section) =>
    SECTION_HEAD_H +
    section.rows.reduce((sum, row) => sum + rowHeight(row), 0) +
    section.noteLines.length * NOTE_LINE_H +
    14
  const height = HEADER_H + sections.reduce((sum, section) => sum + sectionHeight(section), 0) + FOOTER_H

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
  g.fillText(subtitle, PAD, PAD + 28)

  let y = HEADER_H
  g.fillStyle = COLORS.strongLine
  g.fillRect(PAD, y, FULL_W, 2)

  sections.forEach((section) => {
    // Bo'lim sarlavhasi: chapda savdo raqami va sanasi, o'ngda shu savdo qarzi.
    g.textAlign = 'right'
    g.fillStyle = COLORS.danger
    g.font = font(700, 14)
    const debtText = `${t('Долг')}: ${money(section.debt)}`
    g.fillText(debtText, WIDTH - PAD, y + 12)
    const debtWidth = g.measureText(debtText).width

    g.textAlign = 'left'
    g.fillStyle = COLORS.fg
    g.font = font(700, 14)
    g.fillText(fitText(g, section.heading, FULL_W - debtWidth - 16), PAD, y + 12)

    y += SECTION_HEAD_H
    section.rows.forEach((row, index) => {
      y = drawItemRow(g, font, row, index, y)
    })

    g.textAlign = 'left'
    g.fillStyle = COLORS.muted
    g.font = font(400, 12)
    section.noteLines.forEach((line, i) => g.fillText(line, PAD, y + 8 + i * NOTE_LINE_H))
    y += section.noteLines.length * NOTE_LINE_H + 14

    g.fillStyle = COLORS.strongLine
    g.fillRect(PAD, y, FULL_W, 2)
  })

  // Jami
  g.textAlign = 'left'
  g.fillStyle = COLORS.muted
  g.font = font(400, 13)
  g.fillText(spec.countLabel, PAD, y + 16)

  g.fillStyle = COLORS.fg
  g.font = font(700, 16)
  g.fillText(spec.totalLabel, PAD, y + 46)

  g.textAlign = 'right'
  g.fillStyle = COLORS.danger
  g.font = font(800, 22)
  g.fillText(money(spec.total), WIDTH - PAD, y + 42)

  return canvas
}

/** Usta xizmatidan kompaniya ulushi (savdo summasiga kiradi) — jami ustidagi qator. */
function serviceExtra(services) {
  const amount = (services ?? []).reduce((sum, fee) => sum + (fee.companyAmount ?? 0), 0)
  return { amount, extras: amount > 0 ? [{ label: t('Услуга мастера'), value: `+${money(amount)}` }] : [] }
}

/**
 * Savat: narx oʻzgartirilgan boʻlsa «было … · farq» qatori va «Изменение цены» chiqadi.
 * `services` — usta xizmatlari: kompaniya ulushi jamiga qo'shiladi (ustaning ulushi rasmga chiqmaydi).
 */
function cartSpec(orderList, priceField, services) {
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
  const service = serviceExtra(services)

  return {
    title: t('Список товаров'),
    subtitle: new Date().toLocaleString(locale),
    rows,
    extras: [
      ...(changeTotal !== 0 ? [{ label: t('Изменение цены'), value: `${signed(changeTotal)} So'm` }] : []),
      ...service.extras,
    ],
    total: rows.reduce((sum, row) => sum + row.sum, 0) + service.amount,
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

  // `sale.total` ichida usta xizmatidan kompaniya ulushi ham bor — qatorlar yig'indisiga mos kelishi uchun alohida chiqadi.
  const extras = [...serviceExtra(sale.masterFees).extras]
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

/** `/customer/operations` dagi operatsiya qatorlari — rasm qatorlari shaklida. */
const operationRows = (op) =>
  op.items.map((item) => ({
    name: item.name ?? t('Товар удалён'),
    quantity: item.quantity,
    unit: item.unit ? td(item.unit) : '',
    price: item.price,
    sum: item.amount,
    wholesale: false,
    change: 0,
    was: item.price,
  }))

/**
 * Kontragent kartochkasidagi operatsiya (`/customer/operations` javobidagi shaklda: savdo, qaytarish, kirim).
 * Savdoda qarz qolgan bo'lsa «Оплачено» va «Остаток долга» chiqadi; `customerDebt` (mijozning umumiy qarzi)
 * shu savdo qarzidan katta bo'lsa — «Общий долг клиента» ham.
 */
function operationSpec(op, label, customerDebt = 0) {
  const rows = operationRows(op)

  const extras = [...serviceExtra(op.masterFees).extras]
  if (op.discount > 0) extras.push({ label: t('Скидка'), value: `−${money(op.discount)}` })
  if (op.debt > 0) {
    extras.push({ label: t('Оплачено'), value: money(op.paid) })
    extras.push({ label: t('Остаток долга'), value: money(op.debt) })
  }
  if (op.type === 'sale' && customerDebt > op.debt) {
    extras.push({ label: t('Общий долг клиента'), value: money(customerDebt) })
  }

  return {
    title: t('Список товаров'),
    subtitle: `${label} #${op.id} · ${new Date(op.date).toLocaleString(locale)}`,
    rows,
    extras,
    total: op.net,
  }
}

/**
 * Mijozning qarzli savdolari (`/customer/operations?debt=true` qatorlari) — bitta rasm uchun: eskisi tepada,
 * har birida tovarlar (usta xizmatidan kompaniya ulushi ham qator bo'lib) va shu savdo qarzi, oxirida umumiy qarz.
 */
function debtsSpec(sales, customerName) {
  const sections = [...sales]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((op) => {
      const service = serviceExtra(op.masterFees).amount
      const rows = operationRows(op)
      if (service > 0) {
        rows.push({ name: t('Услуга мастера'), quantity: 1, unit: '', price: service, sum: service, change: 0, was: service })
      }
      const note = [
        `${t('Сумма')}: ${money(op.total)}`,
        ...(op.discount > 0 ? [`${t('Скидка')}: −${money(op.discount)}`] : []),
        `${t('Оплачено')}: ${money(op.paid)}`,
      ].join(' · ')
      return {
        heading: `${t('Продажа')} #${op.id} · ${new Date(op.date).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}`,
        rows,
        note,
        debt: op.debt,
      }
    })

  return {
    title: t('Долги клиента'),
    subtitle: [customerName, new Date().toLocaleString(locale)].filter(Boolean).join(' · '),
    sections,
    countLabel: t('Продаж в долг: {count}', { count: sections.length }),
    totalLabel: t('ОБЩИЙ ДОЛГ'),
    total: sections.reduce((sum, section) => sum + section.debt, 0),
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

/** `source` — tayyor canvas yoki uni beradigan Promise (avval ma'lumot yuklanadigan rasm uchun). */
async function deliver(source) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new ClipboardUnavailableError((await source).toDataURL('image/png'))
  }
  // Blob ni Promise sifatida berish — ma'lumot yuklanib, `toBlob` kutilayotganda ham bosish
  // (user activation) yoʻqolmasligi uchun: clipboard ga yozish bosilgan zahoti boshlanadi.
  const blob = Promise.resolve(source).then(
    (canvas) =>
      new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
      ),
  )
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

/** Savatni rasm qilib clipboard ga yozadi. Imkon bo'lmasa `ClipboardUnavailableError` otadi. */
async function copyCartImage(orderList, priceField, services = []) {
  return deliver(renderImage(cartSpec(orderList, priceField, services)))
}

/** Savdo (kirim, qaytarish) tafsilotini rasm qilib clipboard ga yozadi. */
async function copySaleImage(sale, label) {
  return deliver(renderImage(saleSpec(sale, label)))
}

/** Kontragent kartochkasidagi operatsiyani (tovarlar va qarz) rasm qilib clipboard ga yozadi. */
async function copyOperationImage(op, label, customerDebt) {
  return deliver(renderImage(operationSpec(op, label, customerDebt)))
}

/**
 * Mijozning barcha qarzli savdolarini bitta rasm qilib clipboard ga yozadi. `loadSales()` — savdolarni yuklovchi
 * Promise: rasm ma'lumot kelgach chiziladi, lekin clipboard ga yozish bosilgan zahoti boshlanadi.
 */
async function copyDebtsImage(loadSales, customerName) {
  return deliver(
    Promise.resolve()
      .then(loadSales)
      .then((sales) => renderDebtsImage(debtsSpec(sales, customerName))),
  )
}

export { ClipboardUnavailableError, copyCartImage, copyDebtsImage, copyOperationImage, copySaleImage }
