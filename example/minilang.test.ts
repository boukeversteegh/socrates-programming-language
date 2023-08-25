import {tokenize} from "./minilang";

describe('tokenizer', () => {
    it('a = add(b, 1)', () => {
        expect(tokenize('a = add(b, 1)')).toEqual([
            'a',
            '=',
            'add',
            '(',
            'b',
            ',',
            '1',
            ')',
        ])
    });
});