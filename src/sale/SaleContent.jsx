import Table from 'react-bootstrap/Table';
import { Button,Col,Row,InputGroup,Collapse,Dropdown,DropdownButton,Spinner,ProgressBar} from "react-bootstrap";

import Alert from 'react-bootstrap/Alert';


import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import logobgtransparent from "../assets/logobgtransparent.png"

import { useEffect, useRef, useState } from 'react';

import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { SaleProductListGroup } from './SaleProductListContent';
import { addNewSale, getAllCustomersForSale } from './SaleApi';
import { SaleListGroup, SaleListGroupForHome2 } from './SaleListContent';
import { AlertDismissibleDanger, AlertDismissibleSuccess, ProgressDismissible } from '../utils/UtilsContent';
import { SaleDetailScreen } from './SaleDetail';
import { useReactToPrint } from 'react-to-print';






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

function CustomerList(props) {

  const [searchTerm, setSearchTerm] = useState(""); // 
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerList,setCustomerList] = useState([]);

  const [customer, setCustomer] = useState("Имя или Номер телефона");
   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      //setActive(1); // Qidiruv o'zgarganda birinchi sahifaga qaytarish
    }, 500); // 500ms kutish

    return () => {
      clearTimeout(handler); // Agar foydalanuvchi yana yozsa, eski taymerni o'chiradi
    };
  }, [searchTerm]);


    useEffect(() => {
    async function loadCustomers() {
        try {
            const customerListPag = await getAllCustomersForSale(debouncedSearch);

            //console.log(customerListPag);

            setCustomerList(customerListPag.data);
            

        } catch (error) {
            console.log(error);
        }
    }

    loadCustomers();
}, [debouncedSearch]);

 

  return (
    <Dropdown className="my-2">
      <Dropdown.Toggle variant="light w-100 d-flex align-items-center justify-content-between py-0 ps-0 pe-2" id="dropdown-basic">
     
      <Form.Control className='me- me-2' value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}  type="text" placeholder="Имя контрагент или Номер телефона" />
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="mt-1 w-100">
        {customerList?.map((item) => (
          <Dropdown.Item
            key={item}  
            active={customer === item}
            onClick={() => {
              setSearchTerm(`${item.username} ${item.surname}`)
              props.setCustomerId(item.id)
            }}
          >
             {item.username} {item.surname} - {item.phone}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}





function OrderListGroup(props) {

  const [showBulkPrice, setShowBulkPrice] = useState(false);


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
          <div className='d-flex flex-row w-100'>
            <div>
            <small className={`m-0 p-0 py-1 px-2 rounded mt-0 ${index % 2 === 1 ? "bg-dark-subtle" : "bg-light"}`}
            onClick={()=>{
              props.setOrderList(prev =>
                prev.map(item =>
                  item.id === product.id
                    ? { ...item, checkPrice: !item.checkPrice }
                    : item
                )
              )
            }}
            >{product.id}</small>
            {/* <Form.Check className=' bg-dangerx me-2 mt-1'   name="discountType"  type={"checkbox"} id={product.id}
              checked={product.checkPrice}
              reverse            
             onChange={() => {
              props.setOrderList(prev =>
                prev.map(item =>
                  item.id === product.id
                    ? { ...item, checkPrice: !item.checkPrice }
                    : item
                )
              )
            }}
              ></Form.Check> */}
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

            <div className='d-flex flex-column me-1'>
            <small className='ms-0 m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap'>{product.buyPrice.toLocaleString("uz")} So'm </small>            
            {product.checkPrice && 
            <small className='ms-0 m-0 p-0 bg-warning-subtle px-2 rounded mt-1 text-nowrap'>{product.bulkPrice.toLocaleString("uz")} So'm </small>            
            }
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-1 text-nowrap'>{(product.quantity* (product.checkPrice ? product.bulkPrice:product.buyPrice)).toLocaleString("uz")} So'm</small>
            
            </div>

            <div className='d-flex flex-column align-items-end'>
               <svg
            onClick={() => {
                handleDelete(product.id)
            }}
            className="bg-warningx me-0" type="submit" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.9545 5.95548C6.39384 5.51614 7.10616 5.51614 7.5455 5.95548L11.999 10.409L16.4524 5.95561C16.8918 5.51627 17.6041 5.51627 18.0434 5.95561C18.4827 6.39495 18.4827 7.10726 18.0434 7.5466L13.59 12L18.0434 16.4534C18.4827 16.8927 18.4827 17.605 18.0434 18.0444C17.6041 18.4837 16.8918 18.4837 16.4524 18.0444L11.999 13.591L7.5455 18.0445C7.10616 18.4839 6.39384 18.4839 5.9545 18.0445C5.51517 17.6052 5.51516 16.8929 5.9545 16.4535L10.408 12L5.9545 7.54647C5.51516 7.10713 5.51517 6.39482 5.9545 5.95548Z" fill="red"/>
            </svg>
              
            </div>
           
          </div>
         
          
        </ListGroup.Item>
      ))}
    </ListGroup>
    </div>
  );
}








