package com.lifelineai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bond_toxicity_analysis")
public class BondToxicityAnalysis {
    @Id
    @Column(name = "relationship_bond_id")
    private Long relationshipBondId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_bond_id", insertable = false, updatable = false)
    @JsonBackReference("bond-analysis")
    private RelationshipBond relationshipBond;

    // AI Analysis Results
    private String relationshipClassification; // HEALTHY, GROWING, STRUGGLING, etc.
    private Integer toxicityScore; // 0-100
    private String attachmentStyle; // SECURE, ANXIOUS, AVOIDANT, etc.
    private String relationshipStage; // Knapp's model stages
    private String conflictResolutionStyle;
    private Integer gaslightingScore; // 0-100
    private Integer trustLevel; // 0-100
    private Double confidenceScore; // 0.0-1.0

    // Communication Patterns
    @ElementCollection
    @CollectionTable(name = "communication_patterns",
            joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "pattern")
    private List<String> communicationPatterns = new ArrayList<>();

    // Emotional Health Indicators (0-100 scores)
    private Integer emotionalSupport;
    private Integer validation;
    private Integer empathyLevel;
    private Integer emotionalSafety;

    // Red Flags
    @ElementCollection
    @CollectionTable(name = "red_flags",
            joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "flag")
    private List<String> redFlags = new ArrayList<>();

    // Green Flags
    @ElementCollection
    @CollectionTable(name = "green_flags",
            joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "flag")
    private List<String> greenFlags = new ArrayList<>();

    // Love Languages Assessment
    private String primaryLoveExpression;
    private Boolean loveNeedsMet;
    private String loveCompatibility;

    // Codependency Indicators
    @ElementCollection
    @CollectionTable(name = "codependency_indicators",
            joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "indicator")
    private List<String> codependencyIndicators = new ArrayList<>();

    // Recommendations
    @ElementCollection
    @CollectionTable(name = "recommendations",
            joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "recommendation", columnDefinition = "TEXT")
    private List<String> recommendations = new ArrayList<>();

    // Meta data
    @Column(columnDefinition = "TEXT")
    private String rawAnalysisJson;

    private LocalDateTime analyzedAt;
    private LocalDateTime lastUpdatedAt;

    private String generatedPdfS3Url;
    private LocalDateTime pdfGeneratedAt;
}

