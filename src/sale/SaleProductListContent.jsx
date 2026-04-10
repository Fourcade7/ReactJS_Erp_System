
import { ListGroup,Button ,Dropdown,Modal,Form,Spinner,ProgressBar, Col} from "react-bootstrap";

import { useEffect, useState,useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import {   addStock, deleteProduct, getAllProductPaginationSearch, getAllWareHouse, updateProduct } from "./SaleApi";

import ellipsis from "../assets/ellipsis.png"
//import "./customer.css"




function SaleProductListGroup(props) {
 
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
  const [pid, setPid] = useState(-1);


  const [productList,setProductList] = useState([]); 
  //const [orderList,setOrderList] = useState([]); 

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
        const productListPag= await getAllProductPaginationSearch(active,20,debouncedSearch);
        const wareHouseListResult = await getAllWareHouse();
        setWareHouseList(wareHouseListResult);
        
        console.log("productListPag.stock");
        console.log(productListPag.stock);
        setPageCount(productListPag.meta.totalPages);
        console.log(active);
        setProductList(productListPag.data)
        setShowLoad(false)
        
        
      }catch(error){
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
       
      productList.filter(p =>(p.stock.length>0)).map((product,index) => (
        <ListGroup.Item
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
                        if (item.quantity >= stockQty) {
                          console.log("Stock yetarli emas");
                          return item; // oshirmaydi
                        }

                        return {
                          ...item,
                          quantity: item.quantity + 1
                        };
                      }
                      return item;
                    });
                  }

                  // ❗ yangi qo‘shishda ham tekshir
                  if (stockQty <= 0) {
                    console.log("Stock yo‘q");
                    return prev;
                  }

                  return [
                    ...prev,
                    {
                      ...product,
                      quantity: 1
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
              <small className={`m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap ${product.stock[0]?.quantity <10 ? "text-danger": null}`}>{product.stock[0]?.quantity} {product.unit}</small>            
              <small className='m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap text-center'>{product.stock[0]?.warehouse.name}</small>            

            </div>
             
            <div className='d-flex flex-column ms-2'>
            <small className='ms-0 m-0 p-0 bg-primary-subtle px-2 rounded mt-1 text-nowrap'>{product.buyPrice.toLocaleString("uz")} So'm</small>            
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-1 text-nowrap'>{product.category.name}</small>
            
            </div>
           
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
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                <Modal.Title>Редактировать</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <small>Название продукт</small>
                     <Form.Control className="mt-2" type="text" placeholder="Введите имя"
                        value={name}
                        onChange={(e)=>{setName(e.target.value)}}
                        />
                        <Form.Control className="mt-2" type="text" placeholder="Введите штрих код"
                        value={barCode}
                        onChange={(e)=>{setBarcode(e.target.value)}}
                        />
                        <Form.Control className="mt-2" type="text" placeholder="Введите сумма"
                        value={price}
                        onChange={(e)=>{setPrice(e.target.value)}}
                        />

                        <Form.Control className="mt-2" type="text" placeholder="Введите оптом сумма"
                        value={bulkPrice}
                        onChange={(e)=>{setBulkPrice(e.target.value)}}
                        />

                        <Form.Control className="mt-2" type="text" placeholder="Введите продажа сумма"
                        value={buyPrice}
                        onChange={(e)=>{setBuyPrice(e.target.value)}}
                        />

                       
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" 
                onClick={() => setShowEdit(false)}>
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
                 const res = await updateProduct(pid,name,barCode,Number(price),Number(bulkPrice),Number(buyPrice))
                 const data= await res.json();
                 setShowLoad(false);
                 
                 
                 if(!res.ok){
                  setShowResAlert(false)
                  setShowResTitle(data.message)
                 }else{
                  setShowResAlert(true)
                  setShowResTitle("Сотрудник успешно обновлён")
                 
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
            //Stock add
            }
            <Modal show={showStockAlert} onHide={() => setShowStockAlert(false)} centered>
                <Modal.Header closeButton>
                <Modal.Title>Добавить начальный остаток</Modal.Title>
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
                <Button variant="primary" 
                 onClick={async()=>{
                 setShowResAlert(false)
                 //await updateCategory(cid,categoryName,categoryNameUZ,categoryNameEN,fileInputRef.current.files[0]);
                 //let result = await addCategory(categoryName,fileInputRef.current.files[0]);
                 setShowEdit(false)                 
                 setShowLoad(true)
                 setShowLoadTitle("Загрузка...")
                 const res = await addStock(pid,wareHouseId,Number(localStorage.getItem("userid")),Number(quantity))
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
                          
                          const res = await deleteProduct(pid);
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


export {SaleProductListGroup}
