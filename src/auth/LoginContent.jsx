import { Button,Col,Row,Nav} from "react-bootstrap";
import NavbarScreen from "../navbar/NavbarContent";



import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

function LoginForm() {
  return (
    <Form className="">
      <Form.Group className="mb-3" controlId="formBasicEmail">
         <small style={{fontSize:"12px"}}>Thisis small text</small>
        <Form.Control type="email" placeholder="Enter email" />
        <Form.Text className="text-muted">
         <small> We'll never share your email with anyone else.</small>
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>
            <small>Password</small>
        </Form.Label>
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicCheckbox">
        <Form.Check type="checkbox" label="Check me out" />
      </Form.Group>
      <Row className="gx-1 align-items-center">
        <Col className="d-grid justify-content-center">     
        
        <Link to={"/home"}>Registration</Link>
     
        </Col>
        <Col className="d-grid">        
        <Button variant="primary" type="submit">
        Submit
        </Button>     
        </Col>
       
    </Row>
      
    </Form>
  );
}




function LoginScreen(){
    return(

        <div className="vh-100">
            <NavbarScreen ></NavbarScreen>
            <Col className="d-flex align-items-center justify-content-center h-75">
                <Col className="col-12 col-md-4 col-lg-4 col-sm-12">
                <LoginForm></LoginForm>
                </Col>
            </Col>
        </div>
    )
}


export default LoginScreen;