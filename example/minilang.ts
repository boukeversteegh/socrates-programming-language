export function tokenize(source: string) {
    let offset = 0;

    function tryMatch(type, pattern) {
        let match = source.slice(offset).match(pattern);
        return match ? {type, value: match[0]} : null;
    }

    const tokens = [];
    while (offset < source.length) {
        const token = null
            ?? tryMatch('NAME', /^[a-z]+/)
            ?? tryMatch('WHITESPACE', /^\s/)
            ?? tryMatch('ASSIGN', /^=/)
            ?? tryMatch('OPEN', /^\(/)
            ?? tryMatch('COMMA', /^,/)
            ?? tryMatch('NUMBER', /^\d+/)
            ?? tryMatch('CLOSE', /^\)/)

        if (!token) throw new Error(`Unexpected token '${source[offset]}' at offset ${offset}`);

        offset += token.value.length;
        if (token.type !== 'WHITESPACE') tokens.push(token);
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

    function tryRule(rule) {
        const _offset = offset;
        try {
            return rule();
        } catch (e) {
            offset = _offset;
        }
    }

    const rules = {
        ASSIGNMENT() {
            const variable = token('NAME')
            token('ASSIGN')
            const value = rules.VALUE();
            return {type: 'ASSIGN', variable: variable, value: value}
        },
        VARIABLE: () => ({type: 'VARIABLE', name: token('NAME')}),
        VALUE: () => tryRule(rules.NUMBER) ?? tryRule(rules.CALL) ?? rules.VARIABLE(),
        CALL() {
            const name = token('NAME');

            token('OPEN')
            const args = []
            while (tokens[offset].type !== 'CLOSE') {
                const argValue = rules.VALUE();
                args.push(argValue);
                if (tokens[offset].type !== 'CLOSE') token('COMMA');
            }
            token('CLOSE');

            return {type: 'CALL', arguments: args, name: name}
        },
        NUMBER() {
            const value = token('NUMBER')
            return {type: 'NUMBER', value: parseInt(value)}
        }
    }

    return rules.ASSIGNMENT();
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
            return `${node.name}(${args})`;
        case 'NUMBER':
            return `${node.value}`
        default:
            throw new Error(`Unknown node type: ${node.type}`)
    }
}