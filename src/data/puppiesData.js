/**
 * Frontend Puppy Data Store
 * All puppies are loaded dynamically from the database and REST API.
 * Dummy/demo data has been permanently removed.
 */
export const PUPPIES = [];

export const getPuppyById = (id) => {
  return PUPPIES.find((p) => (p.id || p._id) === id) || null;
};

export const getFeaturedPuppies = (limit = 6) => {
  return PUPPIES.filter((p) => p.status === 'Available' || p.availability === 'Available').slice(0, limit);
};

export const getAllBreeds = () => {
  const breeds = Array.from(new Set(PUPPIES.map((p) => p.breed)));
  return ['All Breeds', ...breeds];
};
