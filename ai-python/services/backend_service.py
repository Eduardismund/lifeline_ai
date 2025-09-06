"""Service for interacting with Spring Boot backend"""

import requests
import json
import logging
from typing import Dict, Any, List
from fastapi import HTTPException
from config import BACKEND_BASE_URL

logger = logging.getLogger(__name__)

# API key for internal service authentication
API_KEY = "lifeline-ai-internal-key-2025"
HEADERS = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}


async def fetch_user_profile(user_id: int) -> Dict[str, Any]:
    """Fetch user profile from Spring Boot backend"""
    try:
        url = f"{BACKEND_BASE_URL}/users/{user_id}"
        logger.info(f"Fetching user profile from: {url}")
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        logger.info(f"User profile retrieved: {json.dumps(data, indent=2)}")
        return data
    except requests.RequestException as e:
        logger.error(f"Failed to fetch user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user profile: {str(e)}")


async def fetch_relationship_bond(relationship_id: int) -> Dict[str, Any]:
    """Fetch relationship bond from Spring Boot backend"""
    try:
        url = f"{BACKEND_BASE_URL}/relationship-bonds/{relationship_id}"
        logger.info(f"Fetching relationship bond from: {url}")
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        logger.info(f"Relationship bond retrieved: {json.dumps(data, indent=2)}")
        return data
    except requests.RequestException as e:
        logger.error(f"Failed to fetch relationship bond: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch relationship bond: {str(e)}")


async def fetch_evidence_files(relationship_id: int) -> List[Dict[str, Any]]:
    """Fetch evidence files from Spring Boot backend"""
    try:
        url = f"{BACKEND_BASE_URL}/evidence-file/relationship-bond/{relationship_id}"
        logger.info(f"Fetching evidence files from: {url}")
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        logger.info(f"Evidence files retrieved ({len(data)} files): {json.dumps(data, indent=2)}")
        return data
    except requests.RequestException as e:
        logger.error(f"Failed to fetch evidence files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch evidence files: {str(e)}")


async def fetch_trusted_contact(bond_id: int, contact_id: int) -> Dict[str, Any]:
    """Fetch a specific trusted contact from Spring Boot backend"""
    try:
        # First fetch all trusted contacts for the bond
        url = f"{BACKEND_BASE_URL}/trusted-contacts/bond/{bond_id}"
        logger.info(f"Fetching trusted contacts from: {url}")
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        contacts = response.json()
        
        # Find the specific contact
        for contact in contacts:
            if contact.get('id') == contact_id:
                logger.info(f"Trusted contact found: {json.dumps(contact, indent=2)}")
                return contact
        
        raise HTTPException(status_code=404, detail=f"Trusted contact with id {contact_id} not found")
    except requests.RequestException as e:
        logger.error(f"Failed to fetch trusted contact: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch trusted contact: {str(e)}")