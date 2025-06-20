
const parser = new DOMParser();

const html = (str) => parser.parseFromString(str, "text/html").body.children[0];

export { html };