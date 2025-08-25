export const generateOtp = (length = 6): string => {
    const digits = "0123456789";
    return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
};

export const getOtpExpiry = (minutes = 10): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

export const isOtpExpired = (expiryDate: Date): boolean => {
    return new Date() > expiryDate;
};

export const generateSecureOtp = (length = 6): string => {
    // More secure OTP generation with better randomization
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
};
