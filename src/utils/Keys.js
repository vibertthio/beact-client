let keys = '';
keys = new Array(26);
for (let i = 0; i < 26; i += 1) {
	keys[i] = String.fromCharCode(97 + i);
}
keys = keys.join(', ');

export default keys;
