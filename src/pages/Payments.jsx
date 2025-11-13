import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Row, Table } from 'react-bootstrap'
import apiService from '../services/apiService'
import PaginationControls from '../components/PaginationControls'

const Payments = () => {
	const [paymentData, setPaymentData] = useState([])
	const [statusFilter, setStatusFilter] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)

	const fetchPayments = async () => {
    try {
      const res = await apiService.getPayment();

	  setPaymentData(res?.data?.data || []);
    //   console.log("Fetched payments:", res?.data?.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
	setCurrentPage(1);
  }, [statusFilter, dateRange]);


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
    <div className='register_container login-container d-flex flex-column py-3 px-5'>
        <h5 className='mt-1' style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px !important', color: '#FF7043', marginBottom: '0px' }}>Payments</h5>

		<Row className="my-2 gap-3">
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
					<td className="text-muted" style={{ fontSize: "12px", fontWeight: 500 }}>
						{(currentPage - 1) * itemsPerPage + index + 1}
					</td>

					<td className="d-flex flex-column">
						<span className="text-muted" style={{ fontSize: "12px", fontWeight: 500 }}>
							{row?.candidateName}
						</span>
						<span className="text-muted">{row?.candidateEmail}</span>
						<span style={{ visibility: "hidden" }}>-</span>
					</td>

					<td>
						<span className="text-muted" style={{ fontSize: "12px", fontWeight: 500 }}>
							{row?.razorpayOrderDetails?.requisitionCode} - {row?.positionTitle}
						</span>
					</td>

					<td className="d-flex flex-column">
						<span className="text-muted" style={{ fontSize: "12px", fontWeight: 500 }}>
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
								{row?.razorpayOrderDetails?.orderId || "-"}
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
		
	  <PaginationControls
		currentPage={currentPage}
		totalPages={totalPages}
		itemsPerPage={itemsPerPage}
		onPageChange={(page) => setCurrentPage(page)}
		onItemsPerPageChange={(rows) => {
			setItemsPerPage(rows);
			setCurrentPage(1); // ✅ reset to first page on rows change
		}}
	  />
    </div>
  )
}

export default Payments