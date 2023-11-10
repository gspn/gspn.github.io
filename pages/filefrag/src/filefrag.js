const filefrag = {
    makeFragments(blob, blocksize = 8 * 10 ** 6) {
        const frags = [];
        const blocks = Math.ceil(blob.size / blocksize)
        for (let i = 0; i < blocks; i++) {
            const pos = blocksize * i;
            frags.push(blob.slice(pos, pos + blocksize));
        };
        return frags;
    },
    joinFragments(fragments) {
        return new Blob(fragments);
    },
    makeRecord(filename, uris) {
        const bin = CBOR.encode([filename, ...uris]);
        return new File([bin], filename + ".filefrag.bin");
    },
    async downloadRecord(buffer) {
        const record = CBOR.decode(buffer);
        const name = record[0];
        const blockuris = record.slice(1);
        const frags = [];

        for (const uri of blockuris) {
            console.log("fetching fragment");
            const block = await fetch(uri).then(res => res.blob());
            frags.push(block);
        };
        return new File([this.joinFragments(frags)], name);
    }
};