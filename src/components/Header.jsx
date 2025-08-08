import React from 'react';
import { Navbar, Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faGlobe, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import logo_Bob from '../assets/logo_Bob.png';

const Header = () => {
  return (
    <Navbar bg="warning" variant="light" expand="lg" className="py-2">
      <div className="container-fluid">
        <Navbar.Brand href="#" className="fw-bold logobob">
          <img src={logo_Bob} alt="BobApp Logo" className="me-2" />
         
        </Navbar.Brand>
        
        <div className="d-flex align-items-center w-50">
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Search..."
              className="border-0"
              aria-label="Search"
            />
            <Button variant="light">
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </InputGroup>
        </div>

        <div className="d-flex align-items-center">
          <Button variant="link" className="me-2" style={{ color: '#fff' }}>
            <FontAwesomeIcon icon={faGlobe} size="lg" />
          </Button>
          <Button variant="link" className="me-2" style={{ color: '#fff' }}>
            <FontAwesomeIcon icon={faBell} size="lg" />
          </Button>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faUserCircle} size="2x" style={{ color: '#fff' }} />
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Header;
