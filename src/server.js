const express = require('express')
const app = express()
const port = 5000
const Stockfish = require("stockfish.wasm");


app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

if (process.argv[2] == "debug") {

    Stockfish().then((engine) => {



        engine.addMessageListener((output) => {

            console.log(output);

        })

        engine.postMessage("uci");
        engine.postMessage("ucinewgame");
        engine.postMessage("position startpos");
        engine.postMessage("go depth 20");
        engine.postMessage("eval")



    });


}



app.get('/stockfish/bestmove', (req, res) => {

    const fen = req.query.fen;

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

        engine.postMessage("uci");
        engine.postMessage("ucinewgame");
        engine.postMessage("position fen " + fen);
        engine.postMessage("go depth 20");
        engine.postMessage("eval")



    });


});



app.get('/stockfish/eval', (req, res) => {

    const fen = req.query.fen;

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
        engine.postMessage("go depth 20");
        engine.postMessage("eval")



    });


});


app.get('/stockfish/depthinfo', (req, res) => {

    const fen = req.query.fen;
    const depth = req.query.depth;

    if (depth >= 21) {

        res.status(200).json({
            depthInfo: "Max depth reached!"
        });

    }


    let bestmove = '';

    Stockfish().then((engine) => {



        engine.addMessageListener((output) => {

            if (res.headersSent) {
                return;
            }


            if (typeof(output == "string") && output.match("bestmove")) {

                bestmove = output.split(' ')[3];
                console.log(bestmove)

                Stockfish().then((engine) => {


                    engine.addMessageListener((output) => {

                        if (res.headersSent) {
                            return;
                        }


                        if (output.match(bestmove) && output.match("info depth " + depth) && output.match("pv")) {


                            console.log(output)
                            res.status(200).json({
                                depthInfo: output
                            });

                        }


                    })


                    engine.postMessage("ucinewgame");
                    engine.postMessage("position fen " + fen);
                    engine.postMessage("go depth 20");




                });

            }


        })


        engine.postMessage("ucinewgame");
        engine.postMessage("position fen " + fen);
        engine.postMessage("go depth 20");




    });


});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${server.address().port}`);
});