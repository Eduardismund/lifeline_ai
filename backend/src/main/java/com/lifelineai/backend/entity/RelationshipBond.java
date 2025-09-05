package com.lifelineai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "relationship_bonds")
public class RelationshipBond {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @Column(nullable = false)
    private String partnerName;

    @Enumerated(EnumType.STRING)
    private RelationshipType relationshipType;

    @Column(columnDefinition = "TEXT")
    private String backgroundDescription;

    private LocalDate relationshipStartDate;

    @Enumerated(EnumType.STRING)
    private RelationshipStatus currentStatus;

    @Enumerated(EnumType.STRING)
    private AnalysisStatus analysisStatus = AnalysisStatus.PENDING;

    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    @OneToMany(mappedBy = "relationshipBond", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("bond-evidence")
    private List<EvidenceFile> evidenceFiles = new ArrayList<>();

    @OneToOne(mappedBy = "relationshipBond", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("bond-analysis")
    private BondToxicityAnalysis analysis;

    @OneToMany(mappedBy = "relationshipBond", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("bond-trusted-contacts")
    private List<TrustedContact> trustedContacts = new ArrayList<>();

}

