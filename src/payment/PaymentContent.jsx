import Table from 'react-bootstrap/Table';
import { Button,Col,Row,InputGroup,Collapse,Dropdown,DropdownButton,Spinner,ProgressBar} from "react-bootstrap";

import Alert from 'react-bootstrap/Alert';


import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import eyewhite from "../assets/eye.png"

import { useEffect, useState } from 'react';

import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';


import { PaymentListGroup } from './PaymentListContent';
import { AlertDismissibleDanger, AlertDismissibleSuccess, ProgressDismissible } from '../utils/UtilsContent';
import { SaleDetailScreen } from './PaymentDetail';






function PaymentList(props) {
  const [payment, setPayment] = useState("Способ оплаты");

  const payments = [
    "💵 Наличные",
    "🏦 Банковская карта",
    "🟥 В долг",
    "💳 Click",
    "💳 Payme",
    "💷 Uzum",
  ];

  return (
    <Dropdown className="my-2">
      <Dropdown.Toggle
        variant="light"
        className="w-100 d-flex align-items-center justify-content-between"
      >
        {payment}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="mt-1 w-100">
        {payments.map((item) => (
          <Dropdown.Item
            key={item}
            active={payment === item}
            onClick={() => {
              props.setPaymentType(item.slice(2).trim())
              setPayment(item)}}
          >
            {item}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
















function PaymentTab() {


   const [orderList,setOrderList] = useState([]); 
   const [activeTab,setActiveTab] =useState("home")
   const [selectedSale,setSelectedSale] =useState(null)
  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      id="fill-tab-example"
      className="mb-3 "
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="☰ Список платежей">
         <PaymentListGroup activeTab={activeTab} setSelectedSale={setSelectedSale} setActiveTab={setActiveTab}></PaymentListGroup> 
      </Tab>
      
     

      {activeTab==="payment_detail" && 
       <Tab eventKey="payment_detail" title="ℹ️ Детали платежа">
         <SaleDetailScreen selectedSale={selectedSale} setActiveTab={setActiveTab} setSelectedSale={setSelectedSale}></SaleDetailScreen>
      </Tab>
      }
      
    </Tabs>
  );
}






function PaymentScreen() {
  return (
   <div>
    <PaymentTab></PaymentTab>
   
   </div>
   
  );
}


export default PaymentScreen;