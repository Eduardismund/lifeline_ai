"""Service for AI analysis using Groq API"""

import requests
import json
import re
import logging
from typing import Dict, Any, List
from fastapi import HTTPException
from config import (
    GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL,
    MAX_TOKENS_ANALYSIS, MAX_TOKENS_NARRATIVE,
    TEMPERATURE, EVIDENCE_TEXT_LIMIT
)
from models import RelationshipAnalysisResponse

logger = logging.getLogger(__name__)


def clean_json_response(response: str) -> str:
    """Clean up common JSON issues from AI response"""
    cleaned = response
    
    # Replace word numbers with actual numbers
    number_replacements = {
        'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
        'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
        'ten': '10', 'twenty': '20', 'thirty': '30', 'forty': '40',
        'fifty': '50', 'sixty': '60', 'seventy': '70', 'eighty': '80',
        'ninety': '90', 'hundred': '100'
    }
    
    for word, num in number_replacements.items():
        cleaned = re.sub(rf'\b{word}\b', num, cleaned, flags=re.IGNORECASE)
    
    # Fix quotes around true/false
    cleaned = cleaned.replace('"true"', 'true').replace('"false"', 'false')
    
    return cleaned


async def analyze_relationship(
    user_profile: Dict[str, Any],
    relationship_bond: Dict[str, Any],
    evidence_files: List[Dict[str, Any]]
) -> RelationshipAnalysisResponse:
    """Analyze relationship using AI"""
    
    # Prepare context
    context = f"""
    User Profile: {json.dumps(user_profile, indent=2)}
    
    Relationship Information: {json.dumps(relationship_bond, indent=2)}
    
    Evidence Files Summary:
    """
    
    for evidence in evidence_files:
        context += f"""
    - File: {evidence.get('fileName', 'Unknown')}
      Type: {evidence.get('fileType', 'Unknown')}
      Status: {evidence.get('processingStatus', 'Unknown')}
      Context: {evidence.get('evidenceContext', 'No context provided')}
      Extracted Text: {evidence.get('extractedText', 'No text extracted')[:500] if evidence.get('extractedText') else 'No text extracted'}...
    """
    
    # Calculate evidence weight and context
    evidence_count = len(evidence_files)
    evidence_weight = min(0.9, 0.3 + (evidence_count * 0.1))  # Scales from 0.3 to 0.9 based on evidence count
    description_weight = 1.0 - evidence_weight
    
    # Create comprehensive prompt
    prompt = f"""
    You are an expert relationship psychologist and safety analyst. Analyze the following relationship data using established psychological theories including:
    - Attachment Theory (Bowlby)
    - Gottman's Four Horsemen of relationship apocalypse
    - Sternberg's Triangular Theory of Love
    - Knapp's Relational Development Model
    - Five Love Languages
    - Signs of codependency and enmeshment
    
    CRITICAL ANALYSIS INSTRUCTIONS:
    - EVIDENCE FILES ARE THE PRIMARY SOURCE OF TRUTH ({evidence_count} files provided)
    - Weight evidence files at {evidence_weight:.1%} importance vs background description at {description_weight:.1%}
    - The MORE evidence files available, the MORE confident and evidence-based your analysis should be
    - Focus heavily on patterns, behaviors, and communications found in the evidence
    - Use the relationship description only as supplementary context, not primary analysis material
    - If evidence contradicts the description, TRUST THE EVIDENCE
    - Higher evidence count = higher confidence score (current count: {evidence_count})
    - The medical conditions and the description in user profile weight in the analysis
    
    {context}
    
    Provide a comprehensive JSON analysis with this EXACT structure:
    {{
        "relationship_classification": "one of: HEALTHY, GROWING, STRUGGLING, UNSTABLE, TOXIC, ABUSIVE, DANGEROUS",
        "toxicity_score": <0-100 where 0=completely healthy, 100=severely toxic/dangerous>,
        "attachment_style": "one of: SECURE, ANXIOUS, AVOIDANT, DISORGANIZED, or combination like ANXIOUS-AVOIDANT",
        "communication_patterns": ["list specific patterns observed"],
        "emotional_health_indicators": {{
            "emotional_support": <0-100>,
            "validation": <0-100>,
            "empathy_level": <0-100>,
            "emotional_safety": <0-100>
        }},
        "red_flags": ["list all concerning behaviors"],
        "green_flags": ["list all positive aspects"],
        "relationship_stage": "based on Knapp's model",
        "love_languages_assessment": {{
            "primary_expression": "how love is shown",
            "needs_met": <true/false>,
            "compatibility": "assessment of love language compatibility"
        }},
        "conflict_resolution_style": "one of: COLLABORATIVE, COMPROMISING, ACCOMMODATING, AVOIDING, COMPETING, DESTRUCTIVE",
        "codependency_indicators": ["list any signs"],
        "gaslighting_score": <0-100>,
        "trust_level": <0-100>,
        "recommendations": ["specific actionable recommendations"],
        "confidence_score": <0.0-1.0 - BASE confidence on evidence count: {evidence_count} files = minimum {min(0.9, 0.4 + (evidence_count * 0.1)):.1f} confidence>
    }}
    
    ANALYSIS PRIORITY:
    1. EVIDENCE FILES (actual behaviors, communications, documented interactions) - {evidence_weight:.1%} weight
    2. Relationship description (self-reported context) - {description_weight:.1%} weight
    
    Be thorough but objective. Consider cultural context.
    Return ONLY the JSON response, no additional text.
    """
    
    logger.info(f"Sending to AI for analysis (prompt length: {len(prompt)} characters)")
    
    # Call Groq API
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": MAX_TOKENS_ANALYSIS,
        "temperature": TEMPERATURE
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    response.raise_for_status()
    
    ai_response = response.json()["choices"][0]["message"]["content"]
    logger.info(f"AI Response received: {len(ai_response)} characters")
    
    # Clean and parse response
    cleaned_response = clean_json_response(ai_response)
    
    try:
        analysis_data = json.loads(cleaned_response)
        return RelationshipAnalysisResponse(**analysis_data)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {str(e)}")
        logger.error(f"Problematic response: {cleaned_response}")
        raise HTTPException(status_code=500, detail=f"AI response parsing failed: {str(e)}")


