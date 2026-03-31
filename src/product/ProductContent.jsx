



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

function ProductListGroup() {
const products = [
  { id: 1, name: "Hikvision DS-2CE16D0T-IR", barCode: "847362918374", code: "cam1", price: 180000, bulkPrice: 160000, buyPrice: 140000, categoryId: 1, unit: "Штук" },
  { id: 2, name: "Dahua HAC-HFW1200TLP", barCode: "563728194650", code: "cam2", price: 170000, bulkPrice: 150000, buyPrice: 130000, categoryId: 1, unit: "Штук" },
  { id: 3, name: "Ezviz C6N WiFi Camera", barCode: "902183746512", code: "cam3", price: 350000, bulkPrice: 320000, buyPrice: 290000, categoryId: 1, unit: "Штук" },
  { id: 4, name: "Uniview IPC2122LB-SF28", barCode: "128374659201", code: "cam4", price: 400000, bulkPrice: 370000, buyPrice: 330000, categoryId: 1, unit: "Штук" },
  { id: 5, name: "Hikvision DS-2CD1023G0-I", barCode: "774920183645", code: "cam5", price: 420000, bulkPrice: 390000, buyPrice: 350000, categoryId: 1, unit: "Штук" },
  { id: 6, name: "Dahua IPC-HDW1230T1-S5", barCode: "639201847562", code: "cam6", price: 410000, bulkPrice: 380000, buyPrice: 340000, categoryId: 1, unit: "Штук" },
  { id: 7, name: "Ezviz C3TN Outdoor", barCode: "918273645019", code: "cam7", price: 330000, bulkPrice: 300000, buyPrice: 270000, categoryId: 1, unit: "Штук" },
  { id: 8, name: "Uniview IPC3612LB-AF28", barCode: "564738291027", code: "cam8", price: 450000, bulkPrice: 420000, buyPrice: 380000, categoryId: 1, unit: "Штук" },
  { id: 9, name: "Hikvision DS-2CD2043G0-I", barCode: "382910475629", code: "cam9", price: 580000, bulkPrice: 540000, buyPrice: 500000, categoryId: 1, unit: "Штук" },
  { id: 10, name: "Dahua IPC-HFW1431S1P", barCode: "745920183764", code: "cam10", price: 520000, bulkPrice: 490000, buyPrice: 450000, categoryId: 1, unit: "Штук" },
  { id: 11, name: "Ezviz C8C PTZ", barCode: "190283746591", code: "cam11", price: 600000, bulkPrice: 560000, buyPrice: 520000, categoryId: 1, unit: "Штук" },
  { id: 12, name: "Uniview IPC2322EBR-DPZ28", barCode: "847561920384", code: "cam12", price: 750000, bulkPrice: 700000, buyPrice: 650000, categoryId: 1, unit: "Штук" },
  { id: 13, name: "Hikvision DS-2CD2143G0-I", barCode: "564920183745", code: "cam13", price: 600000, bulkPrice: 560000, buyPrice: 520000, categoryId: 1, unit: "Штук" },
  { id: 14, name: "Dahua HAC-HDW1209TLQP", barCode: "309284756192", code: "cam14", price: 200000, bulkPrice: 180000, buyPrice: 160000, categoryId: 1, unit: "Штук" },
  { id: 15, name: "Ezviz TY1 Indoor", barCode: "675849302817", code: "cam15", price: 280000, bulkPrice: 250000, buyPrice: 230000, categoryId: 1, unit: "Штук" },
  { id: 16, name: "Uniview IPC2124SR3-DPF28", barCode: "928374650192", code: "cam16", price: 480000, bulkPrice: 450000, buyPrice: 410000, categoryId: 1, unit: "Штук" },
  { id: 17, name: "Hikvision DS-2CE76D0T-ITPFS", barCode: "473829105647", code: "cam17", price: 210000, bulkPrice: 190000, buyPrice: 170000, categoryId: 1, unit: "Штук" },
  { id: 18, name: "Dahua IPC-HDW2231TP-AS", barCode: "582910374659", code: "cam18", price: 550000, bulkPrice: 510000, buyPrice: 470000, categoryId: 1, unit: "Штук" },
  { id: 19, name: "Ezviz H8 Pro", barCode: "918273640195", code: "cam19", price: 700000, bulkPrice: 650000, buyPrice: 600000, categoryId: 1, unit: "Штук" },
  { id: 20, name: "Uniview IPC3634SR3-ADZK", barCode: "746392018574", code: "cam20", price: 800000, bulkPrice: 750000, buyPrice: 700000, categoryId: 1, unit: "Штук" }
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
            <small className='ms-2 m-0 p-0 bg-warning-subtle px-2 rounded mt-0'>{user.code}</small>
            
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0'>{user.price}</small>
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0'>{user.bulkPrice}</small>
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0'>{user.buyPrice}</small>
            
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






function ProductAdd(){
    return(
        <div>
            <Form className="mt-3">

      <Form.Group className="mb-2" controlId="formBasicEmail">
      
        
        <Form.Control className="" type="email" placeholder="Введите имя" />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите код" />
        
      </Form.Group>
       <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Введите штрих код" />
        
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="email" placeholder="Цена" />
        
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Цена оптом" />
        
      </Form.Group>

       <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Цена продажа" />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Единица" />
        
      </Form.Group>

      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="email" placeholder="Цена продажа" />
        
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

function ProductTab() {
  return (
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3 mt-3"
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список продуктов">
         <ProductListGroup></ProductListGroup>
      </Tab>
      <Tab eventKey="profile" title="Добавить новый продукт">
        <div className='d-flex align-items-center justify-content-center'>
        <Col xs={4}>
        <ProductAdd></ProductAdd>
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






function ProductScreen() {
  return (
   <div>
    <ProductTab></ProductTab>
   
   </div>
   
  );
}


export default ProductScreen;