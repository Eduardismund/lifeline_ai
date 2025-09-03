package com.lifelineai.backend.repository;

import com.lifelineai.backend.entity.BondToxicityAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface BondToxicityAnalysisRepository extends JpaRepository<BondToxicityAnalysis, Long> {
    
    Optional<BondToxicityAnalysis> findByRelationshipBondId(Long relationshipBondId);
    
    boolean existsByRelationshipBondId(Long relationshipBondId);
    
    @Modifying
    @Transactional
    void deleteByRelationshipBondId(Long relationshipBondId);
}