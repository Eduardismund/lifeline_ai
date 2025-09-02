import api from './api';
import { RelationshipBond, EvidenceFile } from '../types/RelationshipBond';

export const relationshipService = {
  async getAllBonds(userId: number): Promise<RelationshipBond[]> {
    const response = await api.get<RelationshipBond[]>(`/relationship-bonds/user/${userId}`);
    return response.data;
  },

  async getBondById(id: number): Promise<RelationshipBond> {
    const response = await api.get<RelationshipBond>(`/relationship-bonds/${id}`);
    return response.data;
  },

  async createBond(userId: number, bond: Partial<RelationshipBond>): Promise<RelationshipBond> {
    const response = await api.post<RelationshipBond>(`/relationship-bonds/user/${userId}`, bond);
    return response.data;
  },

  async updateBond(id: number, bond: Partial<RelationshipBond>): Promise<RelationshipBond> {
    const response = await api.put<RelationshipBond>(`/relationship-bonds/${id}`, bond);
    return response.data;
  },

  async deleteBond(id: number): Promise<void> {
    await api.delete(`/relationship-bonds/${id}`);
  },

  async uploadEvidence(relationshipBondId: number, evidence: Partial<EvidenceFile>): Promise<EvidenceFile> {
    const response = await api.post<EvidenceFile>(
      `/evidence-file/relationship-bond/${relationshipBondId}`,
      evidence
    );
    return response.data;
  },

  async getEvidenceFiles(relationshipBondId: number): Promise<EvidenceFile[]> {
    const response = await api.get<EvidenceFile[]>(
      `/evidence-file/relationship-bond/${relationshipBondId}`
    );
    return response.data;
  },

  async deleteEvidence(id: number): Promise<void> {
    await api.delete(`/evidence-file/${id}`);
  },

  async getFileDownloadUrl(fileId: number): Promise<string> {
    const response = await api.get<string>(`/evidence-file/${fileId}/download-url`);
    return response.data;
  }
};