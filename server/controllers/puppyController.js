import * as puppyService from '../services/puppyService.js';

// @desc    Get all puppies (with optional filters: breed, gender, availability, search, price)
// @route   GET /api/puppies
// @access  Public
export const getAllPuppiesHandler = async (req, res, next) => {
  try {
    const puppies = await puppyService.getAllPuppies(req.query);
    res.status(200).json({
      success: true,
      count: puppies.length,
      data: puppies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single puppy by ID
// @route   GET /api/puppies/:id
// @access  Public
export const getPuppyByIdHandler = async (req, res, next) => {
  try {
    const puppy = await puppyService.getPuppyById(req.params.id);
    if (!puppy) {
      return res.status(404).json({
        success: false,
        message: `Puppy with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: puppy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new puppy
// @route   POST /api/puppies
// @access  Admin (or public in Part 2)
export const createPuppyHandler = async (req, res, next) => {
  try {
    const newPuppy = await puppyService.createPuppy(req.body);
    res.status(201).json({
      success: true,
      message: 'Puppy record created successfully',
      data: newPuppy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update puppy details
// @route   PUT /api/puppies/:id
// @access  Admin
export const updatePuppyHandler = async (req, res, next) => {
  try {
    const updatedPuppy = await puppyService.updatePuppy(req.params.id, req.body);
    if (!updatedPuppy) {
      return res.status(404).json({
        success: false,
        message: `Puppy with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Puppy record updated successfully',
      data: updatedPuppy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a puppy
// @route   DELETE /api/puppies/:id
// @access  Admin
export const deletePuppyHandler = async (req, res, next) => {
  try {
    const deleted = await puppyService.deletePuppy(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Puppy with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Puppy record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update puppy availability (Available / Sold)
// @route   PATCH /api/puppies/:id/availability
// @access  Admin
export const updateAvailabilityHandler = async (req, res, next) => {
  try {
    const { availability } = req.body;
    const updated = await puppyService.updatePuppyAvailability(req.params.id, availability);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Puppy with ID "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Puppy status updated to "${availability}" successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
