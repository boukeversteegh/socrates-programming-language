import {compile, parse, tokenize} from "./minilang";

describe('tokenizer', () => {
    it('a = add(b, 1)', () => {
        expect(tokenize('a = add(b, 1)')).toEqual([
            {type: 'NAME', value: 'a'},
            {type: 'ASSIGN', value: '='},
            {type: 'NAME', value: 'add'},
            {type: 'OPEN', value: '('},
            {type: 'NAME', value: 'b'},
            {type: 'COMMA', value: ','},
            {type: 'NUMBER', value: '1'},
            {type: 'CLOSE', value: ')'},
        ])
    });
});

describe('parser', () => {
    it('a = 1', () => {
        expect(parse(tokenize('a = 1'))).toEqual({
            type: 'ASSIGN',
            variable: 'a',
            value: {
                type: 'NUMBER',
                value: 1
            }
        })
    });
    it('a = add(b, 1)', () => {
        expect(parse(tokenize('a = add(b, 1)'))).toEqual({
            type: 'ASSIGN',
            variable: 'a',
            value: {
                type: 'CALL',
                name: 'add',
                arguments: [
                    {type: 'VARIABLE', name: 'b'},
                    {type: 'NUMBER', value: 1}
                ]
            }
        })
    });
    it('a = foobar(1, 2, 3)', () => {
        expect(parse(tokenize('a = foobar(1, 2, 3)'))).toEqual({
            type: 'ASSIGN',
            variable: 'a',
            value: {
                type: 'CALL',
                name: 'foobar',
                arguments: [
                    {type: 'NUMBER', value: 1},
                    {type: 'NUMBER', value: 2},
                    {type: 'NUMBER', value: 3},
                ]
            }
        })
    });

    it('a = add(add(3, c), 1)', () => {
        expect(parse(tokenize('a = add(add(3, c), 1)'))).toEqual({
            type: 'ASSIGN',
            variable: 'a',
            value: {
                type: 'CALL',
                name: 'add',
                arguments: [
                    {
                        type: 'CALL',
                        name: 'add',
                        arguments: [
                            {type: 'NUMBER', value: 3},
                            {type: 'VARIABLE', name: 'c'},
                        ]
                    }
                    ,
                    {type: 'NUMBER', value: 1}
                ]
            }
        })
    });
});

describe('compiler', () => {
    it('a = foo(foo(1, 2), foo(3, 4))', () => {
        expect(compile(parse(tokenize('a = foo(foo(1, 2), foo(3, 4))')))).toEqual(
            'let a = foo(foo(1, 2), foo(3, 4))'
        )
    });
    it('a = add(add(1, 2), add(3, b))', () => {
        expect(compile(parse(tokenize('a = add(add(1, 2), add(3, b))')))).toEqual(
            'let a = 1 + 2 + 3 + b'
        )
    });

});