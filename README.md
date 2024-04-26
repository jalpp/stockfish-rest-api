Work in progress Stockfish REST API

making this for my own chess discord bots and other chess software that need
stockfish best moves within 3 seconds. (I'm NOT trying to sell this or whatever in the name of Stockfish), 
mostly used for internal software, and of course it be free if I deploy it for other devs!!



## Credits to:
- [Stockfish.wsm](https://www.npmjs.com/package/stockfish.wasm)
- The Stockfish developers (see AUTHORS file). Stockfish [Computer software]. https://github.com/official-stockfish/Stockfish
- [Stockfish js for understanding the flow](https://github.com/nmrugg/stockfish.js)
- [Stockfish standalone nodejs server, I used this for some help, not really but you get the point](https://github.com/hyugit/stockfish-server)
- [fen-validator](https://www.npmjs.com/package/fen-validator/v/2.0.1) so I don't need to do all that FEN regex stuff

## Running it:
- running on debug mode which runs the engine on server start by selecting engine mode (wasm or 16) 
- ``` node server.js debug wasm```
- - ``` node server.js debug 16```
- running without debug mode and starting the server
- ``` node server.js ```



## Endpoint parameters

- mode = engine mode pick which engine you want to run Stockfish.wasm or Stockfish16.js without NNUE
- depth = for wasm implementation [1 to 20] for Stockfish16.js depth varies from [1 to 16] so for higher depth choose wasm 
- fen = chess FEN for given position

## Working endpoints

- **Get best move for current FEN and MODE (pass in engine mode [wasm, 16])** ``` GET localhost:5000/stockfish/bestmove?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2 ```
- **Get eval for current FEN and MODE(pass in engine mode [wasm, 16])**  ``` GET localhost:5000/stockfish/eval?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2 ```
- **Get top engine line and depth info for given engine MODE and DEPTH and FEN** 
-  ``` GET localhost:5000/stockfish/toplines?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2&depth=20&mode=wasm```
-  ``` GET localhost:5000/stockfish/toplines?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2&depth=16&mode=16```


## License:
follows same as Stockfish GPL