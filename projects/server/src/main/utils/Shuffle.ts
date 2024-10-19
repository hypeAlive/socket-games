/**
 * Shuffle class provides static methods for better randomizing arrays.
 * Or just one ;)
 */
export default class Shuffle {

    /**
     * Fisher-Yates shuffle algorithm.
     * @param array - The array to shuffle
     * @returns The shuffled array
     */
    public static fisherYatesShuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}