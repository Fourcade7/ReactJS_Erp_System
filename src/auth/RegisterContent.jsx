import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Save, UserPlus } from 'lucide-react'
import { NavbarScreenFourAuth } from '../navbar/NavbarContent'
import { Button, Collapse, Form } from '../ui'
import {
  AlertDismissibleDanger,
  AlertDismissibleSuccess,
  ProgressDismissible,
} from '../utils/UtilsContent'
import { registerUser } from './AuthApi'
import { DEFAULT_ROLE, ROLES } from '../users/roles'

/** Koʻrinadigan/yashirin holatni almashtiruvchi parol maydoni. */
function PasswordField({ id, label, placeholder, value, onChange }) {
  const [visible, setVisible] = useState(false)

  return (
    <Form.Group controlId={id}>
      {label && <Form.Label>{label}</Form.Label>}
      <div className="relative">
        <Form.Control
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={placeholder}
          className="pr-10"
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-fg"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Form.Group>
  )
}

/**
 * Roʻyxatdan oʻtish shakli. `variant="tab"` boʻlganda "Сотрудники" boʻlimidagi
 * "Saqlash" tugmasi bilan, aks holda "Вход"/"Регистрация" juftligi bilan chiqadi.
 */
function RegisterFields({ handleRegister, variant = 'page', busy }) {
  const [username, setUsername] = useState('')
  const [surname, setSurname] = useState('')
  const [phone, setPhone] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [role, setRole] = useState(DEFAULT_ROLE)

  const mismatch = password2.length > 0 && password !== password2

  // Rol faqat xodim qo'shish tabida tanlanadi; ochiq ro'yxatdan o'tishda — doim User.
  const submit = (e) =>
    handleRegister(e, username, surname, phone, login, password, variant === 'tab' ? role : DEFAULT_ROLE)

  return (
    <Form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Form.Group controlId="registerName">
          <Form.Label>Имя</Form.Label>
          <Form.Control
            type="text"
            autoComplete="given-name"
            placeholder="Введите имя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="registerSurname">
          <Form.Label>Фамилия</Form.Label>
          <Form.Control
            type="text"
            autoComplete="family-name"
            placeholder="Введите фамилию"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </Form.Group>
      </div>

      <Form.Group controlId="registerPhone">
        <Form.Label>Телефон</Form.Label>
        <Form.Control
          type="tel"
          autoComplete="tel"
          placeholder="Введите номер телефона"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="registerEmail">
        <Form.Label>Электронная почта</Form.Label>
        <Form.Control
          type="email"
          autoComplete="email"
          placeholder="Введите адрес электронной почты"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
      </Form.Group>

      {variant === 'tab' && (
        <Form.Group controlId="registerRole">
          <Form.Label>Роль</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <PasswordField
        id="registerPassword"
        label="Пароль"
        placeholder="Введите пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div>
        <PasswordField
          id="registerPassword2"
          label="Повторите пароль"
          placeholder="Повторите пароль"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        {mismatch && (
          <p className="mt-1.5 text-[11px] text-danger-soft-fg">Пароли не совпадают.</p>
        )}
      </div>

      {variant === 'tab' ? (
        <Button type="submit" loading={busy} block className="mt-1">
          {!busy && <Save />}
          Сохранить
        </Button>
      ) : (
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Button as={Link} to="/login" variant="outline-secondary">
            Вход
          </Button>
          <Button type="submit" loading={busy}>
            {!busy && <UserPlus />}
            Регистрация
          </Button>
        </div>
      )}
    </Form>
  )
}

/** Shakl holati va soʻrovni boshqaruvchi umumiy mantiq. */
function useRegisterHandler(onSuccess) {
  const [pshow, psetShow] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleRegister = async (e, username, surname, phone, email, password, role) => {
    e.preventDefault()

    try {
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false)

      const res = await registerUser(username, surname, phone, email, password, role)
      const result = await res.json()

      if (!res.ok) {
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
        return
      }

      setShowSuccess(true)
      psetShow(false)
      setAlertMessage('Успешно...')

      if (onSuccess) {
        const timer = setTimeout(onSuccess, 2000)
        return () => clearTimeout(timer)
      }
    } catch {
      setShowDanger(true)
      setAlertMessage('Не удалось подключиться к серверу')
      psetShow(false)
    }
  }

  return { pshow, showDanger, showSuccess, alertMessage, handleRegister }
}

function RegisterFeedback({ showDanger, showSuccess, alertMessage, pshow }) {
  return (
    <>
      {showDanger && <AlertDismissibleDanger alertMsg={alertMessage} />}
      {showSuccess && <AlertDismissibleSuccess alertMsg={alertMessage} />}
      <Collapse in={pshow}>
        <div>
          <ProgressDismissible />
        </div>
      </Collapse>
    </>
  )
}

/** "Сотрудники" boʻlimidagi "Yangi xodim qoʻshish" tabi uchun. */
function RegisterScreenforTab(props) {
  const state = useRegisterHandler(() => props.tabChange('home'))

  return (
    <div className="max-w-xl">
      <RegisterFeedback {...state} />
      <RegisterFields handleRegister={state.handleRegister} variant="tab" busy={state.pshow} />
    </div>
  )
}

/** Alohida sahifa sifatidagi roʻyxatdan oʻtish ekrani. */
function RegisterScreen() {
  const state = useRegisterHandler()

  return (
    <div className="flex min-h-svh flex-col">
      <NavbarScreenFourAuth />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-fg">
              Добро пожаловать в систему
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              Создайте учётную запись для работы в{' '}
              <span className="font-semibold text-primary">ERP</span>
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-raised">
            <RegisterFeedback {...state} />
            <RegisterFields handleRegister={state.handleRegister} busy={state.pshow} />
          </div>
        </div>
      </main>
    </div>
  )
}

export { RegisterScreen, RegisterScreenforTab }
