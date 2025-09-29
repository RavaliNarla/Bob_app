import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faBriefcase, faUserFriends, faCalendar, faCogs, faPerson,
  faQuestionCircle, faBuilding, faLightbulb, faMapMarkerAlt,
  faChartLine, faFile, faStar, faTags, faSlidersH, faUsers, faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  const menuItems = [
    { icon: faHome, text: 'Dashboard', path: '/dashboard' },
    { icon: faBriefcase, text: 'Job Postings', path: '/job-postings' },
    { icon: faUserFriends, text: 'Candidate Shortlist', path: '/candidate-shortlist' },
    { icon: faCalendar, text: 'Interviews', path: '/interviews' },
    { icon: faCogs, text: 'Relaxation', path: '/relaxation' },
    { icon: faPerson, text: 'Bulk Upload', path: '/bulk-upload' },
    //{ icon: faUserFriends, text: 'Approvals', path: '/myapproval' }
    // { icon: faUserFriends, text: 'IBPS Integration', path: '/ibps' },
    // { icon: faUserFriends, text: 'Candidate Portal', path: '/candidate-portal' },
    // { icon: faCalendarAlt, text: 'Schedule Interview', path: '/interviews' },
    // { icon: faFileInvoiceDollar, text: 'Roll Offer', path: '/offers' },
    // { icon: faFileInvoiceDollar, text: 'Payments', path: '/payments' },
    // { icon: faCog, text: 'Relaxation Policy', path: '/policy' },
  ];

  if (user?.role === "Manager" || user?.role === "Admin") {
    menuItems.push({ icon: faUserFriends, text: 'Approvals', path: '/myapproval' });
  }

  const adminItems = [
    { icon: faPerson, text: 'Users', path: '/users' },
    { icon: faBuilding, text: 'Department', path: '/department' },
    { icon: faLightbulb, text: 'Skills', path: '/skill' },
    { icon: faMapMarkerAlt, text: 'Location', path: '/location' },
    { icon: faChartLine, text: 'Job Grade', path: '/job-grade' },
    { icon: faFile, text: 'Offer Letter', path: '/template' },
    { icon: faBriefcase, text: 'Position', path: '/position' },
    { icon: faTags, text: 'Category', path: '/category' },
    { icon: faStar, text: 'Special Category', path: '/special-category' },
    { icon: faSlidersH, text: 'Relaxation Type', path: '/relaxation-type' },
    { icon: faFile, text: 'Document', path: '/document' },
    { icon: faUsers, text: 'Interview Panel', path: '/interview-panel' },
  ];

  const handleAdminClick = () => setAdminOpen(!adminOpen);

  const handleAdminItemClick = () => setAdminOpen(false);
  const isAdminActive = () => {
  return adminItems.some(item => item.path === location.pathname);
};


  return (
    <div className="d-flex">
      {/* Main Sidebar */}
      <div
        className="sidebar d-flex flex-column align-items-center bg-white"
        style={{ width: '99px', borderRight: '1px solid #dee2e6', height: '100vh' }}
      >
        <Nav className="flex-column text-center w-100 sidescroll">
          {menuItems.map((item, index) => (
            <Nav.Link
              key={index}
              as={Link}
              to={item.path}
              className={`d-flex flex-column align-items-center justify-content-center py-3 nav-item-custom ${isActive(item.path)}`}
              style={{
                color: isActive(item.path) ? '#FF4D00' : '#6c757d',
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

     {/* Admin menu item with hover color */}
{(user?.role === 'admin' || user?.role === 'Admin') && (
  <div
    className="d-flex flex-column align-items-center justify-content-center py-3 position-relative"
    style={{
      cursor: 'pointer',
      height: '60px',
      width: '97px',
      color: isAdminActive() ? '#FF4D00' : '#6c757d',
fontWeight: isAdminActive() ? '600' : '400',
backgroundColor: isAdminActive() ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
borderLeft: isAdminActive() ? '3px solid rgb(255, 77, 0)' : 'transparent',
borderRadius: isAdminActive() ?  '0.25rem' : '',
fontSize:'13px'

     // transition: 'all 0.2s',
    }}
    onMouseEnter={() => setAdminOpen(true)}
    onMouseLeave={() => setAdminOpen(false)}
  >
    <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '13px' }} />
    <span className="mt-1">Admin</span>

    {/* Right-side chevron */}
    <FontAwesomeIcon
      icon={faChevronRight}
      style={{
        position: 'absolute',
        right: '5px',
        top: '50%',
        fontSize: '10px',
        color: adminOpen ? '#FF4D00' : '#6c757d',
      }}
    />
  </div>
)}



        </Nav>

        <div className="mt-auto mb-3 w-100">
          <Nav.Link
            as={Link}
            to="/help"
            className="d-flex flex-column align-items-center justify-content-center py-3"
            style={{ color: '#6c757d', fontSize: '0.75rem', textDecoration: 'none', height: '70px' }}
          >
            <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '0.8rem' }} />
            <span className="mt-1">Help</span>
          </Nav.Link>
        </div>
      </div>

      {/* Admin Sub Sidebar */}
<div
  className="sub-sidebar"
  onMouseEnter={() => setAdminOpen(true)}
  onMouseLeave={() => setAdminOpen(false)}
  style={{
    width: adminOpen ? '200px' : '0',
       overflow: 'hidden',
    borderRight: adminOpen ? '1px solid #dee2e6' : 'none',
    height: '100vh',
    backgroundColor: '#fff',
    position: 'fixed',
    left:'100px',
    zIndex: '999',
   
  }}
>
  {adminOpen && (
    <Nav className="flex-column p-2">
      {adminItems.map((item, index) => (
        <Nav.Link
          key={index}
          as={Link}
          to={item.path}
          onClick={() => setAdminOpen(false)} // close on click
          className={`d-flex align-items-center ${isActive(item.path)}`}
          style={{
            color: isActive(item.path) ? '#FF4D00' : '#6c757d',
            fontWeight: isActive(item.path) ? '600' : '400',
            textDecoration: 'none',
            fontSize: '13px',
             padding: '10px', // adjust as needed for left spacing
           

          }}
        >
          <FontAwesomeIcon icon={item.icon} style={{ fontSize: '14px', marginRight: '8px' }} />
          {item.text}
        </Nav.Link>
      ))}
    </Nav>
  )}
</div>

    </div>
  );
};

export default Sidebar;