async def generate_narrative_analysis(
    user_profile: Dict[str, Any],
    relationship_bond: Dict[str, Any],
    evidence_files: List[Dict[str, Any]]
) -> str:
    """Generate narrative analysis for PDF report"""
    
    # Build evidence context
    evidence_texts = []
    for evidence in evidence_files:
        if evidence.get('extractedText'):
            evidence_texts.append({
                'filename': evidence.get('fileName', 'Unknown'),
                'type': evidence.get('fileType', 'Unknown'),
                'context': evidence.get('evidenceContext', ''),
                'text': evidence.get('extractedText', '')[:EVIDENCE_TEXT_LIMIT]
            })
    
    user_name = f"{user_profile.get('firstName', '')} {user_profile.get('lastName', '').strip()}".strip()
    
    # Build prompt
    prompt = f"""
    You are an expert relationship psychologist preparing a comprehensive analysis report.
    
    Person seeking help:
    Name: {user_name}
    Email: {user_profile.get('email', '')}
    
    Relationship Information:
    Partner: {relationship_bond.get('partnerName', 'Unknown')}
    Type: {relationship_bond.get('relationshipType', 'Unknown')}
    Duration: Since {relationship_bond.get('relationshipStartDate', 'Unknown')}
    Current Status: {relationship_bond.get('currentStatus', 'Unknown')}
    
    Background:
    {relationship_bond.get('backgroundDescription', 'No background provided.')}
    
    Evidence submitted: {len(evidence_files)} pieces
    """
    
    # Add evidence details
    for idx, evidence in enumerate(evidence_texts, 1):
        prompt += f"""
    
    Evidence #{idx} - {evidence['filename']} ({evidence['type']}):
    Context: {evidence['context']}
    Content: {evidence['text']}
    """
    
    prompt += f"""
    
    Create a comprehensive relationship analysis report.
    
    IMPORTANT CONTEXT: This report is addressed to BOTH people in this relationship:
    - {user_name}
    - {relationship_bond.get('partnerName', 'the other person')}
    Relationship type: {relationship_bond.get('relationshipType', 'Unknown')}
    Current status: {relationship_bond.get('currentStatus', 'Unknown')}
    
    Write as if both people will read this report. Use "you" to address both of them.
    Adjust your language based on the relationship type (romantic partners, family members, friends, etc.).
    
    IMPORTANT: Return your entire response as properly formatted HTML.
    
    You have complete creative freedom to:
    - Decide what sections to include and their titles
    - Choose what information goes in headings vs paragraphs
    - Organize the content in whatever way feels most natural and helpful
    - Use special formatting boxes when emphasis is needed
    
    Available HTML elements:
    <h2>Main Section Title</h2> - for major sections
    <h3>Subsection Title</h3> - for subsections
    <p>Regular paragraph text</p> - for all normal content
    <ul><li>List item</li></ul> - for lists
    <div class="highlight-box">Important insight</div> - for key information
    <div class="warning-box">Area of concern</div> - for issues
    <div class="success-box">Strength or achievement</div> - for positives
    <blockquote>Important quote</blockquote> - for emphasis
    <strong>Bold text</strong> - for emphasis
    <em>Italic text</em> - for subtle emphasis
    
    Content to include (organize however you see fit):
    - Personal introduction addressing both people
    - Analysis of their relationship dynamics
    - Patterns observed in the evidence
    - Strengths and positive aspects
    - Areas for growth or concern
    - Specific recommendations
    - Relevant statistics from their data
    - Closing thoughts and encouragement
    
    Guidelines:
    - Use emojis naturally throughout the text
    - Keep language warm, supportive, and conversational
    - Avoid clinical/psychological jargon
    - Make it feel like a personal letter to both people
    - Be honest but gentle about concerns
    - Focus on their ability to make positive changes
    
    Return ONLY the HTML content, no markdown or plain text.
    """
    
    logger.info("Sending to AI for narrative analysis")
    
    # Call Groq API
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert relationship counselor creating a comprehensive analysis report."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": MAX_TOKENS_NARRATIVE,
        "temperature": TEMPERATURE
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    response.raise_for_status()
    
    narrative = response.json()["choices"][0]["message"]["content"]
    logger.info(f"Narrative analysis complete: {len(narrative)} characters")
    
    return narrative.strip()


