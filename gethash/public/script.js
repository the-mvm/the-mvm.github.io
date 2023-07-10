const textInput = document.querySelector("#input");
const displayArea = document.querySelector("#view");

function get_bits(num, start, end, length = 64) {
    const mask = 2 ** (end - start) - 1;
    const shift = length - (end - start) - start;

    return (num & (mask << shift)) >> shift;
}

function decode_uu_charset(cipher_text) {
    let plain_text = "";

    const three_characters = [];
    for (let i = 1; i < cipher_text.length; i += 4) {
        const character_group = cipher_text.slice(i, i + 4);
        const four_six_bits = [];
        for (let j = 0; j < character_group.length; j++) {
            const c = character_group[j];
            const binary = ((c.charCodeAt(0) - 32) % 64).toString(2).padStart(6, '0');
            four_six_bits.push(binary);
        }
        three_characters.push(
            String.fromCharCode(
                parseInt(get_bits(parseInt(four_six_bits[0], 2), 0, 6, 6).toString(2).padStart(6, '0') +
                    get_bits(parseInt(four_six_bits[1], 2), 0, 2, 6).toString(2).padStart(2, '0'), 2)
            )
        );
        three_characters.push(
            String.fromCharCode(
                parseInt(get_bits(parseInt(four_six_bits[1], 2), 2, 6, 6).toString(2).padStart(4, '0') +
                    get_bits(parseInt(four_six_bits[2], 2), 0, 4, 6).toString(2).padStart(4, '0'), 2)
            )
        );
        three_characters.push(
            String.fromCharCode(
                parseInt(get_bits(parseInt(four_six_bits[2], 2), 4, 6, 6).toString(2).padStart(2, '0') +
                    get_bits(parseInt(four_six_bits[3], 2), 0, 6, 6).toString(2).padStart(6, '0'), 2)
            )
        );
    }

    for (let i = 0; i < three_characters.length; i++) {
        const c = three_characters[i];
        if (c.charCodeAt(0) !== 0) {
            plain_text += c;
        }
    }
    return plain_text;
}

function extractNumbersFromString(str) {
    const numberRegex = /\d+/g;
    const numbers = str.match(numberRegex);
    return numbers ? numbers.map(Number) : [];
}

textInput.addEventListener('input', (event) => {
    const inputText = textInput.value;
    const lines = inputText.split('\n');
    let decodedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const splitted = line.split('|');
        const extractedValue = splitted[1];
        const decodeBase64 = atob(extractedValue);
        const decode_uu_one = decode_uu_charset(decodeBase64);
        const decode_uu_two = decode_uu_charset(decode_uu_one);
        const result = extractNumbersFromString(decode_uu_two);

        if (i === 0) {
            const decodedLine = line.replace(extractedValue, result.join(''));
            decodedLines.push(decodedLine);
        } else {
            const decodedLine = line.replace(extractedValue, result.join(''));
            decodedLines.push(decodedLine);
        }
    }

    const finalString = decodedLines.join('\n');
    displayArea.textContent = finalString;
    console.log(finalString);
});

clipboard = new ClipboardJS('#copyjs', {
    target: function () {
        return view;
    },
})