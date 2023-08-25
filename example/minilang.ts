export function tokenize(source: string) {
    const tokens = [];

    let offset = 0;

    function tryMatch(type, pattern) {
        let match = source.slice(offset).match(pattern);
        if (match) return {type, value: match[0]};
        return null;
    }
    while(offset < source.length) {

        const token = null
            ?? tryMatch('NAME', /^[a-z]+/)
            ?? tryMatch('WHITESPACE', /^\s/)
            ?? tryMatch('ASSIGN', /^=/)
            ?? tryMatch('OPEN', /^\(/)
            ?? tryMatch('COMMA', /^,/)
            ?? tryMatch('NUMBER', /^\d+/)
            ?? tryMatch('CLOSE', /^\)/)

        if (token) {
            offset += token.value.length;
            if (token.type !== 'WHITESPACE') tokens.push(token);
            continue;
        }

        throw new Error(`Unexpected token '${source[offset]}' at offset ${offset}`);
    }

    return tokens;
}


export function parse(tokens) {
    let offset = 0;

    function token(type) {
        const token = tokens[offset];
        if (token.type !== type) throw new Error(`unexpected token: ${JSON.stringify(token)} after: ${offset}`);
        offset++;
        return token.value;
    }

    function ASSIGNMENT() {
        const variable = token('NAME')
        token('ASSIGN')
        const value = VALUE();

        return {
            type: 'ASSIGN',
            variable: variable,
            value: value
        }
    }

    function VARIABLE() {
        return {
            type: 'VARIABLE',
            name: token('NAME'),
        }
    }

    function tryRule(rule) {
        const _offset = offset;
        try {
            return rule();
        } catch (e ) {
            offset = _offset;
            return null;
        }
    }

    function VALUE() {
        return tryRule(NUMBER) ?? tryRule(CALL) ?? VARIABLE()
    }

    function CALL() {
        const name = token('NAME');
        token('OPEN')

        // arguments
        const args = []
        while(tokens[offset].type !== 'CLOSE') {
            const argValue = VALUE();
            args.push(argValue);

            if (tokens[offset].type !== 'CLOSE') token('COMMA');
        }

        token('CLOSE');

        return {
            type: 'CALL',
            arguments: args,
            name: name,
        }
    }

    function NUMBER() {
        const value = token('NUMBER')
        return {
            type: 'NUMBER',
            value: parseInt(value)
        }
    }

    return ASSIGNMENT();
}


export function compile(node) {
    switch (node.type) {
        case 'ASSIGN':
            return `let ${(node.variable)} = ${compile(node.value)}`;
        case 'CALL':
            if (node.name === 'add') {
                return node.arguments.map(compile).join(' + ')
            }
            const args = node.arguments.map(compile).join(', ')
            return`${node.name}(${args})`;
        case 'NUMBER':
            return `${node.value}`
        default:
            throw new Error(`Unknown node type: ${node.type}`)
    }
}