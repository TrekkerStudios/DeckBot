import JSON5 from 'json5';

export class ManyDeck {
    _hydrateCompact(json) {
        let packs = [];
        for (let pack of json.packs) {
            pack.white = pack.white.map((index) =>
                Object.assign(
                    {},
                    { text: json.white[index] },
                    { pack: packs.length },
                    pack.icon ? { icon: pack.icon } : {}
                )
            );
            pack.black = pack.black.map((index) =>
                Object.assign(
                    {},
                    json.black[index],
                    { pack: packs.length },
                    pack.icon ? { icon: pack.icon } : {}
                )
            );
            packs.push(pack);
        }
        return packs;
    }

    async _loadDeck(link) {
        if (typeof this.jsonSrc !== "undefined") {
            let json;
            if (link) {
                const raw = (await fetch(`api/decks/${this.jsonSrc}`)).data;
                const data = typeof raw === "string" ? JSON5.parse(raw) : raw;
                // Process calls into black cards
                const black = data.calls.map(call => {
                    const fragments = call[0]; // Get the inner array of fragments
                    let text = '';
                    let pick = 0;
                    fragments.forEach(fragment => {
                        if (typeof fragment === 'string') {
                            text += fragment;
                        } else {
                            text += '_'; // Replace {} with _
                            pick++;
                        }
                    });
                    return { text, pick, pack: 1 }; // Default pack to 1
                });
                // Process responses into white cards
                const white = data.responses.map(response => ({
                    text: response,
                    pack: 1, // Default pack to 1
                }));
                json = {
                    name: data.name,
                    black,
                    white,
                    official: false,
                };
            } else {
                const raw = this.jsonSrc;
                const data = typeof raw === "string" ? JSON5.parse(raw) : raw;
                // Similar processing for the else case
                const black = data.calls.map(call => {
                    const fragments = call[0];
                    let text = '';
                    let pick = 0;
                    fragments.forEach(fragment => {
                        if (typeof fragment === 'string') {
                            text += fragment;
                        } else {
                            text += '_';
                            pick++;
                        }
                    });
                    return { text, pick, pack: 1 };
                });
                const white = data.responses.map(response => ({
                    text: response,
                    pack: 1,
                }));
                json = {
                    name: data.name,
                    black,
                    white,
                    official: false,
                };
            }
            this.deck = json;
        } else {
            throw Error("No source specified...");
        }
    }

    static async fromJSON(jsonSrc, link) {
        let n = new ManyDeck();
        n.jsonSrc = jsonSrc;
        await n._loadDeck(link);
        return n;
    }

    // listPacks() {
    //     let packs = [];
    //     let id = 0;
    //     for (let { name, official, white, black } of this.deck) {
    //         let pack = {
    //             id,
    //             name,
    //             official,
    //             counts: {
    //                 white: white.length,
    //                 black: black.length,
    //                 total: white.length + black.length,
    //             },
    //         };
    //         packs.push(pack);
    //         id += 1;
    //     }
    //     return packs;
    // }

    getPack(index) {
        return this.deck[index];
    }

    getPacks(indexes) {
        if (typeof indexes == "undefined") {
            indexes = Object.keys(this.deck);
        }
        let white = [];
        let black = [];
        for (let pack of indexes) {
            if (typeof this.deck[pack] != "undefined") {
                white.push(...this.deck[pack].white);
                black.push(...this.deck[pack].black);
            }
        }
        return { white, black };
    }
}