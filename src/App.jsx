
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginScreen from './auth/LoginContent';
import {RegisterScreen} from './auth/RegisterContent';
import MainScreen from './main/MainContent';




function App() {

  return (
    <>
     <BrowserRouter>
      <Routes>
        {/* <Route path='' element={<PR></PR>}></Route> */}
        <Route path='' element={<MainScreen></MainScreen>}></Route>
        <Route path='home' element={<MainScreen></MainScreen>}></Route>
        <Route path='login' element={<LoginScreen></LoginScreen>}></Route>
        <Route path='register' element={<RegisterScreen></RegisterScreen>}></Route>
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
