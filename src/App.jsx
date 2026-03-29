import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
//import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import LoginScreen from './auth/LoginContent';


function PR(){
  return(
    <div>
      <small style={{fontSize:"10px"}}>Thisis small text</small>
      <h1>This is h1</h1>
     <Button className='px-4 rounded-5' style={{fontSize:"12px"}} >asdfasdf</Button>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <BrowserRouter>
      <Routes>
        {/* <Route path='' element={<PR></PR>}></Route> */}
        <Route path='' element={<LoginScreen></LoginScreen>}></Route>
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
