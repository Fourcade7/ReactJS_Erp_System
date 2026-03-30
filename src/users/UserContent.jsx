import Table from 'react-bootstrap/Table';
import { Button,Col,Row,InputGroup,Collapse} from "react-bootstrap";

import Alert from 'react-bootstrap/Alert';


import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import eyewhite from "../assets/eye.png"

function UserList(){
     return (
    <div className="roundedx overflow-hidden"> 
      <Table striped bordered hover className="m-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan={1}>Larry the Bird</td>
            <td>@twitter</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
    </div>
    
  );
}


function UserAdd(){
    return(
        <div>
            <Form className="mt-3">

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
            <small>Пароль</small>
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
      <Col className="d-grid">        
        <Button variant="primary" type="submit">
          Сохранить
        </Button>     
        </Col>
      
    </Form>
        </div>
    )
}

function UserTabs() {
  return (
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3 mt-3"
      //fill
      variant='tabs' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список сотрудников">
         <UserList></UserList>
      </Tab>
      <Tab eventKey="profile" title="Добавить новый сотрудник">
        <div className='d-flex align-items-center justify-content-center'>
        <Col xs={4}>
        <UserAdd></UserAdd>
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






function UserScreen() {
  return (
   <div>
    <UserTabs></UserTabs>
   
   </div>
   
  );
}


export default UserScreen;