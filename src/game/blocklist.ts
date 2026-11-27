// Dropped before the ladder graph is built, so they never appear as a
// puzzle or as a step. Includes SCOWL's offensive and profane lists
// plus other slurs and explicit terms.
const BLOCKED = [
  'abo', 'abos', 'anal', 'anus', 'arse', 'arsehole', 'arseholes', 'arses',
  'asses', 'asshole', 'assholes', 'barf', 'barfs', 'bitch', 'boner', 'boob',
  'boobs', 'booby', 'bullshit', 'bullshits', 'bullshitted', 'bullshitter',
  'bullshitters', 'bullshitting', 'chickenshit', 'chickenshits', 'chink',
  'chinks', 'cock', 'cocks', 'cocksucker', 'cocksuckers', 'coon', 'coons',
  'cum', 'cums', 'cunt', 'cunts', 'darkey', 'darky', 'dick', 'dicks', 'dildo',
  'dildos', 'dyke', 'dykes', 'fag', 'fagot', 'fagots', 'fags', 'fanny', 'fart',
  'farts', 'fecal', 'feces', 'fuck', 'fucked', 'fucker', 'fuckers', 'fuckhead',
  'fuckheads', 'fucking', 'fuckings', 'fucks', 'gook', 'gooks', 'hebe', 'hebes',
  'hoes', 'homo', 'homos', 'honkeys', 'honky', 'horny', 'horseshit', 'horseshits',
  'jap', 'japs', 'jizz', 'jugs', 'kike', 'kikes', 'kinky', 'kraut', 'krauts',
  'labia', 'moron', 'motherfucker', 'motherfuckers', 'motherfucking', 'muff',
  'muffs', 'nazi', 'nazis', 'negro', 'negros', 'nigger', 'niggered', 'niggering',
  'niggers', 'orgy', 'paki', 'pakis', 'penis', 'pimp', 'pimps', 'piss', 'pissed',
  'pisses', 'poop', 'poops', 'porn', 'porno', 'porns', 'prick', 'pricks', 'pubic',
  'puke', 'pukes', 'pussy', 'rape', 'raped', 'raper', 'rapes', 'semen', 'sexed',
  'sexy', 'shag', 'shags', 'shit', 'shite', 'shites', 'shitfaced', 'shithead',
  'shitheads', 'shitload', 'shits', 'shitted', 'shittier', 'shittiest', 'shitting',
  'shitty', 'sissy', 'skank', 'skanks', 'slut', 'sluts', 'smut', 'smuts', 'snot',
  'snots', 'sperm', 'spic', 'spics', 'spunk', 'tits', 'titty', 'turd', 'turds',
  'twat', 'twats', 'vulva', 'wank', 'wanks', 'whore', 'whores', 'wog', 'wogs',
  'wop', 'wops', 'yid', 'yids',
];

export const blockedWords: ReadonlySet<string> = new Set(BLOCKED);
