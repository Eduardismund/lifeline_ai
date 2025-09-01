export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profileDescription?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  medicalConditions?: MedicalCondition[];
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export type MedicalCondition = 
  | 'ANXIETY_DISORDER'
  | 'DEPRESSION'
  | 'PTSD'
  | 'BIPOLAR_DISORDER'
  | 'PANIC_DISORDER'
  | 'OCD'
  | 'ADHD'
  | 'EATING_DISORDER'
  | 'SUBSTANCE_USE_DISORDER'
  | 'BORDERLINE_PERSONALITY_DISORDER'
  | 'CHRONIC_PAIN'
  | 'FIBROMYALGIA'
  | 'CHRONIC_FATIGUE_SYNDROME'
  | 'AUTOIMMUNE_CONDITION'
  | 'DISABILITY'
  | 'HEARING_IMPAIRMENT'
  | 'VISION_IMPAIRMENT'
  | 'MOBILITY_IMPAIRMENT'
  | 'TRAUMATIC_BRAIN_INJURY'
  | 'LEARNING_DISABILITY'
  | 'AUTISM_SPECTRUM_DISORDER'
  | 'PREGNANCY'
  | 'POSTPARTUM_CONDITIONS'
  | 'CHRONIC_ILLNESS'
  | 'OTHER_MENTAL_HEALTH'
  | 'OTHER_PHYSICAL_CONDITION'
  | 'PREFER_NOT_TO_SAY';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}