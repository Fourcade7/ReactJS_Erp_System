import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useRequest } from '../lib/useRequest'
import { Alert, Badge, Button, Form, Modal, Spinner } from '../ui'
import { t } from '../i18n'
import { getProfile, updateProfile } from './ProfileApi'

const MIN_PASSWORD = 8

const initialsOf = (profile) =>
  `${(profile.username ?? '').charAt(0)}${(profile.surname ?? '').charAt(0)}`.toUpperCase() || 'U'

/** Yuklangan profil ustida tahrirlash formasi (holat profil kelgach bir marta o'rnatiladi). */
function ProfileForm({ profile, onHide, onSaved }) {
  const [username, setUsername] = useState(profile.username ?? '')
  const [surname, setSurname] = useState(profile.surname ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [email, setEmail] = useState(profile.email ?? '')
  const [changePassword, setChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [invalid, setInvalid] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const save = async () => {
    const found = {}
    if (!username.trim()) found.username = t('Укажите имя')
    if (!surname.trim()) found.surname = t('Укажите фамилию')
    if (!email.trim()) found.email = t('Укажите адрес электронной почты')
    if (changePassword) {
      if (!currentPassword) found.currentPassword = t('Введите текущий пароль')
      if (newPassword.length < MIN_PASSWORD) {
        found.newPassword = t('Новый пароль должен быть не короче {count} символов', { count: MIN_PASSWORD })
      }
      if (newPassword !== repeatPassword) found.repeatPassword = t('Пароли не совпадают')
    }
    setInvalid(found)
    if (Object.keys(found).length > 0) return

    setBusy(true)
    setError('')
    setDone(false)
    try {
      const saved = await updateProfile(profile.id, {
        username: username.trim(),
        surname: surname.trim(),
        phone: phone.trim(),
        email: email.trim(),
        ...(changePassword ? { currentPassword, newPassword } : {}),
      })
      onSaved(saved)
      setDone(true)
      setChangePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setRepeatPassword('')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const field = (key) => invalid[key] && <Form.Text className="text-danger">{invalid[key]}</Form.Text>

  return (
    <>
      <Modal.Body className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-primary-fg">
            {initialsOf({ username, surname })}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-fg">
              {`${username} ${surname}`.trim() || '—'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge bg={profile.role?.toLowerCase() === 'admin' ? 'primary' : 'neutral'}>{profile.role}</Badge>
              <span className="truncate text-[12px] text-subtle">ID {profile.id}</span>
            </div>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {done && <Alert variant="success">{t('Профиль обновлён')}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Group controlId="profileName">
            <Form.Label>{t('Имя')}</Form.Label>
            <Form.Control
              value={username}
              isInvalid={Boolean(invalid.username)}
              maxLength={100}
              onChange={(e) => setUsername(e.target.value)}
            />
            {field('username')}
          </Form.Group>
          <Form.Group controlId="profileSurname">
            <Form.Label>{t('Фамилия')}</Form.Label>
            <Form.Control
              value={surname}
              isInvalid={Boolean(invalid.surname)}
              maxLength={100}
              onChange={(e) => setSurname(e.target.value)}
            />
            {field('surname')}
          </Form.Group>
          <Form.Group controlId="profilePhone">
            <Form.Label>{t('Телефон')}</Form.Label>
            <Form.Control
              type="tel"
              value={phone}
              maxLength={30}
              placeholder="+998 90 123 45 67"
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="profileEmail">
            <Form.Label>{t('Электронная почта')}</Form.Label>
            <Form.Control
              type="email"
              value={email}
              isInvalid={Boolean(invalid.email)}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
            />
            {field('email') ?? <Form.Text>{t('Используется для входа в систему')}</Form.Text>}
          </Form.Group>
        </div>

        {changePassword ? (
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface-2 p-3">
            <p className="text-[13px] font-medium text-fg">{t('Смена пароля')}</p>
            <Form.Group controlId="profileCurrentPassword">
              <Form.Label>{t('Текущий пароль')}</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                isInvalid={Boolean(invalid.currentPassword)}
                autoComplete="current-password"
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              {field('currentPassword')}
            </Form.Group>
            <div className="grid gap-3 sm:grid-cols-2">
              <Form.Group controlId="profileNewPassword">
                <Form.Label>{t('Новый пароль')}</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  isInvalid={Boolean(invalid.newPassword)}
                  autoComplete="new-password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {field('newPassword')}
              </Form.Group>
              <Form.Group controlId="profileRepeatPassword">
                <Form.Label>{t('Повторите пароль')}</Form.Label>
                <Form.Control
                  type="password"
                  value={repeatPassword}
                  isInvalid={Boolean(invalid.repeatPassword)}
                  autoComplete="new-password"
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
                {field('repeatPassword')}
              </Form.Group>
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setChangePassword(false)
                  setInvalid({})
                }}
              >
                {t('Не менять пароль')}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button variant="outline-secondary" size="sm" onClick={() => setChangePassword(true)}>
              <KeyRound />
              {t('Сменить пароль')}
            </Button>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {t('Закрыть')}
        </Button>
        <Button onClick={save} disabled={busy}>
          {busy && <Spinner size="sm" />}
          {t('Сохранить')}
        </Button>
      </Modal.Footer>
    </>
  )
}

/** "Профиль" (yuqori paneldagi foydalanuvchi menyusidan): o'z ma'lumotlari va parolni o'zgartirish. */
function ProfileDialog({ onHide, onSaved }) {
  const userId = Number(localStorage.getItem('userid')) || 0
  const { data: profile, error } = useRequest(() => getProfile(userId), `profile-${userId}`)

  return (
    <Modal show onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>{t('Профиль')}</Modal.Title>
      </Modal.Header>

      {profile ? (
        <ProfileForm profile={profile} onHide={onHide} onSaved={onSaved} />
      ) : (
        <Modal.Body>
          {error ? (
            <Alert variant="danger">{error.message}</Alert>
          ) : (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}
        </Modal.Body>
      )}
    </Modal>
  )
}

export default ProfileDialog
export { ProfileDialog }
