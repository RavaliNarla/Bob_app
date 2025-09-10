import React, { Suspense } from 'react';
import { Container, Row, Col, Spinner, InputGroup, Form } from 'react-bootstrap';
import { faE, faEye, faPencil, faPlus, faSearch, faTrash, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet } from 'react-router-dom';
const Header = React.lazy(() => import('./Header'));
const Sidebar = React.lazy(() => import('./Sidebar'));

const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

const Layout = ({ children }) => (
  <Suspense fallback={<Loading />}>
    <div className="d-flex flex-column vh-100">
      <Header />
      <div className="flex-grow-1 d-flex" style={{ overflow: 'hidden' }}>
        <Sidebar />
        <main className="flex-grow-1" style={{ overflowY: 'auto', background: '#eee', overflowX: 'hidden' }}>
         
          <Container fluid className="h-100">
            <Row className="h-100">
              <Col className="p-0" style={{ borderRight: '1px solid #dee2e6' }}>
                <Outlet />
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </div>
  </Suspense>
);

export default Layout;