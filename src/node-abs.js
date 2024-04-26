
// from https://github.com/nmrugg/stockfish.js example

var loadEngine = require("./load_engine.js");
var engine = loadEngine(require("path").join("node_modules", "stockfish/src/stockfish-nnue-16.js"));

engine.send("setoption name Use NNUE value false");
engine.send("uci");
engine.send("position fen r1q2rk1/2p1bpp1/3p1n1p/8/1P2b3/1B2B2P/1P1N1PP1/R2Q1RK1 w - - 0 17")
engine.send("go infinite", function onDone(data)
{
    engine.send("eval");
    console.log("DONE:", data);
    engine.quit();
}, function onStream(data)
{
    console.log("STREAMING:", data);
});

setTimeout(function ()
{
    engine.send("stop");
}, 1000);