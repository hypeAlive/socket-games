import {ID, isNamespaceID, NamespaceID} from 'socket-game-types';
import {expect} from "chai";
import UniqueId from "../../main/utils/UniqueId.js";

describe('UniqueId Tests', () => {
    describe('#generateUniqueId()', () => {
        it('should return 0 for empty array', () => {
            expect(UniqueId.generateUniqueId([])).to.be.equal(0);
        });

        it('should return the next number for consecutive IDs', () => {
            const existingIds: ID[] = [0, 1, 2];
            expect(UniqueId.generateUniqueId(existingIds)).to.be.equal(3);
        });

        it('should find the smallest missing number in non-consecutive IDs', () => {
            const existingIds: ID[] = [0, 1, 3, 4];
            expect(UniqueId.generateUniqueId(existingIds)).to.be.equal(2);
        });
    });

    describe('#generateUniqueNamespaceId()', () => {
        it('should return [namespace, 0] for empty array', () => {
            const namespace = 'game';
            expect(UniqueId.generateUniqueNamespaceId([], namespace)).to.deep.equal([namespace, 0]);
        });

        it('should return the correct next namespace ID', () => {
            const namespace = 'player';
            const existingIds: ID[] = [[namespace, 0], [namespace, 1]];
            const generated: NamespaceID = UniqueId.generateUniqueNamespaceId(existingIds, namespace);
            expect(generated).to.deep.equal([namespace, 2]);
            expect(isNamespaceID(generated)).to.be.true;
        });
    });
});