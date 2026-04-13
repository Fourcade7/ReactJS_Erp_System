
import { ListGroup,Button ,Dropdown,Modal,Form,Spinner,ProgressBar, Col} from "react-bootstrap";

import { useEffect, useState,useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import {  getAllSaleListPaginationSearch } from "./SaleApi";

import ellipsis from "../assets/ellipsis.png"
//import "./customer.css"




function SaleListGroup(props) {
 
 
  const [showResAlert, setShowResAlert] = useState(false);

 
 

  //const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 
  const [debouncedSearch, setDebouncedSearch] = useState("");



  const [saleList,setSaleList] = useState([]); 
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
        const saleListPag= await getAllSaleListPaginationSearch(active,10,debouncedSearch);
       
        
        console.log("productListPag.stock");
        console.log(saleListPag.stock);
        setPageCount(saleListPag.meta.totalPages);
        console.log(active);
        setSaleList(saleListPag.data)
        
        
        
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
      {saleList.map((sale,index) => (
        <ListGroup.Item
          key={sale.id}
          as="li"
          className="d-flex "
          onClick={()=>{
            console.log(sale);
            props.setSelectedSale(sale);
            props.setActiveTab("sale_detail")            
            
          }}
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{index+1}</small>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>Продажа id: {sale.id}</small>
              <h6 className='m-0 p-0'>{sale.user.username}</h6>
              <h6 className='ms-2 m-0 p-0'>{sale.customer.username}</h6>
            </div>
            <div className='d-flex ms-auto'>
              
            
            <Col className="col-auto">
             {sale.discount > 0 &&
              <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0 text-nowrap'>Скидка {sale.discount.toLocaleString("uz")} So'm</small>
             }
            </Col>
            
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0 text-nowrap'>{sale.items.length} x</small>
           
           
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0 text-nowrap'>{sale.items[0].warehouse.name}</small>
           
            
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0 text-nowrap'>{sale.total.toLocaleString("uz")} So'm</small>
            
           
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0 text-nowrap'>{
            
             new Date( sale.date).toLocaleString("UZ")
            }</small>
            
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


export {SaleListGroup}
