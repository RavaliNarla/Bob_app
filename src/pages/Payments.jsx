import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Row, Table } from 'react-bootstrap'

const samplePayments = [
    {
      candidateName: "Jane Smith",
      candidateEmail: "janesmith@gmail.com",
      applicationDetails: "Java Developer",
      paymentAmount: "₹500",
      paymentDate: "Aug 20 2025, 11:30 AM",
      paymentId: "RZP0002",
      status: "Paid"
    },
		{
      candidateName: "John Doe",
      candidateEmail: "johndoe@gmail.com",
      applicationDetails: "Software Engineer",
      paymentAmount: "₹1,500",
      paymentDate: "Aug 21 2025, 09:30 AM",
      paymentId: "RZP0001",
      status: "Created"
    },
    {
      candidateName: "Alice Johnson",
      candidateEmail: "alicejohnson@gmail.com",
      applicationDetails: "Data Scientist",
      paymentAmount: "₹750",
      paymentDate: "Aug 19 2025, 2:30 PM",
      paymentId: "RZP0003",
      status: "Failed"
    },
]

const Payments = () => {
	const [paymentData, setPaymentData] = useState([])
	const [statusFilter, setStatusFilter] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(5)

	const fetchPayments = async () => {
    try {
      const res = await axios.get("https://bobjava.sentrifugo.com:8443/api/razorpay/all"); // Update URL if needed
      setPaymentData(res?.data?.data || []);
      console.log("Fetched payments:", res?.data?.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

	// Sorting in descending order
	const sortedPayments = [...paymentData].sort(
		(a, b) => new Date(b.razorpayOrderDetails?.createdAt) - new Date(a.razorpayOrderDetails?.createdAt)
	)

  // Filtering logic with useMemo for performance
	const filteredPayments = useMemo(() => {
		return sortedPayments.filter((row) => {
			let matchesStatus = true
			let matchesDate = true

			// Status filter
			if (statusFilter) {
				matchesStatus = row.razorpayOrderDetails?.status.toLowerCase() === statusFilter.toLowerCase()
			}

			// Date filter with normalized start/end times
			if (dateRange.start && dateRange.end) {
				const paymentDate = new Date(row.razorpayOrderDetails?.createdAt)

				const startDate = new Date(dateRange.start)
				startDate.setHours(0, 0, 0, 0)

				const endDate = new Date(dateRange.end)
				endDate.setHours(23, 59, 59, 999)

				matchesDate = paymentDate >= startDate && paymentDate <= endDate
			}

			return matchesStatus && matchesDate
		})
	}, [sortedPayments, statusFilter, dateRange])

	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem)

	const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

	// Reset to page 1 if rows per page changes
	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(Number(e.target.value))
		setCurrentPage(1)
	}


  // Reset filters
  const resetFilters = () => {
    setStatusFilter("")
    setDateRange({ start: "", end: "" })
  }

  return (
    <div className='register_container login-container d-flex flex-column p-3 py-4 mx-5'>
        <h5 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px !important', color: '#FF7043', marginBottom: '0px' }}>Payments</h5>

				<Row className="my-3 gap-3">
        <Col md={3}>
					<label className='text-muted' style={{ fontWeight: 500 }}>Status</label>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Created">Created</option>
            <option value="Failed">Failed</option>
          </Form.Select>
        </Col>
        <Col md={3}>
					<label className='text-muted' style={{ fontWeight: 500 }}>Start Date</label>
          <Form.Control
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </Col>
        <Col md={3}>
					<label className='text-muted' style={{ fontWeight: 500 }}>End Date</label>
          <Form.Control
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </Col>
        <Col md={2} className='align-content-end'>
          <Button variant="secondary" onClick={resetFilters}>Reset</Button>
        </Col>
      </Row>

        <Table className="req_table mt-2" responsive hover>
        <thead className="table-header-orange">
          <tr>
            <th style={{ cursor: "pointer" }}>
              S No.
            </th>
            <th style={{ cursor: "pointer" }}>
              Candidate
            </th>
            <th style={{ cursor: "pointer" }}>
              Application Details
            </th>
            <th style={{ cursor: "pointer" }}>
              Payment Info
            </th>
            <th style={{ cursor: "pointer" }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className="table-body-orange">
					{currentPayments.map((row, index) => (
						<tr key={index}>
							<td className="text-muted" style={{ fontSize: "14px", fontWeight: 500 }}>
								{(currentPage - 1) * itemsPerPage + index + 1}
							</td>

							<td className="d-flex flex-column">
								<span className="text-muted" style={{ fontSize: "14px", fontWeight: 500 }}>
									{row?.candidateName}
								</span>
								<span className="text-muted">{row?.candidateEmail}</span>
								<span style={{ visibility: "hidden" }}>-</span>
							</td>

							<td>
								<span className="text-muted" style={{ fontSize: "14px", fontWeight: 500 }}>
									{row?.positionTitle}
								</span>
							</td>

							<td className="d-flex flex-column">
								<span className="text-muted" style={{ fontSize: "14px", fontWeight: 500 }}>
									₹{(row?.razorpayOrderDetails?.amount / 100).toLocaleString()}
								</span>
								<span className="text-muted">
									{new Date(row?.razorpayOrderDetails?.createdAt).toLocaleString("en-IN", {
										day: "2-digit",
										month: "short",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
								<span className="text-muted">
									Transaction ID:{" "}
									<span style={{ fontWeight: 500 }}>
										{row?.razorpayOrderDetails?.paymentId || "-"}
									</span>
								</span>
							</td>

							<td>
								<span
									className={`badge ${
										row?.razorpayOrderDetails?.status?.toLowerCase() === "paid"
											? "text-success success_class"
											: row?.razorpayOrderDetails?.status?.toLowerCase() === "failed"
											? "text-danger danger_class"
											: "text-warning warning_class"
									}`}
								>
									{row?.razorpayOrderDetails?.status}
								</span>
							</td>
						</tr>
					))}
					{currentPayments.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">No records found</td>
            </tr>
          )}
				</tbody>
      </Table>
			<div className="d-flex justify-content-between align-items-center mt-3">
			<div>
				<Form.Select
					style={{ width: "120px" }}
					value={itemsPerPage}
					onChange={handleItemsPerPageChange}
				>
					<option value={5}>5 rows</option>
					<option value={10}>10 rows</option>
					<option value={20}>20 rows</option>
				</Form.Select>
			</div>

			<nav className='pagination_container'>
				<ul className="pagination mb-0">
					<li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
						<button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
					</li>

					{[...Array(totalPages)].map((_, idx) => (
						<li key={idx} className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}>
							<button className="page-link" onClick={() => setCurrentPage(idx + 1)}>
								{idx + 1}
							</button>
						</li>
					))}

					<li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
						<button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
					</li>
				</ul>
			</nav>
		</div>
    </div>
  )
}

export default Payments