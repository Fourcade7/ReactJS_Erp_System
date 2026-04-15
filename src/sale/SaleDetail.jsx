
import { Col, ListGroup,Row ,Button} from "react-bootstrap"

function SaleDetailScreen(props){


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
                <h6 className="m-0 p-0 bg-dark-subtle px-2 py-1 rounded m-0">
                Продажа id: {props.selectedSale?.id}
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
                                <ListGroup.Item>{index+1}:📦 {item.product.name} <small className="ms-2 m-0 p-0 bg-success-subtle px-2 rounded mt-0 text-nowrap">{item.warehouse.name}</small>   {item.quantity}x 💵 {item.price.toLocaleString("uz")} So'm  {item.checkPrice ? "🫂 Оптом цена" :""}</ListGroup.Item>

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
                                <ListGroup.Item className={`${item.method==="В долг" ? "bg-danger": ""}`} >Оплачено: 💸 {item.amount.toLocaleString("uz")} So'm  Способ оплаты: {paymentIcons[item.method.trim()]} {item.method}</ListGroup.Item>                                 
                               </>  
                               )
                        })
                    } 
                    <ListGroup.Item>Скидка: 💸{props.selectedSale.discount.toLocaleString("uz")}  So'm </ListGroup.Item>                   
                    <ListGroup.Item className={`${props.selectedSale.total<=totalPayed+props.selectedSale.discount ? "bg-primary text-white": "bg-danger text-white"}`}>Общая стоимость продажи: 💵 {props.selectedSale.total.toLocaleString("uz")} So'm  </ListGroup.Item>                   
               </ListGroup>
               
               {props.selectedSale.total<totalPayed+props.selectedSale.discount &&
                    <Col className="d-grid mt-2">        
                        <Button  variant="danger"
                        onClick={(e)=>{
                            //props.handleLogin(e);   // ✅ event berildi
                            //props.clickLogin(e, login, password);
                        }}
                        >
                        Оплата долга
                        </Button>     
                        </Col>
               }
               

                </Col>
            </Row>
        </div>
        
    )
}



export {SaleDetailScreen}