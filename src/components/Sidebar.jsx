import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faFileAlt,
  faBriefcase,
  faUserFriends,
  faQuestionCircle,
  faChevronDown,
  faChevronUp,
  faBuilding,    
  faLightbulb,   
  faMapMarkerAlt,
  faChartLine,
  faPerson,
  faCalendar,   
} from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const menuItems = [
    { icon: faHome, text: 'Dashboard', path: '/dashboard' },
    // { icon: faFileAlt, text: 'Job Requisition', path: '/job-requisition' },
    // { icon: faFileAlt, text: 'Job Creation', path: '/job-creation' },
    { icon: faBriefcase, text: 'Job Postings', path: '/job-postings' },
    { icon: faUserFriends, text: 'Candidate Shortlist', path: '/candidate-shortlist' },
    { icon: faCalendar, text: 'Interviews', path: '/interviews' },
    { icon: faUserFriends, text: 'Approvals', path: '/myapproval' }
    // { icon: faUserFriends, text: 'IBPS Integration', path: '/ibps' },
    // { icon: faUserFriends, text: 'Candidate Portal', path: '/candidate-portal' },
    // { icon: faCalendarAlt, text: 'Schedule Interview', path: '/interviews' },
    // { icon: faFileInvoiceDollar, text: 'Roll Offer', path: '/offers' },
    // { icon: faFileInvoiceDollar, text: 'Payments', path: '/payments' },
    // { icon: faCog, text: 'Relaxation Policy', path: '/policy' },
  ];

  // Conditionally add Approvals for L1 or L2 roles
  // if (user?.role === "L1" || user?.role === "L2") {
  //   menuItems.push({ icon: faUserFriends, text: 'Approvals', path: '/myapproval' });
  // }

  const adminItems = [
    { icon: faPerson, text: 'Users', path: '/users' },
    { icon: faBuilding, text: 'Department', path: '/department' },
    { icon: faLightbulb, text: 'Skills', path: '/skill' },
    { icon: faMapMarkerAlt, text: 'Location', path: '/location' },
    { icon: faChartLine, text: 'Job Grade', path: '/job-grade' },
    { icon: faChartLine, text: 'Template', path: '/template' },
  ];

  return (
    <div
      className="sidebar d-flex flex-column align-items-center bg-white"
      style={{ width: '99px', borderRight: '1px solid #dee2e6', height: '100vh' }}
    >
      <Nav className="flex-column text-center w-100 ">
        {/* Regular Menu Items */}
        {menuItems.map((item, index) => (
          <Nav.Link
            key={index}
            as={Link}
            to={item.path}
            className={`d-flex flex-column align-items-center justify-content-center py-3 nav-item-custom ${isActive(item.path)}`}
            style={{
              color: isActive(item.path) ? '#FF4D00' : '#6c757d',
              backgroundColor: isActive(item.path) ? '#FFF' : 'transparent',
              fontWeight: isActive(item.path) ? '600' : '400',
              fontSize: '13px',
              textDecoration: 'none',
              height: '60px',
              width: '99px'
            }}
          >
            <FontAwesomeIcon icon={item.icon} style={{ fontSize: '13px' }} />
            <span className="mt-1">{item.text}</span>
          </Nav.Link>
        ))}

        {(user?.role === 'admin' || user?.role === 'Admin') && (
          <>
            <div
              className="d-flex flex-column align-items-center justify-content-center py-3"
              style={{
                color: '#6c757d',
                fontSize: '12px',
                cursor: 'pointer',
                height: '60px',
                width: '97px',
              }}
              onClick={() => setAdminOpen(!adminOpen)}
            >
              <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '13px' }} />
              <div className='d-flex flex-row align-items-center justify-content-center gap-1'>
                <span className="mt-1">Admin</span>
                <FontAwesomeIcon
                  icon={adminOpen ? faChevronUp : faChevronDown}
                  style={{ fontSize: '14px', marginTop: '5px' }}
                />
              </div>
            </div>

            {adminOpen &&
              adminItems.map((item, index) => (
                <Nav.Link
                  key={`admin-${index}`}
                  as={Link}
                  to={item.path}
                  className={`d-flex flex-column align-items-center justify-content-center py-1 nav-item-custom ${isActive(item.path)}`}
                  style={{
                    color: isActive(item.path) ? '#FF4D00' : '#6c757d',
                    backgroundColor: isActive(item.path) ? '#FFF' : 'transparent',
                    fontWeight: isActive(item.path) ? '600' : '400',
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} style={{ fontSize: '14px' }} />
                  <span className="mt-1">{item.text}</span>
                </Nav.Link>
            ))}
          </>
        )}
      </Nav>

      {/* Bottom Help section */}
      <div className="mt-auto mb-3 w-100">
        <Nav.Link
          as={Link}
          to="/help"
          className="d-flex flex-column align-items-center justify-content-center py-3"
          style={{
            color: '#6c757d',
            fontSize: '0.75rem',
            textDecoration: 'none',
            height: '70px',
          }}
        >
          <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '0.8rem' }} />
          <span className="mt-1">Help</span>
        </Nav.Link>
      </div>
    </div>
  );
};

export default Sidebar;
