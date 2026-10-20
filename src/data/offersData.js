// Dynamic offers structure designed to easily plug into backend APIs in the future
export const activeOffers = [
  {
    id: "offer-welcome-kit-1",
    title: "FREE Welcome Kit",
    subtitle: "Everything you need to give your new family member a warm, joyful start!",
    badge: "Limited Period Festive Special",
    isFeatured: true,
    items: [
      {
        id: "item-food",
        name: "7 Days Premium Puppy Food",
        description: "Starter nutritious food pack matched to your puppy's current diet for easy digestion.",
        icon: "Utensils",
      },
      {
        id: "item-belt",
        name: "Soft Adjustable Dog Collar & Leash",
        description: "Comfortable, safe, puppy-sized neck collar and leash for early training.",
        icon: "ShieldCheck",
      },
      {
        id: "item-shampoo",
        name: "Hypoallergenic Dog Shampoo",
        description: "Gentle tear-free puppy grooming shampoo that keeps coats fresh, soft, and clean.",
        icon: "Sparkles",
      },
    ],
    terms: "Included automatically with every puppy adoption enquiry finalized this month. No hidden charges.",
    highlightText: "Worth ₹2,500 complimentary with every puppy"
  }
];

export const getActiveOffer = () => {
  return activeOffers.find(o => o.isFeatured) || activeOffers[0];
};
