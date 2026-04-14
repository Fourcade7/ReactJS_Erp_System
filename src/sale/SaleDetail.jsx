
import { Col, ListGroup,Row } from "react-bootstrap"

function SaleDetailScreen(props){


    const totalPayed = props.selectedSale?.payments.reduce(
        (sum,item) => sum+item.amount,0
    )

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
                    <ListGroup.Item>Имя: {props.selectedSale?.user.username} {props.selectedSale?.user.surname} </ListGroup.Item>
                    <ListGroup.Item>Email: {props.selectedSale?.user.email} </ListGroup.Item>
                    <ListGroup.Item>Телефон номер: {props.selectedSale?.user.phone}</ListGroup.Item>
                    <ListGroup.Item>{new Date(props.selectedSale?.date).toLocaleString("uz")}</ListGroup.Item>                    
               </ListGroup>
                <ListGroup className="mt-2">
                    <small className="my-2">Клиент</small>
                    <ListGroup.Item>Имя: {props.selectedSale?.customer.username} {props.selectedSale?.customer.surname} </ListGroup.Item>
                    <ListGroup.Item>Телефон номер: {props.selectedSale?.user.phone}</ListGroup.Item>
                               
               </ListGroup>
                </Col>
                <Col>

                 <ListGroup className="mb-2">
                    <small className="my-2">Список продуктов</small>
                    {
                        props.selectedSale?.items.map((item,index) => {

                            return <>
                                <ListGroup.Item>{index+1}: {item.product.name} {item.warehouse.name}  {item.quantity}x {item.price.toLocaleString("uz")} So'm</ListGroup.Item>

                                </> 
                        })
                    }                   
               </ListGroup>
               <small className="mt-3">Сумма</small>
               <ListGroup className="mt-2">
                    
                    {
                        props.selectedSale?.payments.map((item,index) => {

                            return (<>                                                          
                                <ListGroup.Item>Способ оплаты: {item.method}  </ListGroup.Item> 
                                <ListGroup.Item  >Оплачено: {item.amount.toLocaleString("uz")} So'm  </ListGroup.Item>                                 
                               </>  
                               )
                        })
                    } 
                    <ListGroup.Item>Скидка: {props.selectedSale.discount.toLocaleString("uz")}  So'm </ListGroup.Item>                   
                    <ListGroup.Item className={`${props.selectedSale.total<totalPayed ? "bg-danger": "bg-primary"}`}>Общая стоимость продажи: {props.selectedSale.total.toLocaleString("uz")} So'm  </ListGroup.Item>                   
               </ListGroup>

                </Col>
            </Row>
        </div>
        
    )
}



export {SaleDetailScreen}