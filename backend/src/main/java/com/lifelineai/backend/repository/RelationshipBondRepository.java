package com.lifelineai.backend.repository;

import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.entity.RelationshipStatus;
import com.lifelineai.backend.entity.AnalysisStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelationshipBondRepository extends JpaRepository<RelationshipBond, Long> {
    
    List<RelationshipBond> findByUserId(Long userId);

    List<RelationshipBond> findAllByUserId(Long userId);

    List<RelationshipBond> findByUserIdAndCurrentStatus(Long userId, RelationshipStatus status);
    
    List<RelationshipBond> findByAnalysisStatus(AnalysisStatus analysisStatus);
    
    boolean existsByPartnerName(String partnerName);
}