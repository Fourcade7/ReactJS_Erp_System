
import { ListGroup,Button ,Dropdown,Modal,Form,Spinner,ProgressBar, Col} from "react-bootstrap";

import { useEffect, useState,useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import {   getAllProductPaginationSearch } from "./PurchaseApi";

import ellipsis from "../assets/ellipsis.png"
import CustomPaginationScreen from "../utils/CustomPaginationContent";
//import "./customer.css"




function SaleProductListGroup(props) {
 
  
  const [showLoad, setShowLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showResTitle, setShowResTitle] = useState("Success");
  const [showLoadTitle, setShowLoadTitle] = useState("Загрузка...");
  const [showResAlert, setShowResAlert] = useState(false);

  
  
 

  //const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 
  const [debouncedSearch, setDebouncedSearch] = useState("");



  const [productList,setProductList] = useState([]); 

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
    async function loadAllUserPag() {
      try{
        setShowLoad(true)
        const productListPag= await getAllProductPaginationSearch(active,20,debouncedSearch);
       
        
        //console.log("productListPag.stock");
        //console.log(productListPag.stock);
        setPageCount(productListPag.meta.totalPages);
        //console.log(active);
        setProductList(productListPag.data)
        setShowLoad(false)
        
        
      }catch(error){
          setShowRes(true)
          setShowResTitle("Не удалось подключиться к серверу")
          console.log(error.message);
          setShowLoad(false)
          
      }
    }
    loadAllUserPag();
    
      // if (props.activeTab === "home") {
      //   loadAllUserPag();
      // }
      
  },[active,showResAlert,debouncedSearch])  

  //active,showResAlert,props.activeTab,debouncedSearch



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
  <ListGroup as="ol"  className="rounded overflow-auto" style={{ maxHeight: '60vh' }}>
     
      { productList &&  
       productList
      .filter(p =>(p.stock?.[0]?.id))
      .map((product,index) => {
        
        const totalStock = product.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;
        
        return <ListGroup.Item
          key={product.id}
          as="li"
          className={`d-flex ${index % 2 === 1 ? "bg-light" : "bg-dark-subtle "} p-2`}
          onClick={() => {
                props.setOrderList(prev => {
                  const exists = prev.find(item => item.id === product.id);

                  //const stockQty = product.stock?.[0]?.quantity || 0;
                   const stockQty = product.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;

                  if (exists) {
                    return prev.map(item => {
                      if (item.id === product.id) {

                        // ❗ LIMIT CHECK
                        // if (item.quantity >= stockQty) {
                        //   console.log("Stock yetarli emas");
                        //   return item; // oshirmaydi
                        // }

                        return {
                          ...item,
                          quantity: item.quantity + 1
                        };
                      }
                      return item;
                    });
                  }

                  // ❗ yangi qo‘shishda ham tekshir
                  // if (stockQty <= 0) {
                  //   console.log("Stock yo‘q");
                  //   return prev;
                  // }

                  return [
                    ...prev,
                    {
                      ...product,
                      quantity: 1,
                      checkPrice:false
                    }
                  ];
           });
}}
          
        >
          <div className='d-flex flex-row w-100 '>
            <div>
                <small className={`m-0 p-0 py-1 px-2 rounded mt-0 ${index % 2 === 1 ? "bg-dark-subtle" : "bg-light"}`}>{product.id}</small>
            </div>
            <div className='d-flex flex-column'>
            <h6 className='ms-2 m-0 p-0 text-wrap'>{product.name}</h6>              
              
            <div>
            <small className='ms-0 m-0 p-0 bg-success-subtlex ms-2 rounded mt-1'>{product.barCode}</small>
            <small className='ms-0 m-0 p-0 bg-warning-subtlex ms-2  rounded mt-1'>{product.code}</small>
            
            </div>
            </div>

            <div className="d-flex flex-column  ms-auto ">
              <small className={`m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap ${totalStock <10 ? "text-danger": null}`} >{totalStock} {product.unit}</small>            
              <small className='m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap text-center'>{product.stock?.map(s => s.warehouse?.name).join(", ")}</small>            

            </div>
             
            <div className='d-flex flex-column ms-2'>
            <small className='ms-0 m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap'>{product.price.toLocaleString("uz")} So'm</small>            
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-1 text-nowrap'>{product.category.name}</small>
            
            </div>
           
          </div>
         
          
        </ListGroup.Item>
      }   )}
    </ListGroup>
       <div className="mt-4">
         {/* <Pagination>{items}</Pagination> */}
          <CustomPaginationScreen
          active={active}
          pageCount={pageCount}
          setActive={setActive}
         ></CustomPaginationScreen>
              
       </div>



          

            {
             //Loading
            }

            <Modal show={showLoad} onHide={() => setShowLoad(false)} centered>
                        <Modal.Header closeButton>
                        <Modal.Title>{showLoadTitle}</Modal.Title>
                        </Modal.Header>
                        
                        <div className="d-flex flex-column mx-4"> 
                          
                          <Spinner className="mx-auto mt-3" animation="border" variant="primary" />
                          <Modal.Body className="mx-auto">Пожалуйста, подождите</Modal.Body>
                          <ProgressBar  className="my-3" animated variant="primary" now={100} />
                          
                        </div>

                        
            </Modal>

            {
             //Success
            }

            <Modal show={showRes} onHide={() => setShowRes(false)} centered>
                        <Modal.Header closeButton>
                      
                        </Modal.Header>
                        
                        <div className="d-flex flex-column mx-4"> 
                          
                          
                          <Modal.Body className={`mx-auto alert alert-${showResAlert ? "success" : "danger"} w-100 mt-2`}>{showResTitle}</Modal.Body>
                          
                          
                        </div>

                        
            </Modal>
    </div>
  );
}


export {SaleProductListGroup}
