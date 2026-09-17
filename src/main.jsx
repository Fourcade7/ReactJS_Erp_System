import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode ataylab yoqilmagan: mavjud ekranlardagi effektlar bir marta
// ishlashiga moʻljallangan (loyihaning boshlangʻich sozlamasi saqlandi).
createRoot(document.getElementById('root')).render(<App />)
