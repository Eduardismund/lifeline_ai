"""Relationship analysis API endpoints"""

import logging
from fastapi import APIRouter, Response
from datetime import datetime
from models import RelationshipAnalysisRequest, PDFGenerationRequest, RelationshipAnalysisResponse
from services.backend_service import fetch_user_profile, fetch_relationship_bond, fetch_evidence_files
from services.ai_service import analyze_relationship, generate_narrative_analysis
from services.pdf_service import create_html_document, convert_html_to_pdf

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze-relationship")
async def analyze_relationship_endpoint(request: RelationshipAnalysisRequest) -> RelationshipAnalysisResponse:
    """Analyze relationship and return structured data"""
    try:
        logger.info(f"Starting relationship analysis: user_id={request.user_id}, bond_id={request.relationship_bond_id}")
        
        # Fetch data from backend
        user_profile = await fetch_user_profile(request.user_id)
        relationship_bond = await fetch_relationship_bond(request.relationship_bond_id)
        evidence_files = await fetch_evidence_files(request.relationship_bond_id)
        
        # Generate analysis
        analysis = await analyze_relationship(user_profile, relationship_bond, evidence_files)
        
        logger.info("Relationship analysis completed successfully")
        return analysis
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise


@router.post("/generate-pdf-report")
async def generate_pdf_report_endpoint(request: PDFGenerationRequest):
    """Generate PDF report using narrative analysis"""
    try:
        logger.info(f"Starting PDF generation: user_id={request.user_id}, bond_id={request.relationship_bond_id}")
        
        # Fetch data from backend
        user_profile = await fetch_user_profile(request.user_id)
        relationship_bond = await fetch_relationship_bond(request.relationship_bond_id)
        evidence_files = await fetch_evidence_files(request.relationship_bond_id)
        
        # Generate narrative analysis
        narrative_content = await generate_narrative_analysis(user_profile, relationship_bond, evidence_files)
        logger.info(f"Narrative generated: {len(narrative_content)} characters")
        
        # Create HTML document
        html_content = await create_html_document(narrative_content, user_profile, relationship_bond)
        
        # Generate filename
        partner_name = relationship_bond.get('partnerName', 'Unknown').replace(' ', '_')
        filename = f"LifelineAI_Report_{partner_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Convert to PDF
        pdf_content = await convert_html_to_pdf(html_content, filename)
        
        logger.info("PDF generated successfully")
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"PDF generation failed: {str(e)}")
        raise


@router.post("/generate-personalized-email")
async def generate_personalized_email_endpoint(request: dict):
    """Generate personalized email content based on contact's description"""
    try:
        user_id = request.get('user_id')
        relationship_bond_id = request.get('relationship_bond_id')
        contact_id = request.get('contact_id')
        
        logger.info(f"Generating personalized email: user_id={user_id}, bond_id={relationship_bond_id}, contact_id={contact_id}")
        
        # Import the service function
        from services.ai_service import generate_personalized_email_content
        
        # Generate personalized email
        email_content = await generate_personalized_email_content(user_id, relationship_bond_id, contact_id)
        
        logger.info("Personalized email generated successfully")
        return email_content
        
    except Exception as e:
        logger.error(f"Email generation failed: {str(e)}")
        raise