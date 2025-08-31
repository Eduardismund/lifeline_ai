package com.lifelineai.backend.controller;

import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.entity.RelationshipStatus;
import com.lifelineai.backend.entity.AnalysisStatus;
import com.lifelineai.backend.service.RelationshipBondService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relationship-bonds")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RelationshipBondController {
    
    private final RelationshipBondService relationshipBondService;
    
    @PostMapping("/user/{userId}")
    public ResponseEntity<RelationshipBond> createRelationshipBond(
            @PathVariable Long userId,
            @Valid @RequestBody RelationshipBond bond) {
        RelationshipBond created = relationshipBondService.createRelationshipBond(userId, bond);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RelationshipBond> getRelationshipBond(@PathVariable Long id) {
        return relationshipBondService.getRelationshipBondById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RelationshipBond>> getUserRelationshipBonds(@PathVariable Long userId) {
        List<RelationshipBond> bonds = relationshipBondService.getRelationshipBondsByUserId(userId);
        return ResponseEntity.ok(bonds);
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<RelationshipBond>> getUserBondsByStatus(
            @PathVariable Long userId,
            @PathVariable RelationshipStatus status) {
        List<RelationshipBond> bonds = relationshipBondService.getRelationshipBondsByStatus(userId, status);
        return ResponseEntity.ok(bonds);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RelationshipBond> updateRelationshipBond(
            @PathVariable Long id,
            @RequestBody RelationshipBond bond) {
        RelationshipBond updated = relationshipBondService.updateRelationshipBond(id, bond);
        return ResponseEntity.ok(updated);
    }
    
    @PutMapping("/{id}/analysis-status/{status}")
    public ResponseEntity<RelationshipBond> updateAnalysisStatus(
            @PathVariable Long id,
            @PathVariable AnalysisStatus status) {
        RelationshipBond updated = relationshipBondService.updateAnalysisStatus(id, status);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRelationshipBond(@PathVariable Long id) {
        relationshipBondService.deleteRelationshipBond(id);
        return ResponseEntity.noContent().build();
    }
}