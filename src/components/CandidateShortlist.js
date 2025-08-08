import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEye } from "@fortawesome/free-solid-svg-icons";

const CandidateShortlist = () => {
  const [search, setSearch] = useState("");

  const candidates = [
    { id: "ID145", name: "Mia Anderson", age: 25, degree: "Bachelor's Degree", score: "78%", rank: 4 },
    { id: "ID546", name: "Liam Johnson", age: 25, degree: "Master's Degree", score: "82%", rank: 3 },
    { id: "ID147", name: "Emma Smith", age: 23, degree: "Master's Degree", score: "90%", rank: 1 },
    { id: "ID148", name: "Noah Brown", age: 22, degree: "Master's Degree", score: "70%", rank: 6 },
    { id: "ID149", name: "Olivia Davis", age: 24, degree: "Bachelor's Degree", score: "75%", rank: 5 },
    { id: "ID150", name: "William Garcia", age: 24, degree: "Bachelor's Degree", score: "88%", rank: 2 },
  ];

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid className="py-5">
      <h5 className="mb-3">Candidate Ranking System</h5>

      {/* Filters */}
      <div className="bg-light p-3 rounded mb-3">
        <Row>
          <Col md={4} className="mb-3">
            <label>Criteria</label>
            <Form.Select>
              <option>Academic Degree</option>
            </Form.Select>
            <Form.Select className="mt-2">
              <option>Bachelor's Degree</option>
            </Form.Select>
            <Form.Control type="number" placeholder="Weightage" className="mt-2" />
          </Col>
          <Col md={4} className="mb-3">
            <label>Criteria</label>
            <Form.Select>
              <option>Bank Score</option>
            </Form.Select>
            <Form.Select className="mt-2">
              <option>All score (&gt;70%)</option>
            </Form.Select>
            <Form.Control type="number" placeholder="Weightage" className="mt-2" />
          </Col>
          <Col md={4} className="mb-3">
            <label>Criteria</label>
            <Form.Select>
              <option>Age Range</option>
            </Form.Select>
            <Form.Select className="mt-2">
              <option>25</option>
            </Form.Select>
            <Form.Control type="number" placeholder="Weightage" className="mt-2" />
          </Col>
        </Row>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <Form.Select style={{ width: "150px" }}>
              <option>10</option>
            </Form.Select>
            <Button variant="outline-primary">+ Criteria</Button>
          </div>
          <Button variant="warning">Apply Filters</Button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="d-flex justify-content-between mb-3">
        <InputGroup style={{ maxWidth: "300px" }}>
          <Form.Control
            placeholder="Search Candidates.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <div>
          <Button variant="success" className="me-2">
            Accept All
          </Button>
          <Button variant="danger" className="me-2">
            Reject All
          </Button>
          <Button variant="outline-warning">Export</Button>
        </div>
      </div>

      {/* Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>No</th>
            <th>Candidate Name</th>
            <th>Age</th>
            <th>Academic Degree</th>
            <th>Bank Score</th>
            <th>Stack Rank</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map((c, index) => (
            <tr key={c.id}>
              <td>{index + 1}</td>
              <td>
                {c.name}
                <br />
                <small>{c.id}</small>
              </td>
              <td>{c.age} years</td>
              <td>{c.degree}</td>
              <td>{c.score}</td>
              <td>{c.rank}</td>
              <td>
                <Button variant="success" size="sm" className="me-1">
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
                <Button variant="danger" size="sm" className="me-1">
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
                <Button variant="secondary" size="sm">
                  <FontAwesomeIcon icon={faEye} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Footer */}
      <div className="d-flex justify-content-between align-items-center">
        <div>Showing 06 of 1500 candidates</div>
        <Form.Select style={{ width: "100px" }}>
          <option>01</option>
          <option>02</option>
        </Form.Select>
      </div>
    </Container>
  );
};

export default CandidateShortlist;
