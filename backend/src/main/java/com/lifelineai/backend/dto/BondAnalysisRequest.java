package com.lifelineai.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BondAnalysisRequest {
    
    private Long relationshipBondId;
    
    // AI Analysis Results
    private String relationshipClassification;
    private Integer toxicityScore;
    private String attachmentStyle;
    private String relationshipStage;
    private String conflictResolutionStyle;
    private Integer gaslightingScore;
    private Integer trustLevel;
    private Double confidenceScore;
    
    // Collections
    private List<String> communicationPatterns;
    private List<String> redFlags;
    private List<String> greenFlags;
    private List<String> codependencyIndicators;
    private List<String> recommendations;
    
    // Emotional Health Indicators
    private Map<String, Integer> emotionalHealthIndicators;
    
    // Love Languages Assessment
    private Map<String, Object> loveLanguagesAssessment;
}