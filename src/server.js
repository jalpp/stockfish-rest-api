

const express = require('express')
const app = express()
const port = 5000
const Stockfish = require("stockfish.wasm");


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/stockfish', (req, res) => {

 const fen =  req.query.fen;

 Stockfish().then((engine) => {

     engine.postMessage("uci");
     engine.postMessage("ucinewgame");
     engine.postMessage("position fen " + fen);
     engine.postMessage("go depth 20");
     engine.postMessage("eval")

     engine.addMessageListener((output) => {

                              if (res.headersSent ) {
                                  return;
                              }

                              
                                  if (typeof(output == "string") && output.match("bestmove")) {
                                      console.log(output);
                                      res.status(200).json({ engineOutput: output });
                                  }


                         })



 });


});

app.listen(port, (err) => {
  if (err) {
    return console.log('Error!', err)
  }

  console.log(`server is listening on ${port}`)
})