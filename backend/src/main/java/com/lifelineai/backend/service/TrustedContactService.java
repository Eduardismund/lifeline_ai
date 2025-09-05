package com.lifelineai.backend.service;

import com.lifelineai.backend.entity.TrustedContact;
import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.repository.TrustedContactRepository;
import com.lifelineai.backend.repository.RelationshipBondRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrustedContactService {
    
    private final TrustedContactRepository trustedContactRepository;
    private final RelationshipBondRepository relationshipBondRepository;
    
    public List<TrustedContact> getTrustedContactsByBondId(Long bondId) {
        return trustedContactRepository.findByRelationshipBondId(bondId);
    }
    
    public TrustedContact addTrustedContact(Long bondId, TrustedContact contact) {
        RelationshipBond bond = relationshipBondRepository.findById(bondId)
            .orElseThrow(() -> new RuntimeException("Relationship bond not found"));
        
        contact.setRelationshipBond(bond);
        return trustedContactRepository.save(contact);
    }
    
    public void deleteTrustedContact(Long contactId) {
        trustedContactRepository.deleteById(contactId);
    }
}