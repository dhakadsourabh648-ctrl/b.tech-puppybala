import { config } from '../config/env.js';

/**
 * WhatsApp Business Cloud API Service
 * Official Meta Graph API integration for automated customer notifications.
 *
 * Requirements satisfied:
 * - Official WhatsApp Business Platform/API architecture
 * - No browser automation or unofficial scraping
 * - Safe development mock mode if credentials missing or WHATSAPP_MOCK_MODE=true
 * - Automatic thank-you notification triggered on enquiry submission
 * - Deduplication protection to prevent duplicate sends on retries
 */

export const THANK_YOU_MESSAGE_TEMPLATE = `Thank you for contacting B.tech Puppybala! 🐶

We have received your enquiry successfully.
Our team will contact you shortly regarding your puppy enquiry.

Thank you for choosing B.tech Puppybala.`;

/**
 * Format Indian mobile number to WhatsApp E.164 string (e.g. 919826012345)
 * @param {string} phone
 * @returns {string}
 */
export const formatWhatsAppRecipient = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  return cleaned;
};

/**
 * Check if live WhatsApp Business API credentials are fully configured and enabled
 */
export const isLiveWhatsAppConfigured = () => {
  const { accessToken, phoneNumberId, enabled, mockMode } = config.whatsapp;
  if (mockMode) return false;
  if (!enabled) return false;
  return Boolean(accessToken && phoneNumberId && accessToken !== 'your_meta_system_user_access_token_here');
};

/**
 * Send the official thank-you message to an enquiry customer
 *
 * @param {Object} inquiry - The customer enquiry object
 * @param {Object} options - Options including forceResend
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, mode: string, sentAt?: Date, skipped?: boolean }>}
 */
export const sendEnquiryThankYouMessage = async (inquiry, options = {}) => {
  const { forceResend = false } = options;

  if (!inquiry || !inquiry.phone) {
    return {
      success: false,
      error: 'Missing recipient phone number in enquiry',
      mode: 'validation_error',
    };
  }

  // Deduplication check: Prevent duplicate messages if already sent
  if (!forceResend && inquiry.whatsappStatus === 'Sent' && inquiry.whatsappMessageId) {
    console.log(`[WhatsApp Service] Duplicate send prevented for enquiry ${inquiry.id || inquiry._id}. Message already sent (${inquiry.whatsappMessageId}).`);
    return {
      success: true,
      messageId: inquiry.whatsappMessageId,
      skipped: true,
      reason: 'Already sent to this customer for this enquiry',
      mode: 'deduplicated',
    };
  }

  const recipient = formatWhatsAppRecipient(inquiry.phone);
  const messageBody = THANK_YOU_MESSAGE_TEMPLATE;

  // 1. Safe Development / Mock Mode
  if (!isLiveWhatsAppConfigured()) {
    const mockMessageId = `mock_wamid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 [WhatsApp Service - Dev Mock Mode]');
    console.log(`To: +${recipient} (${inquiry.customerName || 'Customer'})`);
    console.log(`Puppy: ${inquiry.puppyName || 'General Enquiry'} (${inquiry.breed || 'N/A'})`);
    console.log(`Mock Message ID: ${mockMessageId}`);
    console.log('Message Content:');
    console.log(messageBody);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      success: true,
      messageId: mockMessageId,
      mode: 'mock',
      sentAt: now,
    };
  }

  // 2. Official Meta WhatsApp Business Cloud API Request
  try {
    const { apiVersion, phoneNumberId, accessToken } = config.whatsapp;
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: {
        preview_url: false,
        body: messageBody,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || `WhatsApp API error (status ${response.status})`;
      console.error('[WhatsApp Service Error]', errorMsg, data.error);
      return {
        success: false,
        error: errorMsg,
        mode: 'live',
      };
    }

    const messageId = data.messages?.[0]?.id || `wamid_${Date.now()}`;
    console.log(`[WhatsApp Service] Live message sent successfully! Recipient: +${recipient}, Message ID: ${messageId}`);

    return {
      success: true,
      messageId,
      mode: 'live',
      sentAt: new Date(),
    };
  } catch (error) {
    console.error('[WhatsApp Service Exception]', error.message);
    return {
      success: false,
      error: error.message || 'Network exception while connecting to WhatsApp API',
      mode: 'live',
    };
  }
};

/**
 * Return current WhatsApp service status and configuration state for Admin diagnostics
 */
export const getWhatsAppServiceStatus = () => {
  const isLive = isLiveWhatsAppConfigured();
  return {
    isConfigured: Boolean(config.whatsapp.accessToken && config.whatsapp.phoneNumberId),
    isLive,
    mockMode: !isLive,
    enabled: config.whatsapp.enabled,
    phoneNumberIdConfigured: Boolean(config.whatsapp.phoneNumberId),
    apiVersion: config.whatsapp.apiVersion,
  };
};
