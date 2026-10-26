
export default function() {
  return {
    myString: process.env.GOOGLE_MAPS_KEY || "Fallback string if not found"
  };
};
