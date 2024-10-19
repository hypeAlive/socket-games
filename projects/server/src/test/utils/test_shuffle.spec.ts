import {expect} from "chai";
import Shuffle from "../../main/utils/Shuffle.js";

describe('Shuffle Tests', () => {

    describe('#fisherYatesShuffle()', () => {
        it('should not change the length of the array', () => {
            const array = [1, 2, 3, 4, 5];
            const shuffledArray = Shuffle.fisherYatesShuffle([...array]);
            expect(shuffledArray.length).to.equal(array.length);
        });

        it('should contain the same elements before and after shuffle', () => {
            const array = [1, 2, 3, 4, 5];
            const shuffledArray = Shuffle.fisherYatesShuffle([...array]);
            expect(shuffledArray.sort()).to.deep.equal(array.sort());
        });

        it('should not return the same array order for most cases', () => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            let similarOrderCount = 0;
            for (let i = 0; i < 100; i++) {
                const shuffledArray = Shuffle.fisherYatesShuffle([...array]);
                if (shuffledArray.every((value: number, index: number) => value === array[index])) {
                    similarOrderCount++;
                }
            }
            // Allowing for the rare chance of the shuffle returning the same order
            expect(similarOrderCount).to.be.lessThan(5);
        });
    });
});