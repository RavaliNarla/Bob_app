import React, { useState, useEffect } from "react";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
const API_BASE = "http://192.168.20.111:8081/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    new_positions: 0,
    total_positions: 0,
    interviews_today: 0,
    offer_letters: 0,
    open_requisition: 0,
  });

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
         const response = await fetch(`${API_BASE}/dashboard/queries`);
        const data = await response.json();

        // Make sure keys match your API response
        setStats({
          new_positions: data.new_positions ?? 0,
          total_positions: data.total_positions ?? 0,
          interviews_today: data.interviews_today ?? 0,
          offer_letters: data.offer_letters ?? 0,
          open_requisition: data.open_requisition ?? 0,
        });

        console.log("Dashboard stats:", data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { label: "Applications", data: [100, 135, 110, 140, 100, 160, 130], borderColor: "#6c63ff", fill: true },
      { label: "Interviews", data: [20, 25, 18, 22, 15, 28, 24], borderColor: "#00c49f", fill: false },
      { label: "Offers", data: [10, 8, 9, 7, 6, 10, 8], borderColor: "#ff7300", fill: false },
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

  const shortlistingProgress = [
    { title: "New Applications", count: 252, note: "Last 7 days" },
    { title: "Screening", count: 182, note: "In progress" },
    { title: "Interviews", count: 62, note: "Scheduled" },
    { title: "Offers", count: 36, note: "Scheduled" },
    { title: "Rejected", count: 22, note: "Total" },
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
        </Col>
      </Row>
    </Container>
  );
}
