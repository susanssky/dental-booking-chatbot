import {
  listPickerUI,
  plainTextUI,
  confirmBooking,
  checkBooking,
  cancelBooking,
  endChatAction,
} from './util/user-input-handler.mjs'
import {
  FULFILLMENT_STATES,
  SLOTS,
  outputSlotValues,
} from './constants/interactive_options.mjs'
import { dateArray } from './util/bookingDateSlot.mjs'
import { formElicitIntentResponse } from './util/response-handler.mjs'
let actionOpts, serviceOpts, apptTimeOpts

export const handler = async (event) => {
  ;({ actionOpts, serviceOpts, apptTimeOpts } = await outputSlotValues(
    event.bot
  ))
  console.log(`Request received: ${JSON.stringify(event)}`)
  let response = await handleRequest(event)
  console.log(`Returning response: ${JSON.stringify(response)}`)
  return response
}
function handleRequest(request) {
  // the message that the user has typed
  let input = request.inputTranscript

  let recent_intent = request.sessionState.intent
  //   {
  //     "name": "ActionIntent",
  //     "slots": {
  //         "appointmentTime": null,
  //         "amazonId": null,
  //         "service": null,
  //         "action": null,
  //         "amazonDate": null,
  //         "amazonLastName": null
  //     },
  //     "state": "InProgress",
  //     "confirmationState": "None"
  // }

  //^same result to  request.currentIntent
  request.currentIntent = request.interpretations[0].intent

  console.log(`input:${input}`)
  console.log(`recent_intent:${JSON.stringify(recent_intent)}`)
  console.log(`request.currentIntent:${JSON.stringify(request.currentIntent)}`)

  const {
    action,
    service,
    amazonDate,
    appointmentTime,
    amazonId,
    amazonLastName,
  } = recent_intent?.slots

  const actionSlot = action?.value?.originalValue
  const serviceSlot = service?.value?.originalValue
  const amazonIdSlot = amazonId?.value?.originalValue
  const amazonDateSlot = amazonDate?.value?.originalValue
  const appointmentTimeSlot = appointmentTime?.value?.originalValue
  const amazonLastNameSlot = amazonLastName?.value?.originalValue

  console.log(`recent_intent?.slots:${JSON.stringify(recent_intent?.slots)}`)

  /*======= end chat =======*/
  if (input.toLowerCase() === 'end chat') {
    return endChatAction(
      request.sessionAttributes,
      FULFILLMENT_STATES.FULFILLED,
      request.currentIntent.name,
      `Received '${input}'`
    )
  }
  /*======= initial message =======*/
  const notGetAnySlotValue =
    !actionSlot &&
    !serviceSlot &&
    !amazonIdSlot &&
    !amazonDateSlot &&
    !appointmentTimeSlot &&
    !amazonLastNameSlot
  console.log(`notGetAnySlotValue:${notGetAnySlotValue}`)

  if (input.toLowerCase() !== 'hi' && notGetAnySlotValue) {
    console.log(`>>>entry  if (input !== 'hi' && notGetAnySlotValue) `)
    const messageText = `Please send 'hi' to start again`
    return formElicitIntentResponse(request.sessionAttributes, messageText)
  }

  if (input.toLowerCase() === 'hi' || !actionOpts.includes(actionSlot)) {
    const title = 'How can I help you?'
    const option = actionOpts
    const slot = SLOTS.ACTION
    return listPickerUI(request, title, option, slot)
  }

  /*======= Check the appointment =======*/
  if (input === 'Check the appointment') {
    const messageText = 'Please input the booking id for checking.'
    const slot = SLOTS.AMAZON_ID
    return plainTextUI(request, messageText, slot)
  }
  if (amazonIdSlot && actionSlot === 'Check the appointment') {
    return checkBooking(amazonIdSlot, request)
  }

  /*======= Cancel the appointment =======*/
  if (input === 'Cancel the appointment') {
    const messageText = 'Please input the booking id for cancalling.'
    const slot = SLOTS.AMAZON_ID
    return plainTextUI(request, messageText, slot)
  }
  if (amazonIdSlot && actionSlot === 'Cancel the appointment') {
    return cancelBooking(amazonIdSlot, request)
  }

  /*======= Book a appointment =======*/
  if (input === 'Book a appointment' || !serviceOpts.includes(serviceSlot)) {
    const title = 'What service would you like to book?'
    const option = serviceOpts
    const slot = SLOTS.SERVICE
    return listPickerUI(request, title, option, slot)
  }
  if (!amazonDateSlot && serviceSlot && actionSlot === 'Book a appointment') {
    const title = 'What date would you like to book?'
    const option = dateArray
    const slot = SLOTS.AMAZON_DATE
    return listPickerUI(request, title, option, slot)
  }
  if (
    (!appointmentTimeSlot &&
      amazonDateSlot &&
      serviceSlot &&
      actionSlot === 'Book a appointment') ||
    !apptTimeOpts.includes(appointmentTimeSlot)
  ) {
    const title = 'What time would you like to book?'
    const option = apptTimeOpts
    const slot = SLOTS.APPOINTMENT_TIME
    return listPickerUI(request, title, option, slot)
  }
  if (
    !amazonLastNameSlot &&
    appointmentTimeSlot &&
    amazonDateSlot &&
    serviceSlot &&
    actionSlot === 'Book a appointment'
  ) {
    const messageText = 'What is your last name?'
    const slot = SLOTS.AMAZON_LAST_NAME
    return plainTextUI(request, messageText, slot)
  }
  if (
    amazonLastNameSlot &&
    appointmentTimeSlot &&
    amazonDateSlot &&
    serviceSlot &&
    actionSlot === 'Book a appointment'
  ) {
    console.log(`>>entry confirmBooking function<<`)
    return confirmBooking(request)
  } else {
    console.log(`this is end`)
  }
}
