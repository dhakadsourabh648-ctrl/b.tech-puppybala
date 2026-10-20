import fs from 'fs';
import path from 'path';
import { Inquiry } from '../models/Inquiry.js';
import { Puppy } from '../models/Puppy.js';
import { isDBConnected } from '../config/db.js';
import {
  sendEnquiryThankYouMessage,
  getWhatsAppServiceStatus,
} from './whatsappService.js';

const STORE_PATH = path.join(process.cwd(), 'uploads', 'inquiries_store.json');

function loadMemoryInquiries() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip any residual demo fake enquiries or test suite enquiries
        return parsed.filter(
          (inq) =>
            inq.customerName !== 'Rahul Sharma' &&
            inq.customerName !== 'Pooja Verma' &&
            inq.customerName !== 'Amitabh Patel' &&
            inq.customerName !== 'Sneha Saxena' &&
            inq.customerName !== 'Vikas Chouhan' &&
            !String(inq._id || inq.id || '').startsWith('inq-seed-')
        );
      }
    }
  } catch (err) {
    console.warn('[InquiryService] Notice: Could not read local store.', err.message);
  }

  return [];
}

function saveMemoryInquiries(inquiries) {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[InquiryService] Notice: Could not persist local inquiries store.', err.message);
  }
}

// In-memory list for inquiries when MongoDB is running in offline mode
let memoryInquiries = loadMemoryInquiries();