async def generate_personalized_email_content(
    user_id: int,
    relationship_bond_id: int, 
    contact_id: int
) -> Dict[str, Any]:
    """Generate personalized email content based on contact description"""
    
    # Import backend service functions
    from services.backend_service import (
        fetch_user_profile, 
        fetch_relationship_bond, 
        fetch_trusted_contact,
        fetch_evidence_files
    )
    
    # Fetch all necessary data
    user = await fetch_user_profile(user_id)
    bond = await fetch_relationship_bond(relationship_bond_id)
    contact = await fetch_trusted_contact(relationship_bond_id, contact_id)
    evidence_files = await fetch_evidence_files(relationship_bond_id)
    
    # Count evidence
    evidence_count = len(evidence_files)
    
    # Prepare prompt for AI
    prompt = f"""
    You are helping create a personalized email to send a relationship analysis report to a trusted contact.
    
    User Name: {user.get('firstName', 'First')} {user.get('lastName', 'Name')}
    Partner in Relationship: {bond.get('partnerName', 'Partner')}
    
    Recipient Email: {contact.get('email', '')}
    Recipient Description/Role: {contact.get('description', 'trusted contact')}
    
    Relationship Context:
    - Type: {bond.get('relationshipType', 'Unknown')}
    - Current Status: {bond.get('currentStatus', 'Unknown')}
    - Background: {bond.get('backgroundDescription', 'No description provided')}
    - Evidence Files: {evidence_count} pieces of evidence documented
    
    Generate a personalized email message that:
    1. Uses an appropriate greeting based on the recipient's role (e.g., "Dear Dr. Smith" for therapist, "Hi Mom" for mother)
    2. Explains why they're receiving this report in a context-appropriate way
    3. Shows the severity/importance based on the evidence count (more evidence = more serious documentation)
    4. Maintains appropriate boundaries and tone for the recipient's relationship to the user
    5. Ends with an appropriate closing
    
    Be empathetic, clear, and professional. The message should feel personal and not generic.
    
    Return ONLY the email body text, no subject line or metadata.
    """
    
    # Call AI API
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a compassionate assistant helping someone share important relationship documentation with their support network. Generate warm, personalized email messages."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 500,
        "temperature": 0.7
    }
    
    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    response.raise_for_status()
    
    message_body = response.json()["choices"][0]["message"]["content"].strip()
    
    # Return structured response
    return {
        "recipient_email": contact.get('email', ''),
        "partner_name": bond.get('partnerName', 'Partner'),
        "user_name": user.get('firstName', 'First') + ' ' + user.get('lastName', 'Name'),
        "message_body": message_body
    }