function filefragManualProcess() {
    if (!confirm("Manual record creation")) return;
    if (confirm("1. Downloading all blocks. Allow multiple file download if prompted (cancel to skip step)")) {
        for (const [i, block] of fragments.entries()) {
            downloadFile(block, `${filename}-frag${i.toString().padStart(fragments.length.toString().length, "0")}.bin`);
        }
    }
    if(!confirm("continue")) return;
    alert("2. Upload blocks and save their links");
    const uris = prompt("3. Insert URLs in order seperated by semicolons").split(";");
    const name = prompt("4. Set filename");
    const frag = filefrag.makeRecord(name, uris);
    downloadFile(frag, frag.name);
}