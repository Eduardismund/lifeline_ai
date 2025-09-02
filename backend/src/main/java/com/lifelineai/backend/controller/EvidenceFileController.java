package com.lifelineai.backend.controller;

import com.lifelineai.backend.entity.AnalysisStatus;
import com.lifelineai.backend.entity.EvidenceFile;
import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.entity.RelationshipStatus;
import com.lifelineai.backend.service.EvidenceFileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evidence-file")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EvidenceFileController {
    
    private final EvidenceFileService evidenceFileService;
    
    @PostMapping("/relationship-bond/{relationShipBondId}")
    public ResponseEntity<EvidenceFile> createEvidenceFile(
            @PathVariable Long relationShipBondId,
            @Valid @RequestBody EvidenceFile evidenceFile) {
        EvidenceFile created = evidenceFileService.createEvidenceFile(relationShipBondId, evidenceFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EvidenceFile> getEvidenceFile(@PathVariable Long id) {
        return evidenceFileService.getEvidenceFileById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvidenceFile> updateEvidenceFile(
            @PathVariable Long id,
            @RequestBody EvidenceFile evidenceFile) {
        EvidenceFile updated = evidenceFileService.updateEvidenceFile(id, evidenceFile);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvidenceFile(@PathVariable Long id) {
        evidenceFileService.deleteEvidenceFileById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/relationship-bond/{relationshipBondId}")
    public ResponseEntity<List<EvidenceFile>> getAllByRelationshipBond(@PathVariable Long relationshipBondId) {
        List<EvidenceFile> files = evidenceFileService.getAllEvidenceFilesByRelationshipBondId(relationshipBondId);
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/{id}/download-url")
    public ResponseEntity<String> getDownloadUrl(@PathVariable Long id) {
        String downloadUrl = evidenceFileService.generateDownloadUrl(id);
        return ResponseEntity.ok(downloadUrl);
    }
}