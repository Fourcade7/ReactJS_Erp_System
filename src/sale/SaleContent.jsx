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
import { SaleProductListGroup } from './SaleProductListContent';
import { addNewSale } from './SaleApi';


function AlertDismissibleDanger(props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sahifa yuklangandan 500ms o'tgach animatsiya boshlanadi
    const timer = setTimeout(() => {
      setShow(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    /* 
      Muhim: Collapse ichida bitta o'rab turuvchi <div> bo'lishi shart!
      Aks holda animatsiya (collapse effekti) ishlamaydi.
    */
    <Collapse in={show}>
      <div> 
        <Alert  variant="danger"  onClose={() => setShow(false)} dismissible >
          <small>{props.alertMsg}</small>
        </Alert>
      </div>
    </Collapse>
  );
}

function ProgressDismissible() {
 
  return (
   
    
      <div className="d-flex flex-column"> 
        <Spinner className="mx-auto mt-3" animation="border" variant="primary" />
        <ProgressBar  className="my-3" animated variant="primary" now={100} />
      </div>
   
  );
}

function AlertDismissibleSuccess() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sahifa yuklangandan 500ms o'tgach animatsiya boshlanadi
    const timer = setTimeout(() => {
      setShow(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    /* 
      Muhim: Collapse ichida bitta o'rab turuvchi <div> bo'lishi shart!
      Aks holda animatsiya (collapse effekti) ishlamaydi.
    */
    <Collapse in={show}>
      <div> 
        <Alert  variant="success"  onClose={() => setShow(false)} dismissible >
          <small>Пользователь успешно зарегистрирован</small>
        </Alert>
      </div>
    </Collapse>
  );
}




function PaymentList() {
  const [payment, setPayment] = useState("Способ оплаты");

  const payments = [
    "Наличные",
    "Банковская карта",
    "В долг",
    "Click",
    "Payme",
    "Uzum",
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
            onClick={() => setPayment(item)}
          >
            {item}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

function CustomerList() {
  const [customer, setCustomer] = useState("Имя или Номер телефона");

  const customers = [
    "Eshmat aka",
    "Gishmat aka",
    "Mirjalol uka",
    
  ];

  return (
    <Dropdown className="my-2">
      <Dropdown.Toggle variant="light w-100 d-flex align-items-center justify-content-between py-0 ps-0 pe-2" id="dropdown-basic">
     
      <Form.Control className='me- me-2' value={customer}  type="text" placeholder="Имя контрагент или Номер телефона" />
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="mt-1 w-100">
        {customers.map((item) => (
          <Dropdown.Item
            key={item}
            active={customer === item}
            onClick={() => setCustomer(item)}
          >
            {item}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}





function OrderListGroup(props) {


  const handleDelete = (id) => {
    props.setOrderList(prev => prev.filter(item => item.id !== id));
  };

  // const increase = (id) => {
  //   props.setOrderList(prev =>
  //     prev.map(item =>
  //       item.id === id
  //         ? { ...item, quantity: item.quantity + 1 }
  //         : item
  //     )
  //   );
  // };

  const increase = (id) => {
  props.setOrderList(prev =>
    prev.map(item => {

      if (item.id === id) {

        const stockQty = item.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;

        // ❗ LIMIT CHECK
        if (item.quantity >= stockQty) {
          console.log("Stock yetarli emas");
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1
        };
      }

      return item;
    })
  );
};

  const decrease = (id) => {
    props.setOrderList(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const remove = (id) => {
    props.setOrderList(prev => prev.filter(item => item.id !== id));
  };


  return (
    <div>
      <small>Корзина</small>
      <ListGroup as="ol"  className="rounded mt-2 overflow-hidden ">

     
      {props.orderList.map((product,index) => (
        <ListGroup.Item
          key={product.id}
          as="li"
          className={`d-flex ${index % 2 === 1 ? "bg-light" : "bg-dark-subtle "} ps-2 pe-2`}
         
        >
          <div className='d-flex flex-row w-100 '>
            <div>
                <small className={`m-0 p-0 py-1 px-2 rounded mt-0 ${index % 2 === 1 ? "bg-dark-subtle" : "bg-light"}`}>{product.id}</small>
            </div>
            <div className='d-flex flex-column'>
            <h6 className='ms-2 m-0 p-0'>{product.name}</h6>              
              
            <div>
            <small className='ms-0 m-0 p-0 bg-success-subtlex ms-2 rounded mt-1'>{product.barCode}</small>
            <small className='ms-0 m-0 p-0 bg-warning-subtlex ms-2  rounded mt-1'>{product.code}</small>
            
            </div>
            </div>

            <div className='d-flex align-items-center h-0 ms-auto me-2'>
                <Button
                onClick={()=>{
                 decrease(product.id)
                   
                 }}
                 
                className="p-0 ms-2 d-flex" variant="outline-danger">
                <svg className="mx-1 p-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M4.875 12C4.875 11.3787 5.37868 10.875 6 10.875H18.0007C18.622 10.875 19.1257 11.3787 19.1257 12C19.1257 12.6213 18.622 13.125 18.0007 13.125H6C5.37868 13.125 4.875 12.6213 4.875 12Z" fill="#323544"/>
                       </svg>
                </Button> 
                <small className="ms-2 p-0">{product.quantity}</small>
                <Button
                onClick={()=>{
                  increase(product.id)
                  
                   
                 }}

                 disabled={product.quantity >= (product.stock?.reduce((s, x) => s + x.quantity, 0) || 0)}
                className="p-0 ms-2 d-flex" variant="outline-primary">
                <svg className="mx-1 p-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="#323544"/>
                      </svg> 
                </Button>
            </div>

            <div className='d-flex flex-column'>
            <small className='ms-0 m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap'>{product.buyPrice.toLocaleString("uz")} So'm </small>            
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-1 text-nowrap'>{(product.quantity*product.buyPrice).toLocaleString("uz")} So'm</small>
            
            </div>

             <svg
            onClick={() => {
                handleDelete(product.id)
            }}
            className="ms-2" type="submit" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.9545 5.95548C6.39384 5.51614 7.10616 5.51614 7.5455 5.95548L11.999 10.409L16.4524 5.95561C16.8918 5.51627 17.6041 5.51627 18.0434 5.95561C18.4827 6.39495 18.4827 7.10726 18.0434 7.5466L13.59 12L18.0434 16.4534C18.4827 16.8927 18.4827 17.605 18.0434 18.0444C17.6041 18.4837 16.8918 18.4837 16.4524 18.0444L11.999 13.591L7.5455 18.0445C7.10616 18.4839 6.39384 18.4839 5.9545 18.0445C5.51517 17.6052 5.51516 16.8929 5.9545 16.4535L10.408 12L5.9545 7.54647C5.51516 7.10713 5.51517 6.39482 5.9545 5.95548Z" fill="red"/>
            </svg>
           
          </div>
         
          
        </ListGroup.Item>
      ))}
    </ListGroup>
    </div>
  );
}

function SaleListGroup() {
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






function SaleAdd(props) {

  const [open, setOpen] = useState(false);

    const [pshow, psetShow] = useState(false);
    const [showDanger, setShowDanger] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    //   const numbers = [1, 2, 3, 4];

    // const sum = numbers.reduce((acc, item) => {
    //   return acc + item;
    // }, 0);

    // console.log(sum); // 10

  const totalCost = props.orderList?.reduce(
    (sum, item) => sum + item.buyPrice * item.quantity,
    0
  );


  
    const handleSale = async () => {
      

        try{
          psetShow(true)
          setShowDanger(false)
          setShowSuccess(false);
          const res = await addNewSale(props.orderList,totalCost);
     
          const result = await res.json();
          if(!res.ok){
            setShowDanger(true)
            setAlertMessage(result.message)
            psetShow(false)
          
          }else{
            setShowSuccess(true);
            psetShow(false)
            const timer = setTimeout(() => {
              setShowSuccess(false);
               window.location.reload(); 
            }, 3000);
           
            return () => clearTimeout(timer); 
          
          }

          
          console.log(result);
          
        }catch(error){
          setShowDanger(true)
          setAlertMessage("Не удалось подключиться к серверу");
          psetShow(false)
        
        }
    }




  return (
    <div>
      <Form className="mt-0">
      <small>Продажа</small>
      <div className='d-grid my-2'>
        <Button variant='outline-primary' onClick={() => setOpen(!open)}>
        Дополнительные функции
      </Button>
      </div>

        <Collapse in={open}>
        <div className="my-2 p-2 bg-light">
          <Form.Group className="mb-2">
          <Form.Control type="email" placeholder="Сумма скидка" />
        </Form.Group>

         <CustomerList />

        <PaymentList />
        </div>
      </Collapse>

      {showDanger &&
           <AlertDismissibleDanger  alertMsg={alertMessage}></AlertDismissibleDanger>
         }
        {showSuccess &&
                        <AlertDismissibleSuccess></AlertDismissibleSuccess>
       }
      
      <Collapse in={pshow}>
        <div>
          {pshow && 
            <ProgressDismissible></ProgressDismissible>
             }
          </div>
       </Collapse>

        <Button
        onClick={()=>{
          //console.log(items);
          handleSale()
          
        }}

        disabled={totalCost<=0}
        className="mt-auto p-4 w-100">
          <h4 className="m-0 p-0">
            Итого: {totalCost.toLocaleString("uz")} UZS
          </h4>
        </Button>

      </Form>
    </div>
  );
}
function SaleTab() {


   const [orderList,setOrderList] = useState([]); 
  return (
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3 "
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список продажи">
         <SaleListGroup></SaleListGroup>    
      </Tab>
      
      <Tab eventKey="profile" title="Добавить новый продажа">
        <div className='d-flex  justify-content-center'>
        <Col xs={4}>
        <SaleProductListGroup setOrderList={setOrderList}></SaleProductListGroup>
        </Col>

        <Col className='ms-2'>
        <OrderListGroup orderList={orderList} setOrderList={setOrderList}></OrderListGroup>
        </Col>
         
        <Col className='ms-2' xs={3}>
        <SaleAdd orderList={orderList}></SaleAdd>
        </Col>
        
        </div>
      </Tab>
      
    </Tabs>
  );
}






function SaleScreen() {
  return (
   <div>
    <SaleTab></SaleTab>
   
   </div>
   
  );
}


export default SaleScreen;