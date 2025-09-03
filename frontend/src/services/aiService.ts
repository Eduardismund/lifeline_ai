const AI_API_URL = 'http://localhost:8002';
const BACKEND_API_URL = 'http://localhost:8080';

export interface RelationshipAnalysis {
  relationship_classification: string;
  toxicity_score: number;
  attachment_style: string;
  communication_patterns: string[];
  emotional_health_indicators: {
    emotional_support: number;
    validation: number;
    empathy_level: number;
    emotional_safety: number;
  };
  red_flags: string[];
  green_flags: string[];
  relationship_stage: string;
  love_languages_assessment: {
    primary_expression: string;
    needs_met: boolean;
    compatibility: string;
  };
  conflict_resolution_style: string;
  codependency_indicators: string[];
  gaslighting_score: number;
  trust_level: number;
  recommendations: string[];
  confidence_score: number;
}

export class AIService {

  static async analyzeRelationship(userId: number, relationshipBondId: number): Promise<RelationshipAnalysis> {
    try {
      // First, try to load existing analysis from backend
      const existingAnalysis = await this.loadAnalysisFromBackend(relationshipBondId);
      if (existingAnalysis) {
        console.log('Loaded existing analysis from backend');
        return existingAnalysis;
      }

      console.log('No existing analysis found, generating new one...');
      
      // Generate new analysis using AI
      const response = await fetch(`${AI_API_URL}/analyze-relationship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          relationship_bond_id: relationshipBondId
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const analysis = await response.json();
      
      // Save the analysis to backend
      try {
        await this.saveAnalysisToBackend(relationshipBondId, analysis);
        console.log('Analysis saved to backend successfully');
      } catch (saveError) {
        console.error('Failed to save analysis to backend:', saveError);
        // Don't throw here - we still want to return the analysis even if save fails
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing relationship:', error);
      throw error;
    }
  }

  static async loadAnalysisFromBackend(relationshipBondId: number): Promise<RelationshipAnalysis | null> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/bond-analysis/${relationshipBondId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 404) {
        return null; // No analysis exists
      }

      if (!response.ok) {
        throw new Error(`Failed to load analysis: ${response.statusText}`);
      }

      const backendAnalysis = await response.json();
      
      // Convert backend format to frontend format
      return this.convertBackendAnalysisToFrontend(backendAnalysis);
    } catch (error) {
      console.error('Error loading analysis from backend:', error);
      return null; // Return null on error, will trigger new analysis
    }
  }

  static async saveAnalysisToBackend(relationshipBondId: number, analysis: RelationshipAnalysis): Promise<void> {
    try {
      const backendRequest = {
        relationshipBondId: relationshipBondId,
        relationshipClassification: analysis.relationship_classification,
        toxicityScore: analysis.toxicity_score,
        attachmentStyle: analysis.attachment_style,
        relationshipStage: analysis.relationship_stage,
        conflictResolutionStyle: analysis.conflict_resolution_style,
        gaslightingScore: analysis.gaslighting_score,
        trustLevel: analysis.trust_level,
        confidenceScore: analysis.confidence_score,
        communicationPatterns: analysis.communication_patterns,
        redFlags: analysis.red_flags,
        greenFlags: analysis.green_flags,
        codependencyIndicators: analysis.codependency_indicators,
        recommendations: analysis.recommendations,
        emotionalHealthIndicators: analysis.emotional_health_indicators,
        loveLanguagesAssessment: analysis.love_languages_assessment
      };

      console.log('=== FRONTEND SAVING TO BACKEND ===');
      console.log('URL:', `${BACKEND_API_URL}/api/bond-analysis`);
      console.log('Request payload:', JSON.stringify(backendRequest, null, 2));

      const response = await fetch(`${BACKEND_API_URL}/api/bond-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to save analysis: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Backend save response:', responseData);
    } catch (error) {
      console.error('Error saving analysis to backend:', error);
      throw error; // Changed: now throw the error so we can see what's failing
    }
  }

  static async regenerateAnalysis(userId: number, relationshipBondId: number): Promise<RelationshipAnalysis> {
    try {
      console.log('Regenerating analysis due to evidence changes...');
      
      // Delete existing analysis
      await this.deleteAnalysisFromBackend(relationshipBondId);
      
      // Generate new analysis using AI
      const response = await fetch(`${AI_API_URL}/analyze-relationship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          relationship_bond_id: relationshipBondId
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const analysis = await response.json();
      
      console.log('=== AI GENERATED NEW ANALYSIS ===');
      console.log('Classification:', analysis.relationship_classification);
      console.log('Toxicity Score:', analysis.toxicity_score);
      console.log('Trust Level:', analysis.trust_level);
      console.log('Attachment Style:', analysis.attachment_style);
      console.log('Red Flags count:', analysis.red_flags?.length || 0);
      console.log('Green Flags count:', analysis.green_flags?.length || 0);
      console.log('Full Analysis Object:', JSON.stringify(analysis, null, 2));
      
      // Save the new analysis to backend
      try {
        await this.saveAnalysisToBackend(relationshipBondId, analysis);
        console.log('New analysis saved to backend successfully');
      } catch (saveError) {
        console.error('Failed to save analysis to backend:', saveError);
        throw new Error(`Analysis generated but failed to save: ${saveError.message}`);
      }
      
      return analysis;
    } catch (error) {
      console.error('Error regenerating analysis:', error);
      throw error;
    }
  }

  static async deleteAnalysisFromBackend(relationshipBondId: number): Promise<void> {
    try {
      await fetch(`${BACKEND_API_URL}/api/bond-analysis/${relationshipBondId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error deleting analysis from backend:', error);
      // Don't throw - continue with regeneration even if delete fails
    }
  }

  static convertBackendAnalysisToFrontend(backendAnalysis: any): RelationshipAnalysis {
    return {
      relationship_classification: backendAnalysis.relationshipClassification,
      toxicity_score: backendAnalysis.toxicityScore,
      attachment_style: backendAnalysis.attachmentStyle,
      communication_patterns: backendAnalysis.communicationPatterns || [],
      emotional_health_indicators: {
        emotional_support: backendAnalysis.emotionalSupport || 0,
        validation: backendAnalysis.validation || 0,
        empathy_level: backendAnalysis.empathyLevel || 0,
        emotional_safety: backendAnalysis.emotionalSafety || 0
      },
      red_flags: backendAnalysis.redFlags || [],
      green_flags: backendAnalysis.greenFlags || [],
      relationship_stage: backendAnalysis.relationshipStage,
      love_languages_assessment: {
        primary_expression: backendAnalysis.primaryLoveExpression || '',
        needs_met: backendAnalysis.loveNeedsMet || false,
        compatibility: backendAnalysis.loveCompatibility || ''
      },
      conflict_resolution_style: backendAnalysis.conflictResolutionStyle,
      codependency_indicators: backendAnalysis.codependencyIndicators || [],
      gaslighting_score: backendAnalysis.gaslightingScore || 0,
      trust_level: backendAnalysis.trustLevel || 0,
      recommendations: backendAnalysis.recommendations || [],
      confidence_score: backendAnalysis.confidenceScore || 0
    };
  }

  static async generatePdfReport(userId: number, relationshipBondId: number): Promise<void> {
    try {
      const response = await fetch(`${AI_API_URL}/generate-pdf-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          relationship_bond_id: relationshipBondId
        })
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'LifelineAI_Analysis_Report.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }
}

export default AIService;