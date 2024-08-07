function generateDateArray(startDate, numberOfDays) {
  const dateArray = []
  let currentDate = new Date(startDate)

  for (let i = 0; i < numberOfDays; i++) {
    const dateString = currentDate.toISOString().split('T')[0]
    dateArray.push(dateString)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dateArray
}

const today = new Date()
const startDate = new Date(today)
startDate.setDate(today.getDate() + 7)

const numberOfDays = 7
export const dateArray = generateDateArray(startDate, numberOfDays)

// console.log('Generated Date Array:')
// console.log(dateArray)
// [ '2024-07-26', '2024-07-27', '2024-07-28', '2024-07-29', '2024-07-30', '2024-07-31', '2024-08-01' ]
