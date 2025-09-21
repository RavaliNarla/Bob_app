import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import Relaxation from "../components/Relaxation";
import "../css/Relaxation.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiService } from "../services/apiService";

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
       
        const payload = {
          job_relaxation_policy_id: selectedPolicyId,
          relaxation_policy_number: selectedPolicy?.relaxation_policy_number ,
          ...data,   // this should contain relaxation, relaxation_policy_number, etc.
        };
     
        const response = await apiService.updateRelaxation(payload);
  
        console.log(response);
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
          {/* <h2 className="mb-4">Relaxation Policy Management</h2> */}
          <div>
              <h5 className='px-2' style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Relaxation Policy</h5>
          </div>
          <div className="row mb-4">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="form-group">
                {/* <label htmlFor="job_relaxation_policy_id" className="form-label">
                  <strong>Relaxation Policy</strong> 
                </label> */}
                <div className="input-group">
                  <select
                    id="job_relaxation_policy_id"
                    name="job_relaxation_policy_id"
                    className="form-control form-select"
                    value={selectedPolicyId}
                    onChange={handlePolicyChange}
                    disabled={isCreateNew || isLoading}
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
                  <Button 
                    variant="outline-primary" 
                    onClick={handleCreateNew}
                    disabled={isLoading}
                    className="ms-2"
                  >
                    {isCreateNew ? 'Creating New...' : 'Create New'}
                  </Button>
                </div>
              </div>
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
