// Cloudinary hosted assets for production
export const LOGO_URL = "https://res.cloudinary.com/de6dvjesr/image/upload/v1768322471/nexus-network/logo.png";

// Fallback to local assets in development if needed
export const getLogoUrl = () => {
  return LOGO_URL;
};
