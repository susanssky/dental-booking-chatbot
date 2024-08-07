import {
  LexModelsV2Client,
  ListSlotTypesCommand,
  DescribeSlotTypeCommand,
} from '@aws-sdk/client-lex-models-v2'

// has to same text from lex v2 console intent
export const SLOTS = {
  ACTION: 'action',
  SERVICE: 'service',
  APPOINTMENT_TIME: 'appointmentTime',
  AMAZON_DATE: 'amazonDate',
  AMAZON_LAST_NAME: 'amazonLastName',
  AMAZON_ID: 'amazonId',
}

export const FULFILLMENT_STATES = {
  FULFILLED: 'Fulfilled',
  FAILED: 'FAILED',
}

//getSlotValues from Lex v2 console - slot type values
const client = new LexModelsV2Client({ region: 'eu-west-2' })

export async function outputSlotValues({ id, version, localeId }) {
  try {
    const slotTypeIds = await getAllSlotTypeIds({ id, version, localeId })
    const slotTypeValues = await getSlotValuesBySlotTypeIds({
      botId: id,
      botVersion: version,
      localeId,
      slotTypeIds,
    })

    console.log(`slotTypeValues:${JSON.stringify(slotTypeValues)}`)
    const actionOpts = slotTypeValues.find(
      (item) => item.slotTypeName === 'action'
    )?.slotTypeValues
    const serviceOpts = slotTypeValues.find(
      (item) => item.slotTypeName === 'service'
    )?.slotTypeValues
    const apptTimeOpts = slotTypeValues.find(
      (item) => item.slotTypeName === 'appointmentTime'
    )?.slotTypeValues

    return { actionOpts, serviceOpts, apptTimeOpts }
  } catch (error) {
    console.error(error)
  }
}

async function getAllSlotTypeIds({ id, version, localeId }) {
  const input = {
    botId: id,
    botVersion: version,
    localeId,
    sortBy: {
      attribute: 'SlotTypeName',
      order: 'Ascending',
    },
  }

  const command = new ListSlotTypesCommand(input)
  const response = await client.send(command)
  console.log(`>>>>getAllSlotTypeIds: ${JSON.stringify(response)}`)

  return response.slotTypeSummaries.map((element) => element.slotTypeId)
}

async function getSlotValuesBySlotTypeIds({
  botId,
  botVersion,
  localeId,
  slotTypeIds,
}) {
  const slotTypePromises = slotTypeIds.map((slotTypeId) => {
    const input = { botId, botVersion, localeId, slotTypeId }
    const command = new DescribeSlotTypeCommand(input)
    return client.send(command)
  })

  const responses = await Promise.all(slotTypePromises)

  const results = responses.map((response) => ({
    slotTypeName: response.slotTypeName,
    slotTypeValues: response.slotTypeValues.map(
      (slotTypeValue) => slotTypeValue.sampleValue.value
    ),
  }))

  console.log(`>>>>getSlotValuesBySlotTypeIds: ${JSON.stringify(results)}`)
  return results
}
