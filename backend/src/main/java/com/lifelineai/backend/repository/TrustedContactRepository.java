package com.lifelineai.backend.repository;

import com.lifelineai.backend.entity.TrustedContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrustedContactRepository extends JpaRepository<TrustedContact, Long> {
    List<TrustedContact> findByRelationshipBondId(Long relationshipBondId);
    void deleteByRelationshipBondId(Long relationshipBondId);
}