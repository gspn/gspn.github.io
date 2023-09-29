const
    filei = document.querySelector("#fi"),
    kbpb = document.querySelector("#kbpb"),
    bpp = document.querySelector("#bpp"),
    estimate = document.querySelector("#fragout");

const downloadFile = async (blob, filename) => Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename }).click();

let fragments = [];
async function storeFragments() {
    const file = filei.files[0];
    const frags = filefrag.makeFragments(file, blocksize * 1000);
    estimate.innerText = `**Fragmenter**\nblock creation completed (${frags.length} blocks)`;
    return fragments = frags;
}

let blocksize = 25000, pageblocks = 10, filename = "unknown.bin";
function updatesettings() {
    const file = filei.files[0];

    if (kbpb.value) blocksize = kbpb.value;
    if (bpp.value) pageblocks = bpp.value;
    filename = file.name

    if (!(file && blocksize && pageblocks)) return estimate.innerText = "**Params & Output**\nunable to make estamate";

    const
        blocks = file.size / (blocksize * 1000),
        pages = blocks / pageblocks;
    const infostr = `**Creation & Output**\nfile size: ${file.size}\n${Math.ceil(blocks)} blocks over ${Math.ceil(pages)} pages\n(${blocksize}kB per block, ${pageblocks} blocks per page)`;
    estimate.innerText = infostr;
};
filei.onchange = kbpb.onchange = bpp.onchange = () => updatesettings();
updatesettings();

async function downloadfromrecord() {
    const buf = await filei.files[0].arrayBuffer();
    const file = await filefrag.downloadRecord(buf);
    downloadFile(file, file.name);
}