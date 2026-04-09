



import Table from 'react-bootstrap/Table';
import { Button,Col,Row,InputGroup,Collapse,Dropdown,DropdownButton} from "react-bootstrap";

import Alert from 'react-bootstrap/Alert';
import { useState } from 'react';


import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import eyewhite from "../assets/eye.png"



import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { StockListGroup } from './StockListContent';








function StockTab() {
  
  const [activeTab,setActiveTab] =useState("home")
  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      id="fill-tab-example"
      className="mb-3 mt-"
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список остатков">
          <StockListGroup 
          activeTab={activeTab}
          ></StockListGroup>
      </Tab>
     
    </Tabs>
  );
}






function StockScreen() {
  return (
   <div>
    <StockTab></StockTab>
   
   </div>
   
  );
}


export default StockScreen;