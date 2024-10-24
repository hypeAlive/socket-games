import crypto from "crypto";

export default class AuthUtil {

    private static readonly TOKEN = crypto.randomBytes(64).toString('hex');


    public static hashPassword(password: string): string {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }

    public static verifyPassword(storedPassword: string, inputPassword: string): boolean {
        const [salt, hash] = storedPassword.split(':');
        const inputHash = crypto.pbkdf2Sync(inputPassword, salt, 1000, 64, 'sha512').toString('hex');
        return hash === inputHash;
    }

    public static hashClientId(clientId: string): string {
        return crypto.createHash('sha256').update(clientId).digest('hex');
    }
}