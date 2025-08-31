package com.lifelineai.backend.service;

import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.entity.RelationshipStatus;
import com.lifelineai.backend.entity.AnalysisStatus;
import com.lifelineai.backend.repository.RelationshipBondRepository;
import com.lifelineai.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class RelationshipBondService {
    
    private final RelationshipBondRepository relationshipBondRepository;
    private final UserRepository userRepository;
    
    public RelationshipBond createRelationshipBond(Long userId, RelationshipBond bond) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        bond.setUser(user);
        bond.setCreatedAt(LocalDateTime.now());
        bond.setLastUpdated(LocalDateTime.now());
        bond.setAnalysisStatus(AnalysisStatus.PENDING);
        
        return relationshipBondRepository.save(bond);
    }
    
    public Optional<RelationshipBond> getRelationshipBondById(Long id) {
        return relationshipBondRepository.findById(id);
    }

    public List<RelationshipBond> getAllRelationshipBondsByUserId(Long userId){
        return relationshipBondRepository.findAllByUserId(userId);

    }
    public List<RelationshipBond> getRelationshipBondsByUserId(Long userId) {
        return relationshipBondRepository.findByUserId(userId);
    }
    
    public List<RelationshipBond> getRelationshipBondsByStatus(Long userId, RelationshipStatus status) {
        return relationshipBondRepository.findByUserIdAndCurrentStatus(userId, status);
    }
    
    public List<RelationshipBond> getPendingAnalysis() {
        return relationshipBondRepository.findByAnalysisStatus(AnalysisStatus.PENDING);
    }
    
    public RelationshipBond updateRelationshipBond(Long id, RelationshipBond updatedBond) {
        RelationshipBond bond = relationshipBondRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Relationship bond not found"));
        
        bond.setPartnerName(updatedBond.getPartnerName());
        bond.setRelationshipType(updatedBond.getRelationshipType());
        bond.setBackgroundDescription(updatedBond.getBackgroundDescription());
        bond.setRelationshipStartDate(updatedBond.getRelationshipStartDate());
        bond.setCurrentStatus(updatedBond.getCurrentStatus());
        bond.setLastUpdated(LocalDateTime.now());
        
        return relationshipBondRepository.save(bond);
    }
    
    public void deleteRelationshipBond(Long id) {
        relationshipBondRepository.deleteById(id);
    }
    
    public RelationshipBond updateAnalysisStatus(Long id, AnalysisStatus status) {
        RelationshipBond bond = relationshipBondRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Relationship bond not found"));
        
        bond.setAnalysisStatus(status);
        bond.setLastUpdated(LocalDateTime.now());
        
        return relationshipBondRepository.save(bond);
    }
}