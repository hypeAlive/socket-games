import {ID, NamespaceID} from "socket-game-types";

/**
 * UniqueId class provides static methods to generate unique numeric or namespaced identifiers
 * based on an array of existing identifiers.
 */
export default class UniqueId {

    /**
     * Generates a unique numeric identifier not present in the provided array of existing IDs.
     *
     * @param existingIds - An array of existing identifiers, which can be either numeric or namespaced.
     * @returns A unique numeric identifier.
     */
    public static generateUniqueId(existingIds: ID[]): number {
        const numbers = UniqueId.getNumArray(existingIds);
        return UniqueId.findNextNumber(numbers);
    }

    /**
     * Generates a unique namespaced identifier based on the provided namespace and not present
     * in the array of existing IDs.
     *
     * @param existingIds - An array of existing identifiers, which can be either numeric or namespaced.
     * @param namespace - The namespace to prefix the unique identifier with.
     * @returns A unique namespaced identifier as a tuple of namespace and numeric identifier.
     */
    public static generateUniqueNamespaceId(existingIds: ID[], namespace: string): NamespaceID {
        const id = UniqueId.generateUniqueId(existingIds);
        return [namespace, id];
    }

    /**
     * Finds the next available number not present in the provided array of numbers.
     *
     * @param numbers - An array of numbers sorted in ascending order.
     * @returns The next available number.
     */
    private static findNextNumber(numbers: number[]): number {
        const numbersSet = new Set(numbers);
        let nextNumber = 0;
        while (numbersSet.has(nextNumber)) {
            nextNumber++;
        }
        return nextNumber;
    }

    /**
     * Extracts the numeric part from an array of IDs, which can be either numeric or namespaced.
     *
     * @param ids - An array of IDs, which can be either numeric or namespaced.
     * @returns An array of numbers extracted from the provided IDs.
     */
    private static getNumArray(ids: ID[]): number[] {
        return ids.map(id => typeof id === 'number' ? id : id[1]);
    }


    public static generateUniqueHash(length: number = 4, existingHashes: IterableIterator<string>): string {
        const existingHashesSet = new Set(existingHashes);
        let hash = UniqueId.generateHash(length);
        while (existingHashesSet.has(hash)) {
            hash = UniqueId.generateHash(length);
        }
        return hash;
    }

    private static generateHash(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        const result = Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * charactersLength)));
        return result.join('');
    }

}