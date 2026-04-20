import { NavbarScreen } from "../navbar/NavbarContent";
import LeftTab from "../main/SidebarTabContent";
import {BarChartEdited, ChartLinearEdited} from "./statistics/ChartsContent";
import Card from 'react-bootstrap/Card';
import { Col, Row ,Tab,Tabs,ListGroup,ListGroupItem,Button} from "react-bootstrap";

import { useState,useEffect } from "react";
import { getAllSaleDebt, getAllSaleMonth, getAllSaleToday, getAllSaleWeek } from "./statistics/HomeApi";
import { SaleTabForHome } from "../sale/SaleContent";

function CardScreen(props){

  
  const todaySaleSum = props.todaySaleList.reduce((sum,item)=> sum+item.total,0)
  const weekSaleSum = props.weekSaleList.reduce((sum,item)=> sum+item.total,0)
  const monthSaleSum = props.monthSaleList.reduce((sum,item)=> sum+item.total,0)
  const allSaleDebtSum = props.allSaleDebtList.reduce((sum,item)=> sum+(item.total-item.totalPaid),0)

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
           <h3 className="fw-bold text-danger">{allSaleDebtSum.toLocaleString("uz")} So'm</h3>
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





function HomeScreen(){

  const monthName = new Date().toLocaleString("ru-RU", {
    month: "long",
  });
  const [todaySaleList,setTodaySaleList] = useState([]);
  const [weekSaleList,setWeekSaleList] = useState([]);
  const [monthSaleList,setMonthSaleList] = useState([]);
  const [allSaleDebtList,setAllSaleDebtList] = useState([]);
  
     useEffect(()=>{
      const handleSalesRange = async ()=>{
      try{
  
        const resToday = await getAllSaleToday();
        const resWeek = await getAllSaleWeek();
        const resMonth = await getAllSaleMonth();
        const resDebt = await getAllSaleDebt();
  
        if(!resToday.ok){
          console.log(resToday);
          
        }else{
         
          const resultToday = await resToday.json();
          const resultWeek = await resWeek.json();
          const resultMonth = await resMonth.json();
          const resultDebtAll = await resDebt.json();
        
          setTodaySaleList(resultToday)
          setWeekSaleList(resultWeek); 
          setMonthSaleList(resultMonth); 
          setAllSaleDebtList(resultDebtAll)     
          
        }
      }catch(error){
        console.log(error.message);      
      }
     };
     handleSalesRange()
     },[])




    return(
        <div className="d-flex flex-column  ">
          <CardScreen todaySaleList={todaySaleList} weekSaleList={weekSaleList} monthSaleList={monthSaleList} allSaleDebtList={allSaleDebtList}></CardScreen>
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
        {/* <CustomerListGroup></CustomerListGroup> */}
          
          {/* <SaleListGroupForHome allSaleDebtList={allSaleDebtList}></SaleListGroupForHome> */}
         
          <SaleTabForHome></SaleTabForHome>

          <br />
          <br />
         
        </div>
    )

}



export default HomeScreen;

