import validator from 'validator';

interface SignUpData {
    userName?: string;
    name?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    avatarUrl?: string;
}

interface SingInData {
    userName?: string;
    email?: string;
    password?: string;
}

interface ProfileEditData {
    userName?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    avatarUrl?: string;
}

interface ValidationResult {
    valid: boolean;
    errors: { [key: string]: string };
}

export const validateSignUpData = (data: SignUpData): ValidationResult => {
    const errors: { [key: string]: string } = {};

    if (!data.userName || !validator.isLength(data.userName, { min: 3, max: 20 }) || !validator.matches(data.userName, /^[a-zA-Z0-9_]+$/)) {
        errors.userName = 'Username must be 3-20 characters and can only contain letters, numbers, and underscores.';
    }

    if (!data.name || !validator.isLength(data.name, { min: 2, max: 20 })) {
        errors.name = 'Name must be 2-20 characters long.';
    }

    if (!data.email) {
        errors.email = 'Email is required.';
    } else if (!validator.isEmail(data.email)) {
        errors.email = 'Email is not valid.';
    }

    if (!data.password) {
        errors.password = 'Password is required.';
    } else if (!validator.isStrongPassword(data.password)) {
        errors.password = 'Password is not strong enough.';
    }

    if (data.phoneNumber && !validator.isMobilePhone(data.phoneNumber, 'any')) {
        errors.phoneNumber = 'Phone number is not valid.';
    }

    if (data.avatarUrl && !validator.isURL(data.avatarUrl, { protocols: ['http', 'https'], require_protocol: true })) {
        errors.avatarUrl = 'Avatar URL is not valid.';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};

export const validateSignInData = (data: SingInData): ValidationResult => {
    const errors: { [key: string]: string } = {};
    if (!data.userName && !data.email) {
        errors.userName = 'Either userName or name is required.';
    }
    if (!data.password) {
        errors.password = 'Password is required.';
    } else if (typeof data.password === 'string' && data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
    }
    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

export const validateProfileData = (data: ProfileEditData): ValidationResult => {
    const errors: { [key: string]: string } = {};

    if (data.userName !== undefined && !validator.isLength(data.userName, { min: 3, max: 30 })) {
        errors.name = 'UserName must be 3-30 characters long.';
    }

    if (data.name !== undefined && !validator.isLength(data.name, { min: 2, max: 20 })) {
        errors.name = 'Name must be 2-20 characters long.';
    }

    if (data.email !== undefined) {
        if (!validator.isEmail(data.email)) {
            errors.email = 'Email is not valid.';
        }
    }

    if (data.phoneNumber !== undefined && data.phoneNumber !== '') {
        if (!validator.isMobilePhone(data.phoneNumber, 'any')) {
            errors.phoneNumber = 'Phone number is not valid.';
        }
    }

    if (data.avatarUrl !== undefined && data.avatarUrl !== '') {
        if (!validator.isURL(data.avatarUrl, { protocols: ['http', 'https'], require_protocol: true })) {
            errors.avatarUrl = 'Avatar URL is not valid.';
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};