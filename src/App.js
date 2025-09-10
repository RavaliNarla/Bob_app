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
import PrivateRoute from './components/PrivateRoute';
import TemplateMainCompo from './components/OfferTemplate/TemplateMainCompo';

// Lazy load components
const JobCreation = React.lazy(() => import('./pages/JobCreation'));
const JobPosting = React.lazy(() => import('./pages/JobPosting'));
const JobRequisition = React.lazy(() => import('./pages/JobRequisition'));
const Department = React.lazy(() => import('./pages/Department'));
const Layout = React.lazy(() => import('./components/Layout'));
const Approval = React.lazy(() => import('./pages/Approvals'));
const Calendar = React.lazy(()=>import('./pages/Calendar'));
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
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected routes */}
                <Route element={<Tokenexp />}>
                  <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/job-creation" element={<JobCreation />} />
                      <Route path="/job-postings" element={<JobPosting />} />
                      <Route path="/job-requisition" element={<JobRequisition />} />
                      <Route path="/department" element={<Department />} />
                      <Route path="/skill" element={<Skill />} />
                      <Route path="/location" element={<Location />} />
                      <Route path="/job-grade" element={<JobGrade />} />
                      <Route path="/users" element={<Register />} />
                      <Route path="/candidate-shortlist" element={<CandidateCard />} />
                      <Route path="/myapproval" element={<Approval />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/interviews" element={<Calendar />} />
                      <Route path="/template" element={<TemplateMainCompo />} />
                    </Route>
                  </Route>
                </Route>
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
