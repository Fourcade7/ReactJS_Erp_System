import { ChevronDown, MousePointerClick } from 'lucide-react'
import { Modal } from '../ui'
import { t } from '../i18n'

const FLAGS_PATH = '#unsafely-treat-insecure-origin-as-secure'

/** Bosilganda matn belgilanadi — Ctrl+C bilan olinadi (saytda HTTPS bo'lmasa ham ishlaydi). */
function Selectable({ value }) {
  return (
    <input
      readOnly
      value={value}
      onFocus={(event) => event.target.select()}
      onClick={(event) => event.target.select()}
      className="h-8 w-full rounded-md border border-line bg-surface-2 px-2 font-mono text-[12px] text-fg"
    />
  )
}

/**
 * Brauzer saytga rasmni clipboard ga bir bosishda yozishga faqat xavfsiz manzilda (https:// yoki localhost)
 * ruxsat beradi. Oddiy `http://IP` da bu mumkin emas, shuning uchun tayyor rasm shu oynada ko'rsatiladi:
 * ustiga sichqonchaning o'ng tugmasi → «Копировать изображение» (brauzerning o'z amali, yuklab olinmaydi).
 */
function CopyImageModal({ image, onHide }) {
  const flags = `${/Edg\//.test(navigator.userAgent) ? 'edge' : 'chrome'}://flags/${FLAGS_PATH}`

  return (
    <Modal show={Boolean(image)} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('Скопируйте изображение')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-3">
        <p className="flex items-start gap-2 text-[13px] text-fg">
          <MousePointerClick className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            {t('Нажмите на картинку правой кнопкой мыши и выберите «Копировать изображение», затем вставьте её (Ctrl+V) в мессенджер.')}
          </span>
        </p>

        <div className="max-h-[52vh] overflow-auto rounded-lg border border-line bg-white p-2">
          {/* Rasm fon ranglariga bog'liq emas: doim oq fonda, mijozga shunday boradi. */}
          {image && <img src={image} alt={t('Список товаров')} className="mx-auto block w-full max-w-[560px]" />}
        </div>

        <details className="group rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] text-muted">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-fg">
            {t('Как копировать одной кнопкой')}
            <ChevronDown className="size-4 shrink-0 text-subtle transition group-open:rotate-180" />
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <p>
              {t('Кнопка «Копировать» работает в один клик, когда сайт открыт по https:// или http://localhost. Для адреса этого сайта это можно разрешить в браузере (Chrome, Edge):')}
            </p>
            <ol className="m-0 flex list-decimal flex-col gap-2 pl-5">
              <li>
                {t('Вставьте в адресную строку:')}
                <div className="mt-1">
                  <Selectable value={flags} />
                </div>
              </li>
              <li>
                {t('В поле впишите адрес этого сайта:')}
                <div className="mt-1">
                  <Selectable value={window.location.origin} />
                </div>
              </li>
              <li>{t('Выберите «Enabled» и нажмите «Relaunch» — браузер перезапустится.')}</li>
            </ol>
          </div>
        </details>
      </Modal.Body>
    </Modal>
  )
}

export default CopyImageModal
