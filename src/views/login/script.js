const modulo = 27;
const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T",
            "U", "V", "W", "X", "Y", "Z"];

function removeAccents(text) {
    const replacements = {'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'};
    return text.replace(/[ÁÉÍÓÚ]/g, char => replacements[char] || char);
}

function cleanText(text) {
    return text.replace(/[^a-zA-ZñÑ\s]/g, '').replace(/\s+/g, ' ');
}

function affineEncryption(mensaje, a, b) {
    let text = mensaje.toUpperCase().replace(/\n/g, "");
    text = cleanText(removeAccents(text));
    let mensajeCifrado = [];

    for (let i = 0; i < text.length; i++) {
        const valor_original = text[i];
        if (valor_original.match(/[a-zA-ZñÑ]/)) {
            const indice_valor_original = alphabet.indexOf(valor_original);
            const valor_cifrado = (a * indice_valor_original + b) % modulo;
            mensajeCifrado.push(alphabet[valor_cifrado]);
        } else {
            mensajeCifrado.push(valor_original);
        }
    }

    return mensajeCifrado.join("");
}

function encryptAndPlot() {
    const mensaje = document.getElementById('mensaje').value;
    const a = parseInt(document.getElementById('a').value);
    const b = parseInt(document.getElementById('b').value);

    if (!isNaN(a) && !isNaN(b)) {
        const encryptedMessage = affineEncryption(mensaje, a, b);
        document.getElementById('resultado_cifrado').innerHTML = "Mensaje cifrado: " + encryptedMessage;

        // Count frequency of letters
        const frequencyMap = {};
        for (let i = 0; i < encryptedMessage.length; i++) {
            const letter = encryptedMessage[i];
            if (letter.match(/[A-ZÑ]/)) {
                if (frequencyMap[letter]) {
                    frequencyMap[letter]++;
                } else {
                    frequencyMap[letter] = 1;
                }
            }
        }

        // Sort by frequency
        const sortedFrequency = Object.entries(frequencyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Prepare data for chart
        const labels = sortedFrequency.map(entry => entry[0]);
        const data = sortedFrequency.map(entry => entry[1]);

        // Display chart using Chart.js
        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frecuencia de letras',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        document.getElementById('resultado_cifrado').innerHTML = "Por favor, introduce valores numéricos para a y b.";
    }
}
