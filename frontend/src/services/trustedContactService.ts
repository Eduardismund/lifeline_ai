import api from './api';
import { TrustedContact } from '../types/RelationshipBond';

export const trustedContactService = {
  async getTrustedContacts(bondId: number): Promise<TrustedContact[]> {
    const response = await api.get<TrustedContact[]>(`/trusted-contacts/bond/${bondId}`);
    return response.data;
  },

  async addTrustedContact(bondId: number, contact: Omit<TrustedContact, 'id' | 'createdAt'>): Promise<TrustedContact> {
    const response = await api.post<TrustedContact>(`/trusted-contacts/bond/${bondId}`, contact);
    return response.data;
  },

  async deleteTrustedContact(contactId: number): Promise<void> {
    await api.delete(`/trusted-contacts/${contactId}`);
  }
};