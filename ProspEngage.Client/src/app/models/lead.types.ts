export interface Country {
    countryId: number;
    countryName: string;
  }
 
  export interface State {
    stateId: number;
    stateName: string;
    countryId: number;
  }
 
  export interface Lead {
    state: any;
    country: any;
    addressLine1: any;
    employeeCount: any;
    companyName: any;
    status: any;
    leadId: number;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phoneNumber: string;
    sourceProfile: string;
    company: string;
    dealSize: number;
    numberOfEmployees: number;
    leadStatus: string;
    budget: number;
    authority: string;
    need: string;
    timeline: string;
    leadSource: string;
    comments: string;
    created_On: string;
    created_By: string;
    modified_On: string;
    modified_By: string;
    isActive: boolean;
  }
 
  export interface LeadFormData {
    leadId: string;
    status: string;
    contacts: Array<{
      firstName: string;
      lastName: string;
      jobTitle: string;
      email: string;
      phone: string;
      SourceProfile: string;
    }>;
    companyName: string;
    DealSize: string;
    employeeCount: string;
    budget: string;
    addressLine1: string;
    country: string;
    state: string;
    city: string;
    zip: string;
    authority: string;
    need: string;
    timeline: string;
    leadSource: string;
    comments: string;
  }
 
  export interface Contact {
    firstName: string;
    lastName: string;
    jobTitle: string;
    phone: string;
    email: string;
    SourceProfile: string;
  }
