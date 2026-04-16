
import { ListGroup,Button ,Dropdown,Modal,Form,Spinner,ProgressBar, Col} from "react-bootstrap";

import { useEffect, useState,useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import {  getAllPaymentListPaginationSearch } from "./PaymentApi";

import ellipsis from "../assets/ellipsis.png"
//import "./customer.css"




function PaymentListGroup(props) {
 
 
  const [showResAlert, setShowResAlert] = useState(false);

 
 

  //const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 
  const [debouncedSearch, setDebouncedSearch] = useState("");



  const [paymentList,setPaymentList] = useState([]); 
  const [pageCount,setPageCount] = useState(0);

   
  const [active, setActive] = useState(1);


  useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(searchTerm);
    setActive(1); // Qidiruv o'zgarganda birinchi sahifaga qaytarish
  }, 500); // 500ms kutish

  return () => {
    clearTimeout(handler); // Agar foydalanuvchi yana yozsa, eski taymerni o'chiradi
  };
}, [searchTerm]);

  

  useEffect(()=>{
    async function loadAllSalePag() {
      try{
        //setShowLoad(true)
        const paymentListPag= await getAllPaymentListPaginationSearch(active,10,debouncedSearch);
       
        
        console.log("productListPag.stock");
        console.log(paymentListPag.stock);
        setPageCount(paymentListPag.meta.totalPages);
        console.log(active);
        setPaymentList(paymentListPag.data)
        
        
        
      }catch(error){
          console.log(error.message);
         
      }
    }

    
      if (props.activeTab === "home") {
        loadAllSalePag();
      }
      
  },[active,showResAlert,props.activeTab,debouncedSearch])  



  //Pagination

  

  let items = [];

  for (let number = 1; number <= pageCount; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === active}
        onClick={() => setActive(number)} // 🔥 click handler
      >
        {number}
      </Pagination.Item>
    );
  }




  return (
    <div>
       <Form.Control className="mb-2" type="text" placeholder="Поиск..." 
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setActive(1); // Qidiruv o'zgarganda birinchi sahifaga qaytish muhim!
        }}
       />
        <ListGroup as="ol"  className="rounded overflow-hiddenx">
      {paymentList.map((paymentItem,index) => (
        <ListGroup.Item
          key={paymentItem.id}
          as="li"
          className="d-flex "
          onClick={()=>{
            console.log(paymentItem);
            props.setSelectedSale(paymentItem);
            props.setActiveTab("payment_detail")            
            
          }}
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{index+1}</small>
              <small className='me-2 m-0 p-0 bg-dark-subtlex px-2 rounded mt-0'>#️⃣ Платеж id: {paymentItem.id}</small>
             
            </div>
            <div className='d-flex ms-auto'>
              
            
            
             

             {/* {sale.total!==(sale.payments.reduce((sum,item) => sum+item.amount,0 )+sale.discount) &&
              <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>🟥 В долг</small>
             } */}

             {/* {paymentItem.sale &&
               (
                  <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>
                    {paymentItem.sale.payments.reduce((sum, item) => sum + item.amount, 0)}
                  </small>
             )} */}

              {/* {paymentItem.sale && paymentItem.sale.discount > 0 && (
                <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>
                  💸 Скидка {paymentItem.sale.discount} So'm
                </small>
              )} */}

             
                

            {/* {paymentItem.sale && paymentItem.sale.payments.reduce((sum, item) => sum + item.amount, 0) < paymentItem.sale.total - paymentItem.sale.discount && (
                <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>
                  🟥 В долг
                </small>
              )}

              {paymentItem.purchase &&
              paymentItem.purchase.total !==
                paymentItem.purchase.payments.reduce((sum, item) => sum + item.amount, 0) + paymentItem.purchase.discount && (
                  <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>
                    🟥 В долг
                  </small>
              )}

              {paymentItem.returns &&
              paymentItem.returns.total !==
                paymentItem.returns.payments.reduce((sum, item) => sum + item.amount, 0) + paymentItem.returns.discount && (
                  <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>
                    🟥 В долг
                  </small>
              )} */}
            
            
           
            
            {/* <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💵 {sale.payments.reduce((sum,item) => sum+item.amount,0 ).toLocaleString("uz")} So'm</small> */}
           


            {// discount
            }

             {paymentItem.sale && 
                  
                     <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💸 Скидка {paymentItem.sale.discount.toLocaleString("uz")} So'm</small>
                                     
                }

                {paymentItem.purchase && (
                  
                     <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💸 Скидка {paymentItem.purchase.discount.toLocaleString("uz")} So'm</small>
                 
                )}

                {paymentItem.returns && (
                  
                     <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💸 Скидка {paymentItem.returns.discount.toLocaleString("uz")} So'm</small>
                 
                )}

                 <small className='m-0 p-0 bg-success-subtlex  rounded mt-0 text-nowrap'>+</small>

                   {// payed
            }

                 <small className='m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💵 Оплачено {paymentItem.amount.toLocaleString("uz")} So'm</small>

                {// total
            }


            
               {paymentItem.sale && 
                  
                     <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💵 {paymentItem.sale.total.toLocaleString("uz")} So'm</small>
                                     
                }

                {paymentItem.purchase && (
                  
                     <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💵 {paymentItem.purchase.total.toLocaleString("uz")} So'm</small>
                 
                )}

                {paymentItem.returns && (
                  
                     <small className='ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap'>💵 {paymentItem.returns.total.toLocaleString("uz")} So'm</small>
                 
                )}




                
            

              {paymentItem.sale && (
                  <small className="ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0 text-nowrap">
                    🔵 Продажа {paymentItem.sale.id}
                  </small>
                )}

                {paymentItem.purchase && (
                  <small className="ms-2 m-0 p-0 bg-danger-subtle px-2 rounded mt-0 text-nowrap">
                    🔴 Приход {paymentItem.purchase.id}
                  </small>
                )}

                {paymentItem.returns && (
                  <small className="ms-2 m-0 p-0 bg-warning-subtle px-2 rounded mt-0 text-nowrap">
                    🟠 Возврат {paymentItem.returns.id}
                  </small>
                )}
            
           
            <small className='ms-2 m-0 p-0 bg-primary-subtlex px-2 rounded mt-0 text-nowrap'>🕗 { new Date( paymentItem.date).toLocaleString("UZ") }</small>
            
            </div>
          </div>
          
          
                </ListGroup.Item>
              ))}
      </ListGroup>

       <div className="mt-4">
         <Pagination>{items}</Pagination>
              
       </div>


    </div>
  );
}


export {PaymentListGroup}
