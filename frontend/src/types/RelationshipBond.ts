export interface RelationshipBond {
  id?: number;
  partnerName: string;
  relationshipType?: RelationshipType;
  backgroundDescription?: string;
  relationshipStartDate?: string;
  currentStatus?: RelationshipStatus;
  analysisStatus?: AnalysisStatus;
  createdAt?: string;
  lastUpdated?: string;
  evidenceFiles?: EvidenceFile[];
  analysis?: BondToxicityAnalysis;
  trustedContacts?: TrustedContact[];
}

export type RelationshipType = 
  | 'ROMANTIC_PARTNER'
  | 'EX_PARTNER'
  | 'SPOUSE'
  | 'EX_SPOUSE'
  | 'FAMILY_MEMBER'
  | 'FRIEND'
  | 'COWORKER'
  | 'BOSS'
  | 'OTHER';

export type RelationshipStatus = 
  | 'ONGOING'
  | 'ENDED'
  | 'COMPLICATED'
  | 'NO_CONTACT';

export type AnalysisStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface EvidenceFile {
  id?: number;
  fileName: string;
  s3Url: string;
  fileType: FileType;
  evidenceContext?: string;
  evidenceDate?: string;
  mimeType?: string;
  uploadedAt?: string;
  processingStatus?: FileProcessingStatus;
  extractedText?: string;
}

export type FileType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';

export type FileProcessingStatus = 
  | 'UPLOADED'
  | 'EXTRACTING'
  | 'EXTRACTED'
  | 'FAILED';

export interface BondToxicityAnalysis {
  relationshipBondId: number;
  overallToxicityScore?: number;
  riskLevel?: RiskLevel;
  patternsDetected?: ToxicityPattern[];
  rawAnalysisJson?: string;
  analyzedAt?: string;
  lastUpdatedAt?: string;
  generatedPdfS3Url?: string;
  pdfGeneratedAt?: string;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type ToxicityPattern = 
  | 'GASLIGHTING'
  | 'EMOTIONAL_MANIPULATION'
  | 'THREATS_VIOLENCE'
  | 'PHYSICAL_VIOLENCE'
  | 'ISOLATION_TACTICS'
  | 'FINANCIAL_CONTROL'
  | 'STALKING_BEHAVIOR'
  | 'JEALOUSY_POSSESSIVENESS'
  | 'VERBAL_ABUSE'
  | 'INTIMIDATION'
  | 'LOVE_BOMBING'
  | 'SEXUAL_COERCION'
  | 'DIGITAL_ABUSE'
  | 'PROPERTY_DESTRUCTION';

export interface TrustedContact {
  id?: number;
  email: string;
  description?: string;
  createdAt?: string;
}