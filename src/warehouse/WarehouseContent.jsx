import Table from 'react-bootstrap/Table';
import { Button,Col,Row,InputGroup,Collapse,Dropdown,DropdownButton,Modal,Spinner,ProgressBar} from "react-bootstrap";

import Alert from 'react-bootstrap/Alert';
//import "./warehouse.css"

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

import eyewhite from "../assets/eye.png"



import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { useEffect, useState } from 'react';
import { addWareHouse, deleteWareHouse, getAllWareHouse, updateWareHouse } from './WareHouseApi';
import { AlertDismissibleDanger, AlertDismissibleSuccess, ProgressDismissible } from '../utils/UtilsContent';







function WarehouseListGroup(props) {


  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showRes, setShowRes] = useState(false);
  const [showResTitle, setShowResTitle] = useState("Success");
  const [showLoadTitle, setShowLoadTitle] = useState("Загрузка...");
  const [showResTypeAlert, setShowResTypeAlert] = useState(false);

  const [wid, setWid] = useState(-1);
  const [wName,setWname]=useState("");
  const [weight,setWeight]=useState("");
  


  const [wList,setWlist] = useState([]);

   useEffect(()=>{
    const handleWareHouse = async ()=>{
    try{

      const res = await getAllWareHouse();

      if(!res.ok){
        console.log(res);
        
      }else{
        console.log(res);
        const result = await res.json();
        console.log(result);
        
        console.log("wlist");
        setWlist(result)       
        
      }
    }catch(error){
      console.log(error.message);      
    }
   };
   handleWareHouse()
   },[props.activeTab,showResTypeAlert])






  return (
   <div>
     <ListGroup as="ol"  className="rounded overflow-autox">
      { wList &&
        wList.map((whouse) => (
        <ListGroup.Item
          key={whouse.id}
          as="li"
          className="d-flex "
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{whouse.id}</small>
              <h6 className='m-0 p-0'>{whouse.name}</h6>
              
            </div>
            <div className='d-flex ms-auto'>
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{whouse.weight}</small>
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0 ms-2'>{new Date(whouse.date).toLocaleString("uz")}</small>
            
            
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
              <Dropdown.Item onClick={() => { 
                 setShowEdit(true);
                 setWid(whouse.id);
                 setWname(whouse.name);
                 setWeight(whouse.weight);  
                }}>
                Изменить
              </Dropdown.Item>
              <Dropdown.Item onClick={() => { 
                setShowDel(true); 
                setWid(whouse.id);
                 }}>
                Удалить
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          

            
          </div>
          
        </ListGroup.Item>
      ))}
    </ListGroup>



      {
            //Edit
            }
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                <Modal.Title>Редактировать</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <small>Название категории</small>
                     <Form.Control className="mt-2" type="text" placeholder="Введите имя"
                        value={wName}
                        onChange={(e)=>{setWname(e.target.value)}}
                        />
                        <Form.Control className="mt-2" type="text" placeholder="Введите обем"
                        value={weight}
                        onChange={(e)=>{setWeight(e.target.value)}}
                        />
                       
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" 
                onClick={() => setShowEdit(false)}>
                   Отмена
                </Button>
                <Button variant="warning" 
                 onClick={async()=>{
                 setShowResTypeAlert(false)
                 //await updateCategory(cid,categoryName,categoryNameUZ,categoryNameEN,fileInputRef.current.files[0]);
                 //let result = await addCategory(categoryName,fileInputRef.current.files[0]);
                 setShowEdit(false)                 
                 setShowLoad(true)
                 setShowLoadTitle("Загрузка...")
                 const res = await updateWareHouse(wid,wName,weight)
                 const data= await res.json();
                 setShowLoad(false);
                 
                 
                 if(!res.ok){
                  setShowResTypeAlert(false)
                  setShowResTitle(data.message)
                 }else{
                  setShowResTypeAlert(true)
                  setShowResTitle("Склад успешно обновлён")
                 
                } 
                
                setShowRes(true);
                const timer = setTimeout(() => {
                  //setShowRes(false);

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
                          setShowResTypeAlert(false)
                          setShowLoadTitle("Загрузка...")
                          setShowDel(false);
                          setShowLoad(true);                         
                          
                          const res = await deleteWareHouse(wid);
                          const deleteResponse = await res.json();
                          console.log(deleteResponse.message); 

                          if(!res.ok){
                              setShowResTypeAlert(false)
                          }else{
                              setShowResTypeAlert(true)
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
                          
                          
                          <Modal.Body className={`mx-auto alert alert-${showResTypeAlert ? "success" : "danger"} w-100 mt-2`}>{showResTitle}</Modal.Body>
                          
                          
                        </div>

                        
            </Modal>
   </div>
  );
}





function WareHouseAdd(props){

  const [wname,setWname] = useState("")
  const [weight,setWeight] = useState("")



  const [pshow, psetShow] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

   const handleWareHouse = async (name,weight)=>{

    try{
      psetShow(true)
      setShowDanger(false)
      setShowSuccess(false);
      const res = await addWareHouse(name,weight);
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
        props.tabChange("home")
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


   };



    return(
        <div className=''>
           <Col className="w-100">
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
                               
                          </Col>
            <Form className="">

      <Form.Group className="mb-2" controlId="formBasicEmail">
      
        
        <Form.Control className="" type="text"
        value={wname}
        onChange={(e) => setWname(e.target.value)}
        placeholder="Введите имя" />

        <Form.Control className="mt-2" 
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="Введите обем"/>
        
      </Form.Group>

      
      <Col className="d-grid">        
        <Button variant="primary" 
        onClick={(e)=>{
          e.preventDefault()
          handleWareHouse(wname,weight)
        }}>
          Сохранить
        </Button>     
        </Col>
      
             </Form>
        </div>
    )
}

function WareHouseTab() {

  const [activeTab,setActiveTab] =useState("home")
  return (
    <Tabs
      //defaultActiveKey="home"
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      id="fill-tab-example"
      className="mb-3 "
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список складов">
         <WarehouseListGroup activeTab={activeTab}></WarehouseListGroup>
      </Tab>
      <Tab eventKey="profile" title="Добавить новый склад">
        <div className='d-flex align-items-center justify-content-start'>
        <Col xs={4}>
        <WareHouseAdd tabChange={(tname)=>{
          setActiveTab(tname);
        }}></WareHouseAdd>
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






function WareHouseScreen() {
  return (
   <div>
    <WareHouseTab></WareHouseTab>
   
   </div>
   
  );
}


export default WareHouseScreen;