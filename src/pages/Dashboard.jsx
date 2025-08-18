import React, { useEffect, useState } from "react"; 
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
} from "react-bootstrap";
import "../css/Dashboard.css";
import { Line, Pie } from "react-chartjs-2";
import apiService from "../services/apiService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  // Stats for top row
  const [stats, setStats] = useState({
    new_positions: 0,
    total_positions: 0,
    interviews_today: 0,
    offer_letters: 0,
    open_requisition: 0
  });

  // Shortlisting progress (same style as stats)
  const [shortlistingProgress, setShortlistingProgress] = useState({
    applied_candidates: 0,
    screening: 0,
    interviews_scheduled: 0,
    offers: 0,
    rejected: 0
  });

  // Metrics for charts + interviews
  const [dashboardJson, setDashboardJson] = useState({
    offer_status: [],
    offers_by_day: [],
    interviews_by_day: [],
    applications_by_day: [],
    upcoming_interviews: []
  });

  useEffect(() => {
    // 📌 Fetch stats + progress
    apiService.getDashboardQueries()
      .then(data => {
        setStats({
          new_positions: data?.new_positions || 0,
          total_positions: data?.total_positions || 0,
          interviews_today: data?.interviews_today || 0,
          offer_letters: data?.offer_letters || 0,
          open_requisition: data?.open_requisition || 0
        });

        setShortlistingProgress({
          applied_candidates: data?.applied_candidates || 0,
          screening: data?.screening || 0,
          interviews_scheduled: data?.interviews_scheduled || 0,
          offers: data?.offers || 0,
          rejected: data?.rejected || 0
        });
      })
      .catch(err => console.error("Error fetching queries:", err));

    // 📌 Fetch metrics (includes upcoming interviews)
    apiService.getDashboardMetrics()
      .then(data => {
        setDashboardJson({
          offer_status: data?.offer_status || [],
          offers_by_day: data?.offers_by_day || [],
          interviews_by_day: data?.interviews_by_day || [],
          applications_by_day: data?.applications_by_day || [],
          upcoming_interviews: data?.upcoming_interviews || []
        });
      })
      .catch(err => console.error("Error fetching metrics:", err));
  }, []);

  // Chart Data
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const applicationsData = allDays.map(
    (d) => dashboardJson.applications_by_day.find(a => a.day === d)?.applications || 0
  );
  const interviewsData = allDays.map(
    (d) => dashboardJson.interviews_by_day.find(i => i.day === d)?.interviews || 0
  );
  const offersData = allDays.map(
    (d) => dashboardJson.offers_by_day.find(o => o.day === d)?.offers || 0
  );

  const lineData = {
    labels: allDays,
    datasets: [
      { label: "Applications", data: applicationsData, borderColor: "#6c63ff", fill: true },
      { label: "Interviews", data: interviewsData, borderColor: "#00c49f", fill: false },
      { label: "Offers", data: offersData, borderColor: "#ff7300", fill: false },
    ],
  };

  const pieData = {
    labels: dashboardJson.offer_status.map(o => o.application_status),
    datasets: [
      {
        label: "Offer Status",
        data: dashboardJson.offer_status.map(o => o.count),
        backgroundColor: ["#00c49f", "#ff4d4f", "#ffbb28"],
      },
    ],
  };

  return (
    <Container fluid className="dashfont">
      <Row>
        <Col md={12} className="p-4">
          {/* Stats Row */}
          <Row className="mb-4">
            <Col md={2} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr">
                <h6>New Applications</h6>
                <h3>{stats.new_positions}</h3>
              </Card>
            </Col>
            <Col md={2} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr2">
                <h6>Total Applications</h6>
                <h3>{stats.total_positions}</h3>
              </Card>
            </Col>
            <Col md={2} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr3">
                <h6>Interviews Today</h6>
                <h3>{stats.interviews_today}</h3>
              </Card>
            </Col>
            <Col md={2} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr4">
                <h6>Offer Letters</h6>
                <h3>{stats.offer_letters}</h3>
              </Card>
            </Col>
            <Col md={2} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr7">
                <h6>Open Requisition</h6>
                <h3>{stats.open_requisition}</h3>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row>
            <Col md={8} className="cardspace">
              <Card className="shadow-sm p-3 heightcard">
                <h6>Application Metrics</h6>
                <Line data={lineData} />
              </Card>
            </Col>
            <Col md={4} className="cardspace">
              <Card className="shadow-sm p-3 heightcard">
                <h6>Offer Status</h6>
                <Pie data={pieData} />
              </Card>
            </Col>
          </Row>

          {/* Shortlisting Progress */}
          <div className="mt-4 shortlist">
            <h5 className="mb-3">Shortlisting Progress</h5>
            <Row className="mt-4">
              {[
                { key: "applied_candidates", label: "Total Candidates", note: "Applied - Last 7 days" },
                { key: "screening", label: "Screening", note: "In progress" },
                { key: "interviews_scheduled", label: "Interviews", note: "Scheduled" },
                { key: "offers", label: "Offers", note: "Given" },
                { key: "rejected", label: "Rejected", note: "Total" }
              ].map((item, idx) => {
                const bgColors = ["bgcolr", "bgcolr2", "bgcolr3", "bgcolr4", "bgcolr7"];
                return (
                  <Col md={2} className="cardspace" key={idx}>
                    <Card className={`shadow-sm p-3 ${bgColors[idx]}`}>
                      <h6>{item.label}</h6>
                      <h3>{shortlistingProgress[item.key]}</h3>
                      <small className="text-muted">{item.note}</small>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Interviews */}
          <Row className="mt-4">
            <Col md={6} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr5 fonapp">
                <h6>Upcoming Interviews</h6>
                <ListGroup variant="flush">
                  {dashboardJson.upcoming_interviews.length > 0 ? (
                    dashboardJson.upcoming_interviews.map((item, idx) => (
                      <ListGroup.Item key={idx}>
                        <strong>{item.position_title}</strong>
                        <br />
                        {new Date(item.scheduled_at).toLocaleString()} — {item.interviewer}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No upcoming interviews</ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