export const createInquiry = async (inquiryData) => {
  // If puppyName or breed was not supplied, lookup from Puppy collection/memory
  let puppyName = inquiryData.puppyName;
  let breed = inquiryData.breed;

  if (!puppyName || puppyName === 'Puppy') {
    if (isDBConnected()) {
      const pup = await Puppy.findById(inquiryData.puppyId);
      if (pup) {
        puppyName = pup.name;
        breed = pup.breed;
      }
    }
  }

  const payload = {
    customerName: inquiryData.customerName,
    phone: inquiryData.phone,
    city: inquiryData.city,
    puppyId: inquiryData.puppyId,
    puppyName: puppyName || 'Selected Puppy',
    breed: breed || 'Standard Breed',
    message: inquiryData.message || '',
    status: 'New',
    whatsappStatus: 'Pending',
    whatsappMessageId: null,
    whatsappSentAt: null,
    whatsappError: null,
  };

  let savedRecord = null;

  if (isDBConnected()) {
    const inquiry = new Inquiry(payload);
    savedRecord = await inquiry.save();
  } else {
    // Offline local store
    const idHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    savedRecord = {
      ...payload,
      _id: `inq-${Date.now()}`,
      id: `inq-${Date.now()}`,
      inquiryRef: `BPB-${idHex}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryInquiries.unshift(savedRecord);
    saveMemoryInquiries(memoryInquiries);
  }

  // Trigger WhatsApp notification safely
  // The inquiry must STILL succeed even if WhatsApp fails or credentials are unset
  try {
    const whatsappResult = await sendEnquiryThankYouMessage(savedRecord);
    if (whatsappResult.success) {
      savedRecord.whatsappStatus = 'Sent';
      savedRecord.whatsappMessageId = whatsappResult.messageId || null;
      savedRecord.whatsappSentAt = whatsappResult.sentAt || new Date();
      savedRecord.whatsappError = null;
    } else {
      savedRecord.whatsappStatus = 'Failed';
      savedRecord.whatsappError = whatsappResult.error || 'WhatsApp message dispatch failed';
    }

    if (isDBConnected() && typeof savedRecord.save === 'function') {
      await savedRecord.save();
    } else {
      saveMemoryInquiries(memoryInquiries);
    }
  } catch (whatsappErr) {
    console.error('[Inquiry Service] Non-blocking WhatsApp error:', whatsappErr.message);
    savedRecord.whatsappStatus = 'Failed';
    savedRecord.whatsappError = whatsappErr.message;
    if (isDBConnected() && typeof savedRecord.save === 'function') {
      try {
        await savedRecord.save();
      } catch (saveErr) {
        console.error('[Inquiry Service] Error persisting WhatsApp error status:', saveErr.message);
      }
    } else {
      saveMemoryInquiries(memoryInquiries);
    }
  }

  return savedRecord;
};

export const getAllInquiries = async (filters = {}) => {
  const { status, puppyId, search, whatsappStatus } = filters;

  if (isDBConnected()) {
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (whatsappStatus && whatsappStatus !== 'All') {
      query.whatsappStatus = whatsappStatus;
    }
    if (puppyId) {
      query.puppyId = puppyId;
    }
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { puppyName: { $regex: search, $options: 'i' } },
      ];
    }

    return await Inquiry.find(query).sort({ createdAt: -1 });
  }

  // Offline local store
  memoryInquiries = loadMemoryInquiries();
  let results = [...memoryInquiries];
  if (status && status !== 'All') {
    results = results.filter((inq) => inq.status === status);
  }
  if (whatsappStatus && whatsappStatus !== 'All') {
    results = results.filter((inq) => inq.whatsappStatus === whatsappStatus);
  }
  if (puppyId) {
    results = results.filter((inq) => inq.puppyId === puppyId);
  }
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (inq) =>
        inq.customerName.toLowerCase().includes(s) ||
        inq.phone.includes(s) ||
        inq.city.toLowerCase().includes(s) ||
        inq.puppyName.toLowerCase().includes(s)
    );
  }

  return results;
};

export const getInquiryById = async (id) => {
  if (isDBConnected()) {
    return await Inquiry.findById(id);
  }
  memoryInquiries = loadMemoryInquiries();
  return memoryInquiries.find((inq) => inq._id === id || inq.id === id);
};

export const updateInquiryStatus = async (id, status) => {
  if (isDBConnected()) {
    return await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  }

  const index = memoryInquiries.findIndex((inq) => inq._id === id || inq.id === id);
  if (index === -1) return null;

  memoryInquiries[index].status = status;
  memoryInquiries[index].updatedAt = new Date().toISOString();
  saveMemoryInquiries(memoryInquiries);
  return memoryInquiries[index];
};

export const resendInquiryWhatsApp = async (id) => {
  let inquiry = null;
  if (isDBConnected()) {
    inquiry = await Inquiry.findById(id);
  } else {
    memoryInquiries = loadMemoryInquiries();
    inquiry = memoryInquiries.find((inq) => (inq._id || inq.id) === id);
  }

  if (!inquiry) return null;

  try {
    const result = await sendEnquiryThankYouMessage(inquiry, { forceResend: true });
    if (result.success) {
      inquiry.whatsappStatus = 'Sent';
      inquiry.whatsappMessageId = result.messageId || inquiry.whatsappMessageId;
      inquiry.whatsappSentAt = result.sentAt || new Date();
      inquiry.whatsappError = null;
    } else {
      inquiry.whatsappStatus = 'Failed';
      inquiry.whatsappError = result.error || 'Failed to send WhatsApp message';
    }

    if (isDBConnected() && typeof inquiry.save === 'function') {
      await inquiry.save();
    } else {
      saveMemoryInquiries(memoryInquiries);
    }
    return inquiry;
  } catch (err) {
    inquiry.whatsappStatus = 'Failed';
    inquiry.whatsappError = err.message;
    if (isDBConnected() && typeof inquiry.save === 'function') {
      await inquiry.save();
    } else {
      saveMemoryInquiries(memoryInquiries);
    }
    return inquiry;
  }
};

export const deleteInquiry = async (id) => {
  if (isDBConnected()) {
    return await Inquiry.findByIdAndDelete(id);
  }

  const index = memoryInquiries.findIndex((inq) => inq._id === id || inq.id === id);
  if (index === -1) return null;

  const deleted = memoryInquiries[index];
  memoryInquiries.splice(index, 1);
  saveMemoryInquiries(memoryInquiries);
  return deleted;
};

export const getWhatsAppDiagnostics = () => {
  return getWhatsAppServiceStatus();
};
