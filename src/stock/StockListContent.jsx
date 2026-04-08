
import { ListGroup,Button ,Dropdown,Modal,Form,Spinner,ProgressBar, Col} from "react-bootstrap";

import { useEffect, useState,useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import {   addStock, deleteStock,  getAllStockPaginationSearch, getAllWareHouse, updateStock } from "./StockApi";

import ellipsis from "../assets/ellipsis.png"
//import "./customer.css"




function StockListGroup(props) {
 
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showResTitle, setShowResTitle] = useState("Success");
  const [showLoadTitle, setShowLoadTitle] = useState("Загрузка...");
  const [showResAlert, setShowResAlert] = useState(false);

  const [name,setName]=useState("");
  const [barCode,setBarcode]=useState("");
  const [price,setPrice]=useState("");
  const [bulkPrice,setBulkPrice]=useState("");
  const [buyPrice,setBuyPrice]=useState("");

  const [showStockAlert, setShowStockAlert] = useState(false);
  const [quantity,setQuantity]=useState("");
  
 

  //const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 
  const [debouncedSearch, setDebouncedSearch] = useState("");


  const fileInputRef=useRef(null);
  const [sid, setSid] = useState(-1);
  const [pid, setPid] = useState(-1);


  const [productList,setProductList] = useState([]); 
  const [pageCount,setPageCount] = useState(0);

   const [wareHouseList,setWareHouseList] = useState([]);
   const [wareHouseName,setWareHouseName] = useState("");
   const [wareHouseId,setWareHouseId] = useState(-1);
  

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
        const productListPag= await getAllStockPaginationSearch(active,10,debouncedSearch);
        const wareHouseListResult = await getAllWareHouse();
        setWareHouseList(wareHouseListResult)
        
        console.log("productListPag.stock");
        console.log(productListPag.stock);
        console.log(productListPag);
        setPageCount(productListPag.meta.totalPages);
        console.log(active);
        setProductList(productListPag.data);
        setShowLoad(false)
        
        
      }catch(error){
          console.log(error.message);
          setShowLoad(false)
          
      }
    }

    
      if (props.activeTab === "home") {
        loadAllUserPag();
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
        <ListGroup as="ol"  className="rounded overflow-hidden">
      {productList.map((stock,index) => (
        <ListGroup.Item
          key={stock.id}
          as="li"
          className="d-flex "
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{index+1}</small>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{stock.id}</small>
              <h6 className='m-0 p-0'>{stock.product.name}</h6>
              
            </div>
            <div className='d-flex ms-auto'>
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{stock.user?.username}</small>
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{stock.user?.surname}</small>
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{stock.user?.email}</small>
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{stock.product.barCode}</small>
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{stock.warehouse.name}</small>
            <small className='ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{stock.quantity} {stock.product.unit}</small>
            
           
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0'>{
            
             new Date( stock.date).toLocaleString("UZ")
            }</small>
            
            </div>
          </div>
          <div className='d-flex ms-3'>
          
           <Dropdown>
            <Dropdown.Toggle as="div" className="bg-dark-subtle px-3 rounded" style={{ cursor: 'pointer' }}>
              Опции  
            </Dropdown.Toggle>

            <Dropdown.Menu 
              className="my-dropdown" 
              align="end" 
              //popperConfig={{ strategy: 'fixed' }}
              //flip={true} // 🔥 Mana shu qator menyuni overflow-dan qutqaradi
            >
              
              <Dropdown.Item  disabled={stock.stock && stock.stock.length > 0} onClick={() => { 
                setShowStockAlert(true); 
                setSid(stock.id); 
                setPid(stock.product.id);
                setWareHouseId(stock.warehouse.id);
                setWareHouseName(stock.warehouse.name);
                setQuantity(stock.quantity)
                }}>
                 Изменить
              </Dropdown.Item>
              
              <Dropdown.Item onClick={() => {
                 setShowDel(true); 
                 setSid(stock.id);
                 setPid(stock.product.id);
                  }}>
                Удалить
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          

            {/* <Button variant='secondary p-0 px-3' style={{fontSize:"12px"}} className=''>Изменить</Button>
            <Button variant='secondary p-0 px-3 ms-2'  style={{fontSize:"12px"}} className=''>Удалить</Button> */}
          </div>
          
                </ListGroup.Item>
              ))}
      </ListGroup>

       <div className="mt-4">
         <Pagination>{items}</Pagination>
              
       </div>



           {
            //Edit
            }
           
            <Modal show={showStockAlert} onHide={() => setShowStockAlert(false)} centered>
                <Modal.Header closeButton>
                <Modal.Title>Редактировать</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <small>Остаток</small>
                     <Form.Control className="mt-2" type="text" placeholder="Введите остаток"
                        value={quantity}
                        onChange={(e)=>{setQuantity(e.target.value)}}
                        />

                        <Dropdown className="my-2">
                        <Dropdown.Toggle variant="light w-100 d-flex align-items-center justify-content-between py-0 ps-0 pe-2" id="dropdown-basic">
                      
                        <Form.Control className='me- me-2' value={wareHouseName}   type="text" placeholder="Выберите Склад" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu align="end" className="mt-1 w-100">
                        
                           {wareHouseList && 
                           
                           wareHouseList.map(wareHouse => (

                            <div>
                               <Dropdown.Item
                              
                              onClick={() => {
                                  setWareHouseName(wareHouse.name)
                                  setWareHouseId(wareHouse.id)

                              }}
                            >
                              {wareHouse.name}
                            </Dropdown.Item>

                            
                            </div>
                           ))
                           
                           }
                          
                        </Dropdown.Menu>
                      </Dropdown>
                        

                       
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" 
                onClick={() => setShowStockAlert(false)}>
                   Отмена
                </Button>
                <Button variant="warning" 
                 onClick={async()=>{
                 setShowResAlert(false)
                 //await updateCategory(cid,categoryName,categoryNameUZ,categoryNameEN,fileInputRef.current.files[0]);
                 //let result = await addCategory(categoryName,fileInputRef.current.files[0]);
                 setShowEdit(false)                 
                 setShowLoad(true)
                 setShowLoadTitle("Загрузка...")
                 const res = await updateStock(sid,pid,wareHouseId,Number(quantity))
                 const data= await res.json();
                 setShowLoad(false);
                 setShowStockAlert(false);
                 
                 
                 if(!res.ok){
                  setShowResAlert(false)
                  setShowResTitle(data.message)
                 }else{
                  setShowResAlert(true)
                  setShowResTitle("Остаток успешно добавлен")
                 
                } 
                
                setShowRes(true);
                const timer = setTimeout(() => {
                  setShowRes(false);

                }, 1000);
                return () => clearTimeout(timer);
                
                 
                }}
                >
                    Сохранять
                </Button>
                </Modal.Footer>
            </Modal>
            {
            //delete
            }

            <Modal show={showDel} onHide={() => setShowDel(false)} centered>
                        <Modal.Header closeButton>
                        <Modal.Title>Удалить</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Вы уверены, что хотите его удалить?</Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDel(false)}>
                            Отмена
                        </Button>
                        <Button variant="danger" 
                        onClick={ async ()=>{
                          setShowResAlert(false)
                          setShowLoadTitle("Загрузка...")
                          setShowDel(false);
                          setShowLoad(true);                         
                          
                          const res = await deleteStock(sid);
                          const deleteResponse = await res.json();
                          console.log(deleteResponse.message); 

                          if(!res.ok){
                              setShowResAlert(false)
                          }else{
                              setShowResAlert(true)
                          }
                           setTimeout(() => {
                            console.log("log");
                            setShowDel(false);
                          }, 500);   
                          
                          setTimeout(() => {
                            console.log("log");
                            setShowLoadTitle("Почти готово")
                          }, 1000);   
                          
                          

                           setTimeout(() => {
                            setShowLoad(false);
                            setShowResTitle(deleteResponse.message)
                            setShowRes(true);
                          }, 2000);
                          
                          //window.location.reload();
                        }
                }>
                    Удалить
                </Button>
                </Modal.Footer>
            </Modal>

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


export {StockListGroup}
