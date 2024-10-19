export type ID = NamespaceID | number;
export type NamespaceID = [namespace: string, identifier: number];

export function isNamespaceID(id: ID): id is NamespaceID {
    return Array.isArray(id) && id.length === 2 && typeof id[0] === 'string' && typeof id[1] === 'number';
}