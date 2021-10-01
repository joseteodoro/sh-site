const express = require('express');
const runner = require('../services/runner')
const router = express.Router();

router.get('/jobs', (_, res) => {
  return runner.jobs()
    .then(found => res.render("jobs/list", { found }))
})

router.get('/jobs/history', (_, res) => {
  return runner.history()
    .then(done => res.render("jobs/history", { done, parser: runner.extractDate }))
})

router.post('/jobs/run', (req, res) => {
  const { body: { cmd } } = req
  return runner.run(cmd)
    .then(() => res.redirect('/jobs/history'))
})

router.post('/jobs/history/purge', (_, res) => {
  return runner.purge()
    .then(() => res.redirect('/jobs'))
})

module.exports = router