const express = require('express')
const app = express()
const port = 5000
const Stockfish = require("stockfish.wasm");
var loadEngine = require("./load_engine.js");
var engi = loadEngine(require("path").join("node_modules", "stockfish/src/stockfish-nnue-16.js"));
const validateFEN = require('fen-validator');

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

if (process.argv[2] == "debug" && process.argv[3] == "wasm") {

    console.log("DEBUG_MODE: STOCKFISH WASM")
    Stockfish().then((engine) => {

        engine.addMessageListener((output) => {

            console.log(output);

        })

        engine.postMessage("uci");
        engine.postMessage("ucinewgame");
        engine.postMessage("position startpos");
        engine.postMessage("go depth 20 mate 1");
        engine.postMessage("eval")



    });


} else if (process.argv[2] == "debug" && process.argv[3] == "16") {

    console.log("DEBUG_MODE: STOCKFISH 16")
    engi.send("setoption name Use NNUE value false");
    engi.send("uci");
    engi.send("position startpos")
    engi.send("go infinite", function onDone(data) {
        engi.send("eval");
        console.log("DONE:", data);
        engi.quit();
    }, function onStream(data) {
        console.log("STREAMING:", data);
    });

     engi.send("eval", function onDone(data) {
            engi.send("eval");
            console.log("DONE:", data);
            engi.quit();
        }, function onStream(data) {
            console.log("STREAMING:", data);
        });

    setTimeout(function() {
        engi.send("stop");
    }, 1000);

}else{

console.log("Running Stockfish Rest API Server")

}


app.get('/stockfish/bestmove', (req, res) => {

    const fen = req.query.fen;
    const mode = req.query.mode;

    if(!validateFEN(fen)){

    res.status(500).json({error: "invalid FEN! please provide valid FEN"});

    }


    if (mode == "wasm") {

        try{
        Stockfish().then((engine) => {



            engine.addMessageListener((output) => {

                if (res.headersSent) {
                    return;
                }
                if (typeof(output == "string") && output.match("bestmove")) {
                    console.log(output);

                    res.status(200).json({
                        engineOutput: output
                    });
                }


            })


        });
      }catch(err){
       res.status(500).json({error: "API server not working!"})
      }

    } else if (mode == "16") {

        engi.send("setoption name Use NNUE value false");
        engi.send("uci");
        engi.send("position startpos")
        engi.send("go infinite", function onDone(data) {

            console.log("DONE:", data);

            if (typeof(data == "string") && data.match("bestmove")) {

                res.status(200).json({
                    engineOutput: data
                });

            }

            engi.quit();


        }, function onStream(data) {
            console.log("STREAMING:", data);
        });



        setTimeout(function() {
            engi.send("stop");
        }, 1000);


    }else{

      res.status(500).json({
                         error: "Please provide valid engine mode [wasm or 16]"
                     });

    }


});



app.get('/stockfish/eval', (req, res) => {

    const fen = req.query.fen;
    const mode = req.query.mode;

     if(!validateFEN(fen)){

        res.status(500).json({error: "invalid FEN! please provide valid FEN"});

        }


    if(mode == "wasm"){

      Stockfish().then((engine) => {

        engine.addMessageListener((output) => {

            if (res.headersSent) {
                return;
            }
            if (typeof(output == "string") && output.match("Final")) {
                console.log(output);

                res.status(200).json({
                    engineOutput: output
                });
            }


        })

        engine.postMessage("uci");
        engine.postMessage("ucinewgame");
        engine.postMessage("position fen " + fen);
        engine.postMessage("go depth 20" + depth);
        engine.postMessage("eval")



    });

    }else if(mode == "16"){


        engi.send("setoption name Use NNUE value false");
        engi.send("uci");
        engi.send("position fen " + fen)
        engi.send("go depth 16 ", function onDone(data) {
            console.log("DONE:", data);
            engi.quit();
        }, function onStream(data) {
            console.log("STREAMING:", data);
        });

         engi.send("eval", function onDone(data) {
                console.log("DONE:", data);
                engi.quit();
            }, function onStream(data) {
                console.log("STREAMING:", data);

                if(data.match("Final evaluation")){
                  res.status(200).json({
                                     engineOutput: data
                                 });
                }

            });

        setTimeout(function() {
            engi.send("stop");
        }, 1000);


    }else{

           res.status(500).json({
                              error: "Please provide valid engine mode [wasm or 16]"
                          });

         }



});




