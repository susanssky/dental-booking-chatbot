const logFunctionEntry = (
  functionName,
  { intentName, slots, slotToElicit, template, messageText, sessionAttributes }
) => {
  console.log(`>>entry ${functionName}<<`)
  console.log(`intentName: ${intentName}`)
  console.log(`slots: ${JSON.stringify(slots)}`)
  console.log(`slotToElicit: ${slotToElicit}`)
  if (template) console.log(`template: ${JSON.stringify(template)}`)
  if (messageText) console.log(`messageText: ${messageText}`)
  console.log(`sessionAttributes: ${JSON.stringify(sessionAttributes)}`)
}

const formElicitSlotResponse = (request, slotToElicit, message) => {
  const {
    sessionAttributes,
    currentIntent: { name: intentName, slots },
  } = request

  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: 'ElicitSlot',
        slotToElicit,
      },
      intent: {
        name: intentName,
        slots,
      },
    },
    messages: [message],
  }
}

export async function WithTemplateResponse(request, slotToElicit, template) {
  const { currentIntent: { name: intentName, slots } = {}, sessionAttributes } =
    request

  logFunctionEntry('WithTemplateResponse', {
    intentName,
    slots,
    slotToElicit,
    template,
    sessionAttributes,
  })

  try {
    return formElicitSlotResponse(request, slotToElicit, {
      contentType: 'CustomPayload',
      content: JSON.stringify(template),
    })
  } catch (error) {
    console.error('Error in WithTemplateResponse:', error)
    throw error
  }
}

export function withPlainTextResponse(request, slotToElicit, messageText) {
  const { currentIntent: { name: intentName, slots } = {}, sessionAttributes } =
    request

  logFunctionEntry('withPlainTextResponse', {
    intentName,
    slots,
    slotToElicit,
    messageText,
    sessionAttributes,
  })

  try {
    return formElicitSlotResponse(request, slotToElicit, {
      contentType: 'PlainText',
      content: messageText,
    })
  } catch (error) {
    console.error('Error in withPlainTextResponse:', error)
    throw error
  }
}
export function formElicitIntentResponse(sessionAttributes, messageText) {
  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: 'ElicitIntent',
      },
    },
    messages: [
      {
        contentType: 'PlainText',
        content: messageText,
      },
    ],
  }
}
export function formTerminalResponse(
  sessionAttributes,
  fulfillmentState,
  intent,
  messageText
) {
  return {
    sessionState: {
      sessionAttributes,
      dialogAction: {
        type: 'Close',
      },
      intent: {
        confirmationState: 'Confirmed',
        name: intent,
        state: fulfillmentState,
      },
    },
    messages: [
      {
        contentType: 'PlainText',
        content: messageText,
      },
    ],
  }
}
