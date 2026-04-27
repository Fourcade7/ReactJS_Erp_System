import Table from 'react-bootstrap/Table';
import { Button,Col} from "react-bootstrap";



import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { Link } from "react-router-dom";





import ListGroup from 'react-bootstrap/ListGroup';
import { RegisterScreenforTab } from '../auth/RegisterContent';
import { UserListGroup } from './UserListContent';
import { useState } from 'react';










function UserTabs() {


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
      <Tab eventKey="home" title={
         <>
          <i className="bi bi-person-lines-fill me-2"></i>
          Список сотрудников
        </>
      }>
         <UserListGroup activeTab={activeTab}></UserListGroup>
      </Tab>
      <Tab eventKey="profile" title={
        <>
        <i class="bi bi-person-add me-2"></i>
         Добавить новый сотрудник
        </>
        
        }>
        <div className='d-flex align-items-center justify-content-start'>
        <Col>
        <RegisterScreenforTab tabChange={(tabName)=>{
          setActiveTab(tabName)
        }}></RegisterScreenforTab>
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