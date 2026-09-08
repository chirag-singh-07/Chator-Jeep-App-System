const s = "'{\"type\":\"abc\"}";
console.log("Original:", s);
console.log("Replaced:", s.replace(/^['"]|['"]$/g, ''));
