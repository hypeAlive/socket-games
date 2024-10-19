/**
 * Custom error class for game errors
 */
export class GameError extends Error {

    /**
     * Creates a new GameError
     * @param message - The error message
     */
    constructor(message: string) {
        super(message);
        this.name = "GameError";
    }

    /**
     * Returns the stack trace of the error
     * @returns {string} - the stack trace
     */
    public getStackTrace(): string {
        return this.stack ? this.stack : this.message;
    }

}