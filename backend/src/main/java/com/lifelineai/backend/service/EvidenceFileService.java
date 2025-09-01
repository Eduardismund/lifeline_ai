package com.lifelineai.backend.service;

import com.lifelineai.backend.entity.AnalysisStatus;
import com.lifelineai.backend.entity.EvidenceFile;
import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.entity.RelationshipStatus;
import com.lifelineai.backend.repository.EvidenceFileRepository;
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
public class EvidenceFileService {
    
    private final RelationshipBondRepository relationshipBondRepository;
    private final EvidenceFileRepository evidenceFileRepository;
    private final UserRepository userRepository;
    
    public EvidenceFile createEvidenceFile(Long relationshipBondId, EvidenceFile evidenceFile) {
        var relationshipBond = relationshipBondRepository.findById(relationshipBondId)
            .orElseThrow(() -> new RuntimeException("RelationshipBond not found"));
        
        evidenceFile.setRelationshipBond(relationshipBond);
        evidenceFile.setUploadedAt(LocalDateTime.now());

        return evidenceFileRepository.save(evidenceFile);
    }
    
    public Optional<EvidenceFile> getEvidenceFileById(Long id) {
        return evidenceFileRepository.findById(id);
    }

    public List<EvidenceFile> getAllEvidenceFilesByRelationshipBondId(Long relationshipBondId){
        return evidenceFileRepository.findAllByRelationshipBondId(relationshipBondId);

    }

    public EvidenceFile updateEvidenceFile(Long id, EvidenceFile updatedEvidenceFile) {
        EvidenceFile evidenceFile = evidenceFileRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Evidence file not found"));
        
        evidenceFile.setFileName(updatedEvidenceFile.getFileName());
        evidenceFile.setFileType(updatedEvidenceFile.getFileType());
        evidenceFile.setEvidenceContext(updatedEvidenceFile.getEvidenceContext());
        evidenceFile.setEvidenceDate(updatedEvidenceFile.getEvidenceDate());
        evidenceFile.setProcessingStatus(updatedEvidenceFile.getProcessingStatus());
        evidenceFile.setExtractedText(updatedEvidenceFile.getExtractedText());
        
        return evidenceFileRepository.save(evidenceFile);
    }
    
    public void deleteEvidenceFileById(Long id) {
        evidenceFileRepository.deleteById(id);
    }

}