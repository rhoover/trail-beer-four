
export default function() {
  return {
    Gkey: process.env.GOOGLE_MAPS_KEY || "Fallback string if not found"
  };
};
