import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import LoginScreen from './auth/LoginContent';
import {RegisterScreen} from './auth/RegisterContent';
import HomeScreen from './home/HomeContent';
import MainScreen from './main/MainContent';




function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <BrowserRouter>
      <Routes>
        {/* <Route path='' element={<PR></PR>}></Route> */}
        <Route path='' element={<LoginScreen></LoginScreen>}></Route>
        <Route path='home' element={<MainScreen></MainScreen>}></Route>
        <Route path='login' element={<LoginScreen></LoginScreen>}></Route>
        <Route path='register' element={<RegisterScreen></RegisterScreen>}></Route>
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
