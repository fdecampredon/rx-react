var validNameInitialChar = /[a-zA-Z_]+/;
var validNameNonInitialChar = /[a-zA-Z0-9_\-]+/;

function parseSelector(input) {
    var selectors = [];
    var currentSelector;
    var currentQualifier;

    function newSelector() {
        if (currentSelector) {
            if (currentQualifier) {
                currentSelector.qualifiers.push(currentQualifier);
                currentQualifier = undefined;
            }

            selectors.push(currentSelector);
        }
        currentSelector = { tagName: '', qualifiers: [] };
    }

    function newQualifier() {
        if (currentQualifier)
            currentSelector.qualifiers.push(currentQualifier);

        currentQualifier = {
            attrName: '',
            attrValue: '',
            contains: false
        };
    }

    var WHITESPACE = /\s/;
    var valueQuoteChar;
    var SYNTAX_ERROR = 'Invalid or unsupported selector syntax.';

    var SELECTOR = 1;
    var TAG_NAME = 2;
    var QUALIFIER = 3;
    var QUALIFIER_NAME_FIRST_CHAR = 4;
    var QUALIFIER_NAME = 5;
    var ATTR_NAME_FIRST_CHAR = 6;
    var ATTR_NAME = 7;
    var EQUIV_OR_ATTR_QUAL_END = 8;
    var EQUAL = 9;
    var ATTR_QUAL_END = 10;
    var VALUE_FIRST_CHAR = 11;
    var VALUE = 12;
    var QUOTED_VALUE = 13;
    var SELECTOR_SEPARATOR = 14;

    var state = SELECTOR;
    var i = 0;
    while (i < input.length) {
        var c = input[i++];

        switch (state) {
            case SELECTOR:
                if (c.match(validNameInitialChar)) {
                    newSelector();
                    currentSelector.tagName = c;
                    state = TAG_NAME;
                    break;
                }

                if (c == '*') {
                    newSelector();
                    currentSelector.tagName = '*';
                    state = QUALIFIER;
                    break;
                }

                if (c == '.') {
                    newSelector();
                    newQualifier();
                    currentSelector.tagName = '*';
                    currentQualifier.attrName = 'className';
                    currentQualifier.contains = true;
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '#') {
                    newSelector();
                    newQualifier();
                    currentSelector.tagName = '*';
                    currentQualifier.attrName = 'id';
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '[') {
                    newSelector();
                    newQualifier();
                    currentSelector.tagName = '*';
                    currentQualifier.attrName = '';
                    state = ATTR_NAME_FIRST_CHAR;
                    break;
                }

                if (c.match(WHITESPACE))
                    break;

                throw Error(SYNTAX_ERROR);

            case TAG_NAME:
                if (c.match(validNameNonInitialChar)) {
                    currentSelector.tagName += c;
                    break;
                }

                if (c == '.') {
                    newQualifier();
                    currentQualifier.attrName = 'className';
                    currentQualifier.contains = true;
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '#') {
                    newQualifier();
                    currentQualifier.attrName = 'id';
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '[') {
                    newQualifier();
                    currentQualifier.attrName = '';
                    state = ATTR_NAME_FIRST_CHAR;
                    break;
                }

                if (c.match(WHITESPACE)) {
                    state = SELECTOR_SEPARATOR;
                    break;
                }

                if (c == ',') {
                    state = SELECTOR;
                    break;
                }

                throw Error(SYNTAX_ERROR);

            case QUALIFIER:
                if (c == '.') {
                    newQualifier();
                    currentQualifier.attrName = 'className';
                    currentQualifier.contains = true;
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '#') {
                    newQualifier();
                    currentQualifier.attrName = 'id';
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '[') {
                    newQualifier();
                    currentQualifier.attrName = '';
                    state = ATTR_NAME_FIRST_CHAR;
                    break;
                }

                if (c.match(WHITESPACE)) {
                    state = SELECTOR_SEPARATOR;
                    break;
                }

                if (c == ',') {
                    state = SELECTOR;
                    break;
                }

                throw Error(SYNTAX_ERROR);

            case QUALIFIER_NAME_FIRST_CHAR:
                if (c.match(validNameInitialChar)) {
                    currentQualifier.attrValue = c;
                    state = QUALIFIER_NAME;
                    break;
                }

                throw Error(SYNTAX_ERROR);

            case QUALIFIER_NAME:
                if (c.match(validNameNonInitialChar)) {
                    currentQualifier.attrValue += c;
                    break;
                }

                if (c == '.') {
                    newQualifier();
                    currentQualifier.attrName = 'className';
                    currentQualifier.contains = true;
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '#') {
                    newQualifier();
                    currentQualifier.attrName = 'id';
                    state = QUALIFIER_NAME_FIRST_CHAR;
                    break;
                }
                if (c == '[') {
                    newQualifier();
                    state = ATTR_NAME_FIRST_CHAR;
                    break;
                }

                if (c.match(WHITESPACE)) {
                    state = SELECTOR_SEPARATOR;
                    break;
                }
                if (c == ',') {
                    state = SELECTOR;
                    break;
                }

                throw Error(SYNTAX_ERROR);

            case ATTR_NAME_FIRST_CHAR:
                if (c.match(validNameInitialChar)) {
                    currentQualifier.attrName = c;
                    state = ATTR_NAME;
                    break;
                }

                if (c.match(WHITESPACE))
                    break;

                throw Error(SYNTAX_ERROR);

            case ATTR_NAME:
                if (c.match(validNameNonInitialChar)) {
                    currentQualifier.attrName += c;
                    break;
                }

                if (c.match(WHITESPACE)) {
                    state = EQUIV_OR_ATTR_QUAL_END;
                    break;
                }

                if (c == '~') {
                    currentQualifier.contains = true;
                    state = EQUAL;
                    break;
                }

                if (c == '=') {
                    currentQualifier.attrValue = '';
                    state = VALUE_FIRST_CHAR;
                    break;
                }

                if (c == ']') {
                    state = QUALIFIER;
                    break;
                }

                throw Error(SYNTAX_ERROR);

            case EQUIV_OR_ATTR_QUAL_END:
                if (c == '~') {
                    currentQualifier.contains = true;
                    state = EQUAL;
                    break;
                }

                if (c == '=') {
                    currentQualifier.attrValue = '';
                    state = VALUE_FIRST_CHAR;
                    break;
                }

                if (c == ']') {
                    state = QUALIFIER;
                    break;
                }

                if (c.match(WHITESPACE))
                    break;

                throw Error(SYNTAX_ERROR);

            case EQUAL:
                if (c == '=') {
                    currentQualifier.attrValue = '';
                    state = VALUE_FIRST_CHAR;
                    break;
                }

                throw Error(SYNTAX_ERROR);

            case ATTR_QUAL_END:
                if (c == ']') {
                    state = QUALIFIER;
                    break;
                }

                if (c.match(WHITESPACE))
                    break;

                throw Error(SYNTAX_ERROR);

            case VALUE_FIRST_CHAR:
                if (c.match(WHITESPACE))
                    break;

                if (c == '"' || c == "'") {
                    valueQuoteChar = c;
                    state = QUOTED_VALUE;
                    break;
                }

                currentQualifier.attrValue += c;
                state = VALUE;
                break;

            case VALUE:
                if (c.match(WHITESPACE)) {
                    state = ATTR_QUAL_END;
                    break;
                }
                if (c == ']') {
                    state = QUALIFIER;
                    break;
                }
                if (c == "'" || c == '"')
                    throw Error(SYNTAX_ERROR);

                currentQualifier.attrValue += c;
                break;

            case QUOTED_VALUE:
                if (c == valueQuoteChar) {
                    state = ATTR_QUAL_END;
                    break;
                }

                currentQualifier.attrValue += c;
                break;

            case SELECTOR_SEPARATOR:
                if (c.match(WHITESPACE))
                    break;

                if (c == ',') {
                    state = SELECTOR;
                    break;
                }

                throw Error(SYNTAX_ERROR);
        }
    }

    switch (state) {
        case SELECTOR:
        case TAG_NAME:
        case QUALIFIER:
        case QUALIFIER_NAME:
        case SELECTOR_SEPARATOR:
            // Valid end states.
            newSelector();
            break;
        default:
            throw Error(SYNTAX_ERROR);
    }

    if (!selectors.length)
        throw Error(SYNTAX_ERROR);

    return selectors;
}



var cache = {};

function matches(selector, element) {
    if (!element) {
      return false;
    }
    var selectors = cache[selector] || (cache[selector] = parseSelector(selector));
    
    var tagName = typeof element.type === 'function'? element.type.displayName: '' + element.type;
    
    var props = element.props;
    return selectors.some(function (selector) {
        if (selector.tagName !== '*' && tagName !== selector.tagName) {
            return false;
        }
        return selector.qualifiers.every(function (qualifier) {
            if (!props.hasOwnProperty(qualifier.attrName)) {
                return false;
            }
            
            if (!qualifier.attrValue) {
                return true;
            }
            
            if (qualifier.contains) {
                var tokens = (props[qualifier.attrName] + '').split(' ');
                return tokens.some(function (token) {
                    return qualifier.attrValue === token;
                });
            }
            
            return props[qualifier.attrName] == qualifier.attrValue;
        });
    });
}


exports.matches = matches;
