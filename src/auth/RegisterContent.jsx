import { Button,Col,Row,InputGroup,Collapse,Spinner,ProgressBar} from "react-bootstrap";
import {NavbarScreenFourAuth} from "../navbar/NavbarContent";
import { useState,useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';


import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import logoblack from "../assets/logoblack.png"
import eyewhite from "../assets/eye.png"
import { registerUser } from "./AuthApi";
import { AlertDismissibleDanger, AlertDismissibleSuccess, ProgressDismissible } from "../utils/UtilsContent";





function RegisterForm(props) {
   const [username, setUsername] = useState("");
   const [surname, setSurname] = useState("");
   const [phone, setPhone] = useState("");
   const [login, setLogin] = useState("");   
   const [password, setPassword] = useState("");
   const [password2, setPassword2] = useState("");






  return (
    <Form className="mt-2">

      <Form.Group className="mb-2" controlId="formBasicEmail">
      
        
        <Form.Control className="" type="email" placeholder="Введите имя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите фамилия"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите телефон номер"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        />
        
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Введите адрес электронной почты"
         value={login}
         onChange={(e) => setLogin(e.target.value)}
        />
        
      </Form.Group>



      <Form.Group className="mb-2" controlId="formBasicPassword">
        <Form.Label>
            <small style={{fontSize:"12px"}}>Пароль</small>
        </Form.Label>
        <InputGroup>
        <Form.Control type="password" placeholder="Введите пароль" 
        
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
        
          <div  type="button" className="d-flex px-3 align-items-center justify-content-center bg-primary rounded-end">

          <img className="" src={eyewhite} width={18} height={18} alt="" /> 
          </div>
          
         
       
      </InputGroup>
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicPassword">
        
        <InputGroup>
        <Form.Control type="password" placeholder="Повторите пароль" 
        
         value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        />
        
          <div  type="button" className="d-flex px-3 align-items-center justify-content-center bg-primary rounded-end">

          <img className="" src={eyewhite} width={18} height={18} alt="" /> 
          </div>
          
         
       
      </InputGroup>
      </Form.Group>
     
      <Row className="mt-3 gx-1 align-items-center">
        <Col className="d-grid">     
        {/* <Link to={"/home"}>Регистрация</Link> */}
         <Button as={Link} to={"/login"} variant="outline-primary" type="submit">
        Вход
        </Button>   
        </Col>
        <Col className="d-grid">        
        <Button variant="primary"
          onClick={(e)=>{
            props.handleRegister(e,username,surname,phone,login,password)
          }}
        >
          Регистрация
        </Button>     
        </Col>
       
    </Row>
      
    </Form>
  );
}
function RegisterFormforTab(props) {
   const [username, setUsername] = useState("");
   const [surname, setSurname] = useState("");
   const [phone, setPhone] = useState("");
   const [login, setLogin] = useState("");   
   const [password, setPassword] = useState("");
   const [password2, setPassword2] = useState("");






  return (
    <Form className="mt-2">

      <Form.Group className="mb-2" controlId="formBasicEmail">
      
        
        <Form.Control className="" type="email" placeholder="Введите имя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите фамилия"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите телефон номер"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        />
        
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Введите адрес электронной почты"
         value={login}
         onChange={(e) => setLogin(e.target.value)}
        />
        
      </Form.Group>



      <Form.Group className="mb-2" controlId="formBasicPassword">
        <Form.Label>
            <small style={{fontSize:"12px"}}>Пароль</small>
        </Form.Label>
        <InputGroup>
        <Form.Control type="password" placeholder="Введите пароль" 
        
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
        
          <div  type="button" className="d-flex px-3 align-items-center justify-content-center bg-primary rounded-end">

          <img className="" src={eyewhite} width={18} height={18} alt="" /> 
          </div>
          
         
       
      </InputGroup>
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicPassword">
        
        <InputGroup>
        <Form.Control type="password" placeholder="Повторите пароль" 
        
         value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        />
        
          <div  type="button" className="d-flex px-3 align-items-center justify-content-center bg-primary rounded-end">

          <img className="" src={eyewhite} width={18} height={18} alt="" /> 
          </div>
          
         
       
      </InputGroup>
      </Form.Group>
     
     
       
        <Col className="d-grid">        
        <Button variant="primary"
          onClick={(e)=>{
            props.handleRegister(e,username,surname,phone,login,password)
          }}
        >
         <i class="bi bi-floppy"></i> Сохранить
        </Button>     
        </Col>
    
      
    </Form>
  );
}


function RegisterScreenforTab(props){
  const [pshow, psetShow] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async (e,username,surname,phone,email,password) =>{
      e.preventDefault();

    try{
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false);
      const res = await registerUser(username,surname,phone,email,password)
      const result = await res.json();

      if(!res.ok){
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
       
      }else{
        setShowSuccess(true);
        psetShow(false)
        setAlertMessage("Успешно...");
        const timer = setTimeout(() => {
        props.tabChange("home")
        }, 2000);
        return () => clearTimeout(timer); 
       //props.tabChange("home")
      }

      
      console.log(result);
      
    }catch(error){
      setShowDanger(true)
      setAlertMessage("Не удалось подключиться к серверу");
      psetShow(false)
      //props.tabChange("home")
    }
  };


    return(

        <div>
         
            

                 
                <Col className="col-12 col-md-4 col-lg-4 col-sm-12">
                  {showDanger &&
                    <AlertDismissibleDanger  alertMsg={alertMessage}></AlertDismissibleDanger>
                    }
                   {showSuccess &&
                  <AlertDismissibleSuccess alertMsg={alertMessage}></AlertDismissibleSuccess>
                  }

                   <Collapse in={pshow}>
                    <div>
                    {pshow && 
                       <ProgressDismissible></ProgressDismissible>
                     }
                      </div>
                     </Collapse>
                <RegisterFormforTab handleRegister={handleRegister}></RegisterFormforTab>
                </Col>
           
        </div>
    )
}

function RegisterScreen(){
  const [pshow, psetShow] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async (e,username,surname,phone,email,password) =>{
      e.preventDefault();

    try{
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false);
      const res = await registerUser(username,surname,phone,email,password)
      const result = await res.json();

      if(!res.ok){
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
      }else{
        setShowSuccess(true);
        setAlertMessage("Успешно...");
        psetShow(false)
        
      }

      
      console.log(result);
      
    }catch(error){
      setShowDanger(true)
      setAlertMessage("Не удалось подключиться к серверу");
      psetShow(false)
    }
  };


    return(

        <div className="vh-100">
         
            <NavbarScreenFourAuth ></NavbarScreenFourAuth>
            <Col className="d-flex flex-column align-items-center justify-content-center " style={{height:"85%"}}>
                 <h1 className="fw-bold">Добро пожаловать в систему</h1>
                 <h1 className="fw-bold text-primary">ERP</h1>

                 
                <Col className="col-12 col-md-4 col-lg-4 col-sm-12">
                  {showDanger &&
                    <AlertDismissibleDanger  alertMsg={alertMessage}></AlertDismissibleDanger>
                    }
                   {showSuccess &&
                  <AlertDismissibleSuccess alertMsg={alertMessage}></AlertDismissibleSuccess>
                  }

                   <Collapse in={pshow}>
                    <div>
                    {pshow && 
                       <ProgressDismissible></ProgressDismissible>
                     }
                      </div>
                     </Collapse>
                <RegisterForm handleRegister={handleRegister}></RegisterForm>
                </Col>
            </Col>
        </div>
    )
}


export  {RegisterScreen,RegisterScreenforTab};