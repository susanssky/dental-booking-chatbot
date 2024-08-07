import {
  WithTemplateResponse,
  withPlainTextResponse,
  formTerminalResponse,
  formElicitIntentResponse,
} from './response-handler.mjs'

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'
import { generateAlphanumeric as bookingId } from './bookingId.mjs'

const client = new DynamoDBClient({ region: 'eu-west-2' })
const tableName = process.env.DYNAMODB_TABLE_NAME

function listPickerUI(request, title, option, slot, botInfo) {
  console.log(`>>entry listPickerUI with ${slot}`)
  console.log(`request:${JSON.stringify(request)}`)
  let template = createSimpleListPickerFromOptions(title, option)
  return WithTemplateResponse(
    request,
    slot,
    template,
    request.sessionAttributes
  )
}

function createSimpleListPickerFromOptions(title, options) {
  let elements = options.map((option) => {
    return { title: option }
  })

  return {
    templateType: 'ListPicker',
    version: '1.0',
    data: {
      content: {
        title: title,
        subtitle: 'Tap to select option',
        elements: elements,
      },
    },
  }
}

function plainTextUI(request, messageText, slot) {
  console.log(`>>entry plainTextUI with ${slot}`)
  return withPlainTextResponse(request, slot, messageText)
}

async function confirmBooking(request) {
  console.log(`>>entry confirmBooking`)

  const idNumber = bookingId()
  const serviceName =
    request?.currentIntent?.slots?.service?.value?.originalValue
  const date =
    request?.currentIntent?.slots?.appointmentDate?.value?.originalValue ||
    request?.currentIntent?.slots?.amazonDate?.value?.originalValue
  const time =
    request?.currentIntent?.slots?.appointmentTime?.value?.originalValue
  const lastName =
    request?.currentIntent?.slots?.appointmentLastName?.value?.originalValue ||
    request?.currentIntent?.slots?.amazonLastName?.value?.originalValue
  const messageText = `Your booking request with ID ${idNumber} has been completed successfully. Your ${serviceName} is booked for ${date} ${time}. Please remember to keep this ID to confirm your appointment.`

  let params = {
    TableName: tableName,
    Item: {
      id: {
        S: idNumber,
      },
      serviceName: {
        S: serviceName,
      },
      date: {
        S: date,
      },
      time: {
        S: time,
      },
      lastName: {
        S: lastName,
      },
      message: {
        S: messageText,
      },
      createTimestamp: {
        S: new Date().toLocaleString('en-GB'),
      },
    },
  }

  const command = new PutItemCommand(params)
  const responseDynamo = await client.send(command)
  console.log(responseDynamo)
  // return formTerminalResponse(
  //   request.sessionAttributes,
  //   FULFILLMENT_STATES.FULFILLED,
  //   request.currentIntent.name,
  //   messageText
  // )

  return formElicitIntentResponse(
    request.sessionAttributes,
    messageText + `\n\nPlease send 'hi' to start again`
  )
}

async function checkBooking(inputId, request) {
  console.log(`>>entry checkBooking`)
  const command = new GetItemCommand({
    TableName: tableName,
    Key: {
      id: { S: inputId },
    },
  })

  const response = await client.send(command)
  console.log(response)

  const messageText = response['Item']['message']['S']
  console.log(`messageText:${JSON.stringify(messageText)}`)
  return formElicitIntentResponse(
    request.sessionAttributes,
    messageText + `\n\nPlease send 'hi' to start again`
  )
}

async function cancelBooking(inputId, request) {
  console.log(`>>entry cancelBooking`)
  const command = new DeleteItemCommand({
    TableName: tableName,
    Key: {
      id: { S: inputId },
    },
  })

  try {
    const response = await client.send(command)
    if (response.$metadata.httpStatusCode === 200) {
      console.log(JSON.stringify(response))
      const messageText = `Your appointment have been cancelled`
      return formElicitIntentResponse(
        request.sessionAttributes,
        messageText + `\n\nPlease send 'hi' to start again`
      )
    }
  } catch (err) {
    console.log(err)
  }
}

function endChatAction(
  sessionAttributes,
  fulfillmentState,
  intent,
  messageText
) {
  console.log(`sessionAttributes:${sessionAttributes}`)
  console.log(`fulfillmentState:${fulfillmentState}`)
  console.log(`intent:${intent}`)
  console.log(`messageText:${messageText}`)
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

export {
  listPickerUI,
  plainTextUI,
  confirmBooking,
  checkBooking,
  cancelBooking,
  endChatAction,
}