function SaleAdd(props) {

    const componentRef  = useRef(null)

    const [userId, setUserId] = useState(localStorage.getItem("userid") || 1);
    const [open, setOpen] = useState(false);
    const [customerId, setCustomerId] = useState(1);

    const [printType, setPrintType] = useState(null);


    const [paymentType, setPaymentType] = useState("Наличные");
    const [discountType, setDiscountType] = useState("sum");
    const [discountSum, setDiscountSum] = useState(0);

    const [pshow, psetShow] = useState(false);
    const [showDanger, setShowDanger] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);


   

    //   const numbers = [1, 2, 3, 4];

    // const sum = numbers.reduce((acc, item) => {
    //   return acc + item;
    // }, 0);

    // console.log(sum); // 10


  let totalCost = props.orderList?.reduce(
    (sum, item) => sum + (item.checkPrice ? item.bulkPrice: item.buyPrice) * item.quantity,
    0
  );

  let finalCost = 0;

  if (discountType === "sum") {
    finalCost = totalCost - Number(discountSum || 0);
  } else {
    finalCost = totalCost - (totalCost * Number(discountSum || 0)) / 100;
  }
  // if(paymentType === "В долг"){
  //   finalCost=0
  // }

  // manfiy bo‘lib ketmasin
  finalCost = Math.max(0, finalCost);

  const discountAmount = discountType === "sum" ? discountSum : (totalCost * discountSum) / 100 ;

  //const finalCost = totalCost - discountSum;

  //   useEffect(() => {
  //   const total = props.orderList?.reduce(
  //     (sum, item) => sum + item.buyPrice * item.quantity,
  //     0
  //   );

  //   setTotalCost(total);
  // }, [props.orderList]);


  


  
    const handleSale = async () => {
      

        try{
          psetShow(true)
          setShowDanger(false)
          setShowSuccess(false);
          const res = await addNewSale(props.orderList,(paymentType === "В долг" ? 0:finalCost),paymentType,discountAmount,customerId,userId);
     
          const result = await res.json();
          if(!res.ok){
            setShowDanger(true)
            setAlertMessage(result.message)
            psetShow(false)
          
          }else{
            setShowSuccess(true);
            setAlertMessage("Успешно...");
            psetShow(false)
            const timer = setTimeout(() => {
              setShowSuccess(false);
               //window.location.reload(); 
               setPrintType("Чек");
               //handlePrint();
               ///window.location.reload(); 
               
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



  const handlePrint = useReactToPrint({
    contentRef:componentRef,
    onAfterPrint: async () => {
    window.location.reload();  // bazadan qayta o‘qish
  },
  });

  const handlePrintDraft = useReactToPrint({
    contentRef:componentRef,  
    onAfterPrint: async () => {
      
  }
  });


  useEffect(()=>{
    if(printType==="Черновик"){
      handlePrintDraft();
      setPrintType(null);
    }
    if(printType==="Чек"){
      handlePrint();
      setPrintType(null);
    }
  },[printType])




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
          <div className="my-2 bg-light">
            <div>
              <Button variant='outline-primary w-100' onClick={() => {
                  setPrintType("Черновик");
                  //handlePrintDraft();
              }}>
              🖨️ Печать черновика
              </Button>
            </div>
            <small>Скидка</small>
            <Form.Group className="my-2">
              <Form.Control 
                type="number" // "text" o'rniga "number"
                placeholder="Скидка"
                value={discountSum === 0 ? "" : discountSum} // 0 bo'lsa bo'sh ko'rinsin, yozish oson bo'ladi
                onChange={(e) => {
                  const val = e.target.value;
                  setDiscountSum(val === "" ? 0 : Number(val)); // Bo'sh bo'lsa 0, aks holda raqam
                }}
              />
            </Form.Group>

            {/* BU YERDA <Form> TEGINI OLIB TASHLAB, <DIV> QO'YDIK */}
            <div className="mb-3"> 
              <Form.Check  
                inline 
                name="discountGroup" // Name bir xil bo'lsa, tanlov to'g'ri ishlaydi
                label="Сумма" 
                type="radio" 
                id="radio-sum"
                checked={discountType === "sum"}
                onChange={() => setDiscountType("sum")}
              />
              <Form.Check  
                inline 
                name="discountGroup" 
                label={`% Процент ${discountType === "percent" ? discountAmount.toLocaleString("uz") + " So'm" : ""}`} 
                type="radio" 
                id="radio-percent"
                checked={discountType === "percent"}
                onChange={() => setDiscountType("percent")}
              />
            </div>

            <CustomerList setCustomerId={setCustomerId} />
            <PaymentList setPaymentType={setPaymentType} />
          </div>
        </Collapse>

      {showDanger &&
           <AlertDismissibleDanger  alertMsg={alertMessage}></AlertDismissibleDanger>
         }
        {showSuccess &&
           <AlertDismissibleSuccess alertMsg={alertMessage}></AlertDismissibleSuccess>
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
          handleSale();
         
          
        }}

        disabled={finalCost<=0 && paymentType !== "В долг"}
        className={`mt-auto p-4 w-100 ${paymentType === "В долг" ? "btn-danger":"btn-primary"}`}>
          <h4 className="m-0 p-0">
            Итого: {finalCost.toLocaleString("uz")} UZS
          </h4>
        </Button>


      <div ref={componentRef} className="print-area my-3 ms-1 me-4">
          <CheckScreen orderList = {props.orderList} discountAmount={discountAmount} finalCost={finalCost} printType={printType}></CheckScreen>
      </div>

      </Form>
    </div>
  );
}


function CheckScreen(props){
  return(
    <div className="" style={{  fontFamily: "monospace", fontSize: "12px" }}>

              {/* Header */}
              <div className="text-center mb-2">
                <h6 className="m-0 fw-bold">{props.printType}</h6>
                <small>{new Date().toLocaleString("uz")}</small>
              </div>

              <hr className="my-1" />

              {/* Items */}
              <div className="d-flex flex-column gap-1">
                {props.orderList.map((item, index) => (
                  <div key={index}>
                    <div className="d-flex justify-content-between">
                      <small className="fw-semibold">
                        {item.name}
                      </small>

                      <small className='fw-bold'>
                        {item.quantity} {item.unit}
                      </small>
                    </div>

                    <div className="d-flex justify-content-between">
                      <small className='fw-bold'>
                        {(item.checkPrice ? item.bulkPrice : item.buyPrice).toLocaleString("uz")} So'm
                      </small>

                      <small className='fw-bold'>
                        {(item.quantity * (item.checkPrice ? item.bulkPrice : item.buyPrice)).toLocaleString("uz")} So'm
                      </small>
                    </div>

                    <hr className="my-1" />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-2">
                <div className="d-flex justify-content-between">
                  <small>Скидка:</small>
                  <small>{props.discountAmount.toLocaleString("uz")} So'm</small>
                </div>

                <div className="d-flex justify-content-between fw-bold">
                  <small>Итого:</small>
                  <small>{props.finalCost.toLocaleString("uz")} So'm</small>
                </div>
              </div>

              <hr className="my-2" />
              <div className='text-center mt-3'>
               <img src={logobgtransparent} className='object-fit-fill' width={50} height={50} alt="" />
              </div>
              
              

              {/* Footer */}
              <div className="text-center">
                <small style={{ fontSize: "10px" }}>
                  by <b>ID GROUP</b> team
                </small>
              </div>

            </div>
  )
}

function SaleTabForHome(props) {


  
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
      <Tab eventKey="home" title="☰ Список продаж с задолженностью">
         <SaleListGroupForHome2 allSaleDebtList={props.allSaleDebtList} activeTab={activeTab} setSelectedSale={setSelectedSale} setActiveTab={setActiveTab}></SaleListGroupForHome2> 
      </Tab>
      

      {activeTab==="sale_detail" && 
       <Tab eventKey="sale_detail" title={<>
       <i class="bi bi-info-square me-2"></i>
       Детали продажа
       </>}>
         <SaleDetailScreen selectedSale={selectedSale} setActiveTab={setActiveTab} setSelectedSale={setSelectedSale}></SaleDetailScreen>
      </Tab>
      }
      
    </Tabs>
  );
}

function SaleTab() {


   const [orderList,setOrderList] = useState([]); 
   const [activeTab,setActiveTab] =useState("sale")
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
      <Tab eventKey="home" title="☰ Список продажи">
         <SaleListGroup activeTab={activeTab} setSelectedSale={setSelectedSale} setActiveTab={setActiveTab}></SaleListGroup> 
      </Tab>
      
      <Tab eventKey="sale" title="✙ Добавить новый продажа">
        <div className='d-flex  justify-content-center'>
         <Row className="w-100">

              <Col xs={12} md={4} className="mb-3">
                <SaleProductListGroup setOrderList={setOrderList} />
              </Col>

              <Col xs={12} md={5} className="mb-3">
                <OrderListGroup
                  orderList={orderList}
                  setOrderList={setOrderList}
                />
              </Col>

              <Col xs={12} md={3} className="mb-3">
                <SaleAdd orderList={orderList} />
              </Col>

        </Row>
            
        </div>
      </Tab>

      {activeTab==="sale_detail" && 
       <Tab eventKey="sale_detail" title={<>
       <i class="bi bi-info-square me-2"></i>
       Детали продажа
       </>}>
         <SaleDetailScreen selectedSale={selectedSale} setActiveTab={setActiveTab} setSelectedSale={setSelectedSale}></SaleDetailScreen>
      </Tab>
      }
      
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


export {SaleScreen,SaleTabForHome};