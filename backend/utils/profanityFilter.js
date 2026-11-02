const defaultBadWords = [
    'shit', 'fuck', 'fucker', 'fucking', 'bitch', 'asshole', 'bastard', 'damn', 'cunt', 'dick',
    'pussy', 'whore', 'slut', 'cock', 'fag', 'nigger', 'nigga', 'bullshit', 'motherfucker',
    'dumbass', 'jackass', 'piss', 'prick', 'twat', 'wanker'
];

class ProfanityFilter {
    constructor(options = {}) {
        const words = options.list || defaultBadWords;
        this.regex = new RegExp(`\\b(${words.join('|')})\\b`, 'gi');
    }

    isProfane(string) {
        if (!string || typeof string !== 'string') return false;
        this.regex.lastIndex = 0;
        return this.regex.test(string);
    }

    clean(string) {
        if (!string || typeof string !== 'string') return string;
        this.regex.lastIndex = 0;
        return string.replace(this.regex, (match) => '*'.repeat(match.length));
    }
}

module.exports = new ProfanityFilter();
