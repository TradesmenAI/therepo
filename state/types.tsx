


export interface Profile {
    full_name: string,
    email: string,
    phone: string|null,
    skills: string[],
    credits: number
}

export interface JobDetails {
    id: number,
    text: string,
    company_id:number
}

export interface JobCompany {
    id: number,
    companyName: string,
    location?:   string,
    job_title:   string,
    date_from:   Date,
    date_to?:    Date,
    details:     JobDetails[]
}

export interface ResumeRequest {
    id:                 number
    title:              string
    description?:       string
    descriptionUrl?:    string
    status:             string
    resumeUrl?:         string
}