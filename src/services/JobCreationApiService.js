
//import axios from 'axios';


export const JobCreationApiService = {
  async getGradeData() {
    try {
      //return response.data;
      return [
        { JobGradeID: 'G1', GradeName: 'Grade 5' },
        { JobGradeID: 'G2', GradeName: 'Grade 2' },
        { JobGradeID: 'G3', GradeName: 'Grade 3' }
        ];
    } catch (error) {
      console.error('Error fetching grade data:', error);
      throw error;
    }
  },
   async getBusinessunitData() {
    try {
      //return response.data;
      return [
        { BusinessUnitID: 'G1', BusinessUnitName: 'Business 5' },
        { BusinessUnitID: 'G2', BusinessUnitName: 'Business 2' },
        { BusinessUnitID: 'G3', BusinessUnitName: 'Business 3' }
        ];
    } catch (error) {
      console.error('Error fetching grade data:', error);
      throw error;
    }
  },
  // You can add more job creation related API methods here
  async getJobTitleData() {
    // Return static JSON for testing
     try {
      //return response.data;
     return [
      { JobTitleID: 'JT1', JobTitleName: 'Associate Engineer - II' },
      { JobTitleID: 'JT2', JobTitleName: 'Senior Developer' },
      { JobTitleID: 'JT3', JobTitleName: 'Project Manager' }
    ];
    } catch (error) {
      console.error('Error fetching grade data:', error);
      throw error;
    }
  },
  async getLocationData() {
    return [
      { LocationID: 'L1', LocationName: 'Mumbai' },
      { LocationID: 'L2', LocationName: 'Hyderabad' },
      { LocationID: 'L3', LocationName: 'Delhi' }
    ];
  },
  async getJobTypeData() {
    return [
      { JobTypeID: 'JT1', JobTypeName: 'Full-Time' },
      { JobTypeID: 'JT2', JobTypeName: 'Part-Time' },
      { JobTypeID: 'JT3', JobTypeName: 'Contract' },
      { JobTypeID: 'JT4', JobTypeName: 'Freelance' }
    ];
  },
  async getCasteData() {
    return [
      { CasteID: 'C1', CasteName: 'OC' },
      { CasteID: 'C2', CasteName: 'BC' },
      { CasteID: 'C3', CasteName: 'SC' },
      { CasteID: 'C4', CasteName: 'ST' }
    ];
  },
  async getPriorityData() {
    return [
      { PriorityID: 'P1', PriorityName: 'Immediate' },
      { PriorityID: 'P2', PriorityName: 'High' },
      { PriorityID: 'P3', PriorityName: 'Medium' },
      { PriorityID: 'P4', PriorityName: 'Low' }
    ];
  },
  async getNoOfPositionsData() {
    return [
      { NoOfPositionsID: 'N1', NoOfPositionsValue: 1 },
      { NoOfPositionsID: 'N2', NoOfPositionsValue: 5 },
      { NoOfPositionsID: 'N3', NoOfPositionsValue: 10 },
      { NoOfPositionsID: 'N4', NoOfPositionsValue: 15 }
    ];
  },
  async getEducationalQualificationData() {
    return [
      { QualificationID: 'Q1', QualificationName: 'Graduation' },
      { QualificationID: 'Q2', QualificationName: 'Post Graduation' },
      { QualificationID: 'Q3', QualificationName: 'Diploma' },
      { QualificationID: 'Q4', QualificationName: 'PhD' }
    ];
  },
   async getRelaxationPolicyData() {
    return [
      { policy_id: 'Q1', policy_name: 'policy1' },
      { policy_id: 'Q2', policy_name: 'policy2' },
      { policy_id: 'Q3', policy_name: 'policy3' },
      { policy_id: 'Q4', policy_name: 'policy4' }
    ];
  },
  async getWorkExperienceData()
  {
    return [
      { WorkExperienceID: 'Q1', WorkExperienceName: '1-3' },
      { WorkExperienceID: 'Q2', WorkExperienceName: '1-5' },
      { WorkExperienceID: 'Q3', WorkExperienceName: '2-3' }
    ];
  }
}