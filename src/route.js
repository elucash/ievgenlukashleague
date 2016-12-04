
export default function(app) {
  app.get('/', (req, res) => {
    res.send('Hello World')
  })
}
