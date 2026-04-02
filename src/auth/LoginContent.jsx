import { Button,Col,Row,InputGroup, Collapse,ProgressBar,Spinner} from "react-bootstrap";
import {NavbarScreenFourAuth} from "../navbar/NavbarContent";
import { useState,useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from "react-router-dom";
import logoblack from "../assets/logoblack.png"
import eyewhite from "../assets/eye.png"
import { loginUser } from "./AuthApi";



function AlertDismissibleExample(props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sahifa yuklangandan 500ms o'tgach animatsiya boshlanadi
    const timer = setTimeout(() => {
      setShow(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    /* 
      Muhim: Collapse ichida bitta o'rab turuvchi <div> bo'lishi shart!
      Aks holda animatsiya (collapse effekti) ishlamaydi.
    */
    <Collapse in={show}>
      <div> 
        <Alert className="mt-3"  variant="danger"  onClose={() => setShow(false)} dismissible >
          <small>{props.message}</small>
        </Alert>
      </div>
    </Collapse>
  );
}


function ProgressDismissible() {
 
  return (
   
    
      <div className="d-flex flex-column"> 
        <Spinner className="mx-auto mt-3" animation="border" variant="primary" />
        <ProgressBar  className="my-3" animated variant="primary" now={100} />
      </div>
   
  );
}

function LoginForm(props) {  
    const [login, setLogin] = useState("user3@gmail.com");
   const [password, setPassword] = useState("password");

 


  return (
    <Form className="mt-0">
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>
         <small style={{fontSize:"12px"}}>Логин</small>
        </Form.Label>
        
        <Form.Control className="" type="email" placeholder="Введите адрес электронной почты"
         value={login}
         onChange={(e) => setLogin(e.target.value)}
        />
        <Form.Text className="text-muted">
         <small>Мы никогда не будем делиться вашим электронным письмом ни с кем другим.</small>
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
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
      <Form.Group className="mb-3" controlId="formBasicCheckbox">
        <Form.Check className="text-secondary" style={{fontSize:"12px"}} type="checkbox" label="Запомните меня" />
      </Form.Group>
      <Row className="gx-1 align-items-center">
        <Col className="d-grid">     
        {/* <Link to={"/home"}>Регистрация</Link> */}
         <Button as={Link} to={"/register"}  variant="outline-primary" type="submit">
        Регистрация
        </Button>   
        </Col>
        <Col className="d-grid">        
        <Button  variant="primary"
        onClick={(e)=>{
            //props.handleLogin(e);   // ✅ event berildi
            props.clickLogin(e, login, password);
            
        }}
        >
          Вход
        </Button>     
        </Col>
       
    </Row>
      
    </Form>
  );
}




function LoginScreen(){

    const navigate = useNavigate();

    const [show, setShow] = useState(false);
    const [pshow, psetShow] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

   const handleLogin = async (e, login, password) => {
          e.preventDefault();

          try {
            psetShow(true)  
            setShow(false);
           
            
            const res = await loginUser(login, password);
            const result = await res.json();
            

            if (!res.ok) {
              psetShow(false) 
              setAlertMessage(result.message);
              setTimeout(() => setShow(true), 50);
              
              return;
            }

           
            console.log("SUCCESS:", result);
            navigate("/home")

           

          } catch (error) {
            psetShow(false) 
            setShow(true)
            setAlertMessage("Не удалось подключиться к серверу");
            
            //setTimeout(() => setShow(true), 50);
          }
    };


    return(

        <div className="vh-100">
         
            <NavbarScreenFourAuth ></NavbarScreenFourAuth>
            <Col className="d-flex flex-column align-items-center justify-content-center h-75">
                 <h1 className="fw-bold">Добро пожаловать в систему</h1>
                 <h1 className="fw-bold text-primary">ERP</h1>

                 
                <Col className="col-12 col-md-4 col-lg-4 col-sm-12">
                 {show && 
                 
                 <AlertDismissibleExample message = {alertMessage}></AlertDismissibleExample>
                 }

                  
                
                 <Collapse in={pshow}>
                    <div>
                      {pshow && 
                    <ProgressDismissible></ProgressDismissible>
                    }
                    </div>
                  </Collapse>
                
                 
                 
                 
                <LoginForm  clickLogin={handleLogin}></LoginForm>
                </Col>
            </Col>
        </div>
    )
}


export default LoginScreen;