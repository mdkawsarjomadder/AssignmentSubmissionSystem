import Cookies from 'js-cookie';

export interface UserTokenClaims {
    email: string;
    fullName: string;
    role: 'Admin' | 'Teacher' | 'Student';
    exp?: number;
}

export const setAuthToken = (token: string) => {
    Cookies.set('token', token, { expires: 1 });
};

export const getAuthToken = () => {
    return Cookies.get('token');
};

export const removeAuthToken = () => {
    Cookies.remove('token');
};

export const parseJwt = (token: string): UserTokenClaims | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const parsed = JSON.parse(jsonPayload);

        return {
            email: parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || parsed.email,
            fullName: parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || parsed.name,
            role: parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || parsed.role,
        };
    } catch (e) {
        return null;
    }
};