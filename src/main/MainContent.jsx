import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavbarScreen } from '../navbar/NavbarContent'
import { Container } from '../ui'
import LeftTab from './SidebarTabContent'

/**
 * Ilovaning asosiy qobigʻi: yuqori panel + chap menyu + mazmun.
 * Butun maket markazda, cheklangan kenglikdagi konteyner ichida joylashadi.
 */
function MainScreen() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('userid')) navigate('/login')
  }, [navigate])

  return (
    <div className="min-h-svh">
      <NavbarScreen onMenuClick={() => setMenuOpen(true)} />
      <Container className="flex">
        <LeftTab mobileOpen={menuOpen} onCloseMobile={() => setMenuOpen(false)} />
      </Container>
    </div>
  )
}

export default MainScreen
