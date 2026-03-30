import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import UserScreen from '../users/UserContent';
import HomeScreen from '../home/HomeContent';

function LeftTab() {
  return (
    <Tab.Container className="" id="left-tabs-example" defaultActiveKey="first">
      <Row>
        <Col sm={2} className='border-endx bg-body-tertiaryx ' >
          <Nav variant="pills" className="flex-column mt-3 bg-body-tertiaryx">
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
              <Nav.Link eventKey="sixth" >Склад</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="seventh" >Продукты</Nav.Link>
            </Nav.Item>

             <Nav.Item>
              <Nav.Link eventKey="eight" >Остатки</Nav.Link>
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
        <Col sm={10} className='mt-4'>
          <Tab.Content className='me-3'>
            <Tab.Pane eventKey="first">
              <HomeScreen></HomeScreen>
            </Tab.Pane>
            <Tab.Pane eventKey="second">

              <UserScreen></UserScreen>

            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}

export default LeftTab;