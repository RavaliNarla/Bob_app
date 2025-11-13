import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import Relaxation from "../components/Relaxation";
import "../css/Relaxation.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiService } from "../services/apiService";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
const RelaxationPage = () => {
  const [relaxationPolicies, setRelaxationPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isCreateNew, setIsCreateNew] = useState(false); // 🔹 Track "create new mode"
  const [formData, setFormData] = useState(null); // 🔹 Data from Relaxation child
  const [isLoading, setIsLoading] = useState(false);

  // Fetch policies on load
  useEffect(() => {
    const fetchRelaxations = async () => {
      setIsLoading(true);
      setIsCreateNew(true);
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
      } finally {
        setIsLoading(false);
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
  const handleRelaxationSave = async (e) => {
    // 🛑 Handle both form submit event and direct data call
    let data = e;
    if (e?.preventDefault) {
      e.preventDefault();
      data = formData; // fallback to current state if from submit
    }
  
    if (!data) {
      toast.info("Save cancelled.");
      return;
    }
  
    setFormData(data);
  // console.log("data", data);
  // console.log("isCreateNew", isCreateNew);
  // console.log("selectedPolicyId", selectedPolicyId);
  if (!isCreateNew && !selectedPolicyId) {
    
    toast.error("No policy selected to update. Please create or select a policy first.");
    return;
  }
    try {
      if (isCreateNew) {
        // 🔹 Save as NEW policy
        const response = await apiService.saveRelaxation(data);
        // console.log("response", response);
        if (response?.success) {
          toast.success(response?.message|| "Relaxation Policy created successfully!");
          setRelaxationPolicies((prev) => [...prev, response.data]);
          setSelectedPolicy(response.data);
          setSelectedPolicyId(response.data.job_relaxation_policy_id);
          setIsCreateNew(false);
        } else {
          toast.error("Failed to create new policy.");
        }
      } else {
        // 🔹 Update existing policy
        // console.log("Updating existing policy...");
  
        const payload = { ...data };
  
        const response = await apiService.updateRelaxation(selectedPolicyId, payload);
        // console.log("Update response:", response);
  
        if (response?.success === true) {
          toast.success(response?.message || "Relaxation Policy updated successfully!");
          setRelaxationPolicies((prev) =>
            prev.map((p) =>
              p.job_relaxation_policy_id === selectedPolicyId
                ? { ...p, ...data }
                : p
            )
          );
        } else if (response?.success === false) {
          // 🚨 Use SweetAlert2 instead of window.confirm
          Swal.fire({
            title: "Cannot Update Policy",
            text: "This policy cannot be updated. Do you want to save as a new policy instead?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Save as New",
            cancelButtonText: "Cancel",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const newResponse = await apiService.saveRelaxation(data);
              if (newResponse?.success) {
                toast.success(newResponse?.message || "Relaxation Policy created Successfully!");
                setRelaxationPolicies((prev) => [...prev, newResponse.data]);
                setSelectedPolicy(newResponse.data);
                setSelectedPolicyId(newResponse.data.job_relaxation_policy_id);
                setIsCreateNew(false);
              } else {
                toast.error(newResponse?.message || "Failed to create new policy.");
              }
            }
          });
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
          {/* <h2 className="mb-4">Relaxation Policy Management</h2> */}
          <div>
              <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '15px' }}>Relaxation Policy</h5>
          </div>
          <div className="row mb-4 align-items-center">
  {/* Dropdown stays in the left column */}
  <div className="col-md-3" style={{ paddingLeft: '0px' }}>
    <div className="form-group">
      <select
        id="job_relaxation_policy_id"
        name="job_relaxation_policy_id"
        className="form-control form-select"
        value={selectedPolicyId}
        onChange={handlePolicyChange}
      >
        <option value="">Select Relaxation Policy</option>
        {relaxationPolicies.map((policy) => (
          <option
            key={policy.job_relaxation_policy_id}
            value={policy.job_relaxation_policy_id}
          >
            {policy.relaxation_policy_number || `Policy ${policy.job_relaxation_policy_id}`}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Button on the right side of the row */}
  <div className="col d-flex justify-content-end" style={{ paddingRight: '0px' }}>
    <Button 
      variant="outline-primary create_new_btn" 
      onClick={handleCreateNew}
      disabled={isLoading}
    >
       <FontAwesomeIcon icon={faPlusCircle} /> &nbsp;
      {isCreateNew ? 'Create New' : 'Create New'}
    </Button>
  </div>
</div>


          <Relaxation
            key={isCreateNew ? 'new' : selectedPolicyId}
            selectedPolicy={selectedPolicy}
            onRelaxationSave={handleRelaxationSave}
          />

          {isLoading && (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default RelaxationPage;
