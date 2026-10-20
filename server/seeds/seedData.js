export const DEMO_PUPPIES = [];

export const DEMO_ADMIN = {
  name: "Sourabh Dhakad",
  email: "dhakadsourabh648@gmail.com",
  password: "MAhadev@123",
  role: "superadmin",
};

export const DEMO_INQUIRIES = [];

export const DEMO_OFFERS = [
  {
    title: "FREE Welcome Kit",
    description: "Everything you need to give your new family member a warm, joyful start! Complimentary starter essentials for all puppies.",
    subtitle: "Everything you need to give your new family member a warm, joyful start!",
    badge: "Limited Period Festive Special",
    active: true,
    startDate: new Date().toISOString(),
    endDate: null,
    image: "",
    icon: "Gift",
    items: [
      {
        name: "7 Days Dog Food",
        description: "Starter nutritious food pack matched to your puppy's current diet for easy digestion.",
        icon: "Utensils",
      },
      {
        name: "Dog Belt",
        description: "Comfortable, safe, puppy-sized neck collar and leash for early training.",
        icon: "ShieldCheck",
      },
      {
        name: "Dog Shampoo",
        description: "Gentle tear-free puppy grooming shampoo that keeps coats fresh, soft, and clean.",
        icon: "Sparkles",
      },
    ],
    terms: "Included automatically with every puppy adoption enquiry finalized this month. No hidden charges.",
    highlightText: "Worth ₹2,500 complimentary with every puppy",
  },
  {
    title: "Puppy Health & Grooming Voucher",
    description: "Special nursery care package including transition diet guide, 30-day vet advisory access, and dental chew treats.",
    subtitle: "Exclusive health & wellness package from B.tech Puppybala Bhopal.",
    badge: "Home-Raised Assurance",
    active: false,
    startDate: new Date().toISOString(),
    endDate: null,
    image: "",
    icon: "Sparkles",
    items: [
      {
        name: "30-Day Transition Support",
        description: "Direct telephonic guidance for puppy nutrition and potty training routine.",
        icon: "ShieldCheck",
      },
      {
        name: "Teething Chew Toy",
        description: "Non-toxic soft rubber teething chew to soothe growing gums.",
        icon: "Gift",
      },
      {
        name: "Nutrition Diet Chart",
        description: "Customized portion feeding schedule tailored to your puppy's breed and weight.",
        icon: "Utensils",
      },
    ],
    terms: "Complimentary for all confirmed adoptions across Bhopal, Indore & MP.",
    highlightText: "Free 1-on-1 pet parenting guidance included",
  },
];

export const DEMO_OFFER = DEMO_OFFERS[0];
