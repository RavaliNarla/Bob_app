import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Table,
} from "react-bootstrap";
import "../css/Dashboard.css";
import { Line, Pie, Bar } from "react-chartjs-2";
import apiService from "../services/apiService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export default function Dashboard() {
  // Stats for top row
  // const [stats, setStats] = useState({
  //   new_positions: 0,
  //   total_positions: 0,
  //   interviews_today: 0,
  //   offer_letters: 0,
  //   open_requisition: 0
  // });
  // Stats for top row
  const [stats, setStats] = useState({
    total_open_positions: 0,
    filled: 0,
    pending_approvals: 0,
    avg_time_to_fill: 0
  });


  // Shortlisting progress (same style as stats)
  const [shortlistingProgress, setShortlistingProgress] = useState({
    applied_candidates: 0,
        eligible: 0,
    Shortlisted: 0,
    offers: 0,
    rejected: 0,
    Interviewed: 0,
    Joined: 0

  });

  // Metrics for charts + interviews + new open positions data
  const [dashboardJson, setDashboardJson] = useState({
    offer_status: [],
    offers_by_day: [],
    interviews_by_day: [],
    applications_by_day: [],
    upcoming_interviews: [],
    openpositions_status: [], // Added for new table
    position_fulfillment_tracker: [] // Added for new chart
  });

  useEffect(() => {
    // 📌 Fetch stats + progress
    apiService.getDashboardQueries()
      .then(data => {
        // setStats({
        //   new_positions: data?.new_positions || 0,
        //   total_positions: data?.total_positions || 0,
        //   interviews_today: data?.interviews_today || 0,
        //   offer_letters: data?.offer_letters || 0,
        //   open_requisition: data?.open_requisition || 0
        // });
        setStats({
          total_open_positions: data?.total_open_positions || 0,
          filled: data?.filled || 0,
          pending_approvals: data?.pending_approvals || 0,
          avg_time_to_fill: data?.avg_time_to_fill || 0
        });

        setShortlistingProgress({
          applied_candidates: data?.applied_candidates || 0,
          eligible: data?.eligible || 0,
                    Shortlisted: data?.Shortlisted || 0,
          offers: data?.offers || 0,
          rejected: data?.rejected || 0,
          Interviewed: data?.Interviewed || 0,
          Joined: data?.Joined || 0
        });
      })
      .catch(err => console.error("Error fetching queries:", err));

    // 📌 Fetch metrics (includes upcoming interviews and open positions)
    apiService.getDashboardMetrics()
      .then(data => {
        console.log("Dashboard  Data:", data);
        setDashboardJson({
          offer_status: data?.offer_status || [],
          offers_by_day: data?.offers_by_day || [],
          interviews_by_day: data?.interviews_by_day || [],
          applications_by_day: data?.applications_by_day || [],
          upcoming_interviews: data?.upcoming_interviews || [],
          openpositions_status: data?.openpositions_status || [], // Added for new table
          position_fulfillment_tracker: data?.position_fulfillment_tracker || [] // Added for new chart
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
        label: "",
        data: dashboardJson.offer_status.map(o => o.count),
        backgroundColor: ["#ff4d4f", "#ffbb28", "#6610f2", "#ff8042", "#00c49f"],
      },
    ],
  };

  return (
    <Container fluid className="dashfont py-4 px-4 mx-3">
      <h5 className="mx-4 pb-3" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>My Dashboard</h5>
      <Row>
        <Col md={12} className="">
          {/* Stats Row */}
          {/* <Row className="mb-4">
            <Col md={2} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr">
                <h6>Job Positions</h6>
                <h3>{stats.new_positions}</h3>
              </Card>
            </Col>
            <Col md={2} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr2">
                <h6>Total Job Positions</h6>
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
              <Card className="shadow-sm p-3 bgcolr7">
                <h6>Open Requisition</h6>
                <h3>{stats.open_requisition}</h3>
              </Card>
            </Col>
          </Row> */}

          {/* Stats Row */}
          <Row className="mb-4">
            <Col md={3} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr">
                <h6>Total Open Positions</h6>
                <h3>{stats.total_open_positions}</h3>
              </Card>
            </Col>
            <Col md={3} className="cardspace">
  <Card className="shadow-sm p-3 bgcolr2 d-flex flex-column justify-content-between">
    <h6>Positions Filled</h6>

    <div className="d-flex align-items-center">
      <h3 className="mb-0 me-3">{stats.filled}</h3>

      <div className="flex-grow-1">
        <div className="progress" style={{ height: "10px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${
                stats.total_open_positions > 0
                  ? Math.round((stats.filled / stats.total_open_positions) * 100)
                  : 0
              }%`,
              backgroundColor:
                stats.total_open_positions > 0 &&
                Math.round((stats.filled / stats.total_open_positions) * 100) < 50
                  ? "#ef5350"
                  : Math.round(
                      (stats.filled / stats.total_open_positions) * 100
                    ) < 80
                  ? "#ffb300"
                  : "#66bb6a",
            }}
            aria-valuenow={
              stats.total_open_positions > 0
                ? Math.round((stats.filled / stats.total_open_positions) * 100)
                : 0
            }
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <small className="text-muted">
          {stats.total_open_positions > 0
            ? Math.round((stats.filled / stats.total_open_positions) * 100)
            : 0}
          % progress
        </small>
      </div>
    </div>
  </Card>
</Col>

            <Col md={3} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr3">
                <h6>Pending Approvals</h6>
                <h3>{stats.pending_approvals}</h3>
              </Card>
            </Col>
            <Col md={3} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr7">
                <h6>Avg Time to Fill (days)</h6>
                <h3>{stats.avg_time_to_fill}</h3>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row>
            <Col md={8} className="cardspace">
              <Card className="shadow-sm p-3 heightcard">
                <h6>Application Metrics</h6>
                <Line data={lineData} className="pb-3" />
              </Card>
            </Col>
            <Col md={4} className="cardspace">
              <Card className="shadow-sm p-3 heightcard">
                <h6>Candidate Application Status</h6>
                <Pie data={pieData} className="pb-2" />
              </Card>
            </Col>
          </Row>

          {/* Shortlisting Progress */}
          <div className="mt-4 shortlist">
            <h5 className="mb-3">Candidate Pipeline</h5>
            <div className="pipeline-container">
              {[
                { key: "applied_candidates", label: "Applications\nReceived", color: "#42a5f5" },
                { key: "eligible", label: "Eligible", color: "#ffa726" }, // Orange
                 { key: "Shortlisted", label: "Shortlisted", color: "#66bb6a" }, // Green
                { key: "Interviewed", label: "Interviewed", color: "#ab47bc" }, // Purple
                { key: "offers", label: "Offered", color: "#ef5350" }, // Red
                { key: "Joined", label: "Joined", color: "#26c6da" }, // Teal
                { key: "rejected", label: "Cancelled", color: "#8d6e63" } // Brown/Grey
              ].map((item, idx, arr) => (
  <div className="pipeline-step" key={idx}>
    <div className="step-content" style={{ background: item.color }}>
      <h6>
        {item.label.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </h6>
      <h3>{shortlistingProgress[item.key]}</h3>
    </div>
    {idx < arr.length - 1 && (
      <div
        className="step-arrow"
        style={{ borderLeftColor: item.color }}
      ></div>
    )}
  </div>
))}
            </div>
          </div>

          <Row className="mt-4">
  <Col md={12} className="cardspace">
    <Card className="shadow-sm p-3 fonapp">
      <h6 className="mb-3">Open Positions</h6>
      <Row>
        {dashboardJson.openpositions_status?.map((pos, idx) => (
          <Col md={4} key={idx} className="mb-3">
            <Card className="h-100 shadow-sm p-2">
              <Card.Body>
                <h6 className="fw-bold">{pos.position_title}</h6>
                <p className="mb-1">
                  <span
                    className={`badge ${
                      pos.position_status === "Active"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {pos.position_status}
                  </span>
                </p>
                <p className="mb-0 text-muted">
                  Openings: <strong>{pos.total_open_positions}</strong>
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  </Col>
</Row>



         {/* ✅ Section 2: Position Fulfillment Tracker */}
<Row className="mt-4">
  <Col md={12} className="cardspace">
    <Card className="shadow-sm p-3 fonapp">
      <h6 className="mb-3">Position Fulfillment Tracker</h6>
      {dashboardJson.position_fulfillment_tracker.map((p, idx) => (
        <div key={idx} className="mb-3">
          <strong>{p.position_title} ({p.department_name})</strong>
          <div className="text-muted small">
            Filled: {p.filled} | In Progress: {p.in_progress} | Openings: {p.openings} | Avg Days: {p.avg_days_open}
          </div>
          <div className="progress" style={{ height: "12px" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${p.per_complete}%`,
                backgroundColor:
                  p.per_complete < 50 ? "#ef5350" : p.per_complete < 80 ? "#ffb300" : "#66bb6a",
              }}
            >
              {p.per_complete}%
            </div>
          </div>
        </div>
      ))}
    </Card>
  </Col>
</Row>





          {/* Interviews */}
          <Row className="mt-4">
            <Col md={8} className="cardspace">
              <Card className="shadow-sm p-3 fonapp">
                <h6>Upcoming Interviews</h6>
                <ListGroup variant="flush" className="interview_list">
                  {dashboardJson.upcoming_interviews.length > 0 ? (
                    dashboardJson.upcoming_interviews.map((item, idx) => (
                      <ListGroup.Item key={idx}>
                        <strong>{item.position_title}</strong>
                        <br />
                        {new Date(item.scheduled_at).toLocaleString()} | Interviewer : {item.interviewer} | Candidate : {item.candidate_name}
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