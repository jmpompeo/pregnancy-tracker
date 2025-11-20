/**
 * <summary>
 * Quick reference list translating gestational weeks into playful size comparisons.
 * Based on common guides from BabyCenter, What to Expect, and March of Dimes.
 * </summary>
 */
export interface BabySizeEntry {
  week: number;
  size: string;
  description: string;
}

/**
 * <summary>Curated 40-week map so we can surface a fun comparison each week.</summary>
 */
export const BABY_SIZE_GUIDE: BabySizeEntry[] = [
  { week: 4, size: "Poppy Seed", description: "Tiny but mighty beginnings." },
  { week: 5, size: "Sesame Seed", description: "Heart tube is starting to form." },
  { week: 6, size: "Lentil", description: "Facial features start budding." },
  { week: 7, size: "Blueberry", description: "Hands and feet are forming." },
  { week: 8, size: "Raspberry", description: "Tail fades as the body straightens." },
  { week: 9, size: "Cherry", description: "Little fingers and toes are appearing." },
  { week: 10, size: "Strawberry", description: "Vital organs are in place." },
  { week: 11, size: "Brussels Sprout", description: "Baby is practicing breathing motions." },
  { week: 12, size: "Lime", description: "Reflexes are kicking in." },
  { week: 13, size: "Peach", description: "Voice box and vocal cords form." },
  { week: 14, size: "Lemon", description: "Neck is getting longer and stronger." },
  { week: 15, size: "Apple", description: "Joints are fully functional." },
  { week: 16, size: "Avocado", description: "Baby can make facial expressions." },
  { week: 17, size: "Pear", description: "Skeleton is hardening into bone." },
  { week: 18, size: "Bell Pepper", description: "Hearing is improving each day." },
  { week: 19, size: "Heirloom Tomato", description: "Vernix caseosa is forming on the skin." },
  { week: 20, size: "Banana", description: "Halfway there! Measuring head to heel now." },
  { week: 21, size: "Carrot", description: "Taste buds are developing quickly." },
  { week: 22, size: "Papaya", description: "Baby responds to light and sound." },
  { week: 23, size: "Grapefruit", description: "Skin is becoming less translucent." },
  { week: 24, size: "Ear of Corn", description: "Lungs keep maturing for first breaths." },
  { week: 25, size: "Rutabaga", description: "Balance and coordination centers advance." },
  { week: 26, size: "Scallion", description: "Eyes begin opening soon." },
  { week: 27, size: "Cauliflower", description: "Start of the third trimester." },
  { week: 28, size: "Eggplant", description: "Dream cycles are forming." },
  { week: 29, size: "Butternut Squash", description: "Baby is packing on baby fat." },
  { week: 30, size: "Cabbage", description: "Brain is full of deep grooves now." },
  { week: 31, size: "Coconut", description: "Five senses are fully developed." },
  { week: 32, size: "Jicama", description: "Practicing swallowing and breathing." },
  { week: 33, size: "Pineapple", description: "Bones are hardening except skull plates." },
  { week: 34, size: "Cantaloupe", description: "Immune system is building antibodies." },
  { week: 35, size: "Honeydew", description: "Kidneys and liver are almost ready." },
  { week: 36, size: "Romaine Lettuce", description: "Baby is head-down and snug." },
  { week: 37, size: "Swiss Chard", description: "Considered early term—nearly there." },
  { week: 38, size: "Leek", description: "Grip strength increases rapidly." },
  { week: 39, size: "Mini Watermelon", description: "Full term—with a strong layer of fat." },
  { week: 40, size: "Pumpkin", description: "Ready to meet the world!" },
];
