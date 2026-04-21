



import Table from 'react-bootstrap/Table';
import { Button,Col,Row,InputGroup,Collapse,Dropdown,Spinner,ProgressBar} from "react-bootstrap";

import Alert from 'react-bootstrap/Alert';


import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import eyewhite from "../assets/eye.png"



import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { useState , useEffect } from 'react';
import { getAllCategory } from '../category/CategoryApi';
import { addProduct } from './ProductApi';
import { ProductListGroup } from './ProductListContent';
import { AlertDismissibleDanger, AlertDismissibleSuccess, ProgressDismissible } from '../utils/UtilsContent';











function ProductAdd(props){

  const [pshow, psetShow] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);


  const [name,setName] = useState("");
  const [barCode,setBarcode] = useState("");
  const [price,setPrice] = useState("");
  const [bulkPrice,setBulkPrice] = useState("");
  const [buyPrice,setBuyerPrice] = useState("");
  const [categoryName,setCategoryName] = useState("");
  const [categoryId,setCategoryId] = useState(-1);
  const [categoryList,setCategoryList] = useState([]);

   useEffect(()=>{
  const handleWareHouse = async ()=>{
    try{

      const res = await getAllCategory();

      if(!res.ok){
        console.log(res);
        
      }else{
        //console.log(res);
        const result = await res.json();
        //console.log(result);
        
        //console.log("wlist");
        setCategoryList(result)       
        
      }
    }catch(error){
      console.log(error.message);      
    }
   };
   handleWareHouse()
   },[props.activeTab])



   const handleProduct = async ()=>{

      try{
         psetShow(true)
         setShowDanger(false)
        setShowSuccess(false);
        const res =await addProduct(name,barCode,Number(price),Number(bulkPrice),Number(buyPrice),categoryId);
        const result = await res.json();
        if(!res.ok){
        setShowDanger(true)
        setAlertMessage(result.message)
        psetShow(false)
       
      }else{
        setShowSuccess(true);
        psetShow(false)
        setAlertMessage("Успешно...");
        const timer = setTimeout(() => {
        //props.tabChange("home")
        }, 2000);
        return () => clearTimeout(timer); 
       //props.tabChange("home")
      }

      
      console.log(result);
      
    }catch(error){
      setShowDanger(true)
      setAlertMessage("Не удалось подключиться к серверу");
      psetShow(false)
      //props.tabChange("home")
    }

   }

   




    return(
        <div>
            <Form className="mt-">

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

      <Form.Group className="mb-2" controlId="formBasicEmail"
      
      >
      
        
        <Form.Control className="" type="text" placeholder="Введите имя" 
        value={name}
      onChange={(e)=>setName(e.target.value)}
        />
        
      </Form.Group>

     
       <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="text" placeholder="Введите штрих код"
        value={barCode}
      onChange={(e)=>setBarcode(e.target.value)}
        />
        
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        <Form.Control className="" type="text" placeholder="Цена"
        
        value={price}
      onChange={(e)=>setPrice(e.target.value)}/>
        
      </Form.Group>


      <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="text" placeholder="Цена оптом"
        value={bulkPrice}
      onChange={(e)=>setBulkPrice(e.target.value)}
        />
        
      </Form.Group>

       <Form.Group className="mb-2" controlId="formBasicEmail">
       
        
        <Form.Control className="" type="text" placeholder="Цена продажа"
        value={buyPrice}
      onChange={(e)=>setBuyerPrice(e.target.value)}
        />
        
      </Form.Group>

     

    
     <Dropdown className="my-2">
                        <Dropdown.Toggle variant="light w-100 d-flex align-items-center justify-content-between py-0 ps-0 pe-2" id="dropdown-basic">
                      
                        <Form.Control className='me- me-2' value={categoryName}  readOnly  type="text" placeholder="Выберите категория" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu align="end" className="mt-1 w-100">
                        
                           {categoryList && 
                           
                           categoryList.map(category => (

                            <div>
                               <Dropdown.Item
                              
                              onClick={() => {
                                  setCategoryName(category.name)
                                  setCategoryId(category.id)

                              }}
                            >
                              {category.name}
                            </Dropdown.Item>

                            
                            </div>
                           ))
                           
                           }
                          
                        </Dropdown.Menu>
                      </Dropdown>


      
      <Col className="d-grid">        
        <Button variant="primary"
        onClick={(e)=>{
          e.preventDefault();
          handleProduct();
        }}
        >
          Сохранить
        </Button>     
        </Col>
      
    </Form>
        </div>
    )
}

function ProductTab() {

   const [activeTab,setActiveTab] =useState("home")
  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      id="fill-tab-example"
      className="mb-3 mt-"
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список продуктов">
         <ProductListGroup activeTab={activeTab}></ProductListGroup>
      </Tab>
      <Tab eventKey="add_new" title="Добавить новый продукт" disabled={localStorage.getItem("role")==="User"}>
        <div className='d-flex align-items-center justify-content-start'>
        <Col xs={4}>
        <ProductAdd
        activeTab={activeTab}
        tabChange={(tabName)=>{
          setActiveTab(tabName)
        }}
        ></ProductAdd>
        </Col>
        </div>
      </Tab>
      {/* <Tab eventKey="longer-tab" title="Loooonger Tab">
        Tab content for Loooonger Tab
      </Tab>
      <Tab eventKey="contact" title="Contact" disabled>
        Tab content for Contactx
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