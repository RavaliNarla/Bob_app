import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import "../css/Relaxation.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiService } from "../services/apiService";
import Relaxation from "../components/Relaxation";
const RelaxationPage = () => {
  console.log("ravali")
  const [relaxationPolicies, setRelaxationPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isCreateNew, setIsCreateNew] = useState(false); // 🔹 Track "create new mode"
  const [formData, setFormData] = useState(null); // 🔹 Data from Relaxation child

  // Fetch policies on load
  useEffect(() => {
    const fetchRelaxations = async () => {
      try {
        const res = await apiService.getRelaxations();
        if (Array.isArray(res)) {
          setRelaxationPolicies(res);
        } else if (res?.data && Array.isArray(res.data)) {
          setRelaxationPolicies(res.data);
        } else {
          setRelaxationPolicies([]);
        }
      } catch (error) {
        console.error("Error fetching relaxations:", error);
        toast.error("Failed to load relaxation policies.");
        setRelaxationPolicies([]);
      }
    };
    fetchRelaxations();
  }, []);

  // Handle dropdown change
  const handlePolicyChange = (e) => {
    const policyId = e.target.value;
    setSelectedPolicyId(policyId);
    setIsCreateNew(false); // Switching to update mode
    if (policyId) {
      const policyObj = relaxationPolicies.find(
        (p) => String(p.job_relaxation_policy_id) === policyId
      );
      setSelectedPolicy(policyObj || null);
    } else {
      setSelectedPolicy(null);
    }
  };

  // Handle "Create New" click
  const handleCreateNew = () => {
    setIsCreateNew(true);
    setSelectedPolicyId("");
    setSelectedPolicy(null);
    setFormData(null); // clear Relaxation form
  };

  // Handle Save All Changes
  const handleRelaxationSave = async (data) => {
    if (!data) {
      toast.info("Save cancelled.");
      return;
    }

    setFormData(data);

    try {
      if (isCreateNew) {
        // 🔹 Save as NEW policy
        const response = await apiService.saveRelaxation(data);
        if (response?.success) {
          toast.success("New Relaxation Policy created!");
          setRelaxationPolicies((prev) => [...prev, response.data]);
          setSelectedPolicy(response.data);
          setSelectedPolicyId(response.data.job_relaxation_policy_id);
          setIsCreateNew(false);
        } else {
          toast.error("Failed to create new policy.");
        }
      } else {
        // 🔹 Update existing policy
        const response = await apiService.updateRelaxation(
          selectedPolicyId,
          data
        );

        if (response?.success) {
          toast.success("Policy updated successfully!");
          // update local list
          setRelaxationPolicies((prev) =>
            prev.map((p) =>
              p.job_relaxation_policy_id === selectedPolicyId
                ? { ...p, ...data }
                : p
            )
          );
        } else if (response?.status === "REJECTED") {
          // Backend rejected update
          if (
            window.confirm(
              "This policy cannot be updated. Do you want to save as a new policy instead?"
            )
          ) {
            setIsCreateNew(true);
            await handleRelaxationSave(data); // retry as create new
          }
        } else {
          toast.error("Failed to update policy.");
        }
      }
    } catch (error) {
      console.error("Error saving relaxation policy:", error);
      toast.error("Something went wrong while saving.");
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="card">
        <div className="card-body">
          {/* Dropdown */}
          <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
            <label htmlFor="job_relaxation_policy_id" className="form-label">
              Relaxation Policy <span className="required-asterisk">*</span>
            </label>
            <select
              id="job_relaxation_policy_id"
              name="job_relaxation_policy_id"
              className="form-select"
              value={selectedPolicyId}
              onChange={handlePolicyChange}
              disabled={isCreateNew} // disable dropdown in create new mode
            >
              <option value="">-- Select Relaxation --</option>
              {relaxationPolicies.map((policy) => (
                <option
                  key={policy.job_relaxation_policy_id}
                  value={policy.job_relaxation_policy_id}
                >
                  {policy.relaxation_policy_number}
                </option>
              ))}
            </select>
          </div>

          {/* Create New Button */}
          <Button variant="secondary" onClick={handleCreateNew} className="mb-3">
            Create New
          </Button>

          {/* Relaxation Form */}
          <Relaxation
            key={isCreateNew ? "new" : selectedPolicyId} // 🔹 re-render form
            selectedPolicy={selectedPolicy}
            onRelaxationSave={handleRelaxationSave}
          />
        </div>
      </div>
    </Container>
  );
};

export default RelaxationPage;