app.get('/stockfish/toplines', (req, res) => {

    const fen = req.query.fen;
    const depth = req.query.depth;
    const mode = req.query.mode

     if(!validateFEN(fen)){

        res.status(500).json({error: "invalid FEN! please provide valid FEN"});

        }


    if(mode == "16"){

             if(!(depth >= 1 && depth <= 16)){

             res.status(500).json({error: "invalid depth! depth for mode 16 is [1 to 16]"})

             }

              if (res.headersSent) {
                                              return;
                                          }


             engi.send("setoption name Use NNUE value false");
             engi.send("uci");
             engi.send("position fen " + fen)
             engi.send("go depth " + depth, function onDone(data) {
                 console.log("DONE:", data);
                 engi.quit();
             }, function onStream(data) {
                 console.log("STREAMING:", data);

                 if(data.match("info depth " + depth) && data.match("pv")){

                     const dataparse = data.toString().split(" ");
                     console.log(dataparse.length)

                     let depth = dataparse[dataparse.indexOf("depth") + 1];
                     let seldepth = dataparse[dataparse.indexOf("seldepth") + 1];
                     let multipv = dataparse[dataparse.indexOf("multipv") + 1];
                     let score = dataparse[dataparse.indexOf("score") + 1];
                     let nodes = dataparse[dataparse.indexOf("nodes") + 1];
                     let nps = dataparse[dataparse.indexOf("nps") + 1];
                     let hashfull = dataparse[dataparse.indexOf("hashfull") + 1];
                     let time = dataparse[dataparse.indexOf("time") + 1];
                     let moves = [];

                     for(var i = dataparse.indexOf("pv") + 1; i < dataparse.length - 1; i++){
                         moves.push(dataparse[i]);

                     }

                     let jsonArray = {
                             "Depth": depth,
                             "Seldepth": seldepth,
                             "Multipv": multipv,
                             "Score": score,
                             "Nodes": nodes,
                             "NPS": nps,
                             "Hashfull": hashfull,
                             "Time": time,
                             "PV": moves
                         };

                     res.status(200).json(jsonArray);
                 }
             });

    }else if(mode == "wasm"){

    if(!(depth >= 1 && depth <= 20)){

                 res.status(500).json({error: "invalid depth! depth for mode wasm is [1 to 20]"})

                 }

                     Stockfish().then((engine) => {


                         engine.addMessageListener((output) => {

                             if (res.headersSent) {
                                 return;
                             }


                             if (output.match("info depth " + depth) && output.match("pv")) {


                                const dataparse = output.toString().split(" ");
                                                  console.log(dataparse.length)

                                                  let depth = dataparse[dataparse.indexOf("depth") + 1];
                                                  let seldepth = dataparse[dataparse.indexOf("seldepth") + 1];
                                                  let multipv = dataparse[dataparse.indexOf("multipv") + 1];
                                                  let score = dataparse[dataparse.indexOf("score") + 1];
                                                  let nodes = dataparse[dataparse.indexOf("nodes") + 1];
                                                  let nps = dataparse[dataparse.indexOf("nps") + 1];
                                                  let hashfull = dataparse[dataparse.indexOf("hashfull") + 1];
                                                  let time = dataparse[dataparse.indexOf("time") + 1];
                                                  let moves = [];

                                                  for(var i = dataparse.indexOf("pv") + 1; i < dataparse.length - 1; i++){
                                                      moves.push(dataparse[i]);

                                                  }

                                                  let jsonArray = {
                                                          "Depth": depth,
                                                          "Seldepth": seldepth,
                                                          "Multipv": multipv,
                                                          "Score": score,
                                                          "Nodes": nodes,
                                                          "NPS": nps,
                                                          "Hashfull": hashfull,
                                                          "Time": time,
                                                          "PV": moves
                                                      };

                                                  res.status(200).json(jsonArray);

                             }


                         })


                         engine.postMessage("ucinewgame");
                         engine.postMessage("position fen " + fen);
                         engine.postMessage("go depth 20");




                     });

    }else{

           res.status(500).json({
                              error: "Please provide valid engine mode [wasm or 16]"
                          });

         }






});






const server = app.listen(port, () => {
    console.log(`Server is running on port ${server.address().port}`);
});