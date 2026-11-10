/** Mijoz balansi: to'ldirish, pulni qaytarish, qarzni balansdan yopish, kassada va qaytarishda balans. */
export default {
  // bazada ruscha saqlanadigan to'lov usullari — faqat ko'rsatishda tarjima qilinadi (td)
  'С баланса': 'Balansdan',
  'На баланс': 'Balansga',

  // balans tarixi
  'Пополнение': "To'ldirish",
  'Возврат на баланс': 'Qaytarish balansga',
  'Оплата с баланса': "Balansdan to'lov",
  'Выдано клиенту': 'Mijozga berildi',
  'Баланс': 'Balans',
  'Баланс клиента': 'Mijoz balansi',
  'Баланс: {amount} сум': "Balans: {amount} so'm",
  'Баланс: {amount}': 'Balans: {amount}',
  'Открыть баланс клиента': 'Mijoz balansini ochish',
  'Деньги клиента в магазине: можно погасить долг или оплатить покупку':
    "Mijozning do'kondagi puli: qarzni yopish yoki xaridni to'lash mumkin",
  'Движений по балансу нет': "Balans bo'yicha harakat yo'q",
  'Пополните баланс, если клиент оставил деньги, или оформите возврат «На баланс».':
    "Mijoz pul qoldirsa balansni to'ldiring yoki qaytarishni «Balansga» qilib rasmiylashtiring.",

  // to'ldirish / qaytarib berish
  'Пополнить': "To'ldirish",
  'Пополнить баланс': "Balansni to'ldirish",
  'Выдать': 'Berish',
  'Выдать деньги с баланса': 'Balansdan pul berish',
  'Клиент оставляет деньги без покупки. Сумма ляжет на баланс: потом ею можно погасить долг или оплатить покупку.':
    "Mijoz xaridsiz pul qoldiradi. Summa balansga tushadi: keyin u bilan qarzni yopish yoki xaridni to'lash mumkin.",
  'Деньги с баланса возвращаются клиенту на руки.': "Balansdagi pul mijozning qo'liga qaytariladi.",
  'Сейчас на балансе: {amount} сум': "Hozir balansda: {amount} so'm",
  'Как внесены деньги': 'Pul qanday kiritildi',
  'Как выданы деньги': 'Pul qanday berildi',
  'Необязательно': 'Ixtiyoriy',
  'На балансе только {amount} сум': "Balansda faqat {amount} so'm bor",
  "На балансе только {amount} So'm": "Balansda faqat {amount} so'm bor",
  'Баланс пополнен на {amount} сум': "Balans {amount} so'mga to'ldirildi",
  'Клиенту выдано {amount} сум с баланса': "Mijozga balansdan {amount} so'm berildi",

  // qarzni balansdan yopish
  'Погасить': 'Yopish',
  'Погасить долг с баланса': 'Qarzni balansdan yopish',
  'Не больше {amount} сум': "Ko'pi bilan {amount} so'm",
  'Долги гасятся начиная с самой старой продажи': 'Qarzlar eng eski savdodan boshlab yopiladi',
  'С баланса погашено {amount} сум ({count} прод.)': "Balansdan {amount} so'm yopildi ({count} ta savdo)",
  'Чем оплатить': "Nima bilan to'lash",
  'Деньги': 'Pul',
  'С баланса ({amount})': 'Balansdan ({amount})',
  'С баланса клиента': 'Mijoz balansidan',

  // kassa
  'Оплатить с баланса': "Balansdan to'lash",
  'Покупка полностью оплачивается с баланса клиента.': "Xarid to'liq mijoz balansidan to'lanadi.",
  'С баланса: {balance}. Остаток {rest} — выберите способ оплаты ниже.':
    "Balansdan: {balance}. Qolgan {rest} — quyida to'lov usulini tanlang.",
  'Чтобы зачислить на баланс, выберите контрагента': 'Balansga yozish uchun kontragentni tanlang',
  'Зачислить на баланс': 'Balansga yozish',

  // qaytarish
  'Деньги не выдаются — сумма ляжет на баланс клиента. Ею можно погасить долг или оплатить следующую покупку.':
    "Pul berilmaydi — summa mijoz balansiga tushadi. U bilan qarzni yopish yoki keyingi xaridni to'lash mumkin.",
  'На баланс клиента': 'Mijoz balansiga',
  'с долга списано {offset}': 'qarzdan {offset} ayirildi',
  'на баланс клиента зачислено {refund} (баланс: {balance})': 'mijoz balansiga {refund} yozildi (balans: {balance})',

  // qarzni summa yoki aniq tovarlar bo'yicha to'lash
  'Как оплатить долг': "Qarzni qanday to'lash",
  'Суммой': 'Summa bilan',
  'За товары': 'Tovarlar uchun',
  'Сумма спишется с общего долга продажи, без привязки к товарам.':
    "Summa savdoning umumiy qarzidan ayiriladi, tovarlarga bog'lanmaydi.",
  'Все товары уже оплачены или возвращены. Остаток долга можно погасить суммой.':
    "Barcha tovarlar to'langan yoki qaytarilgan. Qolgan qarzni summa bilan yopish mumkin.",
  'Укажите, за сколько клиент платит сейчас. Сумма считается по цене продажи.':
    "Mijoz hozir qanchasi uchun to'layotganini kiriting. Summa sotuv narxida hisoblanadi.",
  'Не оплачено: {quantity} {unit} × {price}': "To'lanmagan: {quantity} {unit} × {price}",
  'Не оплачено: {quantity} {unit}': "To'lanmagan: {quantity} {unit}",
  'оплачено {quantity}': "to'langan {quantity}",
  'Оплачено за этот товар: {quantity} {unit}': "Shu tovar uchun to'langan: {quantity} {unit}",
  'К оплате за товары': "Tovarlar uchun to'lov",
  '«{name}»: не оплачено только {quantity}': "«{name}»: faqat {quantity} to'lanmagan",
  'Укажите, за какие товары и сколько платит клиент': "Mijoz qaysi tovarlar uchun va qanchasiga to'layotganini kiriting",
  "Оплата за товары принята: {amount} So'm ({items})": "Tovarlar uchun to'lov qabul qilindi: {amount} so'm ({items})",
  "Долг погашен с баланса: {amount} So'm": "Qarz balansdan yopildi: {amount} so'm",
  "Оплата принята: {amount} So'm": "To'lov qabul qilindi: {amount} so'm",
  'за товары: {items}': 'tovarlar uchun: {items}',
  'оплачено {paid}, осталось {left}': "to'langan {paid}, qoldi {left}",
}
