import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
} from "react-bootstrap";
import "../css/Dashboard.css";
import { Line, Pie } from "react-chartjs-2";
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
  const stats = {
    new_positions: 0,
    total_positions: 78,
    interviews_today: 1,
    offer_letters: 5,
    open_requisition: 12
  };

  // Your provided JSON
  const dashboardJson = {
    offer_status: [
      { count: 2, application_status: "Shortlisted" },
      { count: 5, application_status: "Offered" },
      { count: 63, application_status: "Scheduled" }
    ],
    offers_by_day: [
      { day: "Thu", offers: 5 }
    ],
    interviews_by_day: [
      { day: "Mon", interviews: 8 },
      { day: "Wed", interviews: 2 },
      { day: "Thu", interviews: 9 },
      { day: "Fri", interviews: 8 },
      { day: "Sat", interviews: 3 }
    ],
    applications_by_day: [
      { day: "Fri", applications: 21 },
      { day: "Mon", applications: 17 },
      { day: "Tue", applications: 24 }
    ]
  };

  // All days for consistent order
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Generate data arrays
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

  const upcomingInterviews = [
    { role: "Senior Developer", time: "Today at 2:00 PM", name: "Sarah Johnson" },
    { role: "Product Manager", time: "Tomorrow at 2:00 PM", name: "Michael Chen" },
    { role: "Marketing Manager", time: "Tomorrow at 2:00 PM", name: "Michael Chen" },
  ];

  const notifications = [
    { text: "New application received for Senior Developer", time: "2 hours ago" },
    { text: "Interview scheduled with David Wilson", time: "5 hours ago" },
    { text: "Offer accepted by Emily Brown", time: "1 day ago" },
  ];

  const shortlistingProgress = [
    { title: "New Applications", count: 252, note: "Last 7 days" },
    { title: "Screening", count: 182, note: "In progress" },
    { title: "Interviews", count: 62, note: "Scheduled" },
    { title: "Offers", count: 36, note: "Scheduled" },
    { title: "Rejected", count: 22, note: "Total" }
  ];

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
              {shortlistingProgress.map((item, idx) => {
                const bgColors = ["bgcolr", "bgcolr2", "bgcolr3", "bgcolr4", "bgcolr7"];
                return (
                  <Col md={2} className="cardspace" key={idx}>
                    <Card className={`shadow-sm p-3 ${bgColors[idx]}`}>
                      <h6>{item.title}</h6>
                      <h3>{item.count}</h3>
                      <small className="text-muted">{item.note}</small>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Interviews & Notifications */}
          <Row className="mt-4">
            <Col md={4} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr5 fonapp">
                <h6>Upcoming Interviews</h6>
                <ListGroup variant="flush">
                  {upcomingInterviews.map((item, idx) => (
                    <ListGroup.Item key={idx}>
                      <strong>{item.role}</strong>
                      <br />
                      {item.time} — {item.name}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
            <Col md={5} className="cardspace">
              <Card className="shadow-sm p-3 bgcolr6 fonapp">
                <h6>Recent Notifications</h6>
                <ListGroup variant="flush">
                  {notifications.map((n, idx) => (
                    <ListGroup.Item key={idx}>
                      {n.text} <br />
                      <small className="text-muted">{n.time}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
