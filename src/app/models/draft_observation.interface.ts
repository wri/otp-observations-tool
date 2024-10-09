export interface DraftObservation {
  observationType: string;
  publicationDate?: Date;
  actionsTaken?: string;
  validationStatus?: string;
  concernOpinion?: string;
  details?: string;
  evidenceType?: string;
  evidenceOnReport?: string;
  countryId?: string;
  subcategoryId?: string;
  severityId?: string;
  observers?: Array<string>; // Array of observer ids
  observationReportId?: string;
  operatorId?: string;
  documents?: { id?: string, name: string, attachment: string | { url: string }, attachement?: string | { url: string }, 'observation-report-id'?: number, 'document-type'?: string }[];

  // New report
  reportTitle?: string;
  reportAttachment?: string; // Base64
  reportDate?: Date;

  // New evidence
  evidenceTitle?: string;
  evidenceAttachment?: string; // Base64
  evidenceDocumentType?: string;

  nonConcessionActivity?: boolean;
  isPhysicalPlace?: boolean;
  litigationStatus?: string;
  locationAccuracy?: string;
  locationInformation?: string;
  lat?: number;
  lng?: number;
  pv?: string;
  lawId?: string;
  fmuId?: string;
  governments?: Array<string>; // Array of government ids
  relevantOperators?: Array<string>; // Array of relevant operator ids
}
