package com.lifelineai.backend.controller;

import com.lifelineai.backend.dto.BondAnalysisRequest;
import com.lifelineai.backend.entity.BondToxicityAnalysis;
import com.lifelineai.backend.entity.RelationshipBond;
import com.lifelineai.backend.repository.BondToxicityAnalysisRepository;
import com.lifelineai.backend.repository.RelationshipBondRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bond-analysis")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BondToxicityAnalysisController {
    
    private final BondToxicityAnalysisRepository analysisRepository;
    private final RelationshipBondRepository bondRepository;
    
    @PostMapping
    public ResponseEntity<?> saveAnalysis(@Valid @RequestBody BondAnalysisRequest request) {
        try {
            System.out.println("=== SAVING ANALYSIS ===");
            System.out.println("Request: " + request);
            System.out.println("Relationship Bond ID: " + request.getRelationshipBondId());
            
            // Check if relationship bond exists
            RelationshipBond bond = bondRepository.findById(request.getRelationshipBondId())
                .orElseThrow(() -> new RuntimeException("Relationship bond not found"));
            
            System.out.println("Found relationship bond: " + bond.getId());
            
            // Create or update analysis
            BondToxicityAnalysis analysis = analysisRepository.findByRelationshipBondId(request.getRelationshipBondId())
                .orElseGet(() -> {
                    System.out.println("Creating NEW analysis for bond ID: " + request.getRelationshipBondId());
                    BondToxicityAnalysis newAnalysis = new BondToxicityAnalysis();
                    newAnalysis.setRelationshipBondId(request.getRelationshipBondId());
                    return newAnalysis;
                });
            
            System.out.println("Analysis before mapping - ID: " + analysis.getRelationshipBondId());
            
            // Don't set the relationship bond since we're managing ID manually
            // analysis.setRelationshipBond(bond); 
            
            // Ensure ID is set
            if (analysis.getRelationshipBondId() == null) {
                analysis.setRelationshipBondId(request.getRelationshipBondId());
                System.out.println("Had to explicitly set ID to: " + analysis.getRelationshipBondId());
            }
            analysis.setRelationshipClassification(request.getRelationshipClassification());
            analysis.setToxicityScore(request.getToxicityScore());
            analysis.setAttachmentStyle(request.getAttachmentStyle());
            analysis.setRelationshipStage(request.getRelationshipStage());
            analysis.setConflictResolutionStyle(request.getConflictResolutionStyle());
            analysis.setGaslightingScore(request.getGaslightingScore());
            analysis.setTrustLevel(request.getTrustLevel());
            analysis.setConfidenceScore(request.getConfidenceScore());
            
            // Set collections
            analysis.setCommunicationPatterns(request.getCommunicationPatterns());
            analysis.setRedFlags(request.getRedFlags());
            analysis.setGreenFlags(request.getGreenFlags());
            analysis.setCodependencyIndicators(request.getCodependencyIndicators());
            analysis.setRecommendations(request.getRecommendations());
            
            // Set emotional health indicators from map
            if (request.getEmotionalHealthIndicators() != null) {
                analysis.setEmotionalSupport(request.getEmotionalHealthIndicators().get("emotional_support"));
                analysis.setValidation(request.getEmotionalHealthIndicators().get("validation"));
                analysis.setEmpathyLevel(request.getEmotionalHealthIndicators().get("empathy_level"));
                analysis.setEmotionalSafety(request.getEmotionalHealthIndicators().get("emotional_safety"));
            }
            
            // Set love languages from map
            if (request.getLoveLanguagesAssessment() != null) {
                analysis.setPrimaryLoveExpression((String) request.getLoveLanguagesAssessment().get("primary_expression"));
                analysis.setLoveNeedsMet((Boolean) request.getLoveLanguagesAssessment().get("needs_met"));
                analysis.setLoveCompatibility((String) request.getLoveLanguagesAssessment().get("compatibility"));
            }
            
            // Set timestamps
            LocalDateTime now = LocalDateTime.now();
            if (analysis.getAnalyzedAt() == null) {
                analysis.setAnalyzedAt(now);
            }
            analysis.setLastUpdatedAt(now);
            
            // Save analysis
            System.out.println("Saving analysis with ID: " + analysis.getRelationshipBondId());
            BondToxicityAnalysis savedAnalysis = analysisRepository.save(analysis);
            System.out.println("Analysis saved successfully with ID: " + savedAnalysis.getRelationshipBondId());
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Analysis saved successfully");
            response.put("analysisId", savedAnalysis.getRelationshipBondId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to save analysis: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/{relationshipBondId}")
    public ResponseEntity<BondToxicityAnalysis> getAnalysis(@PathVariable Long relationshipBondId) {
        return analysisRepository.findByRelationshipBondId(relationshipBondId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{relationshipBondId}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable Long relationshipBondId) {
        if (analysisRepository.existsByRelationshipBondId(relationshipBondId)) {
            analysisRepository.deleteByRelationshipBondId(relationshipBondId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}