// I'm using this pattern only for simple access
// to the initialized objects of app and db
// access to unitialized properties will throw an error
let db, app

export default {
  get db() {
    if (!db) throw new Error('"db" is not initialized yet')
    return db
  },
  set db(v) {
    db = v
  },
  get app() {
    if (!app) throw new Error('"app" is not initialized yet')
    return app
  },
  set app(v) {
    app = v
  }
}
