import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';

import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import CandidateCard from './components/CandidateCard';
import Tokenexp from './components/Tokenexp';
import Dashboard from './pages/Dashboard';
import Skill from './pages/Skill';
import JobGrade from './pages/JobGrade';
import Location from './pages/Location';
import Payments from './pages/Payments';

// Lazy load components
const JobCreation = React.lazy(() => import('./pages/JobCreation'));
const JobPosting = React.lazy(() => import('./pages/JobPosting'));
const JobRequisition = React.lazy(() => import('./pages/JobRequisition'));
const Department = React.lazy(() => import('./pages/Department'));
const Layout = React.lazy(() => import('./components/Layout'));
const Approval = React.lazy(() => import('./pages/Approvals'));
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
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
                  path="/department"
                  element={
                    <Layout>
                      <Department />
                    </Layout>
                  }
                />
                <Route
                  path="/skill"
                  element={
                    <Layout>
                      <Skill />
                    </Layout>
                  }
                />
                <Route
                  path="/location"
                  element={
                    <Layout>
                      <Location />
                    </Layout>
                  }
                />
                <Route
                  path="/job-grade"
                  element={
                    <Layout>
                      <JobGrade />
                    </Layout>
                  }
                />

                <Route
                  path="/registration"
                  element={
                    <Layout>
                      <Register />
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
                  path="/myapproval"
                  element={
                    <Layout>
                      < Approval />
                    </Layout>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <Layout>
                      < Payments />
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
      </PersistGate>
    </Provider>
  );
}

export default App;
