
import { useState } from "react";
import { Col, ListGroup,Row ,Button,Modal,Form} from "react-bootstrap"
import { addNewPayment } from "./PurchaseApi";


function SaleDetailScreen(props){

    const [showDebtEdit, setShowDebtEdit] = useState(false);
    const [debtAmount,setDebtAmount]=useState("");
    

    const totalPayed = props.selectedSale?.payments.reduce(
        (sum,item) => sum+item.amount,0
    )

    const paymentIcons = {
    "Наличные": "💵",
    "Банковская карта": "🏦",
    "В долг": "🟥",
    "Click": "💳",
    "Payme": "💳",
    "Uzum": "💷",
    };

    return(
        <div>
            <div className="d-flex">
                <h6 className="m-0 p-0 bg-dark-subtlex px-2 py-1 rounded m-0">
                #️⃣ Приход id: {props.selectedSale?.id}
                </h6>
            </div>

            <Row className="g-2">
                <Col>
                 <ListGroup>
                    <small className="my-2">Владелец</small>
                    <ListGroup.Item>Имя: 👨🏻‍💻 {props.selectedSale?.user.username} {props.selectedSale?.user.surname} </ListGroup.Item>
                    <ListGroup.Item>Email: ✉️ {props.selectedSale?.user.email} </ListGroup.Item>
                    <ListGroup.Item>Телефон номер: 📱 {props.selectedSale?.user.phone}</ListGroup.Item>
                    <ListGroup.Item>Дата и время: 🕗 {new Date(props.selectedSale?.date).toLocaleString("uz")}</ListGroup.Item>                    
               </ListGroup>
                <ListGroup className="mt-2">
                    <small className="my-2">Клиент</small>
                    <ListGroup.Item>Имя: 🙎🏻‍♂️ {props.selectedSale?.customer.username} {props.selectedSale?.customer.surname} </ListGroup.Item>
                    <ListGroup.Item>Телефон номер: 📱 {props.selectedSale?.user.phone}</ListGroup.Item>
                               
               </ListGroup>
                </Col>
                <Col>

                 <ListGroup className="mb-2">
                    <small className="my-2">Список продуктов</small>
                    {
                        props.selectedSale?.items.map((item,index) => {

                            return <>
                                <ListGroup.Item>{index+1}:📦 {item.product.name} <small className="ms-2 m-0 p-0 bg-success-subtlex px-2 rounded mt-0 text-nowrap"> 🏭 {item.warehouse.name}</small>   {item.quantity}x 💵 {item.price.toLocaleString("uz")} So'm  {item.checkPrice ? "🫂 Оптом цена" :""}</ListGroup.Item>

                                </> 
                        })
                    }                   
               </ListGroup>
               <small className="mt-3">Сумма</small>
               <ListGroup className="mt-2">
                    
                    {
                        props.selectedSale?.payments.map((item,index) => {

                            return (<>                                                          
                                {/* <ListGroup.Item className={`${item.method==="В долг" ? "bg-danger": ""}`}>Способ оплаты: {item.method}  </ListGroup.Item>  */}
                                <ListGroup.Item className={`${item.method==="В долг" ? "bg-danger text-white": ""}`} ><div className="d-flex justify-content-center align-items-center">Оплачено: 💸 {item.amount.toLocaleString("uz")} So'm  Способ оплаты: {paymentIcons[item.method.trim()]} {item.method}  <small className="ms-auto">🕗 {new Date(item.date).toLocaleString("uz")}</small></div></ListGroup.Item>                                 
                               </>  
                               )
                        })
                    } 
                    <ListGroup.Item>Скидка: 💸{props.selectedSale?.discount.toLocaleString("uz")}  So'm </ListGroup.Item>                   
                    <ListGroup.Item className={`${props.selectedSale.total<=totalPayed+props.selectedSale.discount ? "bg-primary text-white": "bg-danger text-white"}`}>Общая стоимость продажи: 💵 {props.selectedSale.total.toLocaleString("uz")} So'm  </ListGroup.Item>                   
               </ListGroup>
               
               {props.selectedSale.total>totalPayed+props.selectedSale.discount &&
                    <Col className="d-grid mt-2">        
                        <Button  variant="danger"
                        onClick={(e)=>{
                            //props.handleLogin(e);   // ✅ event berildi
                            //props.clickLogin(e, login, password);
                            setShowDebtEdit(true)
                            setDebtAmount(props.selectedSale.total-(totalPayed+props.selectedSale.discount))
                        }}
                        >
                        Оплата долга
                        </Button>     
                        </Col>
               }
               

                </Col>


               {
            //Edit
            }
           
            <Modal show={showDebtEdit} onHide={() => setShowDebtEdit(false)} centered>
                <Modal.Header closeButton>
                <Modal.Title>Редактировать</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <small>Долг</small>
                     <Form.Control className="mt-2" type="text" placeholder="Введите долг"
                        value={debtAmount}
                        onChange={(e)=>{setDebtAmount(e.target.value)}}
                        />
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" 
                onClick={() => setShowDebtEdit(false)}>
                   Отмена
                </Button>
                <Button variant="warning" 
                 onClick={async()=>{                 
                 
                 const res = await addNewPayment(props.selectedSale?.id,"В долг",Number(debtAmount))
                 const data= await res.json();
                 
                 setShowDebtEdit(false);                 
                 
                 if(!res.ok){
                  console.log("good job");
                  
                  
                 }else{
                
                 props.setActiveTab("home");                 
                 
                } 
                
                }}
                >
                    Сохранять
                </Button>
                </Modal.Footer>
            </Modal>


            </Row>
        </div>
        
    )
}



export {SaleDetailScreen}