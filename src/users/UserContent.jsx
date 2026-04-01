import Table from 'react-bootstrap/Table';
import { Button,Col,Row,InputGroup,Collapse,Dropdown,DropdownButton} from "react-bootstrap";

import Alert from 'react-bootstrap/Alert';


import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import eyewhite from "../assets/eye.png"



import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';

function UserListGroup() {
  const users = [
    {
      id: 1,
      name: "Mark",
      surname: "Otto",
      phone: "998901234567",
      email: "mark@mail.com",
      role: "Admin"
    },
    {
      id: 2,
      name: "Jacob",
      surname: "Thornton",
      phone: "998909876543",
      email: "jacob@mail.com",
      role: "User"
    },
    {
      id: 3,
      name: "Larry",
      surname: "Bird",
      phone: "998907777777",
      email: "larry@mail.com",
      role: "User"
    }
  ];

  return (
    <ListGroup as="ol"  className="rounded overflow-hidden">
      {users.map((user) => (
        <ListGroup.Item
          key={user.id}
          as="li"
          className="d-flex "
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{user.id}</small>
              <h6 className='m-0 p-0'>{user.name}</h6>
              <h6 className='ms-2 m-0 p-0'>{user.name}</h6>
            </div>
            <div className='d-flex ms-auto'>
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{user.phone}</small>
            <small className='ms-2 m-0 p-0 bg-warning-subtle px-2 rounded mt-0'>{user.email}</small>
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0'>{user.role}</small>
            
            </div>
          </div>
          <div className='d-flex ms-5'>
            <Button variant='secondary p-0 px-3' style={{fontSize:"12px"}} className=''>Изменить</Button>
            <Button variant='secondary p-0 px-3 ms-2'  style={{fontSize:"12px"}} className=''>Удалить</Button>
          </div>
          
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}




function UserList() {
  const users = [
    {
      id: 1,
      name: "Ali",
      surname: "Karimov",
      phone: "+998901112233",
      email: "ali@gmail.com",
      role: "Admin",
    },
    {
      id: 2,
      name: "Vali",
      surname: "Rasulov",
      phone: "+998907778899",
      email: "vali@mail.com",
      role: "User",
    },
    {
      id: 3,
      name: "Sardor",
      surname: "Yusupov",
      phone: "+998935556677",
      email: "sardor@mail.com",
      role: "Manager",
    },
  ];

  return (
    <div className="rounded overflow-hidden">
      <Table striped bordered hover className="m-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Телефон</th>
            <th>Электронная почта</th>
            <th>Роль</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>

              <td>
                <Link
                  className="btn btn-warning"
                  style={{ fontSize: "12px" }}
                >
                  Изменить
                </Link>
              </td>

              <td>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: "12px" }}
                  onClick={() => console.log("Delete:", user.id)}
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
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


      <InputGroup className="mb-3">
        <Form.Control aria-label="Text input with dropdown button" />

        <DropdownButton
          variant="outline-secondary"
          title="Рол"
          id="input-group-dropdown-2"
          align="end"
        >
          <Dropdown.Item href="#">User</Dropdown.Item>
          <Dropdown.Item href="#">Admin</Dropdown.Item>
          
          
          
        </DropdownButton>
      </InputGroup>

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
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список сотрудников">
         <UserListGroup></UserListGroup>
      </Tab>
      <Tab eventKey="profile" title="Добавить новый сотрудник">
        <div className='d-flex align-items-center justify-content-start'>
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