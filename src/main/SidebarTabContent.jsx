import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import UserScreen from '../users/UserContent';
import HomeScreen from '../home/HomeContent';
import CustomerScreen from '../customers/CustomerContent';
import WareHouseScreen from '../warehouse/WarehouseContent';
import CategoryScreen from '../category/CategoryContent';
import ProductScreen from '../product/ProductContent';
import StockScreen from '../stock/StockContent';
import PurchaseScreen from '../purchase/PurchaseContent';
import {SaleScreen} from '../sale/SaleContent';

import { useState } from 'react';
import ReturnScreen from '../return/ReturnContent';
import PaymentScreen from '../payment/PaymentContent';
import { IntegrationScreen } from '../integration/IntegrationContent';

function LeftTab() {

  // const [activeTab, setActiveTab] = useState(() => {
  //   if(localStorage.getItem("role")==="User"){
  //    return  localStorage.getItem("activeTab") || "teenth"
  //   }else{
  //    return  localStorage.getItem("activeTab") || "first"
  //   }
      
  // });

    const [activeTab, setActiveTab] = useState(() => {
    const role = localStorage.getItem("role");
    const savedTab = localStorage.getItem("activeTab");

    if (role === "User") {
      return savedTab && savedTab !== "first" ? savedTab : "teenth";
    }

    return savedTab || "first";
  });
  return (
    <div >
       <Tab.Container   id="left-tabs-example" 
    activeKey={activeTab}
    onSelect={(k) => {
      setActiveTab(k)
      localStorage.setItem("activeTab", k);
      //window.location.reload();
    }}
    
    >
      <Row>
        <Col sm={2} className='border-endx bg-body-tertiaryx ps-4' >
          <Nav 
          variant="pills" 
          className="flex-column mt-2 bg-body-tertiaryx"
          // style={{
          //     "--bs-nav-pills-link-active-bg": "#5b605eff",
          //     "--bs-nav-pills-link-active-color": "#fff",
          //   }}
          >
            <Nav.Item variant="secondary">
              <Nav.Link  eventKey="first"disabled={localStorage.getItem("role")==="User"}><i class="bi bi-pc-display-horizontal"></i> Главная страница</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="second" disabled={localStorage.getItem("role")==="User"}><i class="bi bi-person-video2"></i> Сотрудники</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="thrid" disabled={localStorage.getItem("role")==="User"} ><i class="bi bi-people"></i> Клиенты</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="fourth" disabled={localStorage.getItem("role")==="User"}> <i class="bi bi-ui-checks-grid"></i> Склад</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="fifth" ><i class="bi bi-tags"></i> Категория</Nav.Link>
            </Nav.Item>
            

             <Nav.Item>
              <Nav.Link eventKey="seventh" ><i class="bi bi-box-seam"></i> Продукты</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="eighth" disabled={localStorage.getItem("role")==="User"}><i class="bi bi-123"></i> Остатки</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="nineth" disabled={localStorage.getItem("role")==="User"} ><i class="bi bi-arrow-down-left"></i> Приход</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="teenth" ><i class="bi bi-bag-check"></i> Продажа</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="elevn" ><i class="bi bi-arrow-return-right"></i> Возврат</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="twelw" disabled={localStorage.getItem("role")==="User"}><i class="bi bi-cash"></i> Платеж</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="integration" disabled={localStorage.getItem("role")==="User"} ><i class="bi bi-gear-wide-connected"></i> Интеграция</Nav.Link>
            </Nav.Item>

          </Nav>
        </Col>
        <Col sm={10} className='mt-2'>
          <Tab.Content className='me-3'>
            <Tab.Pane eventKey="first">
              <HomeScreen></HomeScreen>
            </Tab.Pane>
            <Tab.Pane eventKey="second">
              <UserScreen></UserScreen>
            </Tab.Pane>
            <Tab.Pane eventKey="thrid">
              <CustomerScreen></CustomerScreen>
            </Tab.Pane>

            <Tab.Pane eventKey="fourth">
              <WareHouseScreen></WareHouseScreen>
            </Tab.Pane>

            <Tab.Pane eventKey="fifth">
              <CategoryScreen></CategoryScreen>
            </Tab.Pane>

            <Tab.Pane eventKey="seventh">
              <ProductScreen></ProductScreen>
            </Tab.Pane>

            <Tab.Pane eventKey="eighth">
              <StockScreen></StockScreen>
            </Tab.Pane>

             <Tab.Pane eventKey="nineth">
              <PurchaseScreen></PurchaseScreen>
            </Tab.Pane>

            <Tab.Pane eventKey="teenth">
              <SaleScreen></SaleScreen>
            </Tab.Pane>

            <Tab.Pane eventKey="elevn">
              <ReturnScreen></ReturnScreen>
            </Tab.Pane>
            <Tab.Pane eventKey="twelw">
              <PaymentScreen></PaymentScreen>
            </Tab.Pane>

            <Tab.Pane eventKey="integration">
              <IntegrationScreen></IntegrationScreen>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
    </div>
   
  );
}

export default LeftTab;