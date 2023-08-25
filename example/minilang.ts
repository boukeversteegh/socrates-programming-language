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
            ?? tryMatch('', /^[a-z]+/)
            ?? tryMatch('WHITESPACE', /^\s/)
            ?? tryMatch('', /^=/)
            ?? tryMatch('', /^\(/)
            ?? tryMatch('', /^,/)
            ?? tryMatch('', /^\d+/)
            ?? tryMatch('', /^\)/)

        if (token) {
            offset += token.value.length;
            if (token.type !== 'WHITESPACE') tokens.push(token.value);
            continue;
        }

        throw new Error(`Unexpected token '${source[offset]}' at offset ${offset}`);
    }

    return tokens;
}