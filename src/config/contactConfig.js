/**
 * Official B.tech Puppybala Contact Configuration
 * Centralized store for public business phone & WhatsApp details
 */

export const CONTACT_CONFIG = {
  // Official WhatsApp number: +91 9926947052
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919926947052',
  whatsappDisplay: import.meta.env.VITE_WHATSAPP_DISPLAY || '+91 9926947052',
  phoneDisplay: '+91 9926947052',

  /**
   * Official WhatsApp click-to-chat format:
   * https://wa.me/919926947052 or with pre-filled message
   */
  getWhatsappLink: (message = '') => {
    const rawNum = String(import.meta.env.VITE_WHATSAPP_NUMBER || '919926947052').replace(/\D/g, '');
    const cleanNum = rawNum.startsWith('91') ? rawNum : `91${rawNum}`;
    if (!message) {
      return `https://wa.me/${cleanNum}`;
    }
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Pre-filled puppy enquiry message:
   * "Hello B.tech Puppybala, I am interested in [PUPPY NAME]. Please share more details."
   */
  getPuppyEnquiryMessage: (puppyName = '') => {
    const name = puppyName && typeof puppyName === 'string' && puppyName.trim() ? puppyName.trim() : 'a puppy';
    return `Hello B.tech Puppybala, I am interested in ${name}. Please share more details.`;
  },
};
