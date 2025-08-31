package com.lifelineai.backend.entity;

public enum MedicalCondition {
    // Mental Health Conditions
    ANXIETY_DISORDER,
    DEPRESSION,
    PTSD,
    BIPOLAR_DISORDER,
    PANIC_DISORDER,
    OCD,
    ADHD,
    EATING_DISORDER,
    SUBSTANCE_USE_DISORDER,
    BORDERLINE_PERSONALITY_DISORDER,

    // Physical Conditions that may affect vulnerability
    CHRONIC_PAIN,
    FIBROMYALGIA,
    CHRONIC_FATIGUE_SYNDROME,
    AUTOIMMUNE_CONDITION,
    DISABILITY,
    HEARING_IMPAIRMENT,
    VISION_IMPAIRMENT,
    MOBILITY_IMPAIRMENT,

    // Conditions affecting cognitive function
    TRAUMATIC_BRAIN_INJURY,
    LEARNING_DISABILITY,
    AUTISM_SPECTRUM_DISORDER,

    // Other relevant conditions
    PREGNANCY,
    POSTPARTUM_CONDITIONS,
    CHRONIC_ILLNESS,

    // General categories
    OTHER_MENTAL_HEALTH,
    OTHER_PHYSICAL_CONDITION,
    PREFER_NOT_TO_SAY
}