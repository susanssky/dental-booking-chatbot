export function generateAlphanumeric(length = 6) {
  const chars = []

  for (let i = 0; i < length; i++) {
    let randomRange = Math.floor(Math.random() * 3)
    let code

    switch (randomRange) {
      case 0: // Numbers (48-57)
        code = Math.floor(Math.random() * 10) + 48
        break
      case 1: // Upper Letters (65-90)
        code = Math.floor(Math.random() * 26) + 65
        break
      case 2: // Lower Letters (97-122)
        code = Math.floor(Math.random() * 26) + 97
        break
    }

    chars.push(String.fromCharCode(code))
  }

  return chars.join('')
}

// example
// console.log(generateAlphanumeric());
