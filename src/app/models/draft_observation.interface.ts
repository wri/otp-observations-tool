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
  observers?: string[]; // Array of observer ids
  observationReportId?: string;
  operatorId?: string;
  // localId identifies a document across submission attempts, see ObservationSubmissionService
  documents?: { localId?: string, id?: string, name: string, attachment: string | { url: string }, attachement?: string | { url: string }, 'observation-report-id'?: number, 'document-type'?: string }[];

  locale?: string;

  // New report
  reportTitle?: string;
  reportAttachment?: string; // Base64
  reportDate?: Date;
  reportMissionType?: string;

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
  governments?: string[]; // Array of government ids
  relevantOperators?: string[]; // Array of relevant operator ids
}
