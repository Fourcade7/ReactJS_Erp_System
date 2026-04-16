import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import logoblack from "../assets/logoblack.png"


function NavbarScreen() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary sticky-top">
      <Container fluid>
        {/* <img src={logoblack} width={40} height={40} alt="" /> */}
        <Nav.Link href="#link" className='ms-3'>  🆔 Главная страница</Nav.Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#home">Поддержка</Nav.Link>
            <Nav.Link href="#link">Планы</Nav.Link>
            <NavDropdown title={ `🙍🏻‍♂️ ${localStorage.getItem("username")}` } id="basic-nav-dropdown"
            align="end"
            >
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.  3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
               ❌ Separated link
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