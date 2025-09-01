package com.lifelineai.backend.repository;

import com.lifelineai.backend.entity.AnalysisStatus;
import com.lifelineai.backend.entity.EvidenceFile;
import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.entity.RelationshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceFileRepository extends JpaRepository<EvidenceFile, Long> {
    List<EvidenceFile> findAllByRelationshipBondId(Long relationshipBondId);
}