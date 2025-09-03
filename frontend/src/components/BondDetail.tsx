import React, { useState, useEffect } from 'react';
import { RelationshipBond, EvidenceFile } from '../types/RelationshipBond';
import { relationshipService } from '../services/relationshipService';
import AWSService from '../services/awsService';
import AIService, { RelationshipAnalysis } from '../services/aiService';
import { authService } from '../services/authService';
import FileUpload from './FileUpload';
import './BondDetail.css';

interface Props {
  bond: RelationshipBond;
  onDelete: (id: number) => void;
  onUpdate: () => void;
}

const BondDetail: React.FC<Props> = ({ bond, onDelete, onUpdate }) => {
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [error, setError] = useState('');
  const [playableUrls, setPlayableUrls] = useState<{ [fileId: number]: string }>({});
  const [analysis, setAnalysis] = useState<RelationshipAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    emotionalHealth: false,
    communicationPatterns: false,
    loveLanguages: false,
    codependency: false,
    redFlags: false,
    greenFlags: false,
    recommendations: false
  });

  useEffect(() => {
    if (bond.id) {
      loadEvidenceFiles();
      loadAnalysis();
    }
  }, [bond.id]);

  const loadEvidenceFiles = async () => {
    if (!bond.id) return;
    
    try {
      const files = await relationshipService.getEvidenceFiles(bond.id);
      setEvidenceFiles(files);
    } catch (err: any) {
      console.error('Failed to load evidence files', err);
    }
  };
  
  const loadAnalysis = async () => {
    if (!bond.id) return;
    
    const user = authService.getCurrentUser();
    if (!user) return;
    
    setAnalysisLoading(true);
    try {
      const analysisResult = await AIService.analyzeRelationship(user.id, bond.id);
      setAnalysis(analysisResult);
    } catch (err: any) {
      console.error('Failed to load analysis', err);
      // Don't show error to user, analysis is optional
    } finally {
      setAnalysisLoading(false);
    }
  };

  const regenerateAnalysisAfterEvidenceChange = async () => {
    if (!bond.id) return;
    
    const user = authService.getCurrentUser();
    if (!user) return;
    
    console.log('Evidence changed, regenerating analysis...', { hasAnalysis: !!analysis, bondId: bond.id, userId: user.id });
    
    setAnalysisLoading(true);
    try {
      const newAnalysis = await AIService.regenerateAnalysis(user.id, bond.id);
      setAnalysis(newAnalysis);
      console.log('Analysis regenerated successfully due to evidence changes');
    } catch (err: any) {
      console.error('Failed to regenerate analysis', err);
      setError('Failed to regenerate analysis after evidence change');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleFileUpload = async (evidence: Partial<EvidenceFile>) => {
    if (!bond.id) return;
    
    try {
      console.log('Uploading evidence file...');
      const newFile = await relationshipService.uploadEvidence(bond.id, evidence);
      setEvidenceFiles([...evidenceFiles, newFile]);
      setError('');
      console.log('Evidence file uploaded successfully, triggering analysis regeneration');
      
      // Regenerate analysis when evidence changes
      await regenerateAnalysisAfterEvidenceChange();
    } catch (err: any) {
      setError('Failed to upload evidence');
      console.error('Error uploading evidence:', err);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        console.log('Deleting evidence file...');
        await relationshipService.deleteEvidence(fileId);
        setEvidenceFiles(evidenceFiles.filter(f => f.id !== fileId));
        console.log('Evidence file deleted successfully, triggering analysis regeneration');
        
        // Regenerate analysis when evidence changes
        await regenerateAnalysisAfterEvidenceChange();
      } catch (err: any) {
        setError('Failed to delete file');
        console.error('Error deleting evidence:', err);
      }
    }
  };

  const handleLoadMedia = async (file: EvidenceFile) => {
    if (!file.id || playableUrls[file.id]) return; // Already loaded
    
    try {
      const playableUrl = await AWSService.createPlayableUrl(file.s3Url, file.fileName);
      setPlayableUrls(prev => ({ ...prev, [file.id!]: playableUrl }));
    } catch (err) {
      console.error('Error loading media:', err);
      setError('Failed to load media file');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONGOING': return '#4caf50';
      case 'ENDED': return '#9e9e9e';
      case 'COMPLICATED': return '#ff9800';
      case 'NO_CONTACT': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };


  const handleGeneratePdf = async () => {
    if (!bond.id) return;
    
    const user = authService.getCurrentUser();
    if (!user) return;
    
    setPdfGenerating(true);
    try {
      await AIService.generatePdfReport(user.id, bond.id);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF report');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="bond-detail">
      <div className="detail-content">
        {evidenceFiles.length > 3 && (
          <div className="support-message">
            <span className="support-icon"><i className="fas fa-hands-holding-heart"></i></span>
            <div>
              <strong>You're doing great by documenting this.</strong>
              <p>Keeping records is an important step in understanding your situation. Remember, you deserve healthy relationships.</p>
            </div>
          </div>
        )}
        
        {/* AI Analysis Section */}
        {analysisLoading && (
          <div className="analysis-section loading">
            <h3><i className="fas fa-brain"></i> Analyzing Relationship...</h3>
            <div className="analysis-loading">Please wait while we analyze your relationship data...</div>
          </div>
        )}
        
        {analysis && !analysisLoading && (
          <div className="analysis-section">
            <div className="analysis-header-row">
              <h3><i className="fas fa-brain"></i> AI Relationship Analysis</h3>
              <div className="analysis-actions">
                <button 
                  onClick={handleGeneratePdf} 
                  disabled={pdfGenerating}
                  className="pdf-download-btn"
                >
                  {pdfGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-pdf"></i> Download PDF Report
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="analysis-overview">
              <div className="analysis-card">
                <h4>Relationship Status</h4>
                <div className={`classification ${analysis.relationship_classification.toLowerCase()}`}>
                  {analysis.relationship_classification}
                </div>
              </div>
              
              <div className="analysis-card">
                <h4>Toxicity Score</h4>
                <div className="toxicity-meter">
                  <div className="toxicity-bar">
                    <div 
                      className="toxicity-fill" 
                      style={{ 
                        width: `${analysis.toxicity_score}%`,
                        backgroundColor: analysis.toxicity_score < 30 ? '#4caf50' : 
                                       analysis.toxicity_score < 60 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                  <span className="toxicity-value">{analysis.toxicity_score}/100</span>
                </div>
              </div>
              
              <div className="analysis-card">
                <h4>Trust Level</h4>
                <div className="trust-meter">
                  <div className="trust-bar">
                    <div 
                      className="trust-fill" 
                      style={{ 
                        width: `${analysis.trust_level}%`,
                        backgroundColor: analysis.trust_level > 70 ? '#4caf50' : 
                                       analysis.trust_level > 40 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                  <span className="trust-value">{analysis.trust_level}/100</span>
                </div>
              </div>

              <div className="analysis-card">
                <h4>Gaslighting Risk</h4>
                <div className="gaslighting-meter">
                  <div className="gaslighting-bar">
                    <div 
                      className="gaslighting-fill" 
                      style={{ 
                        width: `${analysis.gaslighting_score}%`,
                        backgroundColor: analysis.gaslighting_score < 20 ? '#4caf50' : 
                                       analysis.gaslighting_score < 50 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                  <span className="gaslighting-value">{analysis.gaslighting_score}/100</span>
                </div>
              </div>
            </div>
            
            <div className="analysis-details">
              <div className="analysis-row">
                <div className="analysis-item">
                  <h4>Attachment Style</h4>
                  <p>{analysis.attachment_style}</p>
                </div>
                <div className="analysis-item">
                  <h4>Conflict Resolution</h4>
                  <p>{analysis.conflict_resolution_style}</p>
                </div>
                <div className="analysis-item">
                  <h4>Relationship Stage</h4>
                  <p>{analysis.relationship_stage}</p>
                </div>
                <div className="analysis-item">
                  <h4>Analysis Confidence</h4>
                  <p>{Math.round(analysis.confidence_score * 100)}% confident</p>
                </div>
              </div>


              {/* Emotional Health - Collapsible */}
              <div className="analysis-expandable">
                <div className="analysis-header" onClick={() => toggleSection('emotionalHealth')}>
                  <h4><i className="fas fa-heart"></i> Emotional Health Indicators</h4>
                  <i className={`fas fa-chevron-${expandedSections.emotionalHealth ? 'up' : 'down'}`}></i>
                </div>
                {expandedSections.emotionalHealth && (
                  <div className="analysis-content">
                    <div className="emotional-metrics">
                      <div className="metric">
                        <span className="metric-label">Emotional Support</span>
                        <div className="metric-bar">
                          <div className="metric-fill" style={{ width: `${analysis.emotional_health_indicators.emotional_support}%` }}></div>
                        </div>
                        <span className="metric-value">{analysis.emotional_health_indicators.emotional_support}/100</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Validation</span>
                        <div className="metric-bar">
                          <div className="metric-fill" style={{ width: `${analysis.emotional_health_indicators.validation}%` }}></div>
                        </div>
                        <span className="metric-value">{analysis.emotional_health_indicators.validation}/100</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Empathy Level</span>
                        <div className="metric-bar">
                          <div className="metric-fill" style={{ width: `${analysis.emotional_health_indicators.empathy_level}%` }}></div>
                        </div>
                        <span className="metric-value">{analysis.emotional_health_indicators.empathy_level}/100</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Emotional Safety</span>
                        <div className="metric-bar">
                          <div className="metric-fill" style={{ width: `${analysis.emotional_health_indicators.emotional_safety}%` }}></div>
                        </div>
                        <span className="metric-value">{analysis.emotional_health_indicators.emotional_safety}/100</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Communication Patterns - Collapsible */}
              <div className="analysis-expandable">
                <div className="analysis-header" onClick={() => toggleSection('communicationPatterns')}>
                  <h4><i className="fas fa-comments"></i> Communication Patterns</h4>
                  <i className={`fas fa-chevron-${expandedSections.communicationPatterns ? 'up' : 'down'}`}></i>
                </div>
                {expandedSections.communicationPatterns && (
                  <div className="analysis-content">
                    <ul className="pattern-list">
                      {analysis.communication_patterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Love Languages - Collapsible */}
              <div className="analysis-expandable">
                <div className="analysis-header" onClick={() => toggleSection('loveLanguages')}>
                  <h4><i className="fas fa-heart-broken"></i> Love Languages Assessment</h4>
                  <i className={`fas fa-chevron-${expandedSections.loveLanguages ? 'up' : 'down'}`}></i>
                </div>
                {expandedSections.loveLanguages && (
                  <div className="analysis-content">
                    <div className="love-languages">
                      <div className="love-item">
                        <h5>Primary Expression</h5>
                        <p>{analysis.love_languages_assessment.primary_expression}</p>
                      </div>
                      <div className="love-item">
                        <h5>Needs Being Met</h5>
                        <p className={analysis.love_languages_assessment.needs_met ? 'positive' : 'negative'}>
                          {analysis.love_languages_assessment.needs_met ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="love-item">
                        <h5>Compatibility</h5>
                        <p>{analysis.love_languages_assessment.compatibility}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Codependency - Collapsible */}
              {analysis.codependency_indicators.length > 0 && (
                <div className="analysis-expandable">
                  <div className="analysis-header" onClick={() => toggleSection('codependency')}>
                    <h4><i className="fas fa-link"></i> Codependency Indicators</h4>
                    <i className={`fas fa-chevron-${expandedSections.codependency ? 'up' : 'down'}`}></i>
                  </div>
                  {expandedSections.codependency && (
                    <div className="analysis-content">
                      <ul className="codependency-list">
                        {analysis.codependency_indicators.map((indicator, index) => (
                          <li key={index}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Red Flags - Collapsible */}
              {analysis.red_flags.length > 0 && (
                <div className="analysis-expandable red-flags-section">
                  <div className="analysis-header" onClick={() => toggleSection('redFlags')}>
                    <h4><i className="fas fa-exclamation-triangle"></i> Red Flags ({analysis.red_flags.length})</h4>
                    <i className={`fas fa-chevron-${expandedSections.redFlags ? 'up' : 'down'}`}></i>
                  </div>
                  {expandedSections.redFlags && (
                    <div className="analysis-content">
                      <ul className="flags-list red-flags-list">
                        {analysis.red_flags.map((flag, index) => (
                          <li key={index}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Green Flags - Collapsible */}
              {analysis.green_flags.length > 0 && (
                <div className="analysis-expandable green-flags-section">
                  <div className="analysis-header" onClick={() => toggleSection('greenFlags')}>
                    <h4><i className="fas fa-check-circle"></i> Green Flags ({analysis.green_flags.length})</h4>
                    <i className={`fas fa-chevron-${expandedSections.greenFlags ? 'up' : 'down'}`}></i>
                  </div>
                  {expandedSections.greenFlags && (
                    <div className="analysis-content">
                      <ul className="flags-list green-flags-list">
                        {analysis.green_flags.map((flag, index) => (
                          <li key={index}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Recommendations - Collapsible */}
              {analysis.recommendations.length > 0 && (
                <div className="analysis-expandable recommendations-section">
                  <div className="analysis-header" onClick={() => toggleSection('recommendations')}>
                    <h4><i className="fas fa-lightbulb"></i> Recommendations ({analysis.recommendations.length})</h4>
                    <i className={`fas fa-chevron-${expandedSections.recommendations ? 'up' : 'down'}`}></i>
                  </div>
                  {expandedSections.recommendations && (
                    <div className="analysis-content">
                      <ul className="recommendations-list">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="info-section">
          <h3><i className="fas fa-clipboard-list"></i> Relationship Information</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">Analysis Status:</span>
              <span className="value">{bond.analysisStatus}</span>
            </div>
            {bond.relationshipStartDate && (
              <div className="info-row">
                <span className="label">Started:</span>
                <span className="value">
                  {new Date(bond.relationshipStartDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {bond.createdAt && (
              <div className="info-row">
                <span className="label">Added:</span>
                <span className="value">
                  {new Date(bond.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          {bond.backgroundDescription && (
            <div className="description">
              <h4>Background Description</h4>
              <p>{bond.backgroundDescription}</p>
            </div>
          )}
        </div>

        <div className="evidence-section">
          <h3><i className="fas fa-folder-open"></i> Evidence Files ({evidenceFiles.length})</h3>
          
          <FileUpload onUpload={handleFileUpload} />
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="files-list">
            {evidenceFiles.length === 0 ? (
              <p className="no-files">No evidence files uploaded yet.</p>
            ) : (
              evidenceFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-name">{file.fileName}</div>
                    <div className="file-meta">
                      <span className="file-type">{file.fileType}</span>
                      <span className="file-status">{file.processingStatus}</span>
                      {file.evidenceDate && (
                        <span className="file-date">
                          {new Date(file.evidenceDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {file.evidenceContext && (
                      <div className="file-context">{file.evidenceContext}</div>
                    )}
                    {(file.fileType === 'AUDIO' || file.fileType === 'VIDEO' || file.fileType === 'IMAGE') && (
                      <div className="media-section">
                        {!playableUrls[file.id!] ? (
                          <button
                            onClick={() => handleLoadMedia(file)}
                            className="play-btn"
                          >
                            {file.fileType === 'AUDIO' ? (
                              <><i className="fas fa-music"></i> Load Audio</>
                            ) : file.fileType === 'VIDEO' ? (
                              <><i className="fas fa-video"></i> Load Video</>
                            ) : (
                              <><i className="fas fa-image"></i> Load Image</>
                            )}
                          </button>
                        ) : (
                          <div className="media-player">
                            {file.fileType === 'AUDIO' && (
                              <audio controls style={{ width: '100%', maxWidth: '400px' }}>
                                <source src={playableUrls[file.id!]} type={file.mimeType} />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                            {file.fileType === 'VIDEO' && (
                              <video controls style={{ width: '100%', maxWidth: '600px' }}>
                                <source src={playableUrls[file.id!]} type={file.mimeType} />
                                Your browser does not support the video element.
                              </video>
                            )}
                            {file.fileType === 'IMAGE' && (
                              <img 
                                src={playableUrls[file.id!]} 
                                alt={file.fileName} 
                                style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }} 
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => file.id && handleDeleteFile(file.id)}
                    className="delete-file-btn"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondDetail;