export const generateOtp = (length = 6): string => {
    const digits = "0123456789";
    return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
};

export const getOtpExpiry = (minutes = 10): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
};
