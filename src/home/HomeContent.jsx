import { NavbarScreen } from "../navbar/NavbarContent";
import LeftTab from "../main/SidebarTabContent";
import {BarChartEdited, ChartLinearEdited} from "./statistics/ChartsContent";
import Card from 'react-bootstrap/Card';
import { Col, Row ,Tab,Tabs,ListGroup,ListGroupItem,Button} from "react-bootstrap";

import { useState,useEffect } from "react";
import { getAllSaleMonth, getAllSaleToday, getAllSaleWeek } from "./statistics/HomeApi";

function CardScreen(props){

  
  const todaySaleSum = props.todaySaleList.reduce((sum,item)=> sum+item.total,0)
  const weekSaleSum = props.weekSaleList.reduce((sum,item)=> sum+item.total,0)
  const monthSaleSum = props.monthSaleList.reduce((sum,item)=> sum+item.total,0)

  return(
    <div>
      <Row className="g-2">
        <Col>
        <Card>
      <Card.Body>
        <Card.Title>
          <h3 className="fw-bold text-success"> {todaySaleSum.toLocaleString("uz")} So'm</h3>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">31/03/2026</Card.Subtitle>
        <Card.Text>
          Сумма сегодняшних продаж
        </Card.Text>
        
      </Card.Body>
    </Card>
        </Col>

        <Col>
        <Card>
      <Card.Body>
        <Card.Title>
          <h3 className="fw-bold">{weekSaleSum.toLocaleString("uz")} So'm</h3>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">31/03/2026</Card.Subtitle>
        <Card.Text>
          Еженедельная сумма продаж
        </Card.Text>
        
      </Card.Body>
    </Card>
        </Col>

        <Col>
        <Card>
      <Card.Body>
        <Card.Title>
          <h3 className="fw-bold">{monthSaleSum.toLocaleString("uz")} So'm</h3>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">31/03/2026</Card.Subtitle>
        <Card.Text>
         Ежемесячная сумма продаж
        </Card.Text>
        
      </Card.Body>
    </Card>
        </Col>

        <Col>
        <Card>
      <Card.Body>
        <Card.Title>
          <h3 className="fw-bold text-danger">18.000 So'm</h3>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">31/03/2026</Card.Subtitle>
        <Card.Text>
          Сумма продажи долгов
        </Card.Text>
        
      </Card.Body>
    </Card>
        </Col>
      </Row>



    </div>  
  )

}


function CustomerListGroup() {
  const users = [
    {
      id: 1,
      name: "Mark",
      surname: "Otto",
      phone: "998901234567",
      email: "mark@mail.com",
      role: "Admin"
    },
    {
      id: 2,
      name: "Jacob",
      surname: "Thornton",
      phone: "998909876543",
      email: "jacob@mail.com",
      role: "User"
    },
    {
      id: 3,
      name: "Larry",
      surname: "Bird",
      phone: "998907777777",
      email: "larry@mail.com",
      role: "Manager"
    }
  ];

  return (
    <ListGroup as="ol"  className="rounded overflow-hidden">
      {users.map((user) => (
        <ListGroup.Item
          key={user.id}
          as="li"
          className="d-flex "
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{user.id}</small>
              <h6 className='m-0 p-0'>{user.name}</h6>
              <h6 className='ms-2 m-0 p-0'>{user.name}</h6>
            </div>
            <div className='d-flex ms-auto'>
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{user.phone}</small>
            <small className='ms-2 m-0 p-0 bg-warning-subtle px-2 rounded mt-0'>{user.email}</small>
           
            
            </div>
          </div>
          <div className='d-flex ms-5'>
            <Button variant='warning p-0 px-3' style={{fontSize:"12px"}} className=''>Изменить</Button>
            <Button variant='danger p-0 px-3 ms-2'  style={{fontSize:"12px"}} className=''>Удалить</Button>
          </div>
          
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}


function HomeScreen(){

  const monthName = new Date().toLocaleString("ru-RU", {
    month: "long",
  });
  const [todaySaleList,setTodaySaleList] = useState([]);
  const [weekSaleList,setWeekSaleList] = useState([]);
  const [monthSaleList,setMonthSaleList] = useState([]);
  
     useEffect(()=>{
      const handleSalesRange = async ()=>{
      try{
  
        const resToday = await getAllSaleToday();
        const resWeek = await getAllSaleWeek();
        const resMonth = await getAllSaleMonth();
  
        if(!resToday.ok){
          console.log(resToday);
          
        }else{
         
          const resultToday = await resToday.json();
          const resultWeek = await resWeek.json();
          const resultMonth = await resMonth.json();
        
          setTodaySaleList(resultToday)
          setWeekSaleList(resultWeek); 
          setMonthSaleList(resultMonth);      
          
        }
      }catch(error){
        console.log(error.message);      
      }
     };
     handleSalesRange()
     },[])




    return(
        <div className="d-flex flex-column  ">
          <CardScreen todaySaleList={todaySaleList} weekSaleList={weekSaleList} monthSaleList={monthSaleList}></CardScreen>
          <br />
          <small className="mx-auto">{monthName}</small>
          <Row  className="g-2">
             <Col className="col-12 col-lg-8 col-md-12">
            <ChartLinearEdited monthSaleList={monthSaleList}></ChartLinearEdited>
            </Col>
            <Col className="col-12 col-lg-4 col-md-12">
            <BarChartEdited weekSaleList={weekSaleList}></BarChartEdited>
            </Col>
           
            
          </Row>
          <br />

        <h6>Список должников</h6>
        <br />
        {/* <CustomerListGroup></CustomerListGroup> */}
          
          
         
        </div>
    )

}



export default HomeScreen;

