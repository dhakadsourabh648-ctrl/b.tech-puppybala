import * as inquiryService from '../services/inquiryService.js';

// @desc    Submit a new customer enquiry
// @route   POST /api/inquiries
// @access  Public
export const createInquiryHandler = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries (with filters: status, puppyId, search)
// @route   GET /api/inquiries
// @access  Admin / Public
export const getAllInquiriesHandler = async (req, res, next) => {
  try {
    const inquiries = await inquiryService.getAllInquiries(req.query);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enquiry by ID
// @route   GET /api/inquiries/:id
// @access  Admin / Public
export const getInquiryByIdHandler = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry status (New, Contacted, Follow-up, Closed)
// @route   PATCH /api/inquiries/:id/status (or PUT)
// @access  Admin
export const updateInquiryStatusHandler = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await inquiryService.updateInquiryStatus(req.params.id, status);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Enquiry status updated to "${status}" successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an enquiry
// @route   DELETE /api/inquiries/:id
// @access  Admin
export const deleteInquiryHandler = async (req, res, next) => {
  try {
    const deleted = await inquiryService.deleteInquiry(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend WhatsApp thank-you confirmation for an enquiry
// @route   POST /api/inquiries/:id/resend-whatsapp
// @access  Admin
export const resendInquiryWhatsAppHandler = async (req, res, next) => {
  try {
    const updated = await inquiryService.resendInquiryWhatsApp(req.params.id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `WhatsApp thank-you notification re-triggered. Status: ${updated.whatsappStatus}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get WhatsApp API service diagnostics and configuration status
// @route   GET /api/inquiries/whatsapp/status
// @access  Admin
export const getWhatsAppDiagnosticsHandler = async (req, res, next) => {
  try {
    const status = inquiryService.getWhatsAppDiagnostics();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

