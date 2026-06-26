/**
 * Domain types for the ticket-analysis endpoint.
 *
 * These are intentionally minimal at the scaffold stage. They will be
 * expanded (without breaking changes) once the business logic is approved.
 */

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  merchant?: string;
}

export interface CustomerComplaint {
  ticketId: string;
  subject: string;
  description: string;
  channel: 'email' | 'chat' | 'phone' | 'web' | 'other';
  receivedAt: string;
}

export interface TicketAnalysisRequest {
  complaint: CustomerComplaint;
  transactions: Transaction[];
}

export interface TicketAnalysisResponse {
  ticketId: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  recommendedAction: string;
  relevantTransactions: string[];
}