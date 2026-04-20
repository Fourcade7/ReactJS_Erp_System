import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logoblack from "../assets/logoblack.png"
import { useNavigate } from 'react-router-dom';


function NavbarScreen() {
  const navigate = useNavigate();
  return (
    <Navbar expand="lg" className="bg-body-tertiary sticky-top" style={{ zIndex: 1030 }}>
      <Container fluid>
        {/* <img src={logoblack} width={40} height={40} alt="" /> */}
        <Nav.Link href="#link" className='ms-3'>  🆔 Главная страница</Nav.Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#home">Поддержка</Nav.Link>
            <Nav.Link href="#link">Планы</Nav.Link>
            <NavDropdown title={ `🙍🏻‍♂️ ${localStorage.getItem("username")} ${localStorage.getItem("surname")}` } id="basic-nav-dropdown"
            align="end"
            >
             
              <NavDropdown.Item href=""
              onClick={()=>{
                localStorage.clear();
                navigate("/login");
              }}
              >
               ❌ Выйти

              </NavDropdown.Item> 
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
function NavbarScreenFourAuth() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary sticky-top">
      <Container>
        {/* <Navbar.Brand className='' href="#home">Главная страница</Navbar.Brand> */}
        <img src={logoblack} width={40} height={40} alt="" />
        <Nav.Link href="#link">ID Group</Nav.Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            
            <Nav.Link  href="/register">Регистрация</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export {NavbarScreenFourAuth,NavbarScreen};