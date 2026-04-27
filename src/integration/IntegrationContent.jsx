
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Button,Col,Form, Row,ListGroup} from "react-bootstrap";

import { useState } from 'react';





function TelegramBotLists(){
   const bots = [
  {
    name: "my_first_bot",
    token: "1234567890:AAExampleToken_1abcdefghijk"
  },
  {
    name: "news_bot",
    token: "1234567890:AAExampleToken_2abcdefghijk"
  },
  {
    name: "shop_bot",
    token: "1234567890:AAExampleToken_3abcdefghijk"
  }
];
  return(
    <div>
       <ListGroup as="ol" numbered>
      {bots.map((item,index) => (
        <ListGroup.Item as="li">{item.name} :  <strong>Token:</strong> {item.token.slice(0, 15)}...</ListGroup.Item>
      ))
      }
      </ListGroup>

    </div>
  )
}



function TelegramBots(){
  const [username, setUsername] = useState("");
  const [username2, setUsername2] = useState("");

 
   
  return(
    <div>
      <Row className='g-2'>
        <Col className='col-3'>
          <Form className="">

              <Form.Group className="mb-2" controlId="formBasicEmail">                   
                <Form.Control className="" placeholder="Введите  бот имя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />                
              </Form.Group>
               <Form.Group className="mb-2" controlId="formBasicEmail">                   
                <Form.Control className="" placeholder="Введите бот токен"
                value={username2}
                onChange={(e) => setUsername2(e.target.value)}
                />                
              </Form.Group>

             


            
            
            
              
                <Col className="d-grid">        
                <Button variant="primary"
                  onClick={(e)=>{
                   // props.handleRegister(e,username,surname,phone)
                  }}
                >
                <i class="bi bi-floppy"></i> Сохранить
                </Button>     
                </Col>
            
              
        </Form>
        </Col>
        <Col>
        
                <TelegramBotLists></TelegramBotLists>  
        
        </Col>
      </Row>


    </div>
  )
}






function IntegrationTab() {


  const [activeTab,setActiveTab] =useState("home")

  return (
    <Tabs
      //defaultActiveKey={changeTab}
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)} // 🔥 qo‘shib qo‘y
      id="fill-tab-example"
      className="mb-3"
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
     
      <Tab eventKey="home" title={
        <>
        <i class="bi bi-telegram text-info me-2"></i>
        <i class="bi bi-robot me-2"></i>
        Telegram Bots
        </>
      }>
        <TelegramBots></TelegramBots>
      </Tab>

      
      
      
    </Tabs>
  );
}



function IntegrationScreen(){

    return(
        <div>
            <IntegrationTab></IntegrationTab>

        </div>
    )
}



export {IntegrationScreen}