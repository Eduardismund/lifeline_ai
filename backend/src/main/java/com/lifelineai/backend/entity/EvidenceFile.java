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
@Table(name = "evidence_files")
public class EvidenceFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_bond_id", nullable = false)
    @JsonBackReference("bond-evidence")
    private RelationshipBond relationshipBond;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String s3Url;

    @Column(nullable = false)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Column(columnDefinition = "TEXT")
    private String evidenceContext;

    private LocalDate evidenceDate;
    private String mimeType;
    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    private FileProcessingStatus processingStatus = FileProcessingStatus.UPLOADED;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

}

