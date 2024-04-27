Work in progress Stockfish REST API

making this for my own chess discord bots and other chess software that need
stockfish best moves within 3 seconds. (I'm NOT trying to sell this or whatever in the name of Stockfish), 
mostly used for internal software, and of course it be free if I deploy it for other devs!!



## Credits to:
- [Stockfish.wsm](https://www.npmjs.com/package/stockfish.wasm)
- The Stockfish developers (see AUTHORS file). Stockfish [Computer software]. https://github.com/official-stockfish/Stockfish (thanks to everyone! Truly genius devs out there)
- [Stockfish js for understanding the flow](https://github.com/nmrugg/stockfish.js) [moving it to the server rather than node dependency]
- [Stockfish standalone nodejs server, I used this for some help, not really but you get the point](https://github.com/hyugit/stockfish-server)
- [fen-validator](https://www.npmjs.com/package/fen-validator/v/2.0.1) so I don't need to do all that FEN regex stuff

## Running it:
- running on debug mode which runs the engine on server start by selecting engine mode (wasm or cc-nonnue) 
- ``` node server.js debug wasm```
- - ``` node server.js debug cc-nonnue```
- ``` node server.js debug cc-yesnnue ```
- running without debug mode and starting the server
- ``` node server.js ```



## Endpoint parameters

- mode = run webassembly Stockfish (wasm) or No NNUE ChessCom Stockfish 16 (cc-nonnue) or Yes NNUE ChessCom Stockfish 16 (cc-yesnnue)
- depth = for wasm implementation [1 to 20] for Chesscom Stockfish 16 no NNUE version [1 to 16], for ChessCom Stockfish 16 yes NNUE version [1 to 22+] cap at depth 22, if one needs more they can request it
- fen = chess FEN for given position


## Working endpoints

- **Get best move for current FEN and MODE (pass in engine mode [wasm, cc-nonnue])** ``` GET localhost:5000/stockfish/bestmove?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2 ```
- **Get eval for current FEN and MODE(pass in engine mode [wasm, cc-nonnue])**  ``` GET localhost:5000/stockfish/eval?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2 ```
- **Get top engine line and depth info for given engine MODE and DEPTH and FEN** 
-  ``` GET localhost:5000/stockfish/toplines?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2&depth=20&mode=wasm```
-  ``` GET localhost:5000/stockfish/toplines?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2&depth=16&mode=16```

## TODOs

- add NNUE engine type to bestmove
- add NNUE engine type to eval
- add NNUE engine type to lines
- change lines to pv

## License:
follows same as Stockfish GPL