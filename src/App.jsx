import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import LoginScreen from './auth/LoginContent'
import { RegisterScreen } from './auth/RegisterContent'
import MainScreen from './main/MainContent'
import { WelcomeScreen } from './welcome/WelcomeContent'
import DashboardScreen from './dashboard/DashboardScreen'
import SettingsScreen from './settings/SettingsScreen'
import { useAppearanceSync } from './theme/appearance'

function App() {
  // Administrator tanlagan tizim rangi hamma ekranda (kirish sahifasida ham) o'z vaqtida yangilanadi.
  useAppearanceSync()

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/home" element={<MainScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
