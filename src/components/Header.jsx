import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Form, Button, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faGlobe, faUserCircle, faRightFromBracket, faReceipt, faMoneyBillTransfer } from '@fortawesome/free-solid-svg-icons';
import logo_Bob from '../assets/logo_Bob.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../store/userSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.user);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Navbar bg="warning" variant="light" expand="lg" className="py-2">
      <div className="container-fluid">
        <Navbar.Brand href="#" className="fw-bold logobob" style={{marginLeft: '10px'}}>
          <img src={logo_Bob} alt="BobApp Logo" className="me-2" />
        </Navbar.Brand>
        
        {/* <div className="d-flex align-items-center w-50">
          <InputGroup>
            <Form.Control
              type="search"
              placeholder="Search..."
              className="border-0"
              aria-label="Search"
            />
            <InputGroup.Text className='bg-light'>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#FF7043' }} />
            </InputGroup.Text>
          </InputGroup>
        </div> */}

        <div className="d-flex align-items-center">
          {/* <Button variant="link" className="me-2" style={{ color: '#fff' }}>
            <FontAwesomeIcon icon={faGlobe} size="lg" />
          </Button> */}
          {/* <Button variant="link" className="me-2" style={{ color: '#fff' }}>
            <FontAwesomeIcon icon={faBell} size="lg" />
          </Button> */}
          {/* {(user?.role === 'admin' || user?.role === 'Admin') && (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-payments">Payments</Tooltip>}
            >
              <Button variant="link" className="me-2" style={{ color: '#fff' }} onClick={() => navigate('/payments')}>
                <FontAwesomeIcon icon={faMoneyBillTransfer} size="lg" />
              </Button>
            </OverlayTrigger>
          )} */}
          

          {/* User Profile Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-payments">Profile</Tooltip>}
            >
              <FontAwesomeIcon
                icon={faUserCircle}
                size="2x"
                style={{ color: '#fff', cursor: "pointer" }}
                onClick={toggleDropdown}
              />
            </OverlayTrigger>

            {showDropdown && (
              <div
                className="position-absolute end-0 mt-2 p-2 bg-white border rounded shadow"
                style={{ minWidth: "200px", zIndex: 1000 }}
              >
                <p className="mb-1 fw-bold">{user?.name}</p>
                <p className="mb-0 text-muted">{user?.role === "L1" || user?.role === "L2"
                  ? `${user.role} Approver`
                  : user?.role}</p>
                  <hr className="my-2" />
 
                <p onClick={() => {dispatch(clearUser()); navigate('/login');}} style={{cursor: 'pointer', margin: 0}}>Logout</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Header;
