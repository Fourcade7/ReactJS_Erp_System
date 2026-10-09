import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react'
import { NavbarScreenFourAuth } from '../navbar/NavbarContent'
import { Button, Collapse, Form } from '../ui'
import { AlertDismissibleDanger, ProgressDismissible } from '../utils/UtilsContent'
import { loginUser } from './AuthApi'
import { t } from '../i18n'

function LoginForm({ clickLogin, busy }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  const submit = (e) => clickLogin(e, login, password)

  return (
    <Form onSubmit={submit} className="flex flex-col gap-4">
      <Form.Group controlId="loginEmail">
        <Form.Label>{t('Логин')}</Form.Label>
        <Form.Control
          type="email"
          autoComplete="username"
          placeholder={t('Введите адрес электронной почты')}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <Form.Text>{t('Мы никогда не будем делиться вашим адресом ни с кем другим.')}</Form.Text>
      </Form.Group>

      <Form.Group controlId="loginPassword">
        <Form.Label>{t('Пароль')}</Form.Label>
        <div className="relative">
          <Form.Control
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('Введите пароль')}
            className="pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t('Скрыть пароль') : t('Показать пароль')}
            className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-fg"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Form.Group>

      <div className="flex items-center justify-between">
        <Form.Check type="checkbox" label={t('Запомните меня')} id="rememberMe" />
        <a href="#recover" className="text-xs text-primary transition hover:underline">
          {t('Забыли пароль?')}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button as={Link} to="/register" variant="outline-secondary">
          {t('Регистрация')}
        </Button>
        <Button type="submit" loading={busy} onClick={submit}>
          {!busy && <LogIn />}
          {t('Вход')}
        </Button>
      </div>
    </Form>
  )
}

function LoginScreen() {
  const navigate = useNavigate()

  const [show, setShow] = useState(false)
  const [pshow, psetShow] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleLogin = async (e, login, password) => {
    e.preventDefault()

    try {
      psetShow(true)
      setShow(false)

      const res = await loginUser(login, password)
      const result = await res.json()

      if (!res.ok) {
        psetShow(false)
        setAlertMessage(result.message)
        setTimeout(() => setShow(true), 50)
        return
      }

      navigate('/home')
      localStorage.setItem('username', result.user.username)
      localStorage.setItem('surname', result.user.surname)
      localStorage.setItem('userid', result.user.id)
      localStorage.setItem('role', result.user.role)
    } catch {
      psetShow(false)
      setShow(true)
      setAlertMessage(t('Не удалось подключиться к серверу'))
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <NavbarScreenFourAuth />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium text-muted shadow-soft">
              <ShieldCheck className="size-3.5 text-primary" />
              {t('Защищённый вход')}
            </span>
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-fg">
              {t('Добро пожаловать в систему')}
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {t('Войдите, чтобы продолжить работу в')}{' '}
              <span className="font-semibold text-primary">ERP</span>
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-raised">
            {show && <AlertDismissibleDanger alertMsg={alertMessage} />}

            <Collapse in={pshow}>
              <div>
                <ProgressDismissible />
              </div>
            </Collapse>

            <LoginForm clickLogin={handleLogin} busy={pshow} />
          </div>

          <p className="mt-5 text-center text-[11px] text-subtle">
            {t('Продолжая, вы соглашаетесь с условиями использования системы.')}
          </p>
        </div>
      </main>
    </div>
  )
}

export default LoginScreen
