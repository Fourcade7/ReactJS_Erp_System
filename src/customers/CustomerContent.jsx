import { Button,Col,Row,InputGroup,Collapse,Spinner,ProgressBar,Form} from "react-bootstrap";
import {NavbarScreenFourAuth} from "../navbar/NavbarContent";
import { useState,useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';



import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';



import { CustomerListGroup } from './CustomerListContent';
import { addCustomer } from "./CustomerApi";
import { AlertDismissibleDanger, AlertDismissibleSuccess, ProgressDismissible } from "../utils/UtilsContent";



function CustomerForm(props) {
   const [username, setUsername] = useState("");
   const [surname, setSurname] = useState("");
   const [phone, setPhone] = useState("");
   






  return (
    <Form className="mt-2">

      <Form.Group className="mb-2" controlId="formBasicEmail">
      
        
        <Form.Control className="" placeholder="Введите имя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className=""  placeholder="Введите фамилия"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" placeholder="Введите телефон номер"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        />
        
      </Form.Group>


     
     
     
       
        <Col className="d-grid">        
        <Button variant="primary"
          onClick={(e)=>{
            props.handleRegister(e,username,surname,phone)
          }}
        >
          Сохранить
        </Button>     
        </Col>
    
      
    </Form>
  );
}
function AddNewCustomer(props){
  const [pshow, psetShow] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async (e,username,surname,phone) =>{
      e.preventDefault();

    try{
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false);
      const res = await addCustomer(username,surname,phone)
      const result = await res.json();

      if(!res.ok){
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
       
      }else{
        setShowSuccess(true);
        setAlertMessage("Успешно...");
        psetShow(false)
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
                <CustomerForm handleRegister={handleRegister}></CustomerForm>
                </Col>
           
        </div>
    )
}








function CustomerTabs() {


  const [activeTab,setActiveTab] =useState("home")

  return (
    <Tabs
      //defaultActiveKey={changeTab}
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)} // 🔥 qo‘shib qo‘y
      id="fill-tab-example"
      className="mb-3 mt-"
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список клиентов">
        
         <CustomerListGroup activeTab={activeTab}></CustomerListGroup>
      </Tab>
      <Tab eventKey="profile" title="Добавить новый клиент">
        <div className='d-flex align-items-center justify-content-start'>
        <Col>
        {/* <RegisterScreenforTab tabChange={(tabName)=>{
          setActiveTab(tabName)
        }}></RegisterScreenforTab> */}
        <AddNewCustomer 
        tabChange={(tabName)=>{
          setActiveTab(tabName)
        }}
        ></AddNewCustomer>
        </Col>
        </div>
      </Tab>
      {/* <Tab eventKey="longer-tab" title="Loooonger Tab">
        Tab content for Loooonger Tab
      </Tab>
      <Tab eventKey="contact" title="Contact" disabled>
        Tab content for Contact
      </Tab> */}
    </Tabs>
  );
}






function CustomerScreen() {
  return (
   <div>
    <CustomerTabs></CustomerTabs>
   
   </div>
   
  );
}


export default CustomerScreen;