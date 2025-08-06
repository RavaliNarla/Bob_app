import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
// Lazy load components
const Header = React.lazy(() => import('./components/Header'));
const Sidebar = React.lazy(() => import('./components/Sidebar'));
const JobCreation = React.lazy(() => import('./pages/JobCreation'));
const JobPosting = React.lazy(() => import('./pages/JobPosting'));
const JobRequisition = React.lazy(() => import('./pages/JobRequisition'));
// Loading component
const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <div className="d-flex flex-column vh-100">
          <Header />
          <div className="flex-grow-1 d-flex" style={{ overflow: 'hidden' }}>
            <Sidebar />
            <main className="flex-grow-1" style={{ overflowY: 'auto', background: '#eee' }}>
              <Container fluid className="h-100">
                <Row className="h-100">
                  <Col className="p-0" style={{ borderRight: '1px solid #dee2e6' }}>
                    <Routes>
                      <Route path="/" element={<JobCreation />} />
                      <Route path="/job-creation" element={<JobCreation />} />
                      <Route path="/job-postings" element={<JobPosting />} />
                      <Route path="/job-requisition" element={<JobRequisition />} />
                    </Routes>
                  </Col>
                </Row>
              </Container>
            </main>
          </div>
          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
