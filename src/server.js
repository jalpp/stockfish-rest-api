const express = require('express')
const app = express()
const port = 5000
const Stockfish = require("stockfish.wasm");
var loadEngine = require("./load_engine.js");
var engi = loadEngine("./src/stockfish-nnue-16.js");
const validateFEN = require('fen-validator');

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

if (process.argv[2] == "help" || process.argv[2] == "--help") {

    console.log("STOCKFISH SERVER COMMANDS \n * node server debug wasm \n runs wasm on server debug mode \n " +
        "* node server debug cc-nonnue \n runs Chesscom's Stockfish NO NNUE version on debug mode server \n * node server debug cc-yesnnue \n runs Chesscom's Stockfish NNUE enabled debug mode server \n * node server \n starts the Stockfish server on port 3000")

}


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


} else if (process.argv[2] == "debug" && process.argv[3] == "cc-nonnue") {

    console.log("DEBUG_MODE: CHESS COM STOCKFISH NO NNUE VERSION")
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

} else if (process.argv[2] == "debug" && process.argv[3] == "cc-yesnnue") {

    console.log('DEBUG_MODE: CHESS COM STOCKFISH YES NNUE VERSION')
    engi.send("setoption name Use NNUE value true");
    engi.send("uci");
    engi.send("position startpos")
    engi.send("go depth 22", function onDone(data) {
        engi.send("eval");
        console.log("DONE:", data);
        engi.quit();
    }, function onStream(data) {
        console.log("STREAMING:", data);
    });

} else {

    console.log("Running Stockfish Rest API Server")

}


app.get('/stockfish/bestmove', (req, res) => {

    const fen = req.query.fen;
    const mode = req.query.mode;

    if (!validateFEN(fen)) {

        res.status(500).json({
            error: "invalid FEN! please provide valid FEN"
        });

    }


    if (mode == "wasm") {

        try {
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
        } catch (err) {
            res.status(500).json({
                error: "API server not working!"
            })
        }

    } else if (mode == "cc-nonnue") {

        engi.send("setoption name Use NNUE value false");
        engi.send("uci");
        engi.send("position fen " + fen)
        engi.send("go depth 16", function onDone(data) {

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


    } else if (mode == 'cc-yesnnue') {


        engi.send("setoption name Use NNUE value true");
        engi.send("uci");
        engi.send("position fen " + fen)
        engi.send("go depth 22", function onDone(data) {

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


    } else {


        res.status(500).json({
            error: "Please provide valid engine mode [wasm or cc-nonnue or cc-yesnnue]"
        });

    }




});



app.get('/stockfish/eval', (req, res) => {

    const fen = req.query.fen;
    const mode = req.query.mode;

    if (!validateFEN(fen)) {

        res.status(500).json({
            error: "invalid FEN! please provide valid FEN"
        });

    }


    if (mode == "wasm") {

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

    } else if (mode == "cc-nonnue") {


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

            if (data.match("Final evaluation")) {
                res.status(200).json({
                    engineOutput: data
                });
            }

        });

        setTimeout(function() {
            engi.send("stop");
        }, 1000);


    } else if (mode == "cc-yesnnue") {

        engi.send("setoption name Use NNUE value true");
        engi.send("uci");
        engi.send("position fen " + fen)
        engi.send("go depth 22 ", function onDone(data) {
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

            if (data.match("Final evaluation")) {
                res.status(200).json({
                    engineOutput: data
                });
            }

        });

    } else {


        res.status(500).json({
            error: "Please provide valid engine mode [wasm or cc-nonnue or cc-yesnnue]"
        });

    }




});




app.get('/stockfish/toplines', (req, res) => {

    const fen = req.query.fen;
    const depth = req.query.depth;
    const mode = req.query.mode;

    if (!validateFEN(fen)) {

        res.status(500).json({
            error: "invalid FEN! please provide valid FEN"
        });

    }


    if (mode == "cc-nonnue") {

        if (!(depth >= 1 && depth <= 16)) {

            res.status(500).json({
                error: "invalid depth! depth for mode disabled NNUE is [1 to 16]"
            })

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

            if (data.match("info depth " + depth) && data.match("pv")) {

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

                for (var i = dataparse.indexOf("pv") + 1; i < dataparse.length - 1; i++) {
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

    } else if (mode == "cc-yesnnue") {

        // buggy code to look at


        if (!(depth >= 1 && depth <= 22)) {

            res.status(500).json({
                error: "invalid depth! depth for enabled NNUE is [1 to 22]"
            })

        }

        if (res.headersSent) {
            return;
        }


        engi.send("setoption name Use NNUE value true");
        engi.send("uci");
        engi.send("position fen " + fen)
        engi.send("go depth " + depth, function onDone(data) {
            console.log("DONE:", data);
            engi.quit();
        }, function onStream(data) {
            console.log("STREAMING:", data);

            if (data.match("info depth " + depth) && data.match("pv")) {

                const dataparse = data.toString().split(" ");
                let depth = dataparse[dataparse.indexOf("depth") + 1];
                let seldepth = dataparse[dataparse.indexOf("seldepth") + 1];
                let multipv = dataparse[dataparse.indexOf("multipv") + 1];
                let score = dataparse[dataparse.indexOf("score") + 1];
                let nodes = dataparse[dataparse.indexOf("nodes") + 1];
                let nps = dataparse[dataparse.indexOf("nps") + 1];
                let hashfull = dataparse[dataparse.indexOf("hashfull") + 1];
                let time = dataparse[dataparse.indexOf("time") + 1];
                let moves = [];

                for (var i = dataparse.indexOf("pv") + 1; i < dataparse.length - 1; i++) {
                    moves.push(dataparse[i]);

                }

                //                     info depth 22 seldepth 34 multipv 1 score cp 42 nodes 1356583 nps 203936 hashfull 517 time 6652 pv e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f6e4 d2d4 b7b5 a4b3 d7d5 d4e5 c8e6 b1d2 e4c5 c2c3 d5d4 c3d4 c6d4 f3d4 d8d4 d1f3


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

    } else if (mode == "wasm") {


        if (!(depth >= 1 && depth <= 20)) {

            res.status(500).json({
                error: "invalid depth! depth for mode wasm is [1 to 20]"
            })

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

                    for (var i = dataparse.indexOf("pv") + 1; i < dataparse.length - 1; i++) {
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

    } else {

        res.status(500).json({
            error: "Please provide valid engine mode [wasm or cc-nonnue or cc-yesnnue]"
        });

    }




});




const server = app.listen(port, () => {
    console.log(`Server is running on port ${server.address().port}`);
});


