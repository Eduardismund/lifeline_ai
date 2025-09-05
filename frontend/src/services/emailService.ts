import emailjs from '@emailjs/browser';
import AIService from './aiService';

export class EmailService {
  private static readonly SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  private static readonly TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  private static readonly PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  static async sendPdfToTrustedContact(userId: number, relationshipBondId: number, contactId: number, pdfUrl?: string): Promise<void> {
    try {
      const emailContent = await AIService.generatePersonalizedEmail(userId, relationshipBondId, contactId);
      
      const downloadLink = pdfUrl ? `\n\nDownload the PDF report here: ${pdfUrl}` : '';
      const fullMessage = emailContent.message_body + downloadLink;
      
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        {
          to_email: emailContent.recipient_email,
          partner_name: emailContent.partner_name,
          user_name: emailContent.user_name,
          message_body: fullMessage,
        },
        this.PUBLIC_KEY
      );
    } catch (error) {
      console.error('Error sending personalized email:', error);
      throw error;
    }
  }
}