import { NavbarScreen } from "../navbar/NavbarContent";
import LeftTab from "../main/SidebarTabContent";
import {BarChartEdited, ChartLinearEdited} from "./statistics/ChartsContent";
import Card from 'react-bootstrap/Card';
import { Col, Row ,Tab,Tabs} from "react-bootstrap";



function CardScreen(){


  return(
    <div>
      <Row className="g-2">
        <Col>
        <Card>
      <Card.Body>
        <Card.Title>
          <h1 className="fw-bold text-success">176.000</h1>
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
          <h1 className="fw-bold">213.000</h1>
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
          <h1 className="fw-bold">417.000</h1>
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
          <h1 className="fw-bold text-danger">18.000</h1>
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

function CardImage(){
  return(
    <Card>
        <Card.Img variant="top" className="object-fit-cover" height={200} src="https://static.vecteezy.com/system/resources/previews/032/498/283/non_2x/abstract-spiral-dark-blue-background-free-vector.jpg" />
        <Card.Body>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
        </Card.Body>
      </Card>
  )
}

function HomeTab() {
  return (
    <Tabs
      defaultActiveKey="profile"
      id="fill-tab-example"
      className="mb-3 mt-3"
      //fill
      variant='underline' //pills //tabs //underline
      //style={{fontSize:"12px"}}
    >
      <Tab eventKey="home" title="Список остатков">
         
      </Tab>
      <Tab eventKey="profile" title="Добавить новый остаток">
        <div className='d-flex align-items-center justify-content-center'>
        <Col xs={4}>
        
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


function HomeScreen(){
    return(
        <div className="">
          <CardScreen></CardScreen>
          <br />
          <Row  className="g-2">
            <Col className="col-12 col-lg-8 col-md-12">
            <ChartLinearEdited></ChartLinearEdited>
            </Col>
            <Col className="col-12 col-lg-4 col-md-12">
            <BarChartEdited></BarChartEdited>
            </Col>
          </Row>
          <br />
          
        <HomeTab></HomeTab>
          
          
         
        </div>
    )

}



export default HomeScreen;

