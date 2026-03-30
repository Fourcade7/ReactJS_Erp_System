import { Button,Col,Row,InputGroup,Collapse} from "react-bootstrap";
import {NavbarScreenFourAuth} from "../navbar/NavbarContent";
import { useState,useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';


import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import logoblack from "../assets/logoblack.png"
import eyewhite from "../assets/eye.png"



function AlertDismissibleExample() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sahifa yuklangandan 500ms o'tgach animatsiya boshlanadi
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    /* 
      Muhim: Collapse ichida bitta o'rab turuvchi <div> bo'lishi shart!
      Aks holda animatsiya (collapse effekti) ishlamaydi.
    */
    <Collapse in={show}>
      <div> 
        <Alert  variant="success"  onClose={() => setShow(false)} dismissible >
          <small>Измените то и это и попробуйте</small>
        </Alert>
      </div>
    </Collapse>
  );
}

function RegisterForm() {
  return (
    <Form className="mt-2">

      <Form.Group className="mb-2" controlId="formBasicEmail">
      
        
        <Form.Control className="" type="email" placeholder="Введите имя" />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите фамилия" />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите телефон номер" />
        
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Введите адрес электронной почты" />
        
      </Form.Group>



      <Form.Group className="mb-2" controlId="formBasicPassword">
        <Form.Label>
            <small style={{fontSize:"12px"}}>Пароль</small>
        </Form.Label>
        <InputGroup>
        <Form.Control type="password" placeholder="Введите пароль" />
        
          <div  type="button" className="d-flex px-3 align-items-center justify-content-center bg-primary rounded-end">

          <img className="" src={eyewhite} width={18} height={18} alt="" /> 
          </div>
          
         
       
      </InputGroup>
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicPassword">
        
        <InputGroup>
        <Form.Control type="password" placeholder="Повторите пароль" />
        
          <div  type="button" className="d-flex px-3 align-items-center justify-content-center bg-primary rounded-end">

          <img className="" src={eyewhite} width={18} height={18} alt="" /> 
          </div>
          
         
       
      </InputGroup>
      </Form.Group>
     
      <Row className="mt-3 gx-1 align-items-center">
        <Col className="d-grid">     
        {/* <Link to={"/home"}>Регистрация</Link> */}
         <Button as={Link} to={"/"} variant="outline-primary" type="submit">
        Вход
        </Button>   
        </Col>
        <Col className="d-grid">        
        <Button variant="primary" type="submit">
          Регистрация
        </Button>     
        </Col>
       
    </Row>
      
    </Form>
  );
}




function RegisterScreen(){
    return(

        <div className="vh-100">
         
            <NavbarScreenFourAuth ></NavbarScreenFourAuth>
            <Col className="d-flex flex-column align-items-center justify-content-center " style={{height:"85%"}}>
                 <h1 className="fw-bold">Добро пожаловать в систему</h1>
                 <h1 className="fw-bold text-primary">ERP</h1>

                 
                <Col className="col-12 col-md-4 col-lg-4 col-sm-12">
                 <AlertDismissibleExample></AlertDismissibleExample>
                <RegisterForm></RegisterForm>
                </Col>
            </Col>
        </div>
    )
}


export default RegisterScreen;