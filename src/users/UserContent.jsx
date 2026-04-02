import Table from 'react-bootstrap/Table';
import { Button,Col} from "react-bootstrap";



import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { Link } from "react-router-dom";





import ListGroup from 'react-bootstrap/ListGroup';
import { RegisterScreenforTab } from '../auth/RegisterContent';
import { UserListGroup } from './UserListContent';





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
        <Col>
        <RegisterScreenforTab></RegisterScreenforTab>
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