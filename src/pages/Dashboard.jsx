import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Navbar,
  Nav,
  ListGroup,
} from "react-bootstrap";
import "../css/Dashboard.css";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const stats = {
    newApplications: 72,
    totalApplications: 67,
    interviewsToday: 16,
    offerLetters: 12,
    openRequisition: 9
   
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Applications",
        data: [110, 135, 110, 140, 100, 160, 130],
        borderColor: "#6c63ff",
        fill: true,
      },
      {
        label: "Interviews",
        data: [20, 25, 18, 22, 15, 28, 24],
        borderColor: "#00c49f",
        fill: false,
      },
      {
        label: "Offers",
        data: [10, 8, 9, 7, 6, 10, 8],
        borderColor: "#ff7300",
        fill: false,
      },
    ],
  };

  const pieData = {
    labels: ["Accepted", "Rejected", "Pending"],
    datasets: [
      {
        label: "Offer Status",
        data: [8, 3, 4],
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
  {
    title: "New Applications",
    count: 252,
    note: "Last 7 days",
  },
  {
    title: "Screening",
    count: 182,
    note: "In progress",
  },
  {
    title: "Interviews",
    count: 62,
    note: "Scheduled",
  },
  {
    title: "Offers",
    count: 36,
    note: "Scheduled",
  },
  {
    title: "Rejected",
    count: 22,
    note: "Total",
  }
];


  return (
    <>
     

      <Container fluid className="dashfont">
        <Row>
          {/* Main Content */}
          <Col md={12} className="p-4">
            {/* Stats Row */}
          <Row className="mb-4">
             <Col md={2} className="cardspace">
                <Card className="shadow-sm p-3 bgcolr">
                <h6>New Applications</h6>
                <h3>{stats.newApplications}</h3>
                </Card>
             </Col>
             <Col md={2} className="cardspace">
                <Card className="shadow-sm p-3 bgcolr2">
                <h6>Total Applications</h6>
                <h3>{stats.totalApplications}</h3>
                </Card>
             </Col>
             <Col md={2} className="cardspace">
                <Card className="shadow-sm p-3 bgcolr3">
                <h6>Interviews Today</h6>
                <h3>{stats.interviewsToday}</h3>
                </Card>
             </Col>
             <Col md={2} className="cardspace">
                <Card className="shadow-sm p-3 bgcolr4">
                <h6>Offer Letters</h6>
                <h3>{stats.offerLetters}</h3>
                </Card>
             </Col>
             <Col md={2} className="cardspace">
                <Card className="shadow-sm p-3 bgcolr7">
                <h6>Open Requisition</h6>
                <h3>{stats.openRequisition}</h3> {/* Replace with dynamic value later */}
                </Card>
             </Col>
         </Row>


            <Row>
              {/* Line Chart */}
              <Col md={8} className="cardspace">
                <Card className="shadow-sm p-3 heightcard">
                  <h6>Application Metrics</h6>
                  <Line data={lineData} />
                </Card>
              </Col>

              {/* Pie Chart */}
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
                // Assign colors based on position
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



            <Row className="mt-4">
              {/* Upcoming Interviews */}
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

              {/* Notifications */}
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
    </>
  );
}
