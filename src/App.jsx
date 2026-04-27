
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginScreen from './auth/LoginContent';
import {RegisterScreen} from './auth/RegisterContent';
import MainScreen from './main/MainContent';
import { WelcomeScreen } from './welcome/WelcomeContent';




function App() {

  return (
    <>
     <BrowserRouter>
      <Routes>
        {/* <Route path='' element={<PR></PR>}></Route> */}
        <Route path='' element={<WelcomeScreen></WelcomeScreen>}></Route>
        <Route path='home' element={<MainScreen></MainScreen>}></Route>
        <Route path='login' element={<LoginScreen></LoginScreen>}></Route>
        <Route path='register' element={<RegisterScreen></RegisterScreen>}></Route>
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
