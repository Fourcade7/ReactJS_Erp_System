



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

function StpclListGroup() {
const products = [
  { id: 1, name: "Hikvision DS-2CE16D0T-IR", barCode: "Категория 1", code: "12", price: 21, bulkPrice: 160000, buyPrice: 140000, categoryId: 1, unit: "Штук" },
  { id: 2, name: "Dahua HAC-HFW1200TLP",     barCode: "Категория 1", code: "12", price: 15, bulkPrice: 150000, buyPrice: 130000, categoryId: 1, unit: "Штук" },
  { id: 3, name: "Ezviz C6N WiFi Camera",    barCode: "Категория 1", code: "12", price: 36, bulkPrice: 320000, buyPrice: 290000, categoryId: 1, unit: "Штук" },
  { id: 4, name: "Uniview IPC2122LB-SF28",   barCode: "Категория 1", code: "12", price: 41, bulkPrice: 370000, buyPrice: 330000, categoryId: 1, unit: "Штук" },
  { id: 5, name: "Hikvision DS-2CD1023G0-I", barCode: "Категория 1", code: "12", price: 40, bulkPrice: 390000, buyPrice: 350000, categoryId: 1, unit: "Штук" },
  { id: 6, name: "Dahua IPC-HDW1230T1-S5",   barCode: "Категория 1", code: "12", price: 24, bulkPrice: 380000, buyPrice: 340000, categoryId: 1, unit: "Штук" },
  { id: 7, name: "Ezviz C3TN Outdoor",       barCode: "Категория 1", code: "12", price: 3, bulkPrice: 300000, buyPrice: 270000, categoryId: 1, unit: "Штук" },
  { id: 8, name: "Uniview IPC3612LB-AF28",   barCode: "Категория 1", code: "12", price: 4, bulkPrice: 420000, buyPrice: 380000, categoryId: 1, unit: "Штук" },
  { id: 9, name: "Hikvision DS-2CD2043G0-I", barCode: "Категория 1", code: "12", price: 5, bulkPrice: 540000, buyPrice: 500000, categoryId: 1, unit: "Штук" },
  { id: 10, name: "Dahua IPC-HFW1431S1P",    barCode: "Категория 1", code: "120", price: 5, bulkPrice: 490000, buyPrice: 450000, categoryId: 1, unit: "Штук" },
  { id: 11, name: "Ezviz C8C PTZ",           barCode: "Категория 1", code: "cam11", price: 6, bulkPrice: 560000, buyPrice: 520000, categoryId: 1, unit: "Штук" },
  { id: 12, name: "Uniview IPC2322EBR-DPZ28", barCode: "Категория 1", code: "cam12", price: 7, bulkPrice: 700000, buyPrice: 650000, categoryId: 1, unit: "Штук" },
  { id: 13, name: "Hikvision DS-2CD2143G0-I", barCode: "Категория 1", code: "cam13", price: 6, bulkPrice: 560000, buyPrice: 520000, categoryId: 1, unit: "Штук" },
  { id: 14, name: "Dahua HAC-HDW1209TLQP",   barCode: "Категория 1", code: "cam14", price: 2, bulkPrice: 180000, buyPrice: 160000, categoryId: 1, unit: "Штук" },
  { id: 15, name: "Ezviz TY1 Indoor",        barCode: "Категория 1", code: "cam15", price: 2, bulkPrice: 250000, buyPrice: 230000, categoryId: 1, unit: "Штук" },
  { id: 16, name: "Uniview IPC2124SR3-DPF28", barCode: "Категория 1", code: "cam16", price: 4, bulkPrice: 450000, buyPrice: 410000, categoryId: 1, unit: "Штук" },
  { id: 17, name: "Hikvision DS-2CE76D0T-ITPFS", barCode: "Категория 1", code: "cam17", price: 2, bulkPrice: 190000, buyPrice: 170000, categoryId: 1, unit: "Штук" },
  { id: 18, name: "Dahua IPC-HDW2231TP-AS", barCode: "Категория 1", code: "cam18", price: 5, bulkPrice: 510000, buyPrice: 470000, categoryId: 1, unit: "Штук" },
  { id: 19, name: "Ezviz H8 Pro", barCode: "Категория 1", code: "cam19", price: 7, bulkPrice: 650000, buyPrice: 600000, categoryId: 1, unit: "Штук" },
  { id: 20, name: "Uniview IPC3634SR3-ADZK", barCode: "Категория 1", code: "cam20", price: 8, bulkPrice: 750000, buyPrice: 700000, categoryId: 1, unit: "Штук" }
];

  return (
    <ListGroup as="ol"  className="rounded overflow-hidden">
      {products.map((user) => (
        <ListGroup.Item
          key={user.id}
          as="li"
          className="d-flex "
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{user.id}</small>
             
              <h6 className='ms-2 m-0 p-0'>{user.name}</h6>
            </div>
            <div className='d-flex ms-auto'>
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{user.barCode}</small>
            <small className='ms-2 m-0 p-0 bg-warning-subtle px-2 rounded mt-0'>{user.price}</small>
            
            
            
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






function StockAdd(){
    return(
        <div>
            <Form className="mt-3">

      <Form.Group className="mb-2" controlId="formBasicEmail">
      
        
        <Form.Control className="" type="email" placeholder="Наименование продукта" />
        
      </Form.Group>

      
       

      

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Количество остатков" />
        
      </Form.Group>

      <InputGroup className="mb-3">
        <Form.Control aria-label="Text input with dropdown button" />

        <DropdownButton
          variant="outline-secondary"
          title="Выберите категорию"
          id="input-group-dropdown-2"
          align=""
        >
          <Dropdown.Item href="#">Категория 1</Dropdown.Item>
          <Dropdown.Item href="#">Категория 2</Dropdown.Item>
          
          
          
        </DropdownButton>
      </InputGroup>


      
      <Col className="d-grid">        
        <Button variant="primary" type="submit">
          Сохранить
        </Button>     
        </Col>
      
    </Form>
        </div>
    )
}

function StockTab() {
  
  const [activeTab,setActiveTab] =useState("home")
  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      id="fill-tab-example"
      className="mb-3 mt-3"
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