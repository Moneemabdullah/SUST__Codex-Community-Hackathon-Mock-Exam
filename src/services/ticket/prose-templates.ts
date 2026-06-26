import { CASE_TYPE } from '../../constants/ticket.constants.js';
import type { TicketAnalysisRequest } from '../../types/ticket.types.js';
import type { StructuredAnalysis } from './rules/types.js';

export interface ProseFields {
  agent_summary: string;
  recommended_next_action: string;
  customer_reply: string;
}

const usesBangla = (request: TicketAnalysisRequest): boolean =>
  request.language === 'bn' || /[\u0980-\u09FF]/.test(request.complaint);

export const buildProseTemplates = (
  request: TicketAnalysisRequest,
  structured: StructuredAnalysis,
): ProseFields => {
  const txnId = structured.relevant_transaction_id;
  const bangla = usesBangla(request);

  switch (structured.case_type) {
    case CASE_TYPE.WRONG_TRANSFER:
      return {
        agent_summary: txnId
          ? `Customer reports a wrong transfer concern for ${txnId}. Evidence is ${structured.evidence_verdict}.`
          : 'Customer reports a wrong transfer but the relevant transaction could not be identified yet.',
        recommended_next_action: txnId
          ? `Verify ${txnId} with the customer and initiate the wrong-transfer dispute workflow per policy.`
          : 'Ask the customer for the recipient number and transaction details before opening a dispute.',
        customer_reply: bangla
          ? `আপনার অভিযোগ${txnId ? ` ${txnId} লেনদেন সম্পর্কে` : ''} আমরা গ্রহণ করেছি। অনুগ্রহ করে কারো সাথে আপনার পিন বা ওটিপি শেয়ার করবেন না। আমাদের ডিসপিউট দল অফিসিয়াল চ্যানেলে যোগাযোগ করবে।`
          : `We have noted your concern${txnId ? ` about transaction ${txnId}` : ''}. Please do not share your PIN or OTP with anyone. Our dispute team will review the case and contact you through official support channels.`,
      };

    case CASE_TYPE.PAYMENT_FAILED:
      return {
        agent_summary: txnId
          ? `Customer reports payment failure with possible balance deduction on ${txnId}.`
          : 'Customer reports a failed payment with possible balance deduction.',
        recommended_next_action: txnId
          ? `Investigate ${txnId} ledger status and initiate reversal if balance was deducted on failure.`
          : 'Collect transaction details and investigate ledger status with payments operations.',
        customer_reply: bangla
          ? `আপনার লেনদেন${txnId ? ` ${txnId}` : ''} সম্পর্কে আমরা অবগত হয়েছি। আমাদের পেমেন্টস দল যাচাই করবে এবং যোগ্য অর্থ অফিসিয়াল চ্যানেলে ফেরত দেওয়ার বিষয়টি দেখবে। অনুগ্রহ করে পিন বা ওটিপি শেয়ার করবেন না।`
          : `We have noted that transaction${txnId ? ` ${txnId}` : ''} may have caused an unexpected balance deduction. Our payments team will review the case and any eligible amount will be returned through official channels. Please do not share your PIN or OTP with anyone.`,
      };

    case CASE_TYPE.REFUND_REQUEST:
      return {
        agent_summary: txnId
          ? `Customer requests a refund for completed payment ${txnId}.`
          : 'Customer requests a refund for a completed payment.',
        recommended_next_action:
          'Explain merchant refund policy and guide the customer to contact the merchant directly if appropriate.',
        customer_reply: bangla
          ? 'ধন্যবাদ আপনার যোগাযোগের জন্য। সম্পন্ন মার্চেন্ট পেমেন্টের রিফান্ড মার্চেন্টের নীতির উপর নির্ভর করে। অনুগ্রহ করে সরাসরি মার্চেন্টের সাথে যোগাযোগ করুন। পিন বা ওটিপি শেয়ার করবেন না।'
          : 'Thank you for reaching out. Refunds for completed merchant payments depend on the merchant\'s own policy. We recommend contacting the merchant directly. Please do not share your PIN or OTP with anyone.',
      };

    case CASE_TYPE.DUPLICATE_PAYMENT:
      return {
        agent_summary: txnId
          ? `Customer reports a duplicate payment; suspected duplicate transaction is ${txnId}.`
          : 'Customer reports a possible duplicate payment.',
        recommended_next_action: txnId
          ? `Verify duplicate status for ${txnId} with payments operations and biller records.`
          : 'Collect duplicate payment details and route to payments operations.',
        customer_reply: bangla
          ? `সম্ভাব্য ডুপ্লিকেট পেমেন্ট${txnId ? ` ${txnId}` : ''} সম্পর্কে আমরা অবগত হয়েছি। আমাদের পেমেন্টস দল যাচাই করবে এবং যোগ্য অর্থ অফিসিয়াল চ্যানেলে ফেরত দেওয়া হতে পারে। পিন বা ওটিপি শেয়ার করবেন না।`
          : `We have noted the possible duplicate payment${txnId ? ` for transaction ${txnId}` : ''}. Our payments team will verify with the biller and any eligible amount will be returned through official channels. Please do not share your PIN or OTP with anyone.`,
      };

    case CASE_TYPE.MERCHANT_SETTLEMENT_DELAY:
      return {
        agent_summary: txnId
          ? `Merchant reports delayed settlement for ${txnId}.`
          : 'Merchant reports a delayed settlement.',
        recommended_next_action: txnId
          ? `Check settlement batch status for ${txnId} with merchant operations.`
          : 'Route to merchant operations to verify settlement batch status.',
        customer_reply:
          `We have noted your concern about settlement${txnId ? ` ${txnId}` : ''}. Our merchant operations team will check the batch status and update you through official channels.`,
      };

    case CASE_TYPE.AGENT_CASH_IN_ISSUE:
      return {
        agent_summary: txnId
          ? `Customer reports agent cash-in ${txnId} not reflected in balance.`
          : 'Customer reports an agent cash-in issue.',
        recommended_next_action: txnId
          ? `Investigate pending cash-in ${txnId} with agent operations.`
          : 'Route to agent operations to verify cash-in settlement.',
        customer_reply: bangla
          ? `আপনার লেনদেন${txnId ? ` ${txnId}` : ''} এর বিষয়ে আমরা অবগত হয়েছি। আমাদের এজেন্ট অপারেশন্স দল এটি দ্রুত যাচাই করবে এবং অফিসিয়াল চ্যানেলে আপনাকে জানাবে। অনুগ্রহ করে কারো সাথে আপনার পিন বা ওটিপি শেয়ার করবেন না।`
          : `We have noted your cash-in concern${txnId ? ` for transaction ${txnId}` : ''}. Our agent operations team will verify the status and contact you through official channels. Please do not share your PIN or OTP with anyone.`,
      };

    case CASE_TYPE.PHISHING:
      return {
        agent_summary:
          'Customer reports a suspected phishing or social engineering attempt. No transaction match required.',
        recommended_next_action:
          'Escalate to fraud_risk, confirm the company never asks for OTP, and log the reported contact for analysis.',
        customer_reply: bangla
          ? 'তথ্য শেয়ার করার আগে যোগাযোগ করার জন্য ধন্যবাদ। আমরা কখনোই পিন, ওটিপি বা পাসওয়ার্ড চাই না। অনুগ্রহ করে এগুলো কারো সাথে শেয়ার করবেন না। আমাদের ফ্রড দলকে জানানো হয়েছে।'
          : 'Thank you for reaching out before sharing any information. We never ask for your PIN, OTP, or password under any circumstances. Please do not share these with anyone. Our fraud team has been notified of this incident.',
      };

    case CASE_TYPE.OTHER:
    default:
      return {
        agent_summary:
          'Customer submitted a vague or underspecified complaint that needs clarification.',
        recommended_next_action:
          'Ask for transaction ID, amount, approximate time, and a short description of the issue.',
        customer_reply: bangla
          ? 'ধন্যবাদ আপনার যোগাযোগের জন্য। দ্রুত সাহায্যের জন্য লেনদেন আইডি, পরিমাণ এবং সমস্যার সংক্ষিপ্ত বিবরণ শেয়ার করুন। পিন বা ওটিপি শেয়ার করবেন না।'
          : 'Thank you for reaching out. To help you faster, please share the transaction ID, the amount involved, and a short description of what went wrong. Please do not share your PIN or OTP with anyone.',
      };
  }
};
