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
import SaleScreen from '../sale/SaleContent';

function LeftTab() {
  return (
    <Tab.Container className="" id="left-tabs-example" defaultActiveKey="first">
      <Row>
        <Col sm={2} className='border-endx bg-body-tertiaryx ps-4' >
          <Nav variant="pills" className="flex-column mt-2 bg-body-tertiaryx">
            <Nav.Item variant="secondary">
              <Nav.Link eventKey="first" >Главная страница</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="second" >Сотрудники</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="thrid" >Клиенты</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="fourth" >Склад</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="fifth" >Категория</Nav.Link>
            </Nav.Item>
            

             <Nav.Item>
              <Nav.Link eventKey="seventh" >Продукты</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="eighth" >Остатки</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="nineth" >Приход</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="teenth" >Продажа</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="elevn" >Возврат</Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="twelw" >Платеж</Nav.Link>
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
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}

export default LeftTab;