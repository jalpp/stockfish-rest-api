
// from https://github.com/nmrugg/stockfish.js example

var loadEngine = require("./load_engine.js");
var engine = loadEngine(require("path").join("node_modules", "stockfish/src/stockfish-nnue-16.js"));

engine.send("setoption name Use NNUE value false");
engine.send("uci");
engine.send("position r1b1k3/ppq4r/2n1ppp1/3p4/8/1PPQP1P1/P4PP1/RN2K2R w KQq - 0 15")
engine.send("go infinite", function onDone(data)
{
    console.log("DONE:", data);
    engine.quit();
}, function onStream(data)
{
    console.log("STREAMING:", data);
});
engine.send("eval")

setTimeout(function ()
{
    engine.send("stop");
}, 1000);