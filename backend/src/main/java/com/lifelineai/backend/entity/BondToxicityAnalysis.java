package com.lifelineai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDate;
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
    private Long relationshipBondId;

    @OneToOne
    @JoinColumn(name = "relationship_bond_id")
    @MapsId
    @JsonBackReference("bond-analysis")
    private RelationshipBond relationshipBond;

    // Analysis results
    private Double overallToxicityScore; // 0.0 - 10.0

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "bond_toxicity_patterns",
            joinColumns = @JoinColumn(name = "bond_analysis_id"))
    private List<ToxicityPattern> patternsDetected = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String rawAnalysisJson;

    private LocalDateTime analyzedAt;
    private LocalDateTime lastUpdatedAt;

    private String generatedPdfS3Url;
    private LocalDateTime pdfGeneratedAt;
}

