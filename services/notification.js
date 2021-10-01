const fetch = require('node-fetch')

const DEFAULT_MESSAGE = '{{ statusIcon }} {{ etl }} {{ state }}'

const icon = `:white_check_mark:`

const checkStatus = response => response && response.ok
  ? Promise.resolve(response)
  : Promise.reject(response.statusText)

const send = (conf, { etl, state }) => {
  const { url, method = 'post', headers = {}, message = DEFAULT_MESSAGE } = conf
  const filledMessage = message
    .replace('{{ etl }}', etl)
    .replace('{{ state }}', state || '')
    .replace('{{ statusIcon }}', icon)
  const body = JSON.stringify({ text: filledMessage })
  return fetch(url, { method, headers, body })
    .then(checkStatus)
}

module.exports = { send }
