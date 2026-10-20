import {
  getActiveOffers,
  getAllOffersAdmin,
  getOfferById,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
} from '../services/offerService.js';

// @desc    Get all active promotional offers for public customer website
// @route   GET /api/offers
// @access  Public
export const getOffersHandler = async (req, res, next) => {
  try {
    const activeOffers = await getActiveOffers();
    res.status(200).json({
      success: true,
      count: activeOffers.length,
      data: activeOffers,
      // Backward-compatibility alias for single offer callers
      primaryOffer: activeOffers[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all offers for Admin Panel (Active, Inactive, Expired)
// @route   GET /api/offers/admin
// @access  Private (Admin Protected)
export const getAllOffersAdminHandler = async (req, res, next) => {
  try {
    const allOffers = await getAllOffersAdmin();
    res.status(200).json({
      success: true,
      count: allOffers.length,
      data: allOffers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single offer by ID
// @route   GET /api/offers/:id
// @access  Public
export const getOfferByIdHandler = async (req, res, next) => {
  try {
    const offer = await getOfferById(req.params.id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new promotional offer
// @route   POST /api/offers
// @access  Private (Admin Protected)
export const createOfferHandler = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Offer title is required',
      });
    }

    const newOffer = await createOffer(req.body);
    res.status(201).json({
      success: true,
      message: 'Promotional offer created successfully',
      data: newOffer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update promotional offer
// @route   PUT /api/offers/:id or PUT /api/offers (legacy)
// @access  Private (Admin Protected)
export const updateOfferHandler = async (req, res, next) => {
  try {
    let id = req.params.id;

    // Backward compatibility if ID was not in URL params
    if (!id) {
      const all = await getAllOffersAdmin();
      if (all && all.length > 0) {
        id = all[0]._id || all[0].id;
      }
    }

    if (!id) {
      // Create if none exist
      const created = await createOffer(req.body);
      return res.status(200).json({
        success: true,
        message: 'Promotional offer created successfully',
        data: created,
      });
    }

    const updated = await updateOffer(id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Offer to update was not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promotional offer updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle offer active status (Activate / Deactivate)
// @route   PATCH /api/offers/:id/status
// @access  Private (Admin Protected)
export const toggleOfferStatusHandler = async (req, res, next) => {
  try {
    const { active } = req.body;
    const updated = await toggleOfferStatus(req.params.id, active);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Offer ${updated.active ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete promotional offer
// @route   DELETE /api/offers/:id
// @access  Private (Admin Protected)
export const deleteOfferHandler = async (req, res, next) => {
  try {
    const deleted = await deleteOffer(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promotional offer deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};
