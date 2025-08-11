import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import CandidateCard from './components/CandidateCard';
import Tokenexp from './components/Tokenexp';
import CandidatePortal from './components/CandidatePortal';
// Lazy load components
const JobCreation = React.lazy(() => import('./pages/JobCreation'));
const JobPosting = React.lazy(() => import('./pages/JobPosting'));
const JobRequisition = React.lazy(() => import('./pages/JobRequisition'));
const Layout = React.lazy(() => import('./components/Layout'));
// Loading component
const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
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
        {/* <Tokenexp> */}
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes with layout */}
            {/* <Route
              path="/"
              element={
                <Layout>
                  <JobCreation />
                </Layout>
              }
            /> */}
            <Route
              path="/job-creation"
              element={
                <Layout>
                  <JobCreation />
                </Layout>
              }
            />
            <Route
              path="/job-postings"
              element={
                <Layout>
                  <JobPosting />
                </Layout>
              }
            />
            <Route
              path="/job-requisition"
              element={
                <Layout>
                  <JobRequisition />
                </Layout>
              }
            />

            <Route
              path="/candidate-shortlist"
              element={
                <Layout>
                  <CandidateCard />
                </Layout>
              }
            />

            <Route
              path="/candidate-portal"
              element={
                <Layout>
                  <CandidatePortal />
                </Layout>
              }
            />
            {/* Redirect unknown routes */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        {/* </Tokenexp> */}
        <ToastContainer position="top-right" autoClose={5000} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
